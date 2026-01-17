// Point tracking utility for automatic time tracking
class PointsTracker {
    constructor() {
        this.startTime = null;
        this.intervalId = null;
        this.gameStartTime = null;
        this.currentGameId = null;
    }

    // Start tracking website time
    startTracking() {
        if (this.intervalId) return; // Already tracking
        
        this.startTime = Date.now();
        
        // Send activity every 5 minutes
        this.intervalId = setInterval(() => {
            this.sendActivity();
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Stop tracking website time
    stopTracking() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        // Send final activity
        if (this.startTime) {
            this.sendActivity();
            this.startTime = null;
        }
    }

    // Start tracking game play
    startGameTracking(gameId) {
        this.gameStartTime = Date.now();
        this.currentGameId = gameId;
    }

    // Stop tracking game play and send data
    async stopGameTracking() {
        if (!this.gameStartTime || !this.currentGameId) return;
        
        const duration = Math.floor((Date.now() - this.gameStartTime) / 60000); // in minutes
        
        if (duration > 0) {
            await this.sendGameActivity(this.currentGameId, duration);
        }
        
        this.gameStartTime = null;
        this.currentGameId = null;
    }

    // Send website activity to backend
    async sendActivity() {
        if (!this.startTime) return;
        
        const duration = Math.floor((Date.now() - this.startTime) / 60000); // in minutes
        
        if (duration < 5) return; // Minimum 5 minutes
        
        try {
            await fetch('http://localhost:5000/api/wallet/game-activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ duration })
            });
            
            // Reset start time for next interval
            this.startTime = Date.now();
        } catch (error) {
            console.error('Error sending activity:', error);
        }
    }

    // Send game-specific activity
    async sendGameActivity(gameId, duration) {
        try {
            const response = await fetch('http://localhost:5000/api/wallet/game-activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ gameId, duration })
            });
            
            const data = await response.json();
            
            if (data.success) {
                return data.pointsEarned;
            }
        } catch (error) {
            console.error('Error sending game activity:', error);
        }
        return 0;
    }
}

// Create singleton instance
const pointsTracker = new PointsTracker();

// Auto-start tracking when user is logged in
export const initializePointsTracking = () => {
    // Check if user is logged in via token
    const token = localStorage.getItem('token');
    
    if (!token) {
        // No token, user not logged in
        return;
    }

    // Verify token by calling profile endpoint
    fetch('http://localhost:5000/api/auth/profile', { 
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error('Not authenticated');
            }
            return res.json();
        })
        .then(data => {
            if (data.success && data.user) {
                pointsTracker.startTracking();
                
                // Stop tracking on page unload
                window.addEventListener('beforeunload', () => {
                    pointsTracker.stopTracking();
                });
                
                // Stop tracking on visibility change
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) {
                        pointsTracker.stopTracking();
                    } else {
                        pointsTracker.startTracking();
                    }
                });
            }
        })
        .catch(err => {
            // Silently fail - user not logged in or token invalid
            console.log('Points tracking: User not authenticated');
        });
};

export default pointsTracker;
