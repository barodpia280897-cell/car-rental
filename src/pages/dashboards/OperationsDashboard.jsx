import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminState } from '../../context/adminStateContext';
import { fetchDashboardAnalytics } from '../../store/analyticsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, MapPin, CheckCircle2, AlertCircle, 
  ArrowRight, Filter, ChevronRight, Activity,
  Calendar, Wrench, ShieldAlert, Zap, Car, Plus, X, User, Send, Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const OperationsDashboard = () => {
  const {
    vehicles,
    bookings,
    drivers,
    deliveries,
    tasks,
    activities,
    incidents,
    currentOperationsRole,
    setOperationsRole,
    hasOperationalPermission,
    createTask,
    assignDriver,
    completeInspection,
    updateVehicleStatus,
    scheduleReturn,
    createIncident
  } = useAdminState();

  // Active Modals State
  const [activeModal, setActiveModal] = useState(null); // 'task' | 'driver' | 'inspection' | 'ready' | 'return' | 'emergency'

  const dispatch = useDispatch();
  const { data: analytics, loading: loadingAnalytics, error: analyticsError } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  // Form states
  const [taskForm, setTaskForm] = useState({ title: '', type: 'Cleaning', priority: 'Medium', vehicleId: '', notes: '' });
  const [driverForm, setDriverForm] = useState({ bookingId: '', driverId: '' });
  const [inspectionForm, setInspectionForm] = useState({ bookingId: '', type: 'out', fuel: 100, mileage: 5000, damageNotes: '', inspector: 'Marcus Chen' });
  const [readyForm, setReadyForm] = useState({ vehicleId: '' });
  const [returnForm, setReturnForm] = useState({ bookingId: '', returnDate: '', returnLocation: 'Beverly Hills Hub', driverId: '', returnNotes: '' });
  const [emergencyForm, setEmergencyForm] = useState({ vehicle: '', driver: '', customer: '', type: 'Accident', severity: 'Critical', description: '' });

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const deliveriesToday = (deliveries || []).filter(d => d.status !== 'Closed' && d.scheduleDate && d.scheduleDate.includes(todayStr)).length;
  const returnsToday = (deliveries || []).filter(d => d.status === 'Return Scheduled' && d.returnDate && d.returnDate.includes(todayStr)).length;
  const vehiclesInTransit = analytics?.kpis?.pendingTrips || 0;
  const availableDrivers = (drivers || []).filter(d => d.availability === 'Available').length;
  const assignedDrivers = (drivers || []).filter(d => d.status === 'Assigned' || d.status === 'On Route' || d.status === 'Return Pickup').length;
  const vehiclesReady = (vehicles || []).filter(v => v.status === 'Available').length;
  const vehiclesMaintenance = analytics?.kpis?.maintenanceVehicles || 0;
  const openIncidents = (incidents || []).filter(inc => inc.status !== 'Closed' && inc.status !== 'Resolved').length;
  const pendingTasks = analytics?.kpis?.pendingBookings || 0;

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Insufficient permissions to create tasks.');
      return;
    }
    const vehicle = vehicles.find(v => v.id === parseInt(taskForm.vehicleId));
    createTask({
      title: taskForm.title,
      type: taskForm.type,
      priority: taskForm.priority,
      vehicleId: taskForm.vehicleId ? parseInt(taskForm.vehicleId) : null,
      vehicleName: vehicle ? vehicle.name : 'N/A',
      notes: taskForm.notes
    });
    setTaskForm({ title: '', type: 'Cleaning', priority: 'Medium', vehicleId: '', notes: '' });
    setActiveModal(null);
  };

  const handleAssignDriverSubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Assign Driver')) {
      toast.error('Insufficient permissions to assign drivers.');
      return;
    }
    assignDriver(driverForm.bookingId, driverForm.driverId);
    setDriverForm({ bookingId: '', driverId: '' });
    setActiveModal(null);
  };

  const handleInspectionSubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Vehicle Inspection')) {
      toast.error('Insufficient permissions to complete inspections.');
      return;
    }
    completeInspection(inspectionForm.bookingId, inspectionForm.type, {
      fuel: parseInt(inspectionForm.fuel),
      mileage: parseInt(inspectionForm.mileage),
      damageNotes: inspectionForm.damageNotes,
      inspector: inspectionForm.inspector
    });
    setInspectionForm({ bookingId: '', type: 'out', fuel: 100, mileage: 5000, damageNotes: '', inspector: 'Marcus Chen' });
    setActiveModal(null);
  };

  const handleMarkReadySubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Vehicle Readiness')) {
      toast.error('Insufficient permissions to update vehicle readiness.');
      return;
    }
    updateVehicleStatus(parseInt(readyForm.vehicleId), 'Available');
    toast.success('Vehicle marked Available/Ready for dispatch.');
    setReadyForm({ vehicleId: '' });
    setActiveModal(null);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Schedule Return')) {
      toast.error('Insufficient permissions to schedule returns.');
      return;
    }
    scheduleReturn(returnForm.bookingId, returnForm.returnDate, returnForm.returnLocation, returnForm.driverId, returnForm.returnNotes);
    setReturnForm({ bookingId: '', returnDate: '', returnLocation: 'Beverly Hills Hub', driverId: '', returnNotes: '' });
    setActiveModal(null);
  };

  const handleEmergencySubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Insufficient permissions to log emergencies.');
      return;
    }
    createIncident({
      vehicle: emergencyForm.vehicle,
      driver: emergencyForm.driver,
      customer: emergencyForm.customer,
      type: emergencyForm.type,
      severity: emergencyForm.severity,
      description: emergencyForm.description
    });
    setEmergencyForm({ vehicle: '', driver: '', customer: '', type: 'Accident', severity: 'Critical', description: '' });
    setActiveModal(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Ops Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-glow-accent"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Real-Time Rental Operations Feed</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none font-serif">
            Operations <span className="text-accent not-italic font-serif">Control Center</span>
          </h2>
        </div>
        
        {/* Role Switcher Widget */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
          <Shield className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest leading-none">Console Role</span>
            <select 
              value={currentOperationsRole} 
              onChange={(e) => {
                setOperationsRole(e.target.value);
                toast.success(`Switched console view to ${e.target.value}`);
              }}
              className="bg-transparent text-xs font-black text-primary uppercase outline-none cursor-pointer border-none p-0 mt-0.5"
            >
              <option value="Operations Manager">Operations Manager</option>
              <option value="Dispatcher">Dispatcher</option>
              <option value="Fleet Coordinator">Fleet Coordinator</option>
              <option value="Driver Supervisor">Driver Supervisor</option>
              <option value="Maintenance Coordinator">Maintenance Coordinator</option>
              <option value="Operations Staff">Operations Staff</option>
            </select>
          </div>
        </div>
      </header>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-9 gap-4">
        {[
          { label: 'Deliveries Today', val: deliveriesToday, desc: 'Active dispatches due', color: 'text-primary' },
          { label: 'Returns Today', val: returnsToday, desc: 'Collections scheduled', color: 'text-accent' },
          { label: 'In Transit', val: vehiclesInTransit, desc: 'Units on public roads', color: 'text-blue-400' },
          { label: 'Available Drivers', val: availableDrivers, desc: 'Chauffeurs standby', color: 'text-emerald-400' },
          { label: 'Assigned Drivers', val: assignedDrivers, desc: 'Active duty dispatches', color: 'text-[#D4AF37]' },
          { label: 'Vehicles Ready', val: vehiclesReady, desc: 'Showroom deployment', color: 'text-emerald-400' },
          { label: 'In Maintenance', val: vehiclesMaintenance, desc: 'Workshop service bays', color: 'text-red-400' },
          { label: 'Open Incidents', val: openIncidents, desc: 'Requiring manager resolution', color: 'text-red-500', isCritical: openIncidents > 0 },
          { label: 'Pending Tasks', val: pendingTasks, desc: 'Staff workflow items', color: 'text-indigo-400' },
        ].map((stat, i) => (
           <div key={i} className={`glass-panel p-4 border-white/5 flex flex-col justify-between ${stat.isCritical ? 'border-red-500/25 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : ''}`}>
              <div>
                 <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                 <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                 <p className="text-[7px] font-bold text-gray-600 uppercase tracking-widest mt-1">{stat.desc}</p>
              </div>
           </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Priorities & Incidents */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Active Tasks Grid */}
           <div className="glass-panel p-6 border-white/5">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-base font-black text-[#D4AF37] uppercase tracking-wider font-serif flex items-center gap-3">
                    <Zap size={18} className="text-accent animate-pulse" /> Active Operations Tasks
                 </h3>
                 <span className="text-[9px] font-black text-accent uppercase tracking-widest px-2.5 py-1 bg-accent/10 rounded-lg">
                   {(tasks || []).filter(t => t.status !== 'Completed' && t.status !== 'Cancelled').length} Active
                 </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(tasks || []).slice(0, 4).map((job, i) => (
                    <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-accent/30 transition-all cursor-pointer group">
                       <div className="flex justify-between items-start mb-3">
                          <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            job.priority === 'High' || job.priority === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                             {job.priority} Priority
                          </span>
                          <span className="text-[8px] font-mono text-gray-500">{job.id}</span>
                       </div>
                       <h4 className="text-xs font-black text-white uppercase truncate">{job.title}</h4>
                       <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase italic">{job.vehicleName || 'Multiple Units'}</p>
                       <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                             <Clock size={10} className="text-accent" />
                             <span className="text-[9px] font-black text-white italic">Due {job.dueDate}</span>
                          </div>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest border border-white/10 px-1.5 py-0.5 rounded">{job.status}</span>
                       </div>
                    </div>
                 ))}
                 {(tasks || []).length === 0 && (
                   <p className="col-span-2 text-xs text-gray-500 italic text-center py-6">No active tasks on files.</p>
                 )}
              </div>
           </div>

           {/* Active Incidents Panel */}
           <div className="glass-panel p-6 border-white/5">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-base font-black text-[#D4AF37] uppercase tracking-wider font-serif flex items-center gap-3">
                    <ShieldAlert size={18} className="text-red-500" /> Active Incidents
                 </h3>
                 <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-950/20 rounded-md">{openIncidents} Incidents</span>
              </div>
              <div className="space-y-3">
                 {(incidents || []).filter(inc => inc.status !== 'Closed' && inc.status !== 'Resolved').map((inc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#0A0A0A] border border-white/5 rounded-xl hover:border-red-500/30 transition-all cursor-pointer">
                       <div className="flex items-center gap-4">
                          <div className="p-2 bg-red-950/25 text-red-500 rounded-lg">
                             <AlertCircle size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-white uppercase tracking-wide leading-tight">{inc.description}</p>
                             <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">
                               {inc.id} • {inc.type} • Severity: <span className="text-red-400">{inc.severity}</span>
                             </p>
                          </div>
                       </div>
                       <span className="text-[8px] font-black text-red-400 uppercase tracking-widest px-2 py-0.5 border border-red-500/20 rounded-md">
                          {inc.status}
                       </span>
                    </div>
                 ))}
                 {(incidents || []).filter(inc => inc.status !== 'Closed' && inc.status !== 'Resolved').length === 0 && (
                   <p className="text-xs text-gray-500 italic text-center py-4">All incidents resolved. System green.</p>
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Actions & Activity Feed */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Quick Actions Panel */}
           <div className="glass-panel p-6 border-white/5">
              <h3 className="text-base font-black text-[#D4AF37] uppercase tracking-wider font-serif mb-6">Quick Operations</h3>
              <div className="grid grid-cols-2 gap-3">
                 {[
                    { label: 'Create Task', icon: Plus, type: 'task', color: 'bg-primary/10 text-primary', permission: 'Create/Edit/Delete' },
                    { label: 'Assign Driver', icon: User, type: 'driver', color: 'bg-accent/10 text-accent', permission: 'Assign Driver' },
                    { label: 'Start Inspection', icon: CheckCircle2, type: 'inspection', color: 'bg-emerald-400/10 text-emerald-400', permission: 'Vehicle Inspection' },
                    { label: 'Mark Ready', icon: Zap, type: 'ready', color: 'bg-accent/10 text-accent', permission: 'Vehicle Readiness' },
                    { label: 'Schedule Return', icon: Calendar, type: 'return', color: 'bg-indigo-400/10 text-indigo-400', permission: 'Schedule Return' },
                 ].map((action, i) => {
                    const disabled = !hasOperationalPermission(action.permission);
                    return (
                      <button 
                        key={i} 
                        onClick={() => !disabled && setActiveModal(action.type)}
                        className={`flex flex-col items-center justify-center p-4 bg-white/5 border border-white/5 rounded-xl transition-all group gap-2 ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-primary/40'}`}
                      >
                         <div className={`p-2 rounded-lg ${action.color} ${!disabled && 'group-hover:scale-110 transition-transform'}`}>
                            <action.icon size={16} />
                         </div>
                         <span className={`text-[9px] font-black uppercase tracking-widest text-gray-400 ${!disabled && 'group-hover:text-white transition-colors'}`}>{action.label}</span>
                      </button>
                    )
                 })}
                 <button 
                   onClick={() => hasOperationalPermission('Create/Edit/Delete') ? setActiveModal('emergency') : toast.error('Insufficient permissions')}
                   className={`col-span-2 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[9px] transition-all italic flex items-center justify-center gap-2 ${!hasOperationalPermission('Create/Edit/Delete') ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-700 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}
                 >
                    <ShieldAlert size={14} /> Emergency Dispatch
                 </button>
              </div>
           </div>

           {/* Live Activity Feed */}
           <div className="glass-panel p-6 border-white/5">
              <h3 className="text-base font-black text-[#D4AF37] uppercase tracking-wider font-serif mb-6">Live Activity Feed</h3>
              <div className="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                 {(activities || []).map((act, i) => (
                    <div key={act.id || i} className="flex gap-3 relative pb-2 border-b border-white/[0.03]">
                       <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                       <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-white uppercase leading-snug">{act.title}</p>
                          <p className="text-[9px] text-gray-400">{act.desc}</p>
                          <span className="text-[8px] text-gray-600 font-mono block mt-1">{new Date(act.date).toLocaleTimeString()}</span>
                       </div>
                    </div>
                 ))}
                 {(activities || []).length === 0 && (
                   <p className="text-xs text-gray-500 italic text-center py-4">No activities logged yet.</p>
                 )}
              </div>
           </div>

        </div>
      </div>

      {/* DYNAMIC MODALS FOR QUICK ACTIONS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-sm font-black uppercase text-primary tracking-widest flex items-center gap-2">
                   <Zap size={14} /> Quick Action Panel
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Task Creation Form */}
              {activeModal === 'task' && (
                <form onSubmit={handleCreateTaskSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Task Title</label>
                    <input 
                      type="text" 
                      value={taskForm.title} 
                      onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                      placeholder="e.g. Sanitize steering wheel"
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Category</label>
                      <select 
                        value={taskForm.type} 
                        onChange={e => setTaskForm({...taskForm, type: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        {['Cleaning', 'Inspection', 'Maintenance', 'Vehicle Delivery', 'Vehicle Pickup', 'Documentation', 'Customer Follow Up', 'Emergency'].map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Priority</label>
                      <select 
                        value={taskForm.priority} 
                        onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        {['Low', 'Medium', 'High', 'Critical'].map(prio => (
                          <option key={prio} value={prio}>{prio}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Asset (Vehicle ID)</label>
                    <select 
                      value={taskForm.vehicleId} 
                      onChange={e => setTaskForm({...taskForm, vehicleId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white"
                    >
                      <option value="">No specific vehicle</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Notes / Directives</label>
                    <textarea 
                      value={taskForm.notes} 
                      onChange={e => setTaskForm({...taskForm, notes: e.target.value})}
                      placeholder="Add descriptions..." 
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white h-20"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary text-black font-black uppercase tracking-widest rounded-lg">Create Task</button>
                </form>
              )}

              {/* Driver Assignment Form */}
              {activeModal === 'driver' && (
                <form onSubmit={handleAssignDriverSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Select Active Dispatch File</label>
                    <select 
                      value={driverForm.bookingId} 
                      onChange={e => setDriverForm({...driverForm, bookingId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required
                    >
                      <option value="">Select dispatch...</option>
                      {deliveries.filter(d => d.status === 'Not Scheduled' || d.status === 'Scheduled').map(d => (
                        <option key={d.bookingId} value={d.bookingId}>{d.id} - {d.vehicleName} for {d.customerName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Assign Chauffeur</label>
                    <select 
                      value={driverForm.driverId} 
                      onChange={e => setDriverForm({...driverForm, driverId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required
                    >
                      <option value="">Select driver...</option>
                      {drivers.map(drv => (
                        <option key={drv.id} value={drv.id}>{drv.name} ({drv.availability} / {drv.status})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-accent text-black font-black uppercase tracking-widest rounded-lg">Confirm Driver Assignment</button>
                </form>
              )}

              {/* Vehicle Inspection Form */}
              {activeModal === 'inspection' && (
                <form onSubmit={handleInspectionSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Select Booking File</label>
                    <select 
                      value={inspectionForm.bookingId} 
                      onChange={e => setInspectionForm({...inspectionForm, bookingId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required
                    >
                      <option value="">Select dispatch...</option>
                      {bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed').map(b => (
                        <option key={b.id} value={b.id}>{b.id} - {b.vehicleName} ({b.customer})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Inspection Stage</label>
                      <select 
                        value={inspectionForm.type} 
                        onChange={e => setInspectionForm({...inspectionForm, type: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="out">Pre-Delivery (Out)</option>
                        <option value="in">Post-Return (In)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Inspector</label>
                      <input 
                        type="text" 
                        value={inspectionForm.inspector} 
                        onChange={e => setInspectionForm({...inspectionForm, inspector: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Fuel Level (%)</label>
                      <input 
                        type="number" 
                        value={inspectionForm.fuel} 
                        onChange={e => setInspectionForm({...inspectionForm, fuel: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                        min="0" max="100" required 
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Current Mileage</label>
                      <input 
                        type="number" 
                        value={inspectionForm.mileage} 
                        onChange={e => setInspectionForm({...inspectionForm, mileage: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Condition / Damage Notes</label>
                    <textarea 
                      value={inspectionForm.damageNotes} 
                      onChange={e => setInspectionForm({...inspectionForm, damageNotes: e.target.value})}
                      placeholder="List any blemishes..." 
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white h-20"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-[#D4AF37] text-black font-black uppercase tracking-widest rounded-lg">Submit Inspection Record</button>
                </form>
              )}

              {/* Mark Vehicle Ready Form */}
              {activeModal === 'ready' && (
                <form onSubmit={handleMarkReadySubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Select Fleet Asset</label>
                    <select 
                      value={readyForm.vehicleId} 
                      onChange={e => setReadyForm({vehicleId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required
                    >
                      <option value="">Select vehicle...</option>
                      {vehicles.filter(v => v.status !== 'Available').map(v => (
                        <option key={v.id} value={v.id}>{v.name} ({v.licensePlate}) - Status: {v.status}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-accent text-black font-black uppercase tracking-widest rounded-lg">Mark Vehicle as Ready</button>
                </form>
              )}

              {/* Schedule Return Form */}
              {activeModal === 'return' && (
                <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Active Booking</label>
                    <select 
                      value={returnForm.bookingId} 
                      onChange={e => setReturnForm({...returnForm, bookingId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required
                    >
                      <option value="">Select booking...</option>
                      {bookings.filter(b => b.status === 'Active Rental').map(b => (
                        <option key={b.id} value={b.id}>{b.id} - {b.vehicleName} ({b.customer})</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Return Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={returnForm.returnDate} 
                        onChange={e => setReturnForm({...returnForm, returnDate: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white [color-scheme:dark]" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Return Hub</label>
                      <input 
                        type="text" 
                        value={returnForm.returnLocation} 
                        onChange={e => setReturnForm({...returnForm, returnLocation: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Assign Collection Driver</label>
                    <select 
                      value={returnForm.driverId} 
                      onChange={e => setReturnForm({...returnForm, driverId: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required
                    >
                      <option value="">Select chauffeur...</option>
                      {drivers.map(drv => (
                        <option key={drv.id} value={drv.id}>{drv.name} ({drv.availability})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Collection Notes</label>
                    <textarea 
                      value={returnForm.returnNotes} 
                      onChange={e => setReturnForm({...returnForm, returnNotes: e.target.value})}
                      placeholder="Add details..." 
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white h-20"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-primary text-black font-black uppercase tracking-widest rounded-lg">Save Return Schedule</button>
                </form>
              )}

              {/* Emergency Dispatch Form */}
              {activeModal === 'emergency' && (
                <form onSubmit={handleEmergencySubmit} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Incident Type</label>
                      <select 
                        value={emergencyForm.type} 
                        onChange={e => setEmergencyForm({...emergencyForm, type: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        {['Vehicle Damage', 'Late Return', 'Driver No Show', 'Customer Complaint', 'Accident', 'Mechanical Issue', 'Documentation Issue'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Severity</label>
                      <select 
                        value={emergencyForm.severity} 
                        onChange={e => setEmergencyForm({...emergencyForm, severity: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="Minor">Minor</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Affected Vehicle</label>
                    <input 
                      type="text" 
                      value={emergencyForm.vehicle} 
                      onChange={e => setEmergencyForm({...emergencyForm, vehicle: e.target.value})}
                      placeholder="e.g. Aston Martin (LXR-908B)" 
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Driver Involve</label>
                      <input 
                        type="text" 
                        value={emergencyForm.driver} 
                        onChange={e => setEmergencyForm({...emergencyForm, driver: e.target.value})}
                        placeholder="Driver Name..." 
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Customer</label>
                      <input 
                        type="text" 
                        value={emergencyForm.customer} 
                        onChange={e => setEmergencyForm({...emergencyForm, customer: e.target.value})}
                        placeholder="Customer Name..." 
                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Incident Report Description</label>
                    <textarea 
                      value={emergencyForm.description} 
                      onChange={e => setEmergencyForm({...emergencyForm, description: e.target.value})}
                      placeholder="Specify crash, engine failure, customer dispute detail..." 
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white h-20"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-lg">File Incident & Alert Ops</button>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperationsDashboard;
