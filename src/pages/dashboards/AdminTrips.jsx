import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Navigation, Clock, Fuel, Gauge, AlertTriangle, 
  Search, Filter, ChevronRight, Activity, Zap, Shield,
  MoreVertical, Eye, Phone, MessageSquare, Map as MapIcon
} from 'lucide-react';

const mockTrips = [
  { 
    id: 'TRP-1024', 
    driver: 'Alex Chen', 
    vehicle: 'Tesla Model S', 
    destination: 'Downtown Financial Dist.', 
    progress: 65, 
    status: 'In Progress',
    speed: '62 mph',
    fuel: '84%',
    eta: '12 mins',
    lastUpdate: 'Just now'
  },
  { 
    id: 'TRP-1025', 
    driver: 'Sarah Jenkins', 
    vehicle: 'Lucid Air', 
    destination: 'International Airport', 
    progress: 22, 
    status: 'In Progress',
    speed: '55 mph',
    fuel: '92%',
    eta: '34 mins',
    lastUpdate: '2 mins ago'
  },
  { 
    id: 'TRP-1026', 
    driver: 'Marcus Wright', 
    vehicle: 'Rivian R1S', 
    destination: 'Mountain Resort', 
    progress: 95, 
    status: 'Near Destination',
    speed: '25 mph',
    fuel: '45%',
    eta: '3 mins',
    lastUpdate: '1 min ago'
  },
  { 
    id: 'TRP-1027', 
    driver: 'Elena Rodriguez', 
    vehicle: 'Porsche Taycan', 
    destination: 'Coastal Highway', 
    progress: 40, 
    status: 'Delayed',
    speed: '0 mph',
    fuel: '78%',
    eta: 'Unknown',
    lastUpdate: 'Traffic Alert'
  },
];

