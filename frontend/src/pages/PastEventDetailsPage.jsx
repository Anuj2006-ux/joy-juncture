import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '@/data/mockEvents';
import { Calendar, MapPin, Users, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const PastEventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = getEventById(id);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!event) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center font-display text-2xl text-muted-foreground">
                Archive Not Found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background font-sans flex flex-col lg:flex-row">

            {/* --- LEFT VISUAL PANEL (FIXED/STICKY) --- */}
            <div className="w-full lg:w-[50vw] h-[50vh] lg:h-screen lg:fixed lg:top-0 lg:left-0 relative overflow-hidden bg-muted group">
                <img
                    src={event.images[0]}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-1000 scale-105 group-hover:scale-100"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Back Button */}
                <button
                    onClick={() => navigate('/')}
                    className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/90 hover:text-white bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Events
                </button>

                {/* Mobile Title Overlay */}
                <div className="absolute bottom-0 left-0 w-full p-8 z-20 lg:hidden">
                    <h1 className="font-display text-4xl text-white mb-2 shadow-sm">
                        {event.title}
                    </h1>
                </div>
            </div>

            {/* --- RIGHT DATA PANEL (SCROLLABLE) --- */}
            <div className="w-full lg:w-[50vw] lg:ml-[50vw] min-h-screen bg-background p-8 md:p-16 lg:p-24 space-y-16">

                {/* Header (Desktop) */}
                <header className="hidden lg:block space-y-6">
                    <h1 className="font-display text-6xl text-foreground leading-tight">
                        {event.title}
                    </h1>

                    <div className="flex flex-wrap gap-6 text-muted-foreground font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            {event.location}
                        </div>
                    </div>
                </header>

                {/* The Vibe / Description */}
                <section>
                    <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        The Vibe
                    </div>
                    <blockquote className="text-2xl font-display text-foreground/80 leading-relaxed italic border-l-4 border-primary/30 pl-6">
                        "{event.description}"
                    </blockquote>
                </section>

                {/* About the Event */}
                <section className="prose prose-lg text-muted-foreground">
                    <h3 className="text-foreground font-display text-2xl mb-4">About the Event</h3>
                    <p>
                        {event.fullDescription || event.description}
                    </p>
                    {event.highlights && (
                        <div className="mt-8 p-6 bg-secondary/30 rounded-3xl">
                            <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                Community Highlights
                            </h4>
                            <p className="text-sm">{event.highlights}</p>
                        </div>
                    )}
                </section>

                {/* Stats Grid */}
                <section>
                    <div className="grid grid-cols-2 gap-8 border-t border-border pt-8">
                        <div>
                            <span className="block text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Attendees</span>
                            <span className="text-3xl font-display font-bold text-foreground">{event.registered}</span>
                        </div>
                        <div>
                            <span className="block text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Moments Captured</span>
                            <span className="text-3xl font-display font-bold text-foreground">{event.images?.length || 0}</span>
                        </div>
                    </div>
                </section>

                {/* Photo Gallery */}
                {event.images && event.images.length > 0 && (
                    <section>
                        <h3 className="text-foreground font-display text-2xl mb-6 flex items-center gap-2">
                            <ImageIcon className="w-6 h-6 text-primary" />
                            Photo Gallery
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {event.images.map((img, index) => (
                                <div key={index} className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer aspect-[4/3]">
                                    <img
                                        src={img}
                                        alt={`Gallery ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div className="mt-20 pt-12 border-t border-dashed border-border text-center">
                    <p className="text-muted-foreground text-sm font-medium">
                        Looking for more? <span onClick={() => navigate('/')} className="text-primary font-bold cursor-pointer hover:underline">Browse upcoming events</span>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default PastEventDetails;
