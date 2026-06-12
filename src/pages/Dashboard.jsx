import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import { DollarSign, Car, Zap, BatteryCharging, MapPin, Activity, CheckCircle2, AlertTriangle, MoreHorizontal, ArrowUpRight, Clock, ChevronRight } from 'lucide-react';

const revenueData = [
  { name: 'Mon', revenue: 4000, efficiency: 85 },
  { name: 'Tue', revenue: 3000, efficiency: 88 },
  { name: 'Wed', revenue: 5500, efficiency: 92 },
  { name: 'Thu', revenue: 4200, efficiency: 90 },
  { name: 'Fri', revenue: 6800, efficiency: 95 },
  { name: 'Sat', revenue: 8390, efficiency: 98 },
  { name: 'Sun', revenue: 7490, efficiency: 96 },
];

const vehicles = [
  { id: 1, name: 'Tesla Model S Plaid', status: 'Active', battery: 85, location: 'Downtown Hub', image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=300&auto=format&fit=crop' },
  { id: 2, name: 'Rivian R1T', status: 'Charging', battery: 42, location: 'Station B', image: 'https://images.unsplash.com/photo-1669023414162-8b0573b9c2b2?q=80&w=300&auto=format&fit=crop' },
  { id: 3, name: 'Lucid Air Grand', status: 'Available', battery: 98, location: 'Airport Hub', image: 'https://images.unsplash.com/photo-1688636900407-742a2015faec?q=80&w=300&auto=format&fit=crop' },
];

const activities = [
  { id: 1, type: 'booking', message: 'New reservation: Model S', time: '2 mins ago', icon: Car, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { id: 2, type: 'alert', message: 'R1T battery critical (15%)', time: '15 mins ago', icon: AlertTriangle, color: 'text-highlight', bg: 'bg-highlight/10 border-highlight/20' },
  { id: 3, type: 'status', message: 'Lucid Air arrived at HQ', time: '1 hour ago', icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
  { id: 4, type: 'charging', message: 'Model 3 started supercharging', time: '2 hours ago', icon: Zap, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
];

const utilizationData = [
  { name: 'Available', value: 30, fill: 'rgba(255,255,255,0.1)' },
  { name: 'Active', value: 70, fill: '#D4AF37' },
];

const StatCard = ({ icon: Icon, label, value, trend, colorClass, glowColorClass }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    className="relative group cursor-pointer"
  >
    <div className={`absolute inset-0 ${glowColorClass} rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100`}></div>
    <div className="relative glass-panel p-6 flex flex-col gap-4 overflow-hidden border-white/5 group-hover:border-white/20 transition-colors h-full">
      <div className={`absolute -right-10 -top-10 w-32 h-32 ${glowColorClass} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
      
      <div className="flex justify-between items-start z-10">
        <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${colorClass}`}>
          <Icon size={24} className="drop-shadow-[0_0_8px_currentColor]" />
        </div>
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 shadow-[0_0_10px_rgba(124,255,178,0.2)]">
          <ArrowUpRight size={14} /> {trend}
        </span>
      </div>
      
      <div className="z-10 mt-2">
        <p className="text-gray-400 text-xs font-semibold tracking-[0.15em] uppercase mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { stats } = useSelector(state => state.fleet);

  return (
    <div className="space-y-8 pb-12">
      {/* Header Area */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
            Command Overview
            <span className="inline-block w-3 h-3 rounded-full bg-accent shadow-[0_0_10px_rgba(124,255,178,0.8)] animate-pulse"></span>
          </h2>
          <p className="text-primary/70 mt-2 font-medium tracking-wide">System optimal. Real-time telemetry active.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400 font-medium">May 12, 2026</p>
          <p className="text-xl font-bold font-mono tracking-wider text-white">16:45:00</p>
        </div>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Gross Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          trend="12.5%" 
          colorClass="text-primary"
          glowColorClass="bg-primary/20"
        />
        <StatCard 
          icon={Activity} 
          label="Active Missions" 
          value={stats.activeBookings} 
          trend="8.2%" 
          colorClass="text-accent"
          glowColorClass="bg-accent/20"
        />
        <StatCard 
          icon={Zap} 
          label="Energy Efficiency" 
          value="94%" 
          trend="3.1%" 
          colorClass="text-highlight"
          glowColorClass="bg-highlight/20"
        />
        <StatCard 
          icon={BatteryCharging} 
          label="Grid Status" 
          value="Stable" 
          trend="100%" 
          colorClass="text-success"
          glowColorClass="bg-success/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-8 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">Revenue Telemetry</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">7-Day Trajectory</p>
            </div>
            <button className="text-primary hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <div className="h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(17, 17, 17, 0.9)', borderColor: 'rgba(212, 175, 55, 0.3)', borderRadius: '12px', boxShadow: '0 0 20px rgba(212, 175, 55, 0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" style={{ filter: 'drop-shadow(0px 0px 8px rgba(212, 175, 55, 0.3))' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Utilization Radial */}
        <div className="glass-panel p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent/10 rounded-full blur-[60px] -z-10"></div>
          
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Fleet Utilization</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">Real-time capacity</p>
          </div>

          <div className="h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="70%" 
                outerRadius="100%" 
                barSize={15} 
                data={utilizationData}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background={{ fill: 'rgba(255,255,255,0.05)' }}
                  clockWise
                  dataKey="value"
                  cornerRadius={10}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center -mt-8">
              <span className="text-5xl font-bold text-white drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]">70<span className="text-2xl text-primary">%</span></span>
              <span className="text-xs text-gray-400 tracking-widest mt-1 uppercase">Active</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]"></div>
              <span className="text-sm font-medium">On Mission</span>
            </div>
            <span className="font-bold text-white">42 Units</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Preview Cards */}
        <div className="lg:col-span-2 glass-panel p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white tracking-wide">Priority Assets</h3>
            <button className="text-xs font-semibold text-primary uppercase tracking-widest hover:text-white transition-colors">View Fleet</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="group rounded-2xl overflow-hidden bg-black relative border border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent z-10"></div>
                <img src={v.image} alt={v.name} className="w-full h-40 object-cover opacity-60 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
                
                <div className="absolute bottom-0 left-0 w-full p-4 z-20">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-white text-sm mb-1">{v.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gray-400">
                        <MapPin size={10} /> {v.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold mb-1
                        ${v.status === 'Active' ? 'text-accent' : v.status === 'Charging' ? 'text-highlight' : 'text-primary'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'Active' ? 'bg-accent' : v.status === 'Charging' ? 'bg-highlight' : 'bg-primary'} animate-pulse`}></span>
                        {v.status}
                      </div>
                      <span className="font-bold text-white text-sm">{v.battery}%</span>
                    </div>
                  </div>
                  {/* Battery Bar */}
                  <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${v.battery > 50 ? 'bg-accent shadow-[0_0_5px_#7CFFB2]' : 'bg-highlight shadow-[0_0_5px_#FDBA74]'}`} 
                      style={{ width: `${v.battery}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Timeline */}
        <div className="glass-panel p-8">
          <h3 className="text-lg font-bold text-white tracking-wide mb-6">Live Activity</h3>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[1.1rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:to-transparent">
            
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full border-2 ${activity.bg} ${activity.color} shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 backdrop-blur-md`}>
                  <activity.icon size={16} className="drop-shadow-[0_0_5px_currentColor]" />
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] glass-panel !p-3 !rounded-xl !bg-[#111111]/80 hover:!bg-[#111111] transition-colors border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${activity.color}`}>{activity.type}</span>
                    <time className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                      <Clock size={10} /> {activity.time}
                    </time>
                  </div>
                  <div className="text-sm font-medium text-gray-200">{activity.message}</div>
                </div>
              </div>
            ))}

          </div>
          
          <button className="w-full mt-6 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
            View All Logs <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
