import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, Heart, 
  BatteryCharging, Gauge, Zap, Info, ArrowRight,
  LayoutGrid, SlidersHorizontal, Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BookingFlow from '../../components/booking/BookingFlow';

const CarCard = React.forwardRef(({ vehicle, onBook, onDetails }, ref) => {
  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -12 }}
      className="glass-panel !p-0 border-white/5 overflow-hidden group flex flex-col h-full hover:border-primary/30 hover:shadow-glow-primary transition-all duration-500"
    >
      {/* Image Gallery Preview */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={vehicle.image} 
          alt={vehicle.name} 
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-lg shadow-glow-primary">
            <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
               <Zap size={10} className="text-primary animate-pulse" /> {vehicle.status}
            </span>
          </div>
          {vehicle.type === 'Electric' && (
            <div className="px-3 py-1 bg-accent/20 backdrop-blur-md border border-accent/30 rounded-lg">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Zero Emission</span>
            </div>
          )}
        </div>

        {/* Favorite & Compare */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="p-3 rounded-xl bg-black/60 backdrop-blur-md text-white hover:text-danger hover:bg-danger/20 transition-all border border-white/5">
            <Heart size={16} />
          </button>
          <button className="p-3 rounded-xl bg-black/60 backdrop-blur-md text-white hover:text-primary hover:bg-primary/20 transition-all border border-white/5">
            <LayoutGrid size={16} />
          </button>
        </div>

        {/* Rating */}
        <div className="absolute bottom-4 left-6">
           <div className="flex items-center gap-1.5 text-primary">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-black text-white">4.9 <span className="text-[10px] text-gray-500 font-bold">(128 Reviews)</span></span>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-1 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight italic uppercase font-serif">{vehicle.name}</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] mt-1">{vehicle.type} Performance</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-primary tracking-tighter">${vehicle.price}</p>
            <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">/ day</p>
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-3 gap-2 py-4 border-y border-white/5">
          <div className="flex flex-col items-center gap-1.5">
            <BatteryCharging size={16} className="text-primary" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">420 mi</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-white/5">
            <Gauge size={16} className="text-accent" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">2.1s</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Zap size={16} className="text-primary" />
            <span className="text-[10px] font-black text-white uppercase tracking-tighter">1,020 hp</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <button 
            className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            onClick={() => onDetails(vehicle.id)}
          >
            <Info size={14} /> Details
          </button>
          <button 
            onClick={() => onBook(vehicle)}
            className="flex-[1.5] py-4 bg-primary text-black font-black uppercase tracking-widest rounded-xl text-[10px] italic shadow-glow-primary hover:scale-[1.02] hover:bg-accent transition-all flex items-center justify-center gap-2"
          >
            Book Now <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

const CustomerFleet = () => {
  const { vehicles } = useSelector(state => state.fleet);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const navigate = useNavigate();

  const filteredVehicles = vehicles.filter(v => {
    if (filter !== 'All' && v.type !== filter) return false;
    return v.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleBook = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsBookModalOpen(true);
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
             <div className="h-1 w-8 bg-primary rounded-full"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Global Fleet</span>
          </motion.div>
          <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic font-serif">
            Select Your <span className="text-primary not-italic">Vessel</span>
          </h2>
          <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">68 Ultra-High Performance Vehicles Available</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by model or manufacturer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-primary/50 transition-all placeholder-gray-600 focus:shadow-glow-primary"
            />
          </div>
          <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        {['All', 'Electric', 'Sport', 'SUV', 'Executive', 'Convertible'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap
              ${filter === cat 
                ? 'bg-primary text-black border-primary shadow-glow-primary' 
                : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredVehicles.map((vehicle) => (
            <CarCard 
              key={vehicle.id} 
              vehicle={vehicle} 
              onBook={handleBook}
              onDetails={(id) => navigate(`/vehicle/${id}`)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Comparison Drawer Trigger */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-panel !p-4 border-primary/20 bg-primary/5 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl rounded-[2rem]"
      >
        <div className="flex -space-x-3">
           {[1, 2].map(i => (
             <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] overflow-hidden bg-white/5">
                <Plus size={14} className="m-auto mt-2.5 text-gray-600" />
             </div>
           ))}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white">Compare Vehicles <span className="text-gray-500 ml-2">(0/3 selected)</span></p>
        <button className="px-6 py-2 bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 cursor-not-allowed">
           Launch Comparison
        </button>
      </motion.div>

      {/* Booking Flow Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <BookingFlow 
            isOpen={isBookModalOpen} 
            onClose={() => setIsBookModalOpen(false)} 
            vehicle={selectedVehicle}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerFleet;
