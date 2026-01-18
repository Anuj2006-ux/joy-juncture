import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById } from '@/data/mockEvents';
import { Calendar, Clock, MapPin, Ticket, Users, ArrowLeft, Star, Heart, Share2, CheckCircle } from 'lucide-react';
import MissionRegistrationModal from '@/components/events/MissionRegistrationModal';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const event = getEventById(id);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!event) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-6">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Star className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="font-display text-4xl font-bold text-foreground mb-4">Event Not Found</h1>
                <p className="text-muted-foreground text-lg mb-8">Looks like this event has moved or doesn't exist.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary/90 transition-colors"
                >
                    Browse All Events
                </button>
            </div>
        );
    }

    const spotsLeft = event.capacity - event.registered;
    const capacityPercentage = (event.registered / event.capacity) * 100;

    return (
        <div className="min-h-screen bg-background pb-20 selection:bg-primary selection:text-white font-sans">

            {/* --- Navigation Bar --- */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border/50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
                    >
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <ArrowLeft className="w-4 h-4 text-secondary" />
                    </div>
                    Back to Events
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Heart className="w-6 h-6" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
        </div>
            </nav >

    <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* --- Left Column: Images & Content --- */}
            <div className="lg:col-span-7 space-y-10">

                {/* Hero Image */}
                <div className="rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 aspect-video relative group">
                    <img
                        src={event.images[0]}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 left-6 flex gap-3">
                        <span className="bg-white/90 backdrop-blur text-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-sm uppercase tracking-wide">
                            {event.category || 'Special Event'}
                        </span>
                        {spotsLeft < 10 && spotsLeft > 0 && (
                            <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm animate-pulse">
                                Almost Full!
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h2 className="font-display text-3xl font-bold text-foreground mb-6">About This Event</h2>
                    <div className="prose prose-lg text-muted-foreground leading-relaxed">
                        <p>{event.fullDescription || event.description}</p>
                    </div>
                </div>

                {/* Highlights/Loadout */}
                <div className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm">
                    <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <Star className="w-6 h-6 text-joy-gold fill-current" />
                        What's Included
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Game Master Guidance', 'All Equipment Provided', 'Snacks & Drinks', `Earn ${event.pointsEarned} Joy Points`].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-secondary/5 p-4 rounded-2xl text-foreground font-medium">
                                <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Right Column: Sidebar --- */}
            <div className="lg:col-span-5 relative">
                <div className="sticky top-24 space-y-8">

                    {/* Title & Stats */}
                    <div>
                        <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-lg text-sm font-bold">
                                Hosted by Joy Juncture
                            </span>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-black/5">
                        <div className="space-y-6 mb-8">
                            {/* Date */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-primary uppercase tracking-wider">Date</div>
                                    <div className="text-lg font-bold text-foreground">
                                        {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-primary uppercase tracking-wider">Time</div>
                                    <div className="text-lg font-bold text-foreground">{event.time}</div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-primary uppercase tracking-wider">Location</div>
                                    <div className="text-lg font-bold text-foreground">{event.location}</div>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-primary uppercase tracking-wider">Entry Fee</div>
                                    <div className="text-2xl font-bold text-foreground">
                                        ₹{event.price * 80} <span className="text-base font-normal text-muted-foreground">/ person</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-bold mb-2">
                                <span className="text-muted-foreground">Capacity</span>
                                <span className={spotsLeft < 5 ? 'text-red-500' : 'text-secondary'}>
                                    {spotsLeft} spots left
                                </span>
                            </div>
                            <div className="h-3 w-full bg-secondary/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-secondary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${capacityPercentage}%` }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xl py-4 rounded-2xl shadow-lg shadow-primary/25 transition-all hover:-translate-y-1 mb-3"
                        >
                            Register Now
                        </button>
                        <p className="text-center text-xs text-muted-foreground font-medium">
                            Instant confirmation • Secure booking
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </main>

{/* --- Registration Modal (Kept Logic, updated style via props if needed or internal check) --- */ }
{/* Note: MissionRegistrationModal internal styling might need update if it's hardcoded cyber */ }
<MissionRegistrationModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    event={event}
/>
        </div >
    );
};

export default EventDetails;
