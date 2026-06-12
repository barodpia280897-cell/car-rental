import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X,
  BatteryCharging, Gauge, Zap, Wrench,
  Droplets, ShieldCheck, FileText, Calendar,
  ClipboardList, Activity, AlertCircle, Camera, Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ─── tiny helpers ───────────────────────────────── */
const fmt = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const InfoRow = ({ label, val, accent }) => (
  <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
    <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">{label}</span>
    <span className={`text-xs font-bold ${accent ? 'text-accent' : 'text-white'}`}>{val || '—'}</span>
  </div>
);

/* ─── main component ──────────────────────────────── */
const OperationsVehicles = () => {
  const {
    vehicles,
    bookings,
    tasks,
    maintenance,
    hasOperationalPermission,
    updateVehicleStatus,
    completeInspection,
  } = useAdminState();

  /* list filters */
  const [activeTab, setActiveTab]     = useState('All');
  const [search,    setSearch]        = useState('');

  /* drawer */
  const [selected,   setSelected]    = useState(null); // augmented vehicle obj
  const [drawerTab,  setDrawerTab]   = useState('Overview');

  /* inspection form */
  const [inspForm, setInspForm] = useState({ type: 'out', fuel: 100, mileage: 5000, damageNotes: '', inspector: 'Ops Console' });
  const [inspPanel, setInspPanel] = useState(false);

  /* ── augment vehicles ── */
  const augmented = (vehicles || []).map(v => {
    let opsStatus = v.status;
    if (v.status === 'Available')   opsStatus = 'Ready';
    if (v.status === 'In Use')      opsStatus = 'Delivery';

    let readiness = 100;
    if (opsStatus === 'Maintenance') readiness = 15;
    else if (opsStatus === 'Cleaning') readiness = 50;
    else if (opsStatus === 'Inspection') readiness = 85;

    const activeTasks   = (tasks || []).filter(t => t.vehicleId === v.id && !['Completed','Cancelled'].includes(t.status));
    const vehicleBookings = (bookings || []).filter(b => b.vehicleId === v.id);
    const vehicleMaint  = (maintenance || []).filter(m => m.vehicleId === v.id);

    return {
      ...v,
      opsStatus,
      readiness,
      activeTasks,
      vehicleBookings,
      vehicleMaint,
      image: v.image || 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=800&auto=format&fit=crop',
    };
  });

  /* ── list filter ── */
  const filtered = augmented.filter(v => {
    if (activeTab === 'Ready'             && v.opsStatus !== 'Ready')                                    return false;
    if (activeTab === 'Pickups & Deliveries' && !['Pickup','Delivery'].includes(v.opsStatus))            return false;
    if (activeTab === 'Inspections'       && v.opsStatus !== 'Inspection')                              return false;
    if (activeTab === 'Maintenance'       && !['Cleaning','Maintenance'].includes(v.opsStatus))         return false;
    return v.name?.toLowerCase().includes(search.toLowerCase()) ||
           v.licensePlate?.toLowerCase().includes(search.toLowerCase());
  });

  /* ── open drawer ── */
  const openDrawer = (vehicle) => {
    setSelected(vehicle);
    setDrawerTab('Overview');
    setInspPanel(false);
    setInspForm({ type: 'out', fuel: 100, mileage: 5000, damageNotes: '', inspector: 'Ops Console' });
  };

  /* ── deploy to fleet pool ── */
  const handleDeploy = () => {
    if (!hasOperationalPermission('Vehicle Readiness')) {
      toast.error('Insufficient permissions to update fleet readiness.');
      return;
    }
    updateVehicleStatus(selected.id, 'Available');
    toast.success(`${selected.name} deployed to Fleet Pool.`);
    setSelected(null);
  };

  /* ── submit inspection ── */
  const handleInspection = () => {
    if (!hasOperationalPermission('Vehicle Inspection')) {
      toast.error('Insufficient permissions to record inspections.');
      return;
    }
    // Find the active booking for this vehicle
    const activeBooking = (bookings || []).find(b => b.vehicleId === selected.id && !['Cancelled','Completed'].includes(b.status));
    if (!activeBooking) {
      toast.error('No active booking found for this vehicle. Inspection requires a booking.');
      return;
    }
    completeInspection(activeBooking.id, inspForm.type, {
      fuel: parseInt(inspForm.fuel),
      mileage: parseInt(inspForm.mileage),
      damageNotes: inspForm.damageNotes,
      inspector: inspForm.inspector,
    });
    setInspPanel(false);
  };

  /* ─────────────────────────────────────── */
  return (
    <div className="space-y-8 pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-glow-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Asset Readiness</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
            Fleet <span className="text-accent font-serif not-italic">Pool</span>
          </h2>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between glass-panel !p-4 border-white/5">
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto custom-scrollbar">
          {['All', 'Ready', 'Pickups & Deliveries', 'Inspections', 'Maintenance'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border
                ${activeTab === tab
                  ? 'bg-accent/20 border-accent/40 text-accent shadow-glow-accent'
                  : 'bg-white/5 border-transparent text-gray-500 hover:text-white hover:bg-white/10'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/50 group-focus-within:text-accent transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Search fleet..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-xs font-bold text-white focus:outline-none focus:border-accent/50 transition-all placeholder-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filtered.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="glass-panel overflow-hidden border-white/5 group relative"
            >
              {/* Readiness bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 overflow-hidden z-10">
                <div className="h-full bg-accent shadow-glow-accent transition-all duration-1000" style={{ width: `${vehicle.readiness}%` }} />
              </div>

              {/* Image */}
              <div className="h-56 relative overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#161B26] via-[#161B26]/50 to-transparent" />

                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md z-10
                   ${vehicle.opsStatus === 'Ready'    ? 'bg-accent/10 text-accent border-accent/20' :
                     vehicle.opsStatus === 'Cleaning' ? 'bg-primary/10 text-primary border-primary/20' :
                     'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse
                       ${vehicle.opsStatus === 'Ready'    ? 'bg-accent' :
                         vehicle.opsStatus === 'Cleaning' ? 'bg-primary' : 'bg-orange-500'}`} />
                    {vehicle.opsStatus}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">{vehicle.name}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{vehicle.licensePlate} • {vehicle.location || 'Hub'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-white italic tracking-tighter">{vehicle.readiness}%</p>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest leading-none">Readiness</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BatteryCharging size={14} className="text-accent" />
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Energy</span>
                    </div>
                    <p className="text-xs font-black text-white">{vehicle.fuelLevel ?? '—'}%</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge size={14} className="text-primary" />
                      <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Odo</span>
                    </div>
                    <p className="text-xs font-black text-white">{vehicle.mileage?.toLocaleString?.() ?? vehicle.mileage ?? '—'} km</p>
                  </div>
                </div>

                <button
                  onClick={() => openDrawer(vehicle)}
                  className="w-full py-3.5 bg-accent/10 border border-accent/20 text-accent rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-accent hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Readiness Flow
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 glass-panel border-white/5">
          <h3 className="text-lg font-black text-white uppercase font-serif">No Fleet Assets Found</h3>
          <p className="text-sm text-gray-500 mt-2">Adjust your filters to see more results.</p>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          FULL DETAILS DRAWER
          ═══════════════════════════════════════════ */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm"
              onClick={() => setSelected(null)}
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
                  {/* Readiness bar */}
                  <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-accent shadow-glow-accent" style={{ width: `${selected.readiness}%` }} />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{selected.name}</h3>
                  <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-1">
                    {selected.licensePlate} · {selected.opsStatus} · Readiness {selected.readiness}%
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex overflow-x-auto border-b border-white/5 custom-scrollbar shrink-0">
                {['Overview', 'Bookings', 'Maintenance', 'Documents', 'Inspections', 'Timeline'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setDrawerTab(tab); setInspPanel(false); }}
                    className={`px-5 py-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${
                      drawerTab === tab
                        ? 'text-accent border-accent bg-white/[0.02]'
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
                    <img src={selected.image} alt={selected.name} className="w-full h-44 object-cover rounded-xl border border-white/10" />
                    <div className="grid grid-cols-2 gap-4">
                      <InfoRow label="Vehicle ID"         val={`VHC-${selected.id}`} />
                      <InfoRow label="VIN"                val={selected.vinNumber} />
                      <InfoRow label="Plate Number"       val={selected.licensePlate} />
                      <InfoRow label="Fleet Status"       val={selected.status} accent />
                      <InfoRow label="Fuel Level"         val={selected.fuelLevel ? `${selected.fuelLevel}%` : '—'} />
                      <InfoRow label="Mileage"            val={selected.mileage ? `${Number(selected.mileage).toLocaleString()} km` : '—'} />
                      <InfoRow label="Insurance Expiry"   val={fmt(selected.insuranceExpiry)} />
                      <InfoRow label="Registration Expiry" val={fmt(selected.registrationExpiry)} />
                    </div>
                    {/* Active Tasks */}
                    {selected.activeTasks.length > 0 && (
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest mb-3">Active Tasks ({selected.activeTasks.length})</p>
                        <div className="space-y-2">
                          {selected.activeTasks.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[10px] font-bold text-white uppercase">{t.title}</span>
                              <span className="text-[8px] font-black text-accent uppercase tracking-widest">{t.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Bookings ── */}
                {drawerTab === 'Bookings' && (
                  <div className="space-y-3">
                    {selected.vehicleBookings.length > 0 ? selected.vehicleBookings.map((b, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black text-white uppercase">{b.id}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                            b.status === 'Completed' ? 'text-emerald-400 border-emerald-400/30' :
                            b.status === 'Cancelled' ? 'text-red-500 border-red-500/30' :
                            'text-accent border-accent/30'}`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-gray-400"><span className="text-gray-600">Customer:</span> {b.customer}</p>
                        <p className="text-gray-400">
                          <span className="text-gray-600">Rental Period:</span> {b.startDate} → {b.endDate}
                        </p>
                        <p className="text-gray-400"><span className="text-gray-600">Total:</span> ${b.totalPrice?.toLocaleString()}</p>
                      </div>
                    )) : (
                      <EmptyTab icon={Calendar} label="No rental history for this vehicle" />
                    )}
                  </div>
                )}

                {/* ── Maintenance ── */}
                {drawerTab === 'Maintenance' && (
                  <div className="space-y-3">
                    {/* scheduled maintenance from state */}
                    {selected.vehicleMaint.length > 0 && selected.vehicleMaint.map((m, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white uppercase">{m.type}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                            m.status === 'Completed' ? 'text-emerald-400 border-emerald-400/30' : 'text-orange-400 border-orange-400/30'}`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">{m.description}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[9px] text-gray-500">Scheduled: {fmt(m.scheduledDate)}</span>
                          <span className="text-[9px] text-gray-500">Cost: ${m.cost}</span>
                        </div>
                      </div>
                    ))}
                    {/* history from vehicle.maintenanceHistory */}
                    {(selected.maintenanceHistory || []).map((m, i) => (
                      <div key={`hist-${i}`} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white uppercase">{m.description}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded">{m.status}</span>
                        </div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-[9px] text-gray-500">Date: {fmt(m.date)}</span>
                          <span className="text-[9px] text-gray-500">Cost: ${m.cost}</span>
                        </div>
                      </div>
                    ))}
                    {selected.vehicleMaint.length === 0 && (selected.maintenanceHistory || []).length === 0 && (
                      <EmptyTab icon={Wrench} label="No maintenance records found" />
                    )}
                  </div>
                )}

                {/* ── Documents ── */}
                {drawerTab === 'Documents' && (
                  <div className="space-y-3">
                    {[
                      { name: 'Insurance Certificate',      path: selected.documents?.insurance,      status: 'Valid',    expiry: selected.insuranceExpiry },
                      { name: 'Vehicle Registration',       path: selected.documents?.registration,   status: 'Valid',    expiry: selected.registrationExpiry },
                      { name: 'Last Inspection Report',     path: null,                               status: selected.documents?.inspectionReports?.length > 0 ? 'Available' : 'Missing', expiry: selected.documents?.inspectionReports?.[0]?.date },
                      { name: 'Service / Maintenance Log',  path: null,                               status: selected.documents?.maintenanceRecords?.length > 0 ? 'Available' : 'Missing', expiry: null },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-accent/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText size={16} className={doc.status === 'Missing' ? 'text-red-500' : 'text-emerald-400'} />
                          <div>
                            <p className="text-[10px] font-black text-white uppercase">{doc.name}</p>
                            {doc.expiry && <p className="text-[8px] text-gray-500 mt-0.5">Expiry / Date: {fmt(doc.expiry)}</p>}
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          doc.status === 'Missing' ? 'text-red-500 border-red-500/30 bg-red-500/10'
                          : 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10'}`}>
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Inspections ── */}
                {drawerTab === 'Inspections' && (
                  <div className="space-y-5">
                    {/* Existing inspection data */}
                    {(() => {
                      const activeB = (bookings || []).find(b => b.vehicleId === selected.id && !['Cancelled','Completed'].includes(b.status));
                      const preInsp  = activeB?.inspectionOut;
                      const retInsp  = activeB?.inspectionIn;
                      return (
                        <>
                          {/* Pre-Delivery */}
                          <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">Pre-Delivery Inspection</p>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${preInsp ? 'text-emerald-400 border-emerald-400/30' : 'text-gray-500 border-gray-500/30'}`}>
                                {preInsp ? 'Recorded' : 'Pending'}
                              </span>
                            </div>
                            {preInsp ? (
                              <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="Fuel Level"   val={`${preInsp.fuel}%`} />
                                <InfoRow label="Mileage"      val={`${preInsp.mileage} km`} />
                                <div className="col-span-2 p-3 bg-black/30 rounded-lg border border-white/5">
                                  <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Damage Notes</span>
                                  <span className="text-xs text-gray-300">{preInsp.damageNotes || 'None'}</span>
                                </div>
                                <InfoRow label="Inspector" val={preInsp.inspector} />
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-500 italic">No pre-delivery inspection on file.</p>
                            )}
                          </div>

                          {/* Return */}
                          <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                              <p className="text-[9px] font-black uppercase tracking-widest text-primary">Return Inspection</p>
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${retInsp ? 'text-emerald-400 border-emerald-400/30' : 'text-gray-500 border-gray-500/30'}`}>
                                {retInsp ? 'Recorded' : 'Pending'}
                              </span>
                            </div>
                            {retInsp ? (
                              <div className="grid grid-cols-2 gap-3">
                                <InfoRow label="Fuel Level"   val={`${retInsp.fuel}%`} />
                                <InfoRow label="Mileage"      val={`${retInsp.mileage} km`} />
                                <div className="col-span-2 p-3 bg-black/30 rounded-lg border border-white/5">
                                  <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Damage Assessment</span>
                                  <span className="text-xs text-gray-300">{retInsp.damageNotes || retInsp.damageAssessment || 'None'}</span>
                                </div>
                                <InfoRow label="Inspector" val={retInsp.inspector} />
                                {retInsp.additionalCharges > 0 && (
                                  <InfoRow label="Additional Charges" val={`$${retInsp.additionalCharges}`} accent />
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-500 italic">No return inspection on file.</p>
                            )}
                          </div>

                          {/* New inspection form (only if active booking exists) */}
                          {activeB && hasOperationalPermission('Vehicle Inspection') && (
                            <div>
                              {!inspPanel ? (
                                <button
                                  onClick={() => setInspPanel(true)}
                                  className="w-full py-3 border border-dashed border-[#D4AF37]/40 rounded-xl text-[9px] font-black uppercase text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors flex items-center justify-center gap-2"
                                >
                                  <Camera size={14} /> Record New Inspection
                                </button>
                              ) : (
                                <div className="p-4 bg-[#0A0A0A] border border-[#D4AF37]/20 rounded-xl space-y-4">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37]">New Inspection Entry</p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Stage</label>
                                      <select
                                        value={inspForm.type}
                                        onChange={e => setInspForm(p => ({ ...p, type: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                      >
                                        <option value="out">Pre-Delivery (Out)</option>
                                        <option value="in">Post-Return (In)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Inspector</label>
                                      <input
                                        type="text"
                                        value={inspForm.inspector}
                                        onChange={e => setInspForm(p => ({ ...p, inspector: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Fuel Level (%)</label>
                                      <input
                                        type="number" min="0" max="100"
                                        value={inspForm.fuel}
                                        onChange={e => setInspForm(p => ({ ...p, fuel: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Mileage (km)</label>
                                      <input
                                        type="number"
                                        value={inspForm.mileage}
                                        onChange={e => setInspForm(p => ({ ...p, mileage: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Damage Notes</label>
                                    <textarea
                                      value={inspForm.damageNotes}
                                      onChange={e => setInspForm(p => ({ ...p, damageNotes: e.target.value }))}
                                      placeholder="Describe any scratches, dents, or damage..."
                                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs h-20 resize-none"
                                    />
                                  </div>
                                  {/* Photolog */}
                                  <div>
                                    <label className="text-[8px] text-gray-500 uppercase tracking-widest block mb-2">Photo Evidence</label>
                                    <div className="grid grid-cols-2 gap-2">
                                      {['Exterior Front', 'Interior Cabin', 'Engine Bay', 'Tire Condition'].map(photo => (
                                        <label key={photo} className="aspect-video bg-white/5 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center gap-1 hover:border-accent/40 cursor-pointer transition-colors">
                                          <Upload size={14} className="text-gray-500" />
                                          <span className="text-[8px] text-gray-600 uppercase">{photo}</span>
                                          <input type="file" className="hidden" accept="image/*" onChange={() => toast.success(`Photo added for ${photo}`)} />
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <button
                                      onClick={() => setInspPanel(false)}
                                      className="flex-1 py-2.5 bg-white/5 text-gray-400 rounded-xl text-[9px] font-black uppercase"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={handleInspection}
                                      className="flex-1 py-2.5 bg-[#D4AF37] text-black rounded-xl text-[9px] font-black uppercase"
                                    >
                                      Submit Inspection
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* ── Timeline ── */}
                {drawerTab === 'Timeline' && (
                  <div>
                    <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6">
                      {/* Maintenance history as timeline events */}
                      {[...(selected.maintenanceHistory || [])].reverse().map((m, i) => (
                        <div key={`mnt-${i}`} className="relative">
                          <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[30px] top-0.5" />
                          <p className="text-[10px] font-black text-white uppercase">{m.description}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">Status: {m.status} · Cost: ${m.cost}</p>
                          <span className="text-[8px] text-gray-600 font-mono mt-1 block">{fmt(m.date)}</span>
                        </div>
                      ))}
                      {/* Inspection report events */}
                      {(selected.documents?.inspectionReports || []).map((r, i) => (
                        <div key={`insp-${i}`} className="relative">
                          <div className="absolute w-3 h-3 bg-accent rounded-full -left-[30px] top-0.5 shadow-glow-accent" />
                          <p className="text-[10px] font-black text-white uppercase">Inspection: {r.result}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">Inspector: {r.inspector}</p>
                          <span className="text-[8px] text-gray-600 font-mono mt-1 block">{fmt(r.date)}</span>
                        </div>
                      ))}
                      {/* Booking events */}
                      {selected.vehicleBookings.map((b, i) => (
                        <div key={`bkn-${i}`} className="relative">
                          <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[30px] top-0.5" />
                          <p className="text-[10px] font-black text-white uppercase">Booking: {b.id}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">{b.customer} · {b.startDate} → {b.endDate}</p>
                          <span className="text-[8px] text-gray-600 font-mono mt-1 block">{fmt(b.createdAt)}</span>
                        </div>
                      ))}
                      {selected.vehicleBookings.length === 0 && (selected.maintenanceHistory || []).length === 0 && (
                        <p className="text-xs text-gray-500 italic">No lifecycle events recorded.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Footer: Deploy to Fleet Pool ── */}
              <div className="shrink-0 border-t border-white/10 p-6 flex gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 py-3.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all"
                >
                  Close
                </button>
                <button
                  disabled={!hasOperationalPermission('Vehicle Readiness')}
                  onClick={handleDeploy}
                  className={`flex-[2] py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all flex items-center justify-center gap-2 ${
                    hasOperationalPermission('Vehicle Readiness')
                      ? 'bg-accent text-black shadow-glow-accent hover:scale-[1.02] italic'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Zap size={14} /> Deploy to Fleet Pool (Mark Ready)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── tiny empty state helper ── */
const EmptyTab = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center justify-center py-14 border border-dashed border-white/10 rounded-xl text-gray-600">
    <Icon size={30} className="mb-3" />
    <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
  </div>
);

export default OperationsVehicles;
