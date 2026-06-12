// src/pages/dashboards/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminState } from '../../context/adminStateContext';
import { fetchDashboardAnalytics } from '../../store/analyticsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { 
  DollarSign, Car, Zap, Activity, Users, 
  TrendingUp, ArrowUpRight, ArrowDownRight, 
  ShieldCheck, FileText, ChevronRight, AlertCircle, Calendar, Truck, Clock, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const revenueData = [
  { name: 'Jan', revenue: 45000 },
  { name: 'Feb', revenue: 52000 },
  { name: 'Mar', revenue: 48000 },
  { name: 'Apr', revenue: 61000 },
  { name: 'May', revenue: 55000 },
  { name: 'Jun', revenue: 67000 },
];

const AdminDashboard = () => {
  const { 
    vehicles, bookings, drivers, contracts, payments, deliveries,
    createBooking, sendContract, assignDriver, scheduleDelivery, recordPayment 
  } = useAdminState();

  const dispatch = useDispatch();
  const { data: analytics, loading: loadingAnalytics, error: analyticsError } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  // Modal State for Quick Actions
  const [activeModal, setActiveModal] = useState(null); // 'booking', 'contract', 'driver', 'delivery', 'payment'
  
  // Form States for Quick Actions
  const [newBookingData, setNewBookingData] = useState({
    fullName: '', email: '', phone: '', vehicleId: '', startDate: '', endDate: '', pickupLocation: 'Beverly Hills Hub'
  });
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryDateTime, setDeliveryDateTime] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');

  // Operational counts
  const pendingReservations = bookings.filter(b => b.status === 'Pending Review').length;
  const pendingContracts = contracts.filter(c => c.status === 'Sent' || c.status === 'Draft').length;
  const pendingPayments = payments.filter(p => p.status === 'Pending').length;
  const todaysDeliveries = deliveries.filter(d => d.status === 'Scheduled' || d.status === 'Assigned').length;
  const todaysReturns = bookings.filter(b => b.status === 'Active Rental').length;
  const licensePending = bookings.filter(b => b.licenseStatus === 'Pending Review').length;

  const fleetAvailable = analytics ? (analytics.kpis.fleetUtilization > 0 ? Math.round(analytics.kpis.activeBookings) : vehicles.filter(v => v.status === 'Available').length) : 0;
  const fleetInMaintenance = vehicles.filter(v => v.status === 'Maintenance').length;

  const totalCars = analytics?.kpis?.fleetUtilization !== undefined ? Math.round((analytics.kpis.fleetUtilization > 0 ? 100 : 100)) : vehicles.length;
  const activeRentals = analytics?.kpis?.activeBookings || 0;
  const totalRevenue = analytics?.kpis?.revenue || 0;
  const occupancyRate = analytics?.kpis?.fleetUtilization || 0;
  const liveChartData = analytics?.chartData || [];

  const fleetStatusData = [
    { name: 'Active', value: activeRentals, color: '#D4AF37' },
    { name: 'Maintenance', value: fleetInMaintenance, color: '#FDBA74' },
    { name: 'Available', value: fleetAvailable, color: '#7CFFB2' },
  ];

  // Quick Action Submissions
  const handleCreateBookingSubmit = (e) => {
    e.preventDefault();
    if (!newBookingData.fullName || !newBookingData.vehicleId || !newBookingData.startDate || !newBookingData.endDate) {
      toast.error('All fields are required.');
      return;
    }
    const success = createBooking(newBookingData);
    if (success) {
      setActiveModal(null);
      setNewBookingData({ fullName: '', email: '', phone: '', vehicleId: '', startDate: '', endDate: '', pickupLocation: 'Beverly Hills Hub' });
    }
  };

  const handleSendContractSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId) return toast.error('Please select a booking.');
    sendContract(selectedBookingId);
    setActiveModal(null);
    setSelectedBookingId('');
  };

  const handleAssignDriverSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !selectedDriverId) return toast.error('Please select booking and driver.');
    assignDriver(selectedBookingId, selectedDriverId);
    setActiveModal(null);
    setSelectedBookingId('');
    setSelectedDriverId('');
  };

  const handleScheduleDeliverySubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !deliveryAddress || !deliveryDateTime) return toast.error('Please complete all logistics details.');
    scheduleDelivery(selectedBookingId, deliveryAddress, deliveryDateTime);
    setActiveModal(null);
    setSelectedBookingId('');
    setDeliveryAddress('');
    setDeliveryDateTime('');
  };

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !paymentAmount) return toast.error('Please enter payment credentials.');
    recordPayment(selectedBookingId, parseFloat(paymentAmount), paymentMethod);
    setActiveModal(null);
    setSelectedBookingId('');
    setPaymentAmount('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Executive Header */}
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
            Executive <span className="text-primary">Overview</span>
          </h2>
          <p className="text-gray-500 mt-2 font-bold tracking-[0.2em] uppercase text-[10px]">GOFINTAZA RENTAL BI INTERFACE V.3.0</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right px-4 border-r border-white/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Fleet Utilization</p>
            <p className="text-xl font-black text-white">{occupancyRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Active Clients</p>
            <p className="text-xl font-black text-accent">{bookings.filter(b => b.status === 'Active Rental' || b.status === 'Payment Completed').length}</p>
          </div>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Fleet Size', val: `${totalCars} exotics`, trend: `${fleetAvailable} available`, icon: Car, color: 'text-accent' },
          { label: 'Active Leases', val: `${activeRentals} active`, trend: `${occupancyRate}% utilization`, icon: Zap, color: 'text-primary' },
          { label: 'Pending Review', val: `${pendingReservations} reservations`, trend: `${licensePending} KYC checks`, icon: Calendar, color: 'text-highlight' },
          { label: 'Net Receipts', val: `$${(totalRevenue / 1000).toFixed(1)}K`, trend: '+14.6% this week', icon: DollarSign, color: 'text-primary' },
        ].map((kpi, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="glass-panel p-6 border-white/5 relative overflow-hidden group"
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${kpi.color}`}>
                <kpi.icon size={20} className="drop-shadow-[0_0_8px_currentColor]" />
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg border border-accent/20 bg-accent/10 text-accent`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-white tracking-tighter">{kpi.val}</h3>
          </motion.div>
        ))}
      </div>

      {/* Section 1: Detailed Operational Widgets */}
      <section className="glass-panel p-8 border-primary/20 bg-primary/5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Real-Time Operations</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Live Logistics and Compliance Surcharges</p>
          </div>
          <Zap size={20} className="text-primary animate-pulse" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Pending Reservations', val: pendingReservations, color: 'text-yellow-500' },
            { label: 'Pending Contracts', val: pendingContracts, color: 'text-amber-500' },
            { label: 'Pending Payments', val: pendingPayments, color: 'text-red-400' },
            { label: 'Today\'s Deliveries', val: todaysDeliveries, color: 'text-[#D4AF37]' },
            { label: 'Today\'s Returns', val: todaysReturns, color: 'text-emerald-400' },
            { label: 'License Pending', val: licensePending, color: 'text-orange-400' },
            { label: 'Fleet Available', val: fleetAvailable, color: 'text-blue-400' },
            { label: 'Fleet In Maintenance', val: fleetInMaintenance, color: 'text-gray-400' },
          ].map((op, i) => (
            <div key={i} className="p-4 bg-[#0A0D14] border border-white/5 rounded-2xl text-center">
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1 leading-tight h-6 flex items-center justify-center">{op.label}</p>
              <p className={`text-2xl font-black ${op.color}`}>{op.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Actions Buttons */}
      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Executive Quick Console</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Create Booking', modal: 'booking', icon: Calendar, color: 'hover:bg-primary/20 hover:border-primary/40' },
            { label: 'Create Contract', modal: 'contract', icon: FileText, color: 'hover:bg-amber-500/20 hover:border-amber-500/40' },
            { label: 'Assign Driver', modal: 'driver', icon: Users, color: 'hover:bg-blue-500/20 hover:border-blue-500/40' },
            { label: 'Schedule Delivery', modal: 'delivery', icon: Truck, color: 'hover:bg-emerald-500/20 hover:border-emerald-500/40' },
            { label: 'Record Payment', modal: 'payment', icon: DollarSign, color: 'hover:bg-red-500/20 hover:border-red-500/40' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => setActiveModal(action.modal)}
              className={`p-6 glass-panel border-white/5 transition-all flex flex-col items-center gap-4 group ${action.color}`}
            >
              <div className="p-3 bg-white/5 rounded-xl text-gray-500 group-hover:text-white group-hover:scale-110 transition-all">
                <action.icon size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-white text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Financial Analytics */}
        <div className="lg:col-span-2 glass-panel p-8 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Revenue Dynamics</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">H1 2026 Fiscal Analysis</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Revenue</button>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveChartData.length > 0 ? liveChartData : revenueData}>
                  <defs>
                    <linearGradient id="adminGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={4} fill="url(#adminGlow)" />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rental Composition */}
        <div className="glass-panel p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Rental Status</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Real-time Allocation</p>
          </div>

          <div className="h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fleetStatusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {fleetStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-black text-white">{totalCars}</p>
              <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Total Fleet</p>
            </div>
          </div>

          <div className="space-y-2">
            {fleetStatusData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-white">{item.value} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#111111] border border-[#D4AF37]/25 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-3 mb-4">
                <h4 className="text-md font-bold uppercase tracking-wider text-white">
                  {activeModal === 'booking' && 'Initiate Booking File'}
                  {activeModal === 'contract' && 'Issue Client Compact'}
                  {activeModal === 'driver' && 'Assign Logistics Driver'}
                  {activeModal === 'delivery' && 'Schedule Delivery Dispatch'}
                  {activeModal === 'payment' && 'Record Payment Transaction'}
                </h4>
                <button onClick={() => setActiveModal(null)} className="p-1 text-gray-500 hover:text-white"><X size={18} /></button>
              </div>

              {/* CREATE BOOKING FORM */}
              {activeModal === 'booking' && (
                <form onSubmit={handleCreateBookingSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      value={newBookingData.fullName}
                      onChange={e => setNewBookingData({ ...newBookingData, fullName: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                      placeholder="Client Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email</label>
                      <input
                        type="email"
                        value={newBookingData.email}
                        onChange={e => setNewBookingData({ ...newBookingData, email: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                        placeholder="email@address.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                      <input
                        type="text"
                        value={newBookingData.phone}
                        onChange={e => setNewBookingData({ ...newBookingData, phone: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Luxury Vehicle</label>
                    <select
                      value={newBookingData.vehicleId}
                      onChange={e => setNewBookingData({ ...newBookingData, vehicleId: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                    >
                      <option value="" disabled>Select vehicle...</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} — ${v.price}/day ({v.status})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pickup Date</label>
                      <input
                        type="date"
                        value={newBookingData.startDate}
                        onChange={e => setNewBookingData({ ...newBookingData, startDate: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Return Date</label>
                      <input
                        type="date"
                        value={newBookingData.endDate}
                        onChange={e => setNewBookingData({ ...newBookingData, endDate: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.01] shadow-md transition-all"
                  >
                    Initiate Booking File
                  </button>
                </form>
              )}

              {/* ISSUE CONTRACT */}
              {activeModal === 'contract' && (
                <form onSubmit={handleSendContractSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Booking File</label>
                    <select
                      value={selectedBookingId}
                      onChange={e => setSelectedBookingId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                    >
                      <option value="" disabled>Select booking...</option>
                      {bookings.filter(b => b.contractStatus === 'Draft').map(b => (
                        <option key={b.id} value={b.id}>{b.id} — {b.customer} ({b.vehicleName})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.01] shadow-md transition-all"
                  >
                    Send Lease Agreement Contract
                  </button>
                </form>
              )}

              {/* ASSIGN DRIVER */}
              {activeModal === 'driver' && (
                <form onSubmit={handleAssignDriverSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Booking File</label>
                    <select
                      value={selectedBookingId}
                      onChange={e => setSelectedBookingId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                    >
                      <option value="" disabled>Select booking...</option>
                      {bookings.filter(b => b.deliveryStatus === 'Scheduled' && !b.driverId).map(b => (
                        <option key={b.id} value={b.id}>{b.id} — {b.customer} ({b.vehicleName})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Available Driver</label>
                    <select
                      value={selectedDriverId}
                      onChange={e => setSelectedDriverId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none"
                    >
                      <option value="" disabled>Select driver...</option>
                      {drivers.filter(d => d.status === 'Available').map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.01] shadow-md transition-all"
                  >
                    Assign Driver to Logistics Delivery
                  </button>
                </form>
              )}

              {/* SCHEDULE DELIVERY */}
              {activeModal === 'delivery' && (
                <form onSubmit={handleScheduleDeliverySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Booking File</label>
                    <select
                      value={selectedBookingId}
                      onChange={e => setSelectedBookingId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                    >
                      <option value="" disabled>Select booking...</option>
                      {bookings.filter(b => b.deliveryStatus === 'Not Scheduled').map(b => (
                        <option key={b.id} value={b.id}>{b.id} — {b.customer} ({b.vehicleName})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none"
                      placeholder="e.g. 1004 Beverly Hills Blvd CA"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Delivery Date & Time</label>
                    <input
                      type="datetime-local"
                      value={deliveryDateTime}
                      onChange={e => setDeliveryDateTime(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.01] shadow-md transition-all"
                  >
                    Schedule Delivery Dispatch
                  </button>
                </form>
              )}

              {/* RECORD PAYMENT */}
              {activeModal === 'payment' && (
                <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Booking File</label>
                    <select
                      value={selectedBookingId}
                      onChange={e => setSelectedBookingId(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                    >
                      <option value="" disabled>Select booking...</option>
                      {bookings.filter(b => b.paymentStatus === 'Pending').map(b => (
                        <option key={b.id} value={b.id}>{b.id} — {b.customer} (Due: ${b.totalPrice})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount Paid</label>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none"
                        placeholder="Amount"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value="Credit Card">Credit Card</option>
                        <option value="Stripe">Stripe</option>
                        <option value="Zelle">Zelle</option>
                        <option value="Cash App">Cash App</option>
                        <option value="Cash">Cash</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.01] shadow-md transition-all"
                  >
                    Record Payment Transaction
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
