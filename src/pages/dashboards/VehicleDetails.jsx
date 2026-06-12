import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Star, Heart, Share2, 
  BatteryCharging, Gauge, Zap, MapPin,
  ShieldCheck, CheckCircle2, Info, 
  Calendar, Clock, DollarSign, ChevronRight,
  User, Shield, Plus, MessageSquare
} from 'lucide-react';
import BookingFlow from '../../components/booking/BookingFlow';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles } = useSelector(state => state.fleet);
  const vehicle = vehicles.find(v => v.id === parseInt(id)) || vehicles[0];
  
  const [activeTab, setActiveTab] = useState('Specs');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const images = [
    vehicle.image,
    'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
  ];

  const specs = [
    { label: '0-60 mph', value: '2.1s', icon: Zap, color: 'text-primary' },
    { label: 'Top Speed', value: '200 mph', icon: Gauge, color: 'text-accent' },
    { label: 'Max Range', value: '420 mi', icon: BatteryCharging, color: 'text-highlight' },
    { label: 'Drivetrain', value: 'Tri-Motor AWD', icon: Info, color: 'text-primary' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Navigation & Header */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center gap-2 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Fleet</span>
        </button>
        <div className="flex gap-3">
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all">
            <Share2 size={18} />
          </button>
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-danger transition-all">
            <Heart size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Image Gallery */}
          <section className="space-y-6">
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5 shadow-glow-primary group"
             >
                <img src={images[0]} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt={vehicle.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                   <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">{vehicle.name}</h1>
                   <div className="flex items-center gap-4 mt-2">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{vehicle.type} Performance Unit</span>
                      <div className="h-1 w-12 bg-primary/30 rounded-full"></div>
                      <div className="flex items-center gap-1.5 text-highlight">
                         <Star size={14} fill="currentColor" />
                         <span className="text-xs font-black text-white">4.9 <span className="text-[10px] text-gray-500 font-bold">(128 Reviews)</span></span>
                      </div>
                   </div>
                </div>
             </motion.div>
             <div className="grid grid-cols-3 gap-6">
                {images.map((img, i) => (
                  <div key={i} className="h-32 rounded-3xl overflow-hidden border border-white/5 cursor-pointer hover:border-primary/50 transition-all opacity-60 hover:opacity-100">
                    <img src={img} className="w-full h-full object-cover" alt="Gallery" />
                  </div>
                ))}
             </div>
          </section>

          {/* Features & Tabs */}
          <section className="space-y-8">
             <div className="flex gap-8 border-b border-white/5">
                {['Specs', 'Features', 'Reviews', 'Terms'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all relative
                      ${activeTab === tab ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-glow-primary"></motion.div>
                    )}
                  </button>
                ))}
             </div>

             <div className="min-h-[200px]">
                {activeTab === 'Specs' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 gap-6">
                     {specs.map((spec, i) => (
                       <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-4 hover:bg-white/10 transition-colors group">
                          <div className={`p-3 bg-white/5 rounded-2xl w-fit ${spec.color} group-hover:shadow-glow-primary transition-all`}>
                            <spec.icon size={24} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{spec.label}</p>
                             <p className="text-lg font-black text-white italic">{spec.value}</p>
                          </div>
                       </div>
                     ))}
                  </motion.div>
                )}
                
                {activeTab === 'Features' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {[
                       'Full Self-Driving Capability', 'Premium Interior with Carbon Fiber',
                       'Ultra-High Fidelity 22-Speaker Audio', 'Cold Weather Package (Heated Seats/Steering)',
                       'Adaptive Air Suspension', 'Game Console-Grade Computer'
                     ].map((feat, i) => (
                       <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                          <CheckCircle2 size={16} className="text-primary" />
                          <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">{feat}</span>
                       </div>
                     ))}
                  </motion.div>
                )}

                {activeTab === 'Reviews' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                     {[1, 2].map(i => (
                       <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-4">
                          <div className="flex justify-between items-center">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase">AR</div>
                                <div>
                                   <p className="text-xs font-black text-white uppercase tracking-widest">Alex Rivera</p>
                                   <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Verified Resident • May 2024</p>
                                </div>
                             </div>
                             <div className="flex text-highlight">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                             </div>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed italic">
                             "The performance is absolutely mind-blowing. The delivery was seamless and the car was in pristine condition. Best rental experience ever."
                          </p>
                       </div>
                     ))}
                  </motion.div>
                )}
             </div>
          </section>
        </div>

        {/* Right Column: Booking Card */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-panel p-8 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent sticky top-8">
              <div className="flex justify-between items-end mb-8">
                 <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Daily Access Rate</p>
                    <p className="text-4xl font-black text-white tracking-tighter italic">${vehicle.price}<span className="text-lg text-gray-500 not-italic ml-1">/ day</span></p>
                 </div>
                 <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl">
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">Available</span>
                 </div>
              </div>

              {/* Quick Selectors */}
              <div className="space-y-4 mb-8">
                 <div className="p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Pickup Station</span>
                       <MapPin size={14} className="text-primary" />
                    </div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Beverly Hills Hub</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:border-primary/30 transition-all">
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Start Date</span>
                       <p className="text-xs font-bold text-white uppercase tracking-wide">May 24, 2024</p>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:border-primary/30 transition-all">
                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block">End Date</span>
                       <p className="text-xs font-bold text-white uppercase tracking-wide">May 28, 2024</p>
                    </div>
                 </div>
              </div>

              {/* Insurance Info */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl mb-8 flex items-start gap-4">
                 <Shield size={20} className="text-primary shrink-0 mt-0.5" />
                 <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Premium Protection</p>
                    <p className="text-[9px] text-gray-500 font-medium leading-relaxed">Full comprehensive coverage included for platinum members.</p>
                 </div>
              </div>

              {/* Total Calculation */}
              <div className="space-y-3 pt-6 border-t border-white/5 mb-8">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium uppercase tracking-wider">$120 x 4 Days</span>
                    <span className="text-white font-bold">$480.00</span>
                 </div>
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium uppercase tracking-wider">Service Fee</span>
                    <span className="text-white font-bold">$25.00</span>
                 </div>
                 <div className="flex justify-between text-sm pt-3">
                    <span className="text-white font-black uppercase tracking-widest italic">Est. Total</span>
                    <span className="text-white font-black tracking-tight">$505.00</span>
                 </div>
              </div>

              <button 
                className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs italic"
                onClick={() => setIsBookModalOpen(true)}
              >
                Book Your Experience <ChevronRight size={18} strokeWidth={3} />
              </button>
           </div>

           {/* Support Badge */}
           <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all group">
              <div className="p-3 bg-white/5 rounded-2xl text-primary group-hover:shadow-glow-primary transition-all">
                <MessageSquare size={20} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Dedicated Concierge</p>
                 <p className="text-[9px] text-gray-500 font-medium">Chat with an expert about this unit</p>
              </div>
           </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <BookingFlow 
            isOpen={isBookModalOpen} 
            onClose={() => setIsBookModalOpen(false)} 
            vehicle={vehicle}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleDetails;
