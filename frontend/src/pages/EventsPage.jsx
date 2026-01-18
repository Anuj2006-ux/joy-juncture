import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, Gamepad2, Sparkles, Heart, Send, Puzzle, Ghost } from 'lucide-react';
import EventToggle from '@/components/events/EventToggle';
import EventCard from '@/components/events/EventCard';
import PastEventCard from '@/components/events/PastEventCard';
import { getUpcomingEvents, getPastEvents } from '@/data/mockEvents';

const Index = () => {
    const location = useLocation();
    const [activeView, setActiveView] = useState('upcoming');

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const tab = searchParams.get('tab');
        if (tab === 'past' || tab === 'upcoming') {
            setActiveView(tab);
        }
    }, [location]);

    const upcomingEvents = getUpcomingEvents();
    const pastEvents = getPastEvents();

    return (
        <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-white">

            {/* --- Navigation --- */}
            <nav className="border-b border-border/40 bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-105">
                        <div className="w-12 h-12 bg-primary rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:rotate-6 transition-all">
                            <Gamepad2 className="w-7 h-7 text-white" />
                        </div>
                        <span className="font-display text-2xl font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                            Joy Juncture
                        </span>
                    </div>
                </div>
            </nav>

            {/* --- Hero Section --- */}
            <header className="relative pt-24 pb-32 overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white border border-primary/20 px-4 py-2 rounded-full shadow-sm mb-8 animate-fade-in">
                        <Sparkles className="w-4 h-4 text-joy-gold" />
                        <span className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Where Play Meets Community</span>
                    </div>

                    <h1 className="font-display text-6xl md:text-8xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                        We Keep It <span className="text-secondary italic transform -rotate-2 inline-block">Fresh</span>.<br />
                        We Keep It <span className="text-primary underline decoration-wavy decoration-4 underline-offset-8">Fun!</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12">
                        Join the most vibrant board game community in town. Weekly events, friendly faces, and endless fun awaits.
                    </p>


                </div>

                {/* Floating Icons */}
                <div className="absolute top-1/4 left-10 text-secondary/20 animate-bounce delay-700 hidden lg:block">
                    <Puzzle className="w-16 h-16 rotate-12" />
                </div>
                <div className="absolute bottom-1/3 right-10 text-primary/20 animate-pulse delay-1000 hidden lg:block">
                    <Ghost className="w-20 h-20 -rotate-12" />
                </div>

                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/40 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-joy-green/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

                {/* Wave Divider Bottom */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-20">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] fill-background">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
            </header>

            {/* --- Events Section --- */}
            <main className="container mx-auto px-6 pb-24">
                <div className="flex flex-col items-center mb-16">
                    <EventToggle activeView={activeView} onToggle={setActiveView} />
                </div>

                <div className="min-h-[400px]">
                    {activeView === 'upcoming' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-border shadow-sm">
                                    <p className="text-muted-foreground text-xl">
                                        No upcoming events announced yet. Stay tuned!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeView === 'past' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                            {pastEvents.length > 0 ? (
                                pastEvents.map((event) => (
                                    <PastEventCard key={event.id} event={event} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-20">
                                    <p className="text-muted-foreground text-lg">
                                        No past events to show.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>


            </main>

            {/* --- Newsletter / Community Section --- */}
            <section className="relative py-24 bg-secondary/5 overflow-hidden">
                {/* Top Wave */}
                <div className="absolute top-0 left-0 w-full overflow-hidden leading-none">
                    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[50px] fill-background rotate-180">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>

                <div className="container mx-auto px-6 text-center relative z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm mb-6 border border-primary/20">
                            <span className="w-2 h-2 rounded-full bg-joy-green animate-pulse" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Join the inner circle</span>
                        </div>

                        <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Never Miss a <span className="text-primary underline decoration-wavy decoration-2 underline-offset-4">Game Night</span>
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                            Get exclusive invites to secret events, early access to tournaments, and special community rewards delivered to your inbox.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 bg-white border border-border px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground placeholder:text-muted-foreground/60"
                            />
                            <button className="bg-foreground text-white font-bold px-8 py-4 rounded-full hover:bg-primary transition-colors flex items-center justify-center gap-2 group shadow-lg shadow-black/10">
                                Subscribe
                                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 font-medium">
                            No spam, just pure joy. Unsubscribe anytime.
                        </p>
                    </div>
                </div>

                {/* Bottom Wave decoration for smooth footer transition could go here, or let footer be flat */}
            </section>

            {/* --- Footer --- */}
            <footer className="bg-white border-t border-border py-12">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white fill-current" />
                        </div>
                        <span className="font-display font-bold text-lg text-foreground">Joy Juncture</span>
                    </div>
                    <p className="text-muted-foreground font-medium">
                        © 2026 Joy Juncture. Made for community.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Index;
