import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, MapPin, ChevronRight, User, Car, 
  CheckCircle2, Navigation, Phone, X, FileText, Upload,
  AlertOctagon, AlertTriangle, ShieldCheck, Zap, MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminState } from '../../context/adminStateContext';

const MyTrips = () => {
  const navigate = useNavigate();
  const { 
    deliveries, 
    drivers, 
    bookings,
    vehicles,
    customers,
    acceptAssignment, 
    rejectAssignment,
    startNavigation,
    markArrived,
    startTrip, 
    completeTrip 
  } = useAdminState();

  const [activeTab, setActiveTab] = useState('Active'); // Assigned, Accepted, Active, Completed, Cancelled
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [drawerTab, setDrawerTab] = useState('Overview'); // Overview, Customer, Vehicle, Timeline, Documents
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Other');

  const currentUser = drivers.find(d => d.name === 'David Wilson') || drivers[0];
  const myDeliveries = deliveries.filter(d => d.driverName === currentUser?.name);

  // Filter Logic
  const filteredTrips = myDeliveries.filter(d => {
    if (activeTab === 'Assigned') return d.status === 'Assigned' || d.status === 'Driver Assigned' || d.status === 'Scheduled';
    if (activeTab === 'Accepted') return d.status === 'Accepted';
    if (activeTab === 'Active') return ['En Route', 'Arrived', 'Inspection Complete', 'Trip Active'].includes(d.status) || d.status === 'In Transit';
    if (activeTab === 'Completed') return ['Delivered', 'Returned', 'Closed', 'Completed'].includes(d.status);
    if (activeTab === 'Cancelled') return d.status === 'Cancelled';
    return false;
  });

  const getTripDetails = (trip) => {
    if (!trip) return null;
    const booking = bookings.find(b => b.id === trip.bookingId) || {};
    const customer = customers.find(c => c.name === trip.customerName) || {};
    const vehicle = vehicles.find(v => v.name === trip.vehicleName || v.id === booking.vehicleId) || {};
    return { booking, customer, vehicle };
  };

  const currentDetails = selectedTrip ? getTripDetails(selectedTrip) : null;

  const handleCTAAction = (trip, actionType) => {
    if (!trip) return;

    if (actionType === 'accept') {
      acceptAssignment(trip.id);
      setSelectedTrip(prev => ({ ...prev, status: 'Accepted' }));
    } else if (actionType === 'navigate') {
      startNavigation(trip.id);
      setSelectedTrip(prev => ({ ...prev, status: 'En Route' }));
    } else if (actionType === 'arrived') {
      markArrived(trip.id);
      setSelectedTrip(prev => ({ ...prev, status: 'Arrived' }));
    } else if (actionType === 'inspect') {
      navigate(`/inspection?id=${trip.id}`);
    } else if (actionType === 'start') {
      startTrip(trip.id);
      setSelectedTrip(prev => ({ ...prev, status: 'Trip Active' }));
    } else if (actionType === 'complete') {
      completeTrip(trip.id);
      setSelectedTrip(prev => ({ ...prev, status: 'Completed' }));
    }
  };

  const confirmReject = () => {
    if (selectedTrip) {
      rejectAssignment(selectedTrip.id, rejectReason);
      setShowRejectModal(false);
      setSelectedTrip(null);
    }
  };

  // Helper to format date
  const formatDate = (isoString) => {
    if (!isoString) return 'Pending';
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getDrawerCTA = (status) => {
    switch (status) {
      case 'Scheduled':
      case 'Driver Assigned':
      case 'Assigned':
        return { label: 'Accept Assignment', icon: CheckCircle2, action: 'accept', style: 'bg-primary text-black shadow-glow-primary' };
      case 'Accepted':
        return { label: 'Start Navigation', icon: Navigation, action: 'navigate', style: 'bg-highlight text-black shadow-glow-accent' };
      case 'En Route':
      case 'In Transit':
        return { label: 'Mark Arrived', icon: MapPin, action: 'arrived', style: 'bg-accent text-white' };
      case 'Arrived':
        return { label: 'Start Inspection', icon: ShieldCheck, action: 'inspect', style: 'bg-primary text-black shadow-glow-primary' };
      case 'Inspection Complete':
        return { label: 'Start Trip', icon: Zap, action: 'start', style: 'bg-highlight text-black shadow-glow-accent' };
      case 'Trip Active':
        return { label: 'Complete Trip', icon: CheckCircle2, action: 'complete', style: 'bg-green-600 text-white' };
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-8 pb-24">
      {/* Header */}
      <header className="px-2">
         <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic font-serif">
            My <span className="text-primary font-serif not-italic">Trips</span>
         </h2>
         <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-2">Driver Assignments</p>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-[#111111] p-1 rounded-2xl border border-white/5">
         {['Assigned', 'Accepted', 'Active', 'Completed', 'Cancelled'].map(tab => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`flex-1 min-w-[60px] py-3 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all border
                  ${activeTab === tab 
                    ? 'bg-primary border-primary text-black shadow-glow-primary font-bold' 
                    : 'text-gray-500 border-transparent hover:text-white'}
               `}
            >
               {tab}
            </button>
         ))}
      </div>

      {/* Trip List */}
      <div className="space-y-4">
         <AnimatePresence mode='wait'>
            {filteredTrips.length > 0 ? (
               <motion.div 
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
               >
                  {filteredTrips.map(trip => (
                     <div 
                        key={trip.id}
                        onClick={() => {
                          setSelectedTrip(trip);
                          setDrawerTab('Overview');
                        }}
                        className="glass-panel p-6 border-white/5 hover:border-primary/30 transition-all group cursor-pointer relative overflow-hidden"
                     >
                        {/* Status Accent */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${activeTab === 'Active' ? 'bg-primary shadow-glow-primary' : 'bg-white/10'}`} />

                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1">{trip.id}</p>
                              <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-serif">{trip.vehicleName}</h3>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-white italic">{trip.scheduleDate ? trip.scheduleDate.split(' ')[1] : 'ASAP'}</p>
                              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">Scheduled</p>
                           </div>
                        </div>

                        <div className="space-y-4 relative">
                           <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/5" />
                           
                           <div className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded-full border border-primary bg-[#0A0A0A] z-10" />
                              <p className="text-[10px] font-bold text-gray-400 uppercase truncate">Hub</p>
                           </div>

                           <div className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded-full border border-primary bg-[#0A0A0A] z-10" />
                              <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{trip.address}</p>
                           </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                                  <User size={14} />
                              </div>
                              <span className="text-[10px] font-black text-white uppercase">{trip.customerName}</span>
                           </div>
                           <ChevronRight size={18} className="text-gray-800 group-hover:text-primary transition-colors" />
                        </div>
                     </div>
                  ))}
               </motion.div>
            ) : (
               <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <Calendar size={48} className="text-gray-600" />
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-600">No Assignments in this category</p>
               </div>
            )}
         </AnimatePresence>
      </div>

      {/* TRIP DETAIL DRAWER */}
      <AnimatePresence>
         {selectedTrip && currentDetails && (
            <div className="fixed inset-0 z-[110] flex justify-end">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0A0A0A]/85 backdrop-blur-md"
                  onClick={() => setSelectedTrip(null)}
               />
               <motion.div 
                  initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="relative w-full sm:w-[500px] bg-[#111111] border-l border-white/10 h-full p-8 shadow-2xl flex flex-col font-serif"
               >
                  <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/5">
                     <div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-serif">Trip Details</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{selectedTrip.id} • {selectedTrip.status}</p>
                     </div>
                     <button onClick={() => setSelectedTrip(null)} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>
                  </div>

                  {/* Drawer Tabs */}
                  <div className="flex gap-2 mb-6 font-sans overflow-x-auto pb-2 custom-scrollbar">
                    {['Overview', 'Customer', 'Vehicle', 'Timeline', 'Documents'].map(tab => (
                       <button
                         key={tab}
                         onClick={() => setDrawerTab(tab)}
                         className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                            ${drawerTab === tab 
                              ? 'bg-primary/10 border-primary text-primary font-bold shadow-glow-primary' 
                              : 'border-white/5 text-gray-500 hover:text-white'}
                         `}
                       >
                         {tab}
                       </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 font-sans space-y-6">
                     
                     {/* OVERVIEW TAB */}
                     {drawerTab === 'Overview' && (
                        <div className="space-y-6">
                           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Trip ID</p>
                                 <p className="text-xs font-bold text-white mt-1">{selectedTrip.id}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Booking ID</p>
                                 <p className="text-xs font-bold text-white mt-1">{selectedTrip.bookingId}</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Status</p>
                                 <p className="text-xs font-bold text-primary mt-1">{selectedTrip.status}</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Pickup Time</p>
                                 <p className="text-xs font-bold text-white mt-1">{formatDate(currentDetails.booking.startDate ? `${currentDetails.booking.startDate}T10:00:00` : '')}</p>
                              </div>
                              <div className="col-span-2">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Dropoff Time</p>
                                 <p className="text-xs font-bold text-white mt-1">{formatDate(currentDetails.booking.endDate ? `${currentDetails.booking.endDate}T18:00:00` : '')}</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* CUSTOMER TAB */}
                     {drawerTab === 'Customer' && (
                        <div className="space-y-6">
                           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                    <User size={28} />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Client Name</p>
                                    <h4 className="text-lg font-black text-white uppercase italic font-serif">{selectedTrip.customerName}</h4>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={`tel:${currentDetails.booking.phone || selectedTrip.customerContact}`}
                                  className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-black transition-all"
                                  title="Call Customer"
                                >
                                   <Phone size={18} />
                                </a>
                                <a 
                                  href={`https://wa.me/${(currentDetails.booking.phone || selectedTrip.customerContact || '').replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-black transition-all"
                                  title="WhatsApp Customer"
                                >
                                   <MessageCircle size={18} />
                                </a>
                              </div>
                           </div>

                           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                              <div>
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Name</p>
                                 <p className="text-sm font-bold text-white mt-1">{selectedTrip.customerName}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Phone</p>
                                 <p className="text-sm font-bold text-white mt-1">{currentDetails.booking.phone || selectedTrip.customerContact || 'Not provided'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Email</p>
                                 <p className="text-sm font-bold text-white mt-1">{currentDetails.booking.customerEmail || 'Not provided'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Address</p>
                                 <p className="text-sm font-bold text-white mt-1">{selectedTrip.address}</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* VEHICLE TAB */}
                     {drawerTab === 'Vehicle' && (
                        <div className="space-y-6">
                           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Assigned Vehicle</p>
                              <div className="flex items-center gap-4">
                                 <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                    <Car size={24} />
                                 </div>
                                 <div>
                                    <h4 className="text-md font-bold text-white uppercase tracking-tight">{selectedTrip.vehicleName}</h4>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl col-span-2">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Vehicle</p>
                                 <p className="text-sm font-bold text-white mt-1">{selectedTrip.vehicleName}</p>
                              </div>
                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Plate</p>
                                 <p className="text-sm font-bold text-white mt-1">{currentDetails.vehicle.licensePlate || 'N/A'}</p>
                              </div>
                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">VIN</p>
                                 <p className="text-xs font-bold text-white mt-1 truncate">{currentDetails.vehicle.vinNumber || 'N/A'}</p>
                              </div>
                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Mileage</p>
                                 <p className="text-sm font-bold text-white mt-1">
                                   {currentDetails.booking.inspectionIn?.mileage || currentDetails.booking.inspectionOut?.mileage || '12,402 mi'}
                                 </p>
                              </div>
                              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                 <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Fuel Level</p>
                                 <p className="text-sm font-bold text-white mt-1">
                                   {currentDetails.booking.inspectionIn?.fuel || currentDetails.booking.inspectionOut?.fuel || '95%'}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* TIMELINE TAB */}
                     {drawerTab === 'Timeline' && (
                        <div className="space-y-6">
                           <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2 font-serif italic">Trip Milestones</h4>
                           <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative">
                              <div className="absolute left-10 top-10 bottom-10 w-[1px] bg-white/10" />
                              <div className="space-y-6">
                                 {(selectedTrip.timeline || []).map((t, idx) => (
                                    <div key={idx} className="flex gap-6 relative z-10">
                                       <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shadow-glow-primary shrink-0" />
                                       <div>
                                          <p className="text-xs font-black text-white uppercase tracking-wider">{t.title}</p>
                                          <p className="text-xs text-gray-400 mt-1">{t.desc}</p>
                                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2">
                                             {formatDate(t.date)}
                                          </p>
                                       </div>
                                    </div>
                                 ))}
                                 {(!selectedTrip.timeline || selectedTrip.timeline.length === 0) && (
                                    <div className="flex gap-6 relative z-10">
                                       <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shadow-glow-primary shrink-0" />
                                       <div>
                                          <p className="text-xs font-black text-white uppercase tracking-wider">Assigned</p>
                                          <p className="text-xs text-gray-400 mt-1">Driver assigned to this trip.</p>
                                          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-2">
                                             {formatDate(currentDetails.booking.createdAt)}
                                          </p>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* DOCUMENTS TAB */}
                     {drawerTab === 'Documents' && (
                        <div className="space-y-4">
                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <FileText size={18} className="text-gray-500" />
                                 <div>
                                    <p className="text-xs font-bold text-white">Contract</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">
                                       {currentDetails.booking.contractStatus === 'Signed' ? 'Signed & Valid' : 'Draft'}
                                    </p>
                                 </div>
                              </div>
                              {currentDetails.booking.contractStatus === 'Signed' ? (
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View PDF</button>
                              ) : (
                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Pending Sign</span>
                              )}
                           </div>
                           
                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <FileText size={18} className="text-gray-500" />
                                 <div>
                                    <p className="text-xs font-bold text-white">Inspection Reports</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">
                                       {currentDetails.booking.inspectionOut ? 'Completed' : 'Pending'}
                                    </p>
                                 </div>
                              </div>
                              {currentDetails.booking.inspectionOut ? (
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View</button>
                              ) : (
                                <button 
                                  onClick={() => navigate(`/inspection?id=${selectedTrip.id}`)}
                                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                                >
                                   Start
                                </button>
                              )}
                           </div>

                           <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <FileText size={18} className="text-gray-500" />
                                 <div>
                                    <p className="text-xs font-bold text-white">Handover Forms</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">
                                       {['Trip Active', 'Completed', 'Returned'].includes(selectedTrip.status) ? 'Signed & Locked' : 'Pending Handover'}
                                    </p>
                                 </div>
                              </div>
                              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                 {['Trip Active', 'Completed', 'Returned'].includes(selectedTrip.status) ? 'Locked' : 'Awaiting Trip Start'}
                              </span>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4 shrink-0 font-sans">
                     {getDrawerCTA(selectedTrip.status) && (
                       <div className="flex gap-4">
                         <button 
                           onClick={() => handleCTAAction(selectedTrip, getDrawerCTA(selectedTrip.status).action)}
                           className={`flex-1 py-4 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${getDrawerCTA(selectedTrip.status).style}`}
                         >
                           {React.createElement(getDrawerCTA(selectedTrip.status).icon, { size: 14 })}
                           {getDrawerCTA(selectedTrip.status).label}
                         </button>
                         
                         {(selectedTrip.status === 'Scheduled' || selectedTrip.status === 'Driver Assigned' || selectedTrip.status === 'Assigned') && (
                           <button 
                             onClick={() => setShowRejectModal(true)}
                             className="flex-1 py-4 bg-red-950/20 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-red-500/10 transition-all"
                           >
                             Reject Assignment
                           </button>
                         )}
                       </div>
                     )}

                     {/* General Quick Actions */}
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            toast.success('Operations dispatch center has been notified. Calling...');
                          }}
                          className="py-3 bg-white/5 border border-white/10 hover:border-primary/20 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[8px] sm:text-[9px] transition-all flex items-center justify-center gap-2"
                        >
                           <Phone size={12} className="text-primary" /> Emergency Support
                        </button>
                        <button 
                          onClick={() => {
                            const issue = prompt("Enter details of the issue to report to dispatch:");
                            if (issue) {
                              toast.success('Issue logged and reported to operations.');
                            }
                          }}
                          className="py-3 bg-white/5 border border-white/10 hover:border-red-500/20 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[8px] sm:text-[9px] transition-all flex items-center justify-center gap-2"
                        >
                           <AlertTriangle size={12} className="text-red-500" /> Report Issue
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* REJECT MODAL */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowRejectModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 z-10"
            >
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <h3 className="text-lg font-black text-white uppercase italic font-serif">Reject Assignment</h3>
                <button onClick={() => setShowRejectModal(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider leading-relaxed">
                Please select a mandatory reason for rejecting this assignment. This will be logged in activity feed.
              </p>
              
              <div className="space-y-3">
                {['Vehicle Issue', 'Driver Unavailable', 'Customer Not Reachable', 'Emergency Situation', 'Other'].map(reason => (
                  <button 
                    key={reason}
                    onClick={() => setRejectReason(reason)}
                    className={`w-full py-4 px-6 rounded-2xl border text-left text-xs font-black uppercase tracking-widest transition-all
                      ${rejectReason === reason 
                        ? 'bg-red-500/10 border-red-500 text-red-500' 
                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/10 hover:text-white'}
                    `}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-4 bg-white/5 text-white border border-white/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmReject}
                  className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                >
                  Confirm Reject
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyTrips;
