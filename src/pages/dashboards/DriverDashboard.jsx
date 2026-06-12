import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Navigation, MapPin, Clock, 
  CheckCircle2, Zap, 
  Smartphone, ShieldCheck,
  ChevronDown, ChevronUp, AlertOctagon, 
  Phone, X, AlertTriangle, MessageCircle, Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { useAdminState } from '../../context/adminStateContext';
import { fetchDashboardAnalytics } from '../../store/analyticsSlice';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { deliveries, drivers, updateDriverAvailability, acceptAssignment, rejectAssignment, startNavigation, markArrived, startTrip, completeTrip } = useAdminState();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Other');
  const [showLaterTasks, setShowLaterTasks] = useState(false);
  
  const dispatch = useDispatch();
  const { data: analytics, loading: loadingAnalytics, error: analyticsError } = useSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardAnalytics());
  }, [dispatch]);

  // Assume logged in as David Wilson
  const currentUser = drivers.find(d => d.name === 'David Wilson') || drivers[0];
  const driverStatus = currentUser?.availability || 'Online';
  
  const myDeliveries = deliveries.filter(d => d.driverName === currentUser?.name);
  
  const activeTrips = myDeliveries.filter(d => ['Accepted', 'En Route', 'Arrived', 'Inspection Complete', 'Trip Active'].includes(d.status) || d.status === 'In Transit');
  const upcomingTrips = myDeliveries.filter(d => d.status === 'Scheduled' || d.status === 'Driver Assigned');
  const completedTrips = analytics?.kpis?.completedTrips !== undefined ? analytics.kpis.completedTrips : myDeliveries.filter(d => ['Delivered', 'Closed', 'Completed', 'Returned'].includes(d.status)).length;
  const pendingInspections = activeTrips.filter(d => d.status === 'Arrived').length;
  const earnings = analytics?.kpis?.earnings || 0;

  const currentTrip = activeTrips.length > 0 ? activeTrips[0] : upcomingTrips[0];
  
  let tripState = 'Assigned';
  if (currentTrip) {
    if (['Driver Assigned', 'Scheduled'].includes(currentTrip.status)) tripState = 'Assigned';
    else if (currentTrip.status === 'Accepted') tripState = 'Accepted';
    else if (['En Route', 'In Transit'].includes(currentTrip.status)) tripState = 'En Route';
    else if (currentTrip.status === 'Arrived') tripState = 'Arrived';
    else if (currentTrip.status === 'Inspection Complete') tripState = 'Inspection Complete';
    else if (currentTrip.status === 'Trip Active') tripState = 'Trip Active';
    else if (['Completed', 'Delivered', 'Returned', 'Closed'].includes(currentTrip.status)) tripState = 'Completed';
  }

  const getPrimaryCTA = () => {
    switch (tripState) {
      case 'Assigned': return { label: 'ACCEPT ASSIGNMENT', icon: CheckCircle2, color: 'bg-primary text-black', action: 'accept' };
      case 'Accepted': return { label: 'START NAVIGATION', icon: Navigation, color: 'bg-highlight text-black', action: 'navigate' };
      case 'En Route': return { label: 'MARK ARRIVED', icon: MapPin, color: 'bg-accent text-white', action: 'arrived' };
      case 'Arrived': return { label: 'START INSPECTION', icon: ShieldCheck, color: 'bg-primary text-black', action: 'inspect' };
      case 'Inspection Complete': return { label: 'START TRIP', icon: Zap, color: 'bg-highlight text-black', action: 'start' };
      case 'Trip Active': return { label: 'COMPLETE TRIP', icon: CheckCircle2, color: 'bg-accent text-white', action: 'complete' };
      default: return { label: 'NO ACTIVE TRIP', icon: Clock, color: 'bg-gray-600 text-white cursor-not-allowed', action: 'none' };
    }
  };

  const handleCTAAction = () => {
    if (!currentTrip) return;
    const cta = getPrimaryCTA();
    
    if (cta.action === 'accept') {
      acceptAssignment(currentTrip.id);
    } else if (cta.action === 'navigate') {
      startNavigation(currentTrip.id);
    } else if (cta.action === 'arrived') {
      markArrived(currentTrip.id);
    } else if (cta.action === 'inspect') {
      navigate(`/inspection?id=${currentTrip.id}`);
    } else if (cta.action === 'start') {
      startTrip(currentTrip.id);
    } else if (cta.action === 'complete') {
      completeTrip(currentTrip.id);
    }
  };

  const confirmReject = () => {
    if (currentTrip) {
      rejectAssignment(currentTrip.id, rejectReason);
      setShowRejectModal(false);
    }
  };

  const cta = getPrimaryCTA();

  return (
    <div className="w-full space-y-8 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
         <div>
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none font-serif">Today's <span className="text-highlight font-serif not-italic">Assignments</span></h2>
            <div className="flex items-center gap-2 mt-2">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${driverStatus === 'Available' || driverStatus === 'Online' ? 'bg-highlight' : 'bg-gray-500'}`}></div>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Status: {driverStatus}</p>
            </div>
         </div>
         
         <div className="flex gap-2 flex-wrap">
            {['Online', 'Busy', 'Break', 'Offline'].map(status => (
               <button 
                  key={status}
                  onClick={() => updateDriverAvailability(currentUser.id, status)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all
                     ${driverStatus === status ? 'bg-highlight/10 border-highlight text-highlight shadow-glow-accent' : 'bg-white/5 border-transparent text-gray-600'}
                  `}
               >
                  {status}
               </button>
            ))}
         </div>
      </header>

      {/* KPI CARDS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
         <div className="glass-panel p-6 border-white/5 flex flex-col justify-between">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Trip</p>
            <p className="text-3xl font-black text-white italic mt-2 font-serif">{analytics?.kpis?.activeTrips !== undefined ? analytics.kpis.activeTrips : (activeTrips.length > 0 ? 1 : 0)}</p>
         </div>
         <div className="glass-panel p-6 border-white/5 flex flex-col justify-between">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Upcoming Trips</p>
            <p className="text-3xl font-black text-white italic mt-2 font-serif">{upcomingTrips.length}</p>
         </div>
         <div className="glass-panel p-6 border-white/5 flex flex-col justify-between">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Completed Trips</p>
            <p className="text-3xl font-black text-white italic mt-2 font-serif">{completedTrips}</p>
         </div>
         <div className="glass-panel p-6 border-white/5 flex flex-col justify-between">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Total Earnings</p>
            <p className="text-3xl font-black text-primary italic mt-2 font-serif">${earnings}</p>
         </div>
      </section>

      {/* ACTIVE NOW */}
      <section className="space-y-4 px-2">
         <div className="flex justify-between items-end">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-highlight italic">Active Now</h3>
            {currentTrip && <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{currentTrip.id}</span>}
         </div>

         <motion.div 
            layout
            className="glass-panel !p-0 border-highlight/30 overflow-hidden shadow-[0_0_50px_rgba(253,186,116,0.1)] relative"
         >
            {currentTrip ? (
              <>
                <div className="bg-highlight/10 p-6 flex justify-between items-center border-b border-highlight/20">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-highlight/20 rounded-lg text-highlight">
                        <Zap size={20} className="animate-pulse" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-highlight italic">{tripState}</span>
                  </div>
                  {tripState !== 'Assigned' && (
                      <span className="text-xs font-black text-white bg-[#0A0E17] px-3 py-1 rounded-full border border-highlight/30">
                        {currentTrip.scheduleDate ? currentTrip.scheduleDate.split(' ')[1] : 'ASAP'} ETA
                      </span>
                  )}
                </div>

                <div className="p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic font-serif">{currentTrip.vehicleName}</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mt-2">BKG: {currentTrip.bookingId} • TYPE: Delivery</p>
                      </div>
                      <div className="flex gap-2">
                        {tripState === 'Assigned' && (
                          <button onClick={() => setShowRejectModal(true)} className="p-4 bg-white/5 rounded-2xl text-danger hover:bg-danger/20 transition-all">
                              <X size={20} />
                          </button>
                        )}
                        <button className="p-4 bg-white/5 rounded-2xl text-primary hover:bg-primary hover:text-black transition-all">
                            <MessageCircle size={20} />
                        </button>
                        <button className="p-4 bg-white/5 rounded-2xl text-highlight hover:bg-highlight hover:text-black transition-all">
                            <Phone size={20} />
                        </button>
                      </div>
                  </div>

                  {/* Route Info */}
                  <div className="space-y-6 relative">
                      <div className="absolute left-[9px] top-3 bottom-3 w-[1px] bg-gradient-to-b from-highlight via-accent to-primary opacity-30"></div>
                      
                      <div className="flex gap-6 items-start">
                        <div className="w-4 h-4 rounded-full border-2 border-highlight bg-[#0A0E17] z-10 mt-1 shadow-glow-accent animate-ping-once"></div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Client Info</p>
                            <p className="text-lg font-bold text-white leading-tight">{currentTrip.customerName}</p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{currentTrip.customerContact || 'Phone hidden'}</p>
                        </div>
                      </div>

                      <div className="flex gap-6 items-start">
                        <div className="w-4 h-4 rounded-full border-2 border-accent bg-[#0A0E17] z-10 mt-1 shadow-glow-primary"></div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Pickup Address</p>
                            <p className="text-sm font-bold text-white uppercase">Beverly Hills Hub</p>
                        </div>
                      </div>

                      <div className="flex gap-6 items-start">
                        <div className="w-4 h-4 rounded-full border-2 border-primary bg-[#0A0E17] z-10 mt-1 shadow-glow-primary"></div>
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Dropoff Address</p>
                            <p className="text-sm font-bold text-white uppercase">{currentTrip.address}</p>
                        </div>
                      </div>
                  </div>

                  {tripState !== 'Completed' ? (
                      <button 
                        onClick={handleCTAAction}
                        className={`w-full py-6 ${cta.color} font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl flex items-center justify-center gap-4 text-sm italic transition-all active:scale-95 group`}
                      >
                        <cta.icon size={20} className="group-hover:scale-125 transition-transform" /> {cta.label}
                      </button>
                  ) : (
                      <div className="p-6 bg-accent/10 border border-accent/20 rounded-2xl flex flex-col items-center justify-center gap-3">
                        <CheckCircle2 className="text-accent" size={40} />
                        <p className="text-xs font-black text-accent uppercase tracking-widest">Trip Completed Successfully</p>
                      </div>
                  )}
                  
                  <div className="flex justify-center mt-4 gap-4">
                     <button className="text-[9px] font-bold text-gray-500 uppercase hover:text-white transition-colors underline underline-offset-4 decoration-white/20">Report Issue</button>
                  </div>
                </div>
              </>
            ) : (
               <div className="p-12 text-center text-gray-500">
                 <Clock size={48} className="mx-auto mb-4 opacity-50" />
                 <p className="text-xs font-black uppercase tracking-widest">No Active Assignments</p>
               </div>
            )}
         </motion.div>
      </section>

      {/* UPCOMING TRIPS */}
      <section className="space-y-4 px-2">
         <button 
            onClick={() => setShowLaterTasks(!showLaterTasks)}
            className="w-full flex items-center justify-between text-gray-600 hover:text-white transition-colors"
         >
            <h3 className="text-xs font-black uppercase tracking-[0.4em] italic">Upcoming Trips ({upcomingTrips.length > 1 ? upcomingTrips.length - 1 : 0})</h3>
            {showLaterTasks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
         </button>
         
         <AnimatePresence>
            {showLaterTasks && upcomingTrips.length > 1 && (
               <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-3"
               >
                  {upcomingTrips.slice(1).map(trip => (
                     <div key={trip.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between opacity-40">
                        <div className="flex items-center gap-3">
                           <Clock size={14} className="text-gray-600" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{trip.vehicleName}</span>
                        </div>
                        <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{trip.scheduleDate}</span>
                     </div>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>
      </section>

      {/* EMERGENCY SUPPORT */}
      <div className="fixed bottom-24 right-4 z-40">
         <button 
            onClick={() => setShowEmergency(!showEmergency)}
            className="w-14 h-14 bg-danger/10 border border-danger/30 rounded-full flex items-center justify-center text-danger shadow-glow-danger active:scale-95 transition-all"
         >
            <AlertOctagon size={24} />
         </button>
      </div>

      <AnimatePresence>
         {showEmergency && (
            <div className="fixed inset-0 z-50 flex items-end">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md"
                  onClick={() => setShowEmergency(false)}
               />
               <motion.div 
                  initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  className="relative w-full bg-[#111111] border-t border-white/10 p-8 rounded-t-[32px] space-y-6"
               >
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-serif">Emergency Support</h3>
                     <button onClick={() => setShowEmergency(false)} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                     <button className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-danger/10 hover:border-danger/30 transition-all text-left">
                        <AlertTriangle className="text-danger" size={24} />
                        <div>
                           <p className="text-sm font-bold text-white uppercase">Report Accident</p>
                           <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mt-1">Log major vehicle collision or incident</p>
                        </div>
                     </button>
                     <button className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-primary/10 hover:border-primary/30 transition-all text-left">
                        <Wrench className="text-primary" size={24} />
                        <div>
                           <p className="text-sm font-bold text-white uppercase">Vehicle Breakdown</p>
                           <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mt-1">Mechanical failure requiring tow</p>
                        </div>
                     </button>
                     <button className="flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all text-left">
                        <Phone className="text-white" size={24} />
                        <div>
                           <p className="text-sm font-bold text-white uppercase">Contact Operations Manager</p>
                           <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest mt-1">Direct line to dispatcher</p>
                        </div>
                     </button>
                  </div>
                  
                  <button onClick={() => setShowEmergency(false)} className="w-full py-4 bg-white/5 text-gray-500 font-black uppercase tracking-widest rounded-2xl text-[10px]">Cancel</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {showRejectModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
               <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#0A0A0A]/90 backdrop-blur-md"
                  onClick={() => setShowRejectModal(false)}
               />
               <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-sm bg-[#111111] border border-white/10 p-8 rounded-[2rem] space-y-6"
               >
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tight font-serif">Reject Assignment</h3>
                  
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Reason</p>
                     <div className="grid grid-cols-1 gap-2">
                        {['Vehicle Issue', 'Driver Unavailable', 'Customer Not Reachable', 'Emergency Situation', 'Other'].map(r => (
                           <button 
                              key={r}
                              onClick={() => setRejectReason(r)}
                              className={`p-4 rounded-xl border text-left text-xs font-bold uppercase transition-all
                                 ${rejectReason === r ? 'bg-danger/20 border-danger text-danger' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}
                              `}
                           >
                              {r}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                     <button onClick={() => setShowRejectModal(false)} className="flex-1 py-4 bg-white/5 text-white font-black uppercase tracking-widest rounded-xl text-[10px]">Cancel</button>
                     <button onClick={confirmReject} className="flex-1 py-4 bg-danger text-white font-black uppercase tracking-widest rounded-xl text-[10px] shadow-glow-danger">Confirm Reject</button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* PERSISTENT STATUS BAR */}
      <div className="fixed bottom-8 right-8 z-30 pointer-events-none">
          <div className="py-4 px-6 bg-[#111111]/85 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl backdrop-blur-xl pointer-events-auto">
             <Smartphone size={16} className="text-highlight" /> Active Workflow: {driverStatus} • {tripState}
          </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