const AdminTrips = () => {
  const [selectedTrip, setSelectedTrip] = useState(mockTrips[0]);
  const [search, setSearch] = useState('');

  const filteredTrips = mockTrips.filter(t => 
    t.driver.toLowerCase().includes(search.toLowerCase()) || 
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Live <span className="text-accent">Operations</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Global Fleet Telemetry V.4.2</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex -space-x-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-gray-800 overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="driver" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-[#0A0A0A] bg-accent flex items-center justify-center text-[10px] font-black text-black">
              +12
            </div>
          </div>
          <button className="px-4 py-2 bg-accent text-[#0A0E17] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-glow-accent hover:scale-105 transition-all">
            Dispatch New
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Trips', value: '24', sub: '+3 from last hour', icon: Navigation, color: 'text-accent' },
          { label: 'Vehicles En Route', value: '18', sub: '92% Efficiency', icon: Activity, color: 'text-primary' },
          { label: 'Idle Operatives', value: '06', sub: 'Ready for dispatch', icon: Zap, color: 'text-highlight' },
          { label: 'System Alerts', value: '02', sub: 'Requires Attention', icon: AlertTriangle, color: 'text-danger' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 border-white/5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon size={48} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
            <h3 className="text-2xl font-black text-white mt-1 italic tracking-tighter">{stat.value}</h3>
            <p className="text-[9px] font-bold text-gray-600 mt-1 uppercase">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Monitoring Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[600px]">
        
        {/* Left: Trip List */}
        <div className="xl:col-span-1 space-y-4 flex flex-col h-full">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Active Operatives..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-4 pl-11 pr-4 text-xs font-bold text-white focus:border-accent/50 focus:outline-none transition-all placeholder:text-gray-600 uppercase tracking-widest"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            <AnimatePresence mode='popLayout'>
              {filteredTrips.map((trip) => (
                <motion.div 
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedTrip(trip)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden
                    ${selectedTrip?.id === trip.id 
                      ? 'bg-accent/10 border-accent/30 shadow-glow-accent/20' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-800 overflow-hidden border border-white/10">
                        <img src={`https://i.pravatar.cc/100?u=${trip.id}`} alt="driver" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">{trip.driver}</h4>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{trip.vehicle}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter
                      ${trip.status === 'Delayed' ? 'bg-danger/20 text-danger' : 'bg-accent/20 text-accent'}`}>
                      {trip.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-white">{trip.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${trip.progress}%` }}
                        className={`h-full ${trip.status === 'Delayed' ? 'bg-danger' : 'bg-accent shadow-glow-accent'}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span className="text-[9px] font-black uppercase">{trip.eta}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel size={10} />
                        <span className="text-[9px] font-black uppercase">{trip.fuel}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${selectedTrip?.id === trip.id ? 'rotate-90 text-accent' : 'text-gray-600'}`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Map & Details */}
        <div className="xl:col-span-2 space-y-6 flex flex-col h-full">
          {/* Mock Map Container */}
          <div className="glass-panel flex-1 min-h-[400px] border-white/5 relative overflow-hidden group bg-[#111111]">
            {/* Map Grid Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            {/* Simulated Map Paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.path 
                d="M100,500 Q250,300 450,450 T800,200" 
                stroke="white" strokeWidth="1" strokeOpacity="0.05" fill="none"
              />
              <motion.path 
                d="M100,500 L450,450" 
                stroke="#D4AF37" strokeWidth="2" strokeOpacity="0.3" fill="none"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>

            {/* Vehicle Markers */}
            {mockTrips.map((trip, idx) => (
              <motion.div 
                key={trip.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute cursor-pointer"
                style={{ 
                  top: `${20 + idx * 15}%`, 
                  left: `${30 + idx * 10}%` 
                }}
                onClick={() => setSelectedTrip(trip)}
              >
                <div className={`relative flex items-center justify-center`}>
                  <div className={`absolute inset-0 w-8 h-8 rounded-full animate-ping opacity-20 ${trip.status === 'Delayed' ? 'bg-danger' : 'bg-accent'}`} />
                  <div className={`w-3 h-3 rounded-full border-2 border-white shadow-glow-accent ${trip.status === 'Delayed' ? 'bg-danger' : 'bg-accent'}`} />
                  <AnimatePresence>
                    {selectedTrip?.id === trip.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#111111] border border-accent/30 p-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white shadow-2xl z-10"
                      >
                        {trip.vehicle} <span className="text-accent ml-2">{trip.speed}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="p-2 bg-[#111111] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <MapIcon size={18} />
              </button>
              <button className="p-2 bg-[#111111] border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Activity size={18} />
              </button>
            </div>

            {/* Status Overlay */}
            <div className="absolute bottom-4 left-4 p-4 bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-xl max-w-xs">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white">Live Operations Feed</p>
              </div>
              <p className="text-[9px] font-medium text-gray-500 mt-1 uppercase tracking-tighter">
                Receiving encrypted telemetry from 24 active units...
              </p>
            </div>
          </div>

          {/* Detailed Trip Info Card */}
          <AnimatePresence mode='wait'>
            <motion.div 
              key={selectedTrip?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-panel p-6 border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-800 overflow-hidden border border-white/10 shrink-0">
                    <img src={`https://i.pravatar.cc/100?u=${selectedTrip?.id}`} alt="driver" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{selectedTrip?.driver}</h3>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">{selectedTrip?.id} • {selectedTrip?.vehicle}</p>
                    <div className="flex gap-2 mt-3">
                      <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-primary transition-colors"><Phone size={14} /></button>
                      <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-highlight transition-colors"><MessageSquare size={14} /></button>
                      <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-danger transition-colors"><Shield size={14} /></button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Current Speed', value: selectedTrip?.speed, icon: Gauge },
                    { label: 'Energy Level', value: selectedTrip?.fuel, icon: Zap },
                    { label: 'Est. Arrival', value: selectedTrip?.eta, icon: Clock },
                    { label: 'Destination', value: selectedTrip?.destination.split(' ')[0], icon: MapPin },
                  ].map((item, i) => (
                    <div key={i} className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <item.icon size={10} />
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                      </div>
                      <p className="text-sm font-black text-white uppercase tracking-tight">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="shrink-0 flex items-end">
                  <button className="w-full lg:w-auto px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors">
                    Emergency Protocols
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminTrips;
