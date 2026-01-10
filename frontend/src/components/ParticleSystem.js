import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
uniform float uTime;
uniform float uPixelRatio;
uniform vec3 uMouse; // x, y, z (z is hover state or strength)

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    vec3 pos = position;
    
    // Flowing Vortex Motion
    
    // 1. Base Rotation (Vortex)
    // Rotate around Y axis, speed decreases with distance (vortex like)
    float radius = length(pos.xz);
    float baseSpeed = 0.5;
    float vortexSpeed = baseSpeed / (radius + 1.0); // Faster in center
    float angle = uTime * (vortexSpeed + 0.2); 
    
    float c = cos(angle);
    float s = sin(angle);
    mat2 rot = mat2(c, -s, s, c);
    pos.xz = rot * pos.xz;
    
    // 2. Random Flow Path (Turbulence/Noise)
    // Add organic offsets based on position and time
    // This gives the "random flow path" feel while maintaining the center structure
    float noiseFreq = 0.5;
    float noiseAmp = 0.5;
    vec3 noiseOffset;
    noiseOffset.x = sin(uTime * 0.5 + pos.y * noiseFreq + aRandomness.x * 6.0);
    noiseOffset.y = cos(uTime * 0.3 + pos.z * noiseFreq + aRandomness.y * 6.0);
    noiseOffset.z = sin(uTime * 0.4 + pos.x * noiseFreq + aRandomness.z * 6.0);
    
    pos += noiseOffset * noiseAmp;

    // 3. Dust Wipe Effect (Mouse Interaction)
    // Strong repulsion that clears the area
    float dist = distance(uMouse.xy, pos.xy);
    float wipeRadius = 4.0;
    float influence = smoothstep(wipeRadius, wipeRadius * 0.2, dist); // Sharp falloff inside
    
    vec3 direction = normalize(pos - vec3(uMouse.xy, 0.0));
    
    // Push particles away strongly
    // Add some "drag" or "lift" to make it feel like dust being stirred
    pos += direction * influence * 5.0; 
    
    // Optional: Lift particles up/down when wiped
    pos.z += influence * 2.0 * sin(dist * 5.0 - uTime * 5.0);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    // Dust is fine but visible
    float size = (8.0 * aScale + 2.0); 
    gl_PointSize = size * uPixelRatio * (12.0 / -mvPosition.z);
    
    // Pass randomness to fragment
    vColor = vec3(0.95, 0.95, 1.0); // Clean dust color

}
`;

const fragmentShader = `
varying vec3 vColor;

void main() {
    // Circular particle with soft edge for dust look
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    
    // Very soft falloff
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
    
    // Make it even softer/more transparent
    alpha = pow(alpha, 3.0); 

    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor, alpha * 0.5); // Lower opacity
}
`;

const ParticleSystem = () => {
    const { viewport, pointer, camera } = useThree();
    const count = 10000; // Increased count for density

    // Custom Shader Material
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
                uMouse: { value: new THREE.Vector3(0, 0, 0) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });
    }, []);

    // Geometry
    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const randomness = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spherical distribution for centered density
            // Dense core, sparse outskirts
            const radius = Math.pow(Math.random(), 2.0) * 10.0 + 2.0;
            const u = Math.random();
            const v = Math.random();
            const thetaAng = 2 * Math.PI * u;
            const phiAng = Math.acos(2 * v - 1);

            positions[i * 3] = radius * Math.sin(phiAng) * Math.cos(thetaAng);
            positions[i * 3 + 1] = radius * Math.sin(phiAng) * Math.sin(thetaAng);
            positions[i * 3 + 2] = radius * Math.cos(phiAng);

            // Varied scales
            scales[i] = Math.random();

            randomness[i * 3] = Math.random();
            randomness[i * 3 + 1] = Math.random();
            randomness[i * 3 + 2] = Math.random();
        }

        return { positions, scales, randomness };
    }, [count]);

    const pointsRef = useRef(null);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouse3D = new THREE.Vector3();

    useFrame((state) => {
        if (pointsRef.current) {
            // Update Time
            pointsRef.current.material.uniforms.uTime.value = state.clock.elapsedTime;

            // Update Mouse
            // Raycast to find the point on z=0 plane where the mouse is pointing
            raycaster.setFromCamera(pointer, camera);
            raycaster.ray.intersectPlane(plane, mouse3D);

            // Smoothly interpolate the mouse uniform
            const currentMouse = pointsRef.current.material.uniforms.uMouse.value;
            currentMouse.x += (mouse3D.x - currentMouse.x) * 0.1;
            currentMouse.y += (mouse3D.y - currentMouse.y) * 0.1;

            // Interaction strength (z component of uMouse)
            // We can increase it when moving or just keep it static
            currentMouse.z = 1.0;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particlesPosition.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    count={count}
                    array={particlesPosition.scales}
                    itemSize={1}
                />
                <bufferAttribute
                    attach="attributes-aRandomness"
                    count={count}
                    array={particlesPosition.randomness}
                    itemSize={3}
                />
            </bufferGeometry>
            <primitive object={shaderMaterial} attach="material" />
        </points>
    );
};

export default ParticleSystem;
