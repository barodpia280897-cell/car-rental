// src/pages/dashboards/AdminDeliveries.jsx
import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Calendar, User, Search, MapPin, CheckCircle2, 
  Clock, Compass, ArrowRightLeft, ClipboardSignature, FileText, Settings, X, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDeliveries = () => {
  const { 
    deliveries, bookings, drivers, vehicles,
    scheduleDelivery, assignDriver, dispatchVehicle, markDelivered, scheduleReturn, markReturned, closeDelivery, completeInspection
  } = useAdminState();

  const [search, setSearch] = useState('');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null);

  // Form modals state
  const [activeModal, setActiveModal] = useState(null); // 'schedule', 'driver', 'inspection', 'handover', 'return'
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [driverIdInput, setDriverIdInput] = useState('');
  const [specialInstructionsInput, setSpecialInstructionsInput] = useState('');
  const [customerContactInput, setCustomerContactInput] = useState('');

  // Handover state
  const [handoverNotes, setHandoverNotes] = useState('');
  const [handoverConfirmed, setHandoverConfirmed] = useState(false);

  // Return Logistics state
  const [returnDate, setReturnDate] = useState('');
  const [returnLocation, setReturnLocation] = useState('Beverly Hills Hub');
  const [returnDriverId, setReturnDriverId] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  // Inspection states
  const [inspectionType, setInspectionType] = useState('out');
  const [inspectFuel, setInspectFuel] = useState('100');
  const [inspectMileage, setInspectMileage] = useState('');
  const [inspectDamage, setInspectDamage] = useState('None');
  const [inspectCharges, setInspectCharges] = useState('0');
  const [inspectorName, setInspectorName] = useState('Marcus Chen');

  // Filtered list
  const filteredDeliveries = (deliveries || []).filter(d => {
    const term = search.toLowerCase();
    return (
      d.id.toLowerCase().includes(term) ||
      d.customerName.toLowerCase().includes(term) ||
      d.vehicleName.toLowerCase().includes(term) ||
      d.bookingId.toLowerCase().includes(term)
    );
  });

  const selectedDelivery = (deliveries || []).find(d => d.id === selectedDeliveryId) || (deliveries && deliveries[0]);

  // Calculations for top cards
  const todayStr = new Date().toISOString().split('T')[0];
  const deliveriesScheduledToday = (deliveries || []).filter(d => 
    d.scheduleDate && d.scheduleDate.includes(todayStr) && (d.status === 'Scheduled' || d.status === 'Driver Assigned')
  ).length;

  const vehiclesInTransit = (deliveries || []).filter(d => d.status === 'In Transit').length;
  const activeRentalsCount = (bookings || []).filter(b => b.status === 'Active Rental').length;
  const returnsPending = (deliveries || []).filter(d => d.status === 'Return Scheduled').length;
  const completedDeliveries = (deliveries || []).filter(d => d.status === 'Closed' || d.status === 'Returned').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Closed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Delivered':
        return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20 shadow-glow-primary';
      case 'Returned':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Return Scheduled':
        return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'In Transit':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Ready For Dispatch':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Driver Assigned':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'Scheduled':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  const getDriverStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Assigned':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'On Route':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Completed Assignment':
        return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !addressInput || !dateInput) {
      toast.error('All required fields must be completed.');
      return;
    }
    scheduleDelivery(selectedBookingId, addressInput, dateInput, specialInstructionsInput, customerContactInput);
    setActiveModal(null);
    setSelectedBookingId('');
    setAddressInput('');
    setDateInput('');
    setSpecialInstructionsInput('');
    setCustomerContactInput('');
  };

  const handleAssignDriverSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !driverIdInput) {
      toast.error('Chauffeur and Reservation options are required.');
      return;
    }
    assignDriver(selectedBookingId, driverIdInput);
    setActiveModal(null);
    setSelectedBookingId('');
    setDriverIdInput('');
  };

  const handleInspectionSubmit = (e) => {
    e.preventDefault();
    if (!selectedBookingId || !inspectFuel || !inspectMileage) {
      toast.error('Please input fuel/charge level and mileage logs.');
      return;
    }
    completeInspection(selectedBookingId, inspectionType, {
      fuel: inspectFuel,
      mileage: parseFloat(inspectMileage),
      damageNotes: inspectDamage,
      additionalCharges: parseFloat(inspectCharges),
      inspector: inspectorName
    });
    setActiveModal(null);
    setSelectedBookingId('');
    setInspectFuel('100');
    setInspectMileage('');
    setInspectDamage('None');
    setInspectCharges('0');
    setInspectorName('Marcus Chen');
  };

  const handleHandoverSubmit = (e) => {
    e.preventDefault();
    if (!handoverConfirmed) {
      toast.error('Customer confirmation signature is required.');
      return;
    }
    markDelivered(selectedDelivery.bookingId, handoverNotes);
    setActiveModal(null);
    setHandoverNotes('');
    setHandoverConfirmed(false);
  };

  const handleReturnLogisticsSubmit = (e) => {
    e.preventDefault();
    if (!returnDate || !returnLocation || !returnDriverId) {
      toast.error('Logistics coordinates are required.');
      return;
    }
    scheduleReturn(selectedDelivery.bookingId, returnDate, returnLocation, returnDriverId, returnNotes);
    setActiveModal(null);
    setReturnDate('');
    setReturnLocation('Beverly Hills Hub');
    setReturnDriverId('');
    setReturnNotes('');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Logistics & <span className="text-primary not-italic font-serif">Dispatch</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">VIP Chauffeur & Delivery Command Hub</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              // Pre-select first un-scheduled booking
              const unsch = bookings.find(b => b.deliveryStatus !== 'Scheduled' && b.deliveryStatus !== 'Closed');
              setSelectedBookingId(unsch ? unsch.id : '');
              setActiveModal('schedule');
            }}
            className="px-6 py-2.5 bg-[#111] border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" /> Schedule Logistics
          </button>
          <button
            onClick={() => {
              const unsch = bookings.find(b => b.status === 'Delivery Scheduled' || b.status === 'Pending Review');
              setSelectedBookingId(unsch ? unsch.id : '');
              setActiveModal('driver');
            }}
            className="px-6 py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-glow-primary hover:bg-[#cda632] transition-all flex items-center gap-2"
          >
            <User className="w-3.5 h-3.5" /> Assign Driver
          </button>
        </div>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Deliveries Scheduled Today', val: deliveriesScheduledToday, desc: 'Awaiting dispatch today', color: 'text-primary' },
          { label: 'Vehicles In Transit', val: vehiclesInTransit, desc: 'Drivers currently on route', color: 'text-red-400' },
          { label: 'Active Rentals', val: activeRentalsCount, desc: 'VIP Vehicles on the road', color: 'text-blue-400' },
          { label: 'Returns Pending', val: returnsPending, desc: 'Return check-ins booked', color: 'text-indigo-400' },
          { label: 'Completed Deliveries', val: completedDeliveries, desc: 'Successful log entries closed', color: 'text-emerald-400' },
        ].map((stat, i) => (
           <div key={i} className="glass-panel p-5 border-white/5 flex flex-col justify-between">
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                 <p className="text-2xl font-black text-white">{stat.val}</p>
                 <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">{stat.desc}</p>
              </div>
           </div>
        ))}
      </div>

      {/* Main Logistics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliveries Board */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <h3 className="text-lg font-serif text-primary uppercase tracking-wider">Logistics Fleet Ledger</h3>
             <div className="relative w-full sm:w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input
                 type="text"
                 placeholder="Search dispatch, client, plate..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-primary/50 focus:outline-none transition-all placeholder:text-gray-600"
               />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDeliveries.map(d => {
              const matchingBooking = bookings.find(b => b.id === d.bookingId);
              const isSelected = selectedDelivery?.id === d.id;
              return (
                <div 
                  key={d.id} 
                  onClick={() => setSelectedDeliveryId(d.id)}
                  className={`p-5 bg-[#111111] border rounded-xl hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-xl relative overflow-hidden group ${
                    isSelected ? 'border-primary' : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-widest">{d.id}</span>
                      <h4 className="text-sm font-black text-white mt-1 group-hover:text-primary transition-colors uppercase tracking-tight">{d.vehicleName}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${getStatusColor(d.status)}`}>
                      {d.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-semibold text-gray-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-500" />
                      <span>Client: <strong className="text-white">{d.customerName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-500" />
                      <span className="truncate max-w-[200px]">Loc: {d.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-3.5 h-3.5 text-gray-500" />
                      <span>Chauffeur: <strong className="text-primary">{d.driverName}</strong></span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1 text-[9px] text-gray-500 font-mono">
                    <div className="flex justify-between">
                      <span>Booking Ref:</span>
                      <span className="text-white">{d.bookingId}</span>
                    </div>
                    {d.scheduleDate && (
                      <div className="flex justify-between">
                        <span>Scheduled:</span>
                        <span className="text-white">{d.scheduleDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Rental Lifecycle:</span>
                      <span className="text-white uppercase font-bold">{matchingBooking?.status || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Dispatch Terminal / Control Center */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-6 shadow-2xl space-y-6 flex flex-col justify-between">
          {selectedDelivery ? (
            <div className="space-y-6">
              <div>
                <span className="text-[9px] font-mono text-primary uppercase tracking-widest font-bold">{selectedDelivery.id}</span>
                <h3 className="text-lg font-serif text-white uppercase tracking-wide mt-1">
                  {selectedDelivery.vehicleName}
                </h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Booking Link: {selectedDelivery.bookingId}</p>
              </div>

              {/* Status Tracker */}
              <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3 text-xs font-semibold">
                <div className="flex justify-between">
                  <span className="text-gray-500">Current Phase:</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusColor(selectedDelivery.status)}`}>
                    {selectedDelivery.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Assignment:</span>
                  <span className="text-primary font-bold">{selectedDelivery.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination:</span>
                  <span className="text-white truncate max-w-[180px]">{selectedDelivery.address}</span>
                </div>
                {selectedDelivery.customerContact && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Customer Phone:</span>
                    <span className="text-white font-mono">{selectedDelivery.customerContact}</span>
                  </div>
                )}
                {selectedDelivery.specialInstructions && (
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <span className="text-gray-500 block mb-1">Logistics Notes:</span>
                    <p className="text-gray-400 italic text-[11px] leading-relaxed">"{selectedDelivery.specialInstructions}"</p>
                  </div>
                )}
              </div>

              {/* Inspection Records Section (Correction 3) */}
              <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-primary border-b border-[#D4AF37]/10 pb-1.5 flex items-center gap-1.5">
                  <ClipboardSignature size={12} /> Digital Inspection Reports
                </h4>

                {/* Pre-Delivery Check */}
                <div className="space-y-2">
                  <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pre-Delivery Inspection</h5>
                  {selectedDelivery.preDeliveryInspection ? (
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded border border-white/5 font-semibold">
                      <div><span className="text-gray-500">Fuel Level:</span> <span className="text-white">{selectedDelivery.preDeliveryInspection.fuelLevel}%</span></div>
                      <div><span className="text-gray-500">Odometer:</span> <span className="text-white">{selectedDelivery.preDeliveryInspection.mileage} mi</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Damage Notes:</span> <span className="text-white">{selectedDelivery.preDeliveryInspection.damageNotes}</span></div>
                      <div className="col-span-2 flex justify-between text-[8px] text-gray-500 font-mono border-t border-white/5 pt-1 mt-1">
                        <span>Inspector: {selectedDelivery.preDeliveryInspection.inspector}</span>
                        <span>{new Date(selectedDelivery.preDeliveryInspection.inspectionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-600 italic">No pre-delivery inspection recorded yet.</p>
                  )}
                </div>

                {/* Return Check */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Return Inspection</h5>
                  {selectedDelivery.returnInspection ? (
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded border border-white/5 font-semibold">
                      <div><span className="text-gray-500">Fuel Level:</span> <span className="text-white">{selectedDelivery.returnInspection.fuelLevel}%</span></div>
                      <div><span className="text-gray-500">Odometer:</span> <span className="text-white">{selectedDelivery.returnInspection.mileage} mi</span></div>
                      <div><span className="text-gray-500">Surcharges:</span> <span className="text-red-400">${selectedDelivery.returnInspection.additionalCharges}</span></div>
                      <div className="col-span-2"><span className="text-gray-500">Damage Notes:</span> <span className="text-white">{selectedDelivery.returnInspection.damageNotes}</span></div>
                      <div className="col-span-2 flex justify-between text-[8px] text-gray-500 font-mono border-t border-white/5 pt-1 mt-1">
                        <span>Inspector: {selectedDelivery.returnInspection.inspector}</span>
                        <span>{new Date(selectedDelivery.returnInspection.inspectionDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-600 italic">No return check-in inspection recorded yet.</p>
                  )}
                </div>
              </div>

              {/* TIMELINE VIEW */}
              <div className="space-y-3 p-4 bg-black/30 border border-white/5 rounded-xl">
                 <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5 border-b border-white/5 pb-2">
                   <Clock size={12} className="text-primary" /> Operational Dispatch Timeline
                 </h4>
                 <div className="space-y-4 max-h-48 overflow-y-auto custom-scrollbar pr-2 pt-2">
                   {selectedDelivery.timeline && selectedDelivery.timeline.length > 0 ? (
                     selectedDelivery.timeline.map((item, idx) => (
                       <div key={idx} className="flex gap-3 text-xs leading-normal">
                         <div className="flex flex-col items-center">
                           <div className="w-2 h-2 rounded-full bg-primary shadow-glow-primary mt-1" />
                           {idx !== selectedDelivery.timeline.length - 1 && <div className="w-0.5 h-full bg-white/10" />}
                         </div>
                         <div className="flex-1 pb-2">
                           <p className="text-white font-bold text-[11px] leading-tight">{item.title}</p>
                           <p className="text-gray-500 text-[10px]">{item.desc}</p>
                           <span className="text-[8px] text-gray-600 font-mono mt-0.5 block">{new Date(item.date).toLocaleTimeString()}</span>
                         </div>
                       </div>
                     ))
                   ) : (
                     <p className="text-[10px] text-gray-500 italic">No tracking entries recorded.</p>
                   )}
                 </div>
              </div>

              {/* Operations Panel */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <h4 className="text-xs uppercase tracking-wider text-gray-400 font-black">Dispatch Workflow Controls</h4>
                
                {selectedDelivery.status === 'Not Scheduled' && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(selectedDelivery.bookingId);
                      setAddressInput(selectedDelivery.address);
                      setActiveModal('schedule');
                    }}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#cda632] text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-glow-primary"
                  >
                    Schedule Dispatch logistics
                  </button>
                )}

                {(selectedDelivery.status === 'Scheduled' || selectedDelivery.status === 'Driver Assigned') && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(selectedDelivery.bookingId);
                      setDriverIdInput('');
                      setActiveModal('driver');
                    }}
                    className="w-full py-2.5 bg-[#161616] hover:bg-[#222] border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Assign / Change Chauffeur
                  </button>
                )}

                {/* Pre-Delivery Inspection trigger */}
                {selectedDelivery.status === 'Driver Assigned' && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(selectedDelivery.bookingId);
                      setInspectionType('out');
                      setActiveModal('inspection');
                    }}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Complete Pre-delivery Inspection
                  </button>
                )}

                {/* Dispatch Trigger */}
                {selectedDelivery.status === 'Ready For Dispatch' && (
                  <button
                    onClick={() => dispatchVehicle(selectedDelivery.bookingId)}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Dispatch Vehicle (Depart Hub)
                  </button>
                )}

                {/* Handover trigger */}
                {selectedDelivery.status === 'In Transit' && (
                  <button
                    onClick={() => setActiveModal('handover')}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Finalize Delivery Handover
                  </button>
                )}

                {/* Delivered state: next step schedule Return */}
                {selectedDelivery.status === 'Delivered' && (
                  <button
                    onClick={() => setActiveModal('return')}
                    className="w-full py-3 bg-[#D4AF37] hover:bg-[#cda632] text-black text-xs font-black uppercase tracking-widest rounded-lg transition-colors shadow-glow-primary"
                  >
                    Schedule Return Logistics
                  </button>
                )}

                {/* Return Scheduled state: Return Inspection */}
                {selectedDelivery.status === 'Return Scheduled' && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(selectedDelivery.bookingId);
                      setInspectionType('in');
                      setActiveModal('inspection');
                    }}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Complete Return Inspection
                  </button>
                )}

                {/* Returned state: Close Delivery file */}
                {selectedDelivery.status === 'Returned' && (
                  <button
                    onClick={() => closeDelivery(selectedDelivery.bookingId)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Mark Logistics File Closed
                  </button>
                )}

                {selectedDelivery.status === 'Closed' && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-lg text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Logistics Journey Completed
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <Truck className="w-12 h-12 text-gray-600 mb-3 animate-pulse" />
              <p className="text-sm">Select a delivery card to manage scheduled routes, assign chauffeurs, and log pre-delivery digital inspections.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Schedule Logistics Modal */}
        {activeModal === 'schedule' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Schedule Fleet Logistics</h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Select Booking</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                    required
                  >
                    <option value="">-- Select Booking --</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>{b.id} ({b.customer} - {b.vehicleName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    placeholder="Enter dispatch destination"
                    className="w-full px-3 py-2.5 bg-black border border-white/10 rounded-lg text-white text-xs"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={dateInput}
                      onChange={(e) => setDateInput(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Client Contact Phone</label>
                    <input
                      type="text"
                      value={customerContactInput}
                      onChange={(e) => setCustomerContactInput(e.target.value)}
                      placeholder="e.g. (555) 302-9011"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Special Instructions</label>
                  <textarea
                    value={specialInstructionsInput}
                    onChange={(e) => setSpecialInstructionsInput(e.target.value)}
                    placeholder="Enter customer requests, details, gate codes..."
                    rows="2"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded-lg text-xs mt-2 shadow-glow-primary">
                  Schedule Delivery
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Assign Chauffeur Modal */}
        {activeModal === 'driver' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Assign VIP Driver</h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAssignDriverSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Select Booking</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                    required
                  >
                    <option value="">-- Select Booking --</option>
                    {bookings.map(b => (
                      <option key={b.id} value={b.id}>{b.id} ({b.customer} - {b.vehicleName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Choose Driver</label>
                  <select
                    value={driverIdInput}
                    onChange={(e) => setDriverIdInput(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                    required
                  >
                    <option value="">-- Select Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id} disabled={d.status === 'Off Duty'}>
                        {d.name} ({d.status} | Assignments: {d.deliveriesCount})
                      </option>
                    ))}
                  </select>
                </div>

                {driverIdInput && (
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1.5 text-[11px] font-semibold text-gray-400">
                    <p className="text-white uppercase font-bold text-xs">Driver Credentials</p>
                    <div>Phone: <span className="text-white font-mono">{drivers.find(d => d.id === driverIdInput)?.phone}</span></div>
                    <div>License: <span className="text-white font-mono">{drivers.find(d => d.id === driverIdInput)?.licenseNumber}</span></div>
                    <div className="flex gap-2 items-center">
                      <span>Status:</span> 
                      <span className={`px-1.5 py-0.5 rounded text-[8px] border font-black uppercase ${getDriverStatusColor(drivers.find(d => d.id === driverIdInput)?.status)}`}>
                        {drivers.find(d => d.id === driverIdInput)?.status}
                      </span>
                    </div>
                  </div>
                )}

                <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded-lg text-xs mt-2 shadow-glow-primary">
                  Dispatch Driver Assignment
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Digital Inspection Modal */}
        {activeModal === 'inspection' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">
                  Digital Inspection ({inspectionType === 'out' ? 'Check-out' : 'Check-in'})
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleInspectionSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Fuel / Charge Level (%)</label>
                    <input
                      type="number"
                      value={inspectFuel}
                      onChange={(e) => setInspectFuel(e.target.value)}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Odometer Mileage (mi)</label>
                    <input
                      type="number"
                      value={inspectMileage}
                      onChange={(e) => setInspectMileage(e.target.value)}
                      placeholder="Enter current reading"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                {inspectionType === 'in' && (
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Additional Charges ($)</label>
                    <input
                      type="number"
                      value={inspectCharges}
                      onChange={(e) => setInspectCharges(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 font-mono text-primary">Inspector Full Name</label>
                    <input
                      type="text"
                      value={inspectorName}
                      onChange={(e) => setInspectorName(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Exterior / Interior Condition Notes</label>
                  <textarea
                    value={inspectDamage}
                    onChange={(e) => setInspectDamage(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                    placeholder="Note minor scratches, curbs, spills or say 'None'"
                  />
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
                  <Info size={14} className="text-[#D4AF37]" />
                  <p className="text-[10px] text-gray-400">Photos Placeholder: Standard visual report logs will link automatically to dispatch registry.</p>
                </div>

                <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded-lg text-xs mt-2 shadow-glow-primary">
                  Complete Inspection
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Customer Handover Confirmation Modal */}
        {activeModal === 'handover' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Confirm Customer Handover</h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleHandoverSubmit} className="space-y-4">
                <div className="p-4 bg-black/40 border border-white/5 rounded-lg text-xs font-semibold text-gray-400 space-y-2">
                  <p className="text-white font-bold uppercase text-xs">Verify Checklist</p>
                  <p>1. Identity verified via Driver License Check</p>
                  <p>2. Pre-delivery inspection report signed by driver</p>
                  <p>3. Rental agreements signed inside Contracts center</p>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Handover / Delivery Notes</label>
                  <textarea
                    value={handoverNotes}
                    onChange={(e) => setHandoverNotes(e.target.value)}
                    placeholder="Enter customer feedback, delivery details, gate keys delivered..."
                    rows="3"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="handoverConfirm"
                    checked={handoverConfirmed}
                    onChange={(e) => setHandoverConfirmed(e.target.checked)}
                    className="mt-0.5 accent-primary"
                    required
                  />
                  <label htmlFor="handoverConfirm" className="text-[11px] text-gray-400 font-semibold select-none leading-snug">
                     I confirm that the client <strong>{selectedDelivery?.customerName}</strong> signed the physical key receipt document.
                  </label>
                </div>

                <button type="submit" className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-wider rounded-lg text-xs mt-2">
                  Mark Delivered
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Schedule Return Modal */}
        {activeModal === 'return' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Schedule Return Logistics</h3>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleReturnLogisticsSubmit} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Return Date & Time</label>
                  <input
                    type="datetime-local"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Return Location</label>
                  <input
                    type="text"
                    value={returnLocation}
                    onChange={(e) => setReturnLocation(e.target.value)}
                    placeholder="Enter return check-in terminal"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 font-mono text-primary">Assigned Check-in Driver</label>
                  <select
                    value={returnDriverId}
                    onChange={(e) => setReturnDriverId(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold"
                    required
                  >
                    <option value="">-- Choose Chauffeur --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id} disabled={d.status === 'Off Duty'}>{d.name} ({d.status})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Return Logistics Notes</label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="Enter instructions, valets, terminal details..."
                    rows="2"
                    className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded-lg text-xs mt-2 shadow-glow-primary">
                  Schedule Return
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDeliveries;
