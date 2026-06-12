import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, MoreHorizontal, Fuel, Gauge, Zap, BatteryCharging, MapPin, ChevronRight, X, CheckCircle2, AlertCircle, DollarSign, Activity, Settings, Cpu } from 'lucide-react';

const VehicleCard = ({ vehicle, onIntercept }) => {
  const statusConfig = {
    'Available': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', shadow: 'shadow-[0_0_15px_rgba(124,255,178,0.2)]' },
    'Rented': { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', shadow: 'shadow-[0_0_15px_rgba(212,175,55,0.2)]' },
    'In Service': { color: 'text-highlight', bg: 'bg-highlight/10', border: 'border-highlight/20', shadow: 'shadow-[0_0_15px_rgba(253,186,116,0.2)]' },
  };

  const config = statusConfig[vehicle.status] || statusConfig['Available'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="glass-panel relative overflow-hidden group cursor-pointer"
    >
      <div className="relative h-56 overflow-hidden">
        <img 
          src={vehicle.image} 
          alt={vehicle.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161B26] via-[#161B26]/20 to-transparent" />
        
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md z-10 ${config.bg} ${config.color} ${config.border} ${config.shadow}`}>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.color.replace('text-', 'bg-')}`}></span>
            {vehicle.status}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 z-10">
           <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{vehicle.name}</h3>
           <div className="flex items-center gap-2 mt-1 text-gray-400">
              <MapPin size={12} className="text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Main Hub Station</span>
           </div>
        </div>
      </div>

      <div className="p-6 pt-2 space-y-6">
        <div className="grid grid-cols-3 gap-2 py-4 border-b border-white/5">
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-2 bg-white/5 rounded-lg text-primary">
              <BatteryCharging size={16} className="drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            </div>
            <span className="text-xs font-bold text-white">85%</span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Energy</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-white/5">
            <div className="p-2 bg-white/5 rounded-lg text-accent">
              <Gauge size={16} className="drop-shadow-[0_0_8px_rgba(124,255,178,0.5)]" />
            </div>
            <span className="text-xs font-bold text-white">450<span className="text-[10px] text-gray-500">km</span></span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Range</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div className="p-2 bg-white/5 rounded-lg text-highlight">
              <Zap size={16} className="drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]" />
            </div>
            <span className="text-xs font-bold text-white">670<span className="text-[10px] text-gray-500">hp</span></span>
            <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Power</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-black text-white tracking-tighter">${vehicle.price}</span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest ml-1">/ cycle</span>
          </div>
          <button 
            onClick={() => onIntercept(vehicle)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-glow-primary group-hover:translate-x-1"
          >
            Intercept <ChevronRight size={14} />
          </button>
        </div>
      </div>
      
      {/* Decorative Corner Accent */}
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/5 blur-xl group-hover:bg-primary/20 transition-colors"></div>
    </motion.div>
  );
};

const Fleet = () => {
  const { vehicles } = useSelector(state => state.fleet);
  const [filter, setFilter] = useState('Vehicles');
  const [search, setSearch] = useState('');
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const filteredVehicles = vehicles.filter(v => {
    // For now, map some statuses to tabs for visual consistency
    if (filter === 'Maintenance' && v.status !== 'In Service') return false;
    if (filter === 'Vehicles' && v.status === 'In Service') return false;
    
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                         v.type.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-10 pb-12">
      {/* Header with Command feel */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
            Fleet Management
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent rounded-full opacity-50"></div>
          </h2>
          <p className="text-primary/70 mt-2 font-bold tracking-[0.05em] uppercase text-xs">AERO-DRIVE GLOBAL INVENTORY SYSTEM</p>
        </div>
        <button 
          onClick={() => setIsDeployOpen(true)}
          className="flex items-center gap-2 bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-glow-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all transform hover:-translate-y-1 text-xs"
        >
          <Plus size={18} strokeWidth={3} /> Deploy New Unit
        </button>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between glass-panel !p-4 border-white/5">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto custom-scrollbar">
          {['Vehicles', 'Maintenance', 'Damage', 'Fuel'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border
                ${filter === status 
                  ? 'bg-primary/20 border-primary/40 text-primary shadow-glow-primary' 
                  : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10'}
              `}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input 
              type="text" 
              placeholder="Filter by unit identifier..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all placeholder-gray-600"
            />
          </div>
          <button className="p-3.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onIntercept={setSelectedVehicle} 
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center glass-panel border-dashed border-white/10"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <Search size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-white">No matches found in grid</h3>
              <p className="text-gray-500 mt-2 font-medium">Try adjusting your filter parameters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Deploy Modal */}
        {isDeployOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeployOpen(false)}
              className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl glass-panel !p-0 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="bg-primary/10 p-8 border-b border-primary/20 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Deploy <span className="text-primary">New Unit</span></h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 mt-1">Initialize global asset registry</p>
                </div>
                <button onClick={() => setIsDeployOpen(false)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Asset Model</label>
                    <input type="text" placeholder="e.g. Tesla Model S" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Telemetry ID</label>
                    <input type="text" placeholder="AUTO-GEN-2026" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Daily Cycle</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input type="number" placeholder="0" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Battery Cap.</label>
                    <input type="number" placeholder="100%" className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Station</label>
                    <select className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-5 text-sm font-bold text-gray-400 focus:outline-none focus:border-primary/50 transition-all appearance-none">
                      <option>Main Hub</option>
                      <option>North Port</option>
                      <option>Sky Port</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                  <AlertCircle className="text-primary shrink-0 mt-0.5" size={18} />
                  <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
                    Deployment will initialize real-time telemetry syncing and add this unit to the global rental pool. Ensure all physical maintenance checks are verified before activation.
                  </p>
                </div>

                 <button onClick={() => setIsDeployOpen(false)} className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-[1.01] transition-all flex items-center justify-center gap-3 text-xs italic">
                  <CheckCircle2 size={18} /> Confirm Asset Deployment
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Intercept Modal */}
        {selectedVehicle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicle(null)}
               className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, x: 50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: 50 }}
              className="relative w-full max-w-4xl glass-panel !p-0 border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row h-[600px]"
            >
               <div className="w-full md:w-1/2 h-full relative">
                 <img src={selectedVehicle.image} className="w-full h-full object-cover opacity-60" alt={selectedVehicle.name} />
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#111111]" />
                <div className="absolute top-8 left-8">
                  <div className="px-4 py-2 bg-primary/20 backdrop-blur-xl border border-primary/30 rounded-xl">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary"></div>
                       Active Link
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 p-10 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{selectedVehicle.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-1">Asset Trace: {selectedVehicle.id}</p>
                    </div>
                    <button onClick={() => setSelectedVehicle(null)} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { label: 'Energy Load', val: '85%', icon: BatteryCharging, color: 'text-primary' },
                      { label: 'Odometer', val: '12,402 km', icon: Gauge, color: 'text-accent' },
                      { label: 'CPU Status', val: 'Optimal', icon: Cpu, color: 'text-highlight' },
                      { label: 'Grid Position', val: 'Zone 4', icon: MapPin, color: 'text-primary' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                           <stat.icon size={14} className={stat.color} />
                           <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <p className="text-sm font-black text-white">{stat.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Command Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Activity size={14} /> Log Diagnostics
                      </button>
                      <button className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                        <Settings size={14} /> Core Config
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button className="flex-1 py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] italic hover:bg-primary transition-all">
                    Initiate Remote Link
                  </button>
                  <button onClick={() => setSelectedVehicle(null)} className="px-8 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-2xl text-[10px] italic hover:bg-danger/20 hover:text-danger hover:border-danger/30 transition-all">
                    Release
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Fleet;
