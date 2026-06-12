import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, MapPin, Search,
  ChevronRight, User, Car, X, FileText, Truck,
  CheckCircle2, AlertCircle, Package, RotateCcw, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── helpers ─────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
};

const StatusBadge = ({ status }) => {
  const map = {
    'Not Scheduled':   'text-gray-500 border-gray-500/30',
    'Scheduled':       'text-blue-400 border-blue-400/30',
    'Driver Assigned': 'text-purple-400 border-purple-400/30',
    'Ready For Dispatch': 'text-accent border-accent/30 bg-accent/10',
    'In Transit':      'text-[#D4AF37] border-[#D4AF37]/30',
    'Delivered':       'text-emerald-400 border-emerald-400/30',
    'Return Scheduled':'text-orange-400 border-orange-400/30',
    'Returned':        'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
    'Closed':          'text-gray-400 border-gray-400/30 bg-gray-900',
  };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest border px-2 py-0.5 rounded ${map[status] ?? 'text-white border-white/30'}`}>
      {status}
    </span>
  );
};

/* ─── main component ──────────────────────────────── */
const OperationsSchedule = () => {
  const {
    bookings,
    deliveries,
    drivers,
    vehicles,
    customers,
    hasOperationalPermission,
    assignDriver,
    scheduleDelivery,
    completeInspection,
    dispatchVehicle,
    markDelivered,
    scheduleReturn,
    markReturned,
    closeDelivery,
  } = useAdminState();

  /* filters */
  const [dateFilter,   setDateFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm,   setSearchTerm]   = useState('');

  /* drawer */
  const [drawer,      setDrawer]     = useState(null); // selected delivery obj
  const [drawerTab,   setDrawerTab]  = useState('Overview');

  /* sub-form for "Assign Driver" inside drawer */
  const [driverPick,  setDriverPick] = useState('');

  /* sub-form for "Schedule Delivery" */
  const [schForm,     setSchForm]    = useState({ address: '', dateTime: '' });

  /* sub-form for "Schedule Return" */
  const [retForm,     setRetForm]    = useState({ returnDate: '', returnLocation: '', driverId: '' });

  /* active inline action panel */
  const [actionPanel, setActionPanel] = useState(null); // 'assign'|'schedule'|'return'|null

  /* ── filtering ── */
  const filteredDeliveries = (deliveries || []).filter(del => {
    const q = searchTerm.toLowerCase();
    const matchSearch = del.vehicleName?.toLowerCase().includes(q) ||
                        del.customerName?.toLowerCase().includes(q) ||
                        del.id?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || del.status === statusFilter;
    const matchDate   = !dateFilter || del.scheduleDate?.startsWith(dateFilter);
    return matchSearch && matchStatus && matchDate;
  });

  /* ── open drawer ── */
  const openDrawer = (del) => {
    setDrawer(del);
    setDrawerTab('Overview');
    setActionPanel(null);
    setDriverPick('');
    setSchForm({ address: del.address || del.deliveryAddress || '', dateTime: del.scheduleDate || '' });
    setRetForm({ returnDate: '', returnLocation: 'Beverly Hills Hub', driverId: '' });
  };

  /* ── derived linked data ── */
  const linkedBooking  = drawer ? (bookings  || []).find(b => b.id === drawer.bookingId)            : null;
  const linkedVehicle  = drawer ? (vehicles  || []).find(v => v.id === linkedBooking?.vehicleId)    : null;
  const linkedDriver   = drawer ? (drivers   || []).find(d => d.name === drawer.driverName)          : null;
  const linkedCustomer = drawer ? (customers || []).find(c => c.name === drawer.customerName)        : null;

  /* ── action handlers ── */
  const handleAssignDriver = () => {
    if (!driverPick) { toast.error('Please select a driver.'); return; }
    assignDriver(drawer.bookingId, driverPick);
    setActionPanel(null);
    setDrawer(prev => prev ? { ...prev, status: 'Driver Assigned' } : prev);
  };

  const handleScheduleDelivery = () => {
    if (!schForm.address || !schForm.dateTime) { toast.error('Please fill in address and date.'); return; }
    scheduleDelivery(drawer.bookingId, schForm.address, schForm.dateTime);
    setActionPanel(null);
  };

  const handleStartInspection = () => {
    completeInspection(drawer.bookingId, 'out', { fuel: 100, mileage: 5000, damageNotes: 'None', inspector: 'Ops Console' });
  };

  const handleDispatch = () => {
    dispatchVehicle(drawer.bookingId);
  };

  const handleConfirmDelivery = () => {
    markDelivered(drawer.bookingId, 'Confirmed via Ops Console.');
  };

  const handleScheduleReturn = () => {
    if (!retForm.returnDate || !retForm.driverId) { toast.error('Please fill in return date and select a driver.'); return; }
    scheduleReturn(drawer.bookingId, retForm.returnDate, retForm.returnLocation, retForm.driverId, 'Scheduled via Ops Console.');
    setActionPanel(null);
  };

  const handleConfirmReturn = () => {
    markReturned(drawer.bookingId);
  };

  const handleCompleteDispatch = () => {
    closeDelivery(drawer.bookingId);
  };

  /* ── action center config ── */
  const getActions = (del) => {
    if (!del) return [];
    const s = del.status;
    return [
      {
        key: 'assign',
        label: 'Assign Driver',
        icon: User,
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        show: ['Not Scheduled', 'Scheduled'].includes(s),
        perm: 'Assign Driver',
        onPress: () => setActionPanel('assign'),
      },
      {
        key: 'schedule',
        label: 'Schedule Delivery',
        icon: CalendarIcon,
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        show: ['Not Scheduled'].includes(s),
        perm: 'Schedule Delivery',
        onPress: () => setActionPanel('schedule'),
      },
      {
        key: 'inspect',
        label: 'Start Inspection',
        icon: CheckCircle2,
        color: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40',
        show: ['Driver Assigned'].includes(s),
        perm: 'Vehicle Inspection',
        onPress: handleStartInspection,
      },
      {
        key: 'dispatch',
        label: 'Dispatch Vehicle',
        icon: Truck,
        color: 'bg-accent/20 text-accent border-accent/40',
        show: ['Ready For Dispatch'].includes(s),
        perm: 'Assign Driver',
        onPress: handleDispatch,
      },
      {
        key: 'confirm_del',
        label: 'Confirm Delivery',
        icon: CheckCircle2,
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        show: ['In Transit'].includes(s),
        perm: 'Schedule Delivery',
        onPress: handleConfirmDelivery,
      },
      {
        key: 'sched_ret',
        label: 'Schedule Return',
        icon: RotateCcw,
        color: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        show: ['Delivered'].includes(s),
        perm: 'Schedule Return',
        onPress: () => setActionPanel('return'),
      },
      {
        key: 'confirm_ret',
        label: 'Confirm Return',
        icon: Package,
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        show: ['Return Scheduled'].includes(s),
        perm: 'Schedule Return',
        onPress: handleConfirmReturn,
      },
      {
        key: 'complete',
        label: 'Complete Dispatch',
        icon: Lock,
        color: 'bg-gray-700/50 text-gray-300 border-gray-600/50',
        show: ['Returned'].includes(s),
        perm: 'Create/Edit/Delete',
        onPress: handleCompleteDispatch,
      },
    ].filter(a => a.show);
  };

  /* ─────────────────────────────────────── */
  return (
    <div className="space-y-8 pb-12">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Logistics Operations</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none font-serif">
            Schedule <span className="text-primary not-italic font-serif">Management</span>
          </h2>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 border-white/5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by ID, Customer, or Asset..."
            className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:border-primary outline-none transition-colors"
          />
        </div>
        <div className="flex gap-4">
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white [color-scheme:dark] outline-none focus:border-primary transition-colors"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-black border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none focus:border-primary transition-colors min-w-[180px]"
          >
            {['All', 'Not Scheduled', 'Scheduled', 'Driver Assigned', 'Ready For Dispatch', 'In Transit', 'Delivered', 'Return Scheduled', 'Returned', 'Closed'].map(opt => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All Operations' : opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dispatch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeliveries.map(del => (
          <div
            key={del.id}
            onClick={() => openDrawer(del)}
            className="glass-panel border-white/5 p-5 flex flex-col hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-mono text-gray-500 block mb-1">ID: {del.id}</span>
                <StatusBadge status={del.status} />
              </div>
              <ChevronRight size={16} className="text-gray-600 group-hover:text-primary transition-colors mt-0.5" />
            </div>

            <h3 className="text-sm font-black text-white uppercase truncate mb-1">{del.vehicleName}</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-4">
              Customer: <span className="text-gray-300">{del.customerName}</span>
            </p>

            <div className="space-y-2 flex-1 mb-4">
              <div className="flex items-center gap-3 text-xs">
                <CalendarIcon size={13} className="text-primary shrink-0" />
                <span className="text-gray-300">{fmt(del.scheduleDate)}</span>
              </div>
              <div className="flex items-start gap-3 text-xs">
                <MapPin size={13} className="text-accent shrink-0 mt-0.5" />
                <span className="text-gray-300 line-clamp-1">{del.deliveryAddress || del.address || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <User size={13} className="text-[#D4AF37] shrink-0" />
                <span className={del.driverName && del.driverName !== 'Unassigned' ? 'text-gray-300' : 'text-gray-500 italic'}>
                  {del.driverName || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 text-right">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary group-hover:text-accent transition-colors">
                View Details →
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="text-center py-12 glass-panel border-white/5">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-black text-white uppercase font-serif">No Operations Scheduled</h3>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          DETAILS DRAWER
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm"
              onClick={() => setDrawer(null)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full sm:w-[580px] bg-[#111111] border-l border-white/10 h-full shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-start shrink-0">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{drawer.id}</h3>
                    <StatusBadge status={drawer.status} />
                  </div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{drawer.vehicleName} · {drawer.customerName}</p>
                </div>
                <button onClick={() => setDrawer(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-white/5 custom-scrollbar shrink-0">
                {['Overview', 'Customer', 'Vehicle', 'Driver', 'Timeline', 'Documents'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setDrawerTab(tab); setActionPanel(null); }}
                    className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${
                      drawerTab === tab
                        ? 'text-primary border-primary bg-white/[0.02]'
                        : 'text-gray-500 border-transparent hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">

                {/* ── Overview ── */}
                {drawerTab === 'Overview' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Dispatch ID',  val: drawer.id },
                        { label: 'Booking ID',   val: drawer.bookingId },
                        { label: 'Pickup Date',  val: fmt(drawer.scheduleDate) },
                        { label: 'Return Date',  val: fmt(drawer.returnDate) },
                      ].map(({ label, val }) => (
                        <div key={label} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                          <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
                          <span className="font-bold text-white">{val || '—'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Delivery Address</span>
                      <span className="font-bold text-white">{drawer.deliveryAddress || drawer.address || '—'}</span>
                    </div>
                    {drawer.specialInstructions && (
                      <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Special Instructions</span>
                        <span className="text-gray-300">{drawer.specialInstructions}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Customer ── */}
                {drawerTab === 'Customer' && (
                  <div className="space-y-4">
                    {linkedCustomer ? (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black text-lg shrink-0">
                            {linkedCustomer.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-white uppercase">{linkedCustomer.name}</p>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${linkedCustomer.status === 'Suspended' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {linkedCustomer.status || 'Active'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Phone',          val: linkedCustomer.phone },
                            { label: 'Email',          val: linkedCustomer.email },
                            { label: 'License Status', val: linkedBooking?.licenseStatus || '—' },
                            { label: 'Joined',         val: linkedCustomer.joinedDate },
                          ].map(({ label, val }) => (
                            <div key={label} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
                              <span className="font-bold text-white break-all">{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <EmptyTab icon={User} label="Customer data not available" />
                    )}
                  </div>
                )}

                {/* ── Vehicle ── */}
                {drawerTab === 'Vehicle' && (
                  <div className="space-y-4">
                    {linkedVehicle ? (
                      <>
                        <img
                          src={linkedVehicle.image}
                          alt={linkedVehicle.name}
                          className="w-full h-44 object-cover rounded-xl border border-white/10"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Vehicle',     val: linkedVehicle.name },
                            { label: 'Plate',       val: linkedVehicle.licensePlate },
                            { label: 'VIN',         val: linkedVehicle.vinNumber },
                            { label: 'Fleet Status',val: linkedVehicle.status },
                            { label: 'Fuel Level',  val: linkedVehicle.fuelLevel ? `${linkedVehicle.fuelLevel}%` : '—' },
                            { label: 'Mileage',     val: linkedVehicle.mileage ? `${linkedVehicle.mileage} km` : '—' },
                          ].map(({ label, val }) => (
                            <div key={label} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
                              <span className="font-bold text-white break-all">{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <EmptyTab icon={Car} label="No vehicle data linked to this dispatch" />
                    )}
                  </div>
                )}

                {/* ── Driver ── */}
                {drawerTab === 'Driver' && (
                  <div className="space-y-4">
                    {linkedDriver ? (
                      <>
                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-lg shrink-0">
                            {linkedDriver.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-white uppercase">{linkedDriver.name}</p>
                            <span className="text-[8px] text-[#D4AF37] font-black uppercase tracking-widest">{linkedDriver.status}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Phone',           val: linkedDriver.phone },
                            { label: 'Email',           val: linkedDriver.email },
                            { label: 'License #',       val: linkedDriver.licenseNumber },
                            { label: 'Commercial Lic.', val: linkedDriver.commercialLicenseNumber },
                            { label: 'Availability',    val: linkedDriver.availability },
                            { label: 'Rating',          val: linkedDriver.rating ? `⭐ ${linkedDriver.rating}` : '—' },
                          ].map(({ label, val }) => (
                            <div key={label} className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
                              <span className="font-bold text-white break-all">{val || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <EmptyTab icon={User} label="No driver assigned to this dispatch" />
                    )}
                  </div>
                )}

                {/* ── Timeline ── */}
                {drawerTab === 'Timeline' && (
                  <div className="space-y-1">
                    <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6">
                      {(drawer.timeline || []).length > 0 ? [...drawer.timeline].reverse().map((ev, i) => (
                        <div key={i} className="relative">
                          <div className="absolute w-3 h-3 bg-primary rounded-full -left-[30px] top-0.5 shadow-glow-primary" />
                          <p className="text-[10px] font-black text-white uppercase tracking-wide">{ev.title}</p>
                          {ev.desc && <p className="text-[10px] text-gray-400 mt-0.5">{ev.desc}</p>}
                          <span className="text-[8px] text-gray-600 font-mono mt-1 block">{fmt(ev.date)}</span>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-500 italic">No timeline events yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Documents ── */}
                {drawerTab === 'Documents' && (
                  <div className="space-y-3">
                    {[
                      { name: 'Handover Form',      status: drawer.preDeliveryInspection ? 'Available' : 'Pending' },
                      { name: 'Pre-Delivery Inspection Report', status: drawer.preDeliveryInspection ? 'Available' : 'Pending' },
                      { name: 'Return Inspection Report',       status: drawer.returnInspection    ? 'Available' : 'Pending' },
                    ].map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className={doc.status === 'Available' ? 'text-emerald-400' : 'text-gray-600'} />
                          <span className="font-bold text-white uppercase text-[10px] tracking-wide">{doc.name}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          doc.status === 'Available'
                            ? 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10'
                            : 'text-gray-500 border-gray-600/30'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Action Center ── */}
              <div className="shrink-0 border-t border-white/10 p-5 space-y-3">
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-600">Action Center</p>

                {/* Inline sub-forms */}
                {actionPanel === 'assign' && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Assign Chauffeur</p>
                    <select
                      value={driverPick}
                      onChange={e => setDriverPick(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      <option value="">Select driver...</option>
                      {(drivers || []).map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.availability} / {d.status})</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => setActionPanel(null)} className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg text-[9px] font-black uppercase">Cancel</button>
                      <button onClick={handleAssignDriver} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-[9px] font-black uppercase">Confirm</button>
                    </div>
                  </div>
                )}

                {actionPanel === 'schedule' && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Schedule Delivery</p>
                    <input
                      type="text"
                      value={schForm.address}
                      onChange={e => setSchForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="Delivery address..."
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    />
                    <input
                      type="datetime-local"
                      value={schForm.dateTime}
                      onChange={e => setSchForm(p => ({ ...p, dateTime: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs [color-scheme:dark]"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setActionPanel(null)} className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg text-[9px] font-black uppercase">Cancel</button>
                      <button onClick={handleScheduleDelivery} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Save</button>
                    </div>
                  </div>
                )}

                {actionPanel === 'return' && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">Schedule Return</p>
                    <input
                      type="datetime-local"
                      value={retForm.returnDate}
                      onChange={e => setRetForm(p => ({ ...p, returnDate: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs [color-scheme:dark]"
                    />
                    <input
                      type="text"
                      value={retForm.returnLocation}
                      onChange={e => setRetForm(p => ({ ...p, returnLocation: e.target.value }))}
                      placeholder="Return hub location..."
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    />
                    <select
                      value={retForm.driverId}
                      onChange={e => setRetForm(p => ({ ...p, driverId: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      <option value="">Assign collection driver...</option>
                      {(drivers || []).map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.availability})</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button onClick={() => setActionPanel(null)} className="flex-1 py-2 bg-white/5 text-gray-400 rounded-lg text-[9px] font-black uppercase">Cancel</button>
                      <button onClick={handleScheduleReturn} className="flex-1 py-2 bg-orange-500 text-black rounded-lg text-[9px] font-black uppercase">Save</button>
                    </div>
                  </div>
                )}

                {/* Primary action buttons */}
                <div className="flex flex-wrap gap-2">
                  {getActions(drawer).map(action => {
                    const canDo = hasOperationalPermission(action.perm);
                    return (
                      <button
                        key={action.key}
                        onClick={canDo ? action.onPress : () => toast.error('Insufficient permissions.')}
                        className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                          canDo
                            ? `${action.color} hover:opacity-80`
                            : 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed opacity-40'
                        }`}
                      >
                        <action.icon size={13} />
                        {action.label}
                      </button>
                    );
                  })}
                  {getActions(drawer).length === 0 && (
                    <p className="text-[10px] text-gray-600 italic py-1">No further actions available for this status.</p>
                  )}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* tiny helper */
const EmptyTab = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-xl text-gray-600">
    <Icon size={32} className="mb-3" />
    <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
  </div>
);

export default OperationsSchedule;
