import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Car, ChevronRight, 
  Clock, Download, MessageSquare, ShieldCheck,
  Star, CreditCard, AlertCircle, MoreHorizontal,
  FileText, Zap, CheckCircle2, History, XCircle
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cancelBooking } from '../../store/bookingSlice';
import { toast } from 'react-hot-toast';

const CustomerBookings = () => {
  const [filter, setFilter] = useState('All');
  const { bookings } = useSelector(state => state.booking);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCancel = (id) => {
    dispatch(cancelBooking(id));
    toast.success('Reservation cancellation initiated');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
      case 'Pending Approval':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Confirmed':
      case 'Pickup Ready':
        return 'text-success bg-success/10 border-success/20';
      case 'Active':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Completed':
        return 'border border-primary text-primary bg-transparent';
      case 'Cancelled':
        return 'text-danger bg-danger/10 border-danger/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  const statusSteps = ['Pending', 'Pending Approval', 'Confirmed', 'Pickup Ready', 'Active', 'Completed'];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Your <span className="text-primary">Itineraries</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Personal Fleet Access History</p>
        </div>
        <div className="flex gap-2 bg-[#111111] p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {['All', 'Upcoming', 'Active', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                ${filter === f 
                  ? 'bg-primary text-black shadow-glow-primary font-bold' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-8">
        <AnimatePresence mode='popLayout'>
          {bookings
            .filter(b => {
              if (filter === 'All') return true;
              if (filter === 'Upcoming') return b.status === 'Pending' || b.status === 'Confirmed' || b.status === 'Pickup Ready';
              return b.status === filter;
            })
            .map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel overflow-hidden border-white/5 hover:border-primary/30 transition-all group"
            >
              <div className="flex flex-col xl:flex-row">
                {/* Vehicle Section */}
                <div className="xl:w-80 h-64 xl:h-auto relative overflow-hidden shrink-0">
                  <img src={booking.image} alt={booking.vehicleName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent hidden xl:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent xl:hidden" />
                  
                  <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md
                    ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </div>
                </div>

                {/* Info & Status Flow Section */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Reservation: {booking.id}</p>
                        <h3 className="text-3xl font-black text-white italic tracking-tight uppercase font-serif">{booking.vehicleName}</h3>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase">
                              <Calendar size={14} /> {booking.startDate} — {booking.endDate}
                           </div>
                           <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase">
                              <MapPin size={14} /> {booking.pickupLocation}
                           </div>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-3xl font-black text-primary tracking-tighter italic">${booking.totalPrice}</p>
                        <p className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center md:justify-end gap-1">
                           <CheckCircle2 size={12} /> {booking.paymentStatus}
                        </p>
                      </div>
                    </div>

                    {/* Booking Status Flow Visualization */}
                    {booking.status !== 'Cancelled' && (
                      <div className="relative py-8 px-2 overflow-hidden">
                        <div className="flex justify-between items-center relative z-10">
                          {statusSteps.map((step, i) => {
                            const isCompleted = statusSteps.indexOf(booking.status) >= i;
                            const isCurrent = booking.status === step;
                            return (
                              <div key={step} className="flex flex-col items-center gap-3 relative flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500
                                  ${isCompleted ? 'bg-primary text-black shadow-glow-primary' : 'bg-white/5 border border-white/10 text-gray-600'}`}>
                                  {isCompleted ? <CheckCircle2 size={16} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-tighter whitespace-nowrap transition-colors
                                  ${isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-white' : 'text-gray-600'}`}>
                                  {step}
                                </span>
                                {i < statusSteps.length - 1 && (
                                  <div className={`absolute left-[50%] right-[-50%] top-4 h-[1px] -z-10
                                    ${statusSteps.indexOf(booking.status) > i ? 'bg-primary' : 'bg-white/5'}`}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-8 border-t border-white/5">
                    {booking.status === 'Pending' ? (
                      <button 
                        onClick={() => navigate(`/contract/${booking.id}`)}
                        className="px-6 py-4 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-glow-primary"
                      >
                        Sign Contract <ChevronRight size={14} strokeWidth={3} />
                      </button>
                    ) : booking.status === 'Pending Approval' ? (
                      <button 
                        disabled
                        className="px-6 py-4 bg-white/5 border border-white/10 text-gray-500 font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic flex items-center justify-center gap-2 cursor-not-allowed"
                      >
                        Awaiting Approval
                      </button>
                    ) : (
                      <button className="px-6 py-4 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic flex items-center justify-center gap-2 hover:scale-[1.02] transition-all shadow-glow-primary">
                        View Booking <ChevronRight size={14} strokeWidth={3} />
                      </button>
                    )}
                    <button className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Download size={14} /> Invoice
                    </button>
                    <button className="px-6 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <History size={14} /> Extend
                    </button>
                    {booking.status === 'Confirmed' || booking.status === 'Pending' || booking.status === 'Pending Approval' ? (
                       <button 
                         onClick={() => handleCancel(booking.id)}
                         className="px-6 py-4 bg-danger/10 border border-danger/20 text-danger font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-2"
                       >
                         <XCircle size={14} /> Cancel
                       </button>
                    ) : null}
                    <button className="p-4 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors ml-auto">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {bookings.length === 0 && (
          <div className="py-20 text-center glass-panel border-dashed border-white/10">
             <Car size={48} className="mx-auto text-gray-700 mb-6" />
             <h3 className="text-xl font-black text-white uppercase italic">Zero Reservations Detected</h3>
             <p className="text-gray-500 font-bold text-sm mt-2 uppercase tracking-widest">Begin your luxury journey today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBookings;
