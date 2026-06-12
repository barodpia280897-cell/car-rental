import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Calendar, MapPin, User, 
  Upload, Shield, CreditCard, CheckCircle2,
  ChevronRight, ChevronLeft, Zap, Info,
  Car, Baby, Headphones, Plus, ShieldCheck
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBookingData, nextStep, prevStep, completeBooking } from '../../store/bookingSlice';

const BookingFlow = ({ isOpen, onClose, vehicle }) => {
  const dispatch = useDispatch();
  const { bookingFlow } = useSelector(state => state.booking);
  const { step, data } = bookingFlow;

  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [licenseImage, setLicenseImage] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, brand: 'Visa •••• 4242', exp: '12/28', primary: true },
    { id: 2, brand: 'Mastercard •••• 8812', exp: '09/26', primary: false },
  ]);

  if (!isOpen) return null;

  const steps = [
    { name: 'Dates', icon: Calendar },
    { name: 'Locations', icon: MapPin },
    { name: 'Driver', icon: User },
    { name: 'License', icon: Upload },
    { name: 'Extras', icon: Shield },
    { name: 'Payment', icon: CreditCard },
    { name: 'Confirm', icon: CheckCircle2 },
  ];

  const handleNext = () => {
    if (step === 1) {
      dispatch(updateBookingData({ startDate: pickupDate, endDate: returnDate }));
    }
    if (step === 4) {
      dispatch(updateBookingData({ licenseImage }));
    }
    if (step < 7) dispatch(nextStep());
    else {
      dispatch(completeBooking());
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 1) dispatch(prevStep());
  };

  const calculateDuration = () => {
    if (pickupDate && returnDate) {
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      if (end >= start) {
         const diffTime = Math.abs(end - start);
         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
         return diffDays > 0 ? `${diffDays} Full Cycles` : 'Same Day Return';
      }
      return 'Invalid Dates';
    }
    return 'Pending Selection';
  };

  const handleHubSelect = (type, hub) => {
    dispatch(updateBookingData({ [type]: hub }));
  };

  const handleLicenseUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLicenseImage(URL.createObjectURL(file));
    }
  };

  const handleAddPayment = () => {
    const newCard = { 
      id: paymentMethods.length + 1, 
      brand: `Amex •••• ${Math.floor(1000 + Math.random() * 9000)}`, 
      exp: '05/29', 
      primary: false 
    };
    setPaymentMethods([...paymentMethods, newCard]);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0A0E17]/90 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl glass-panel !p-0 border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-transparent p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-glow-primary">
                <Car size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Reserve <span className="text-primary">{vehicle?.name}</span></h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 mt-1">Step {step} of 7: {steps[step-1].name}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex px-8 py-4 bg-white/5 gap-2">
           {steps.map((s, i) => (
             <div key={i} className="flex-1 h-1.5 rounded-full relative overflow-hidden bg-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: i + 1 <= step ? '100%' : '0%' }}
                  className={`h-full ${i + 1 < step ? 'bg-accent' : i + 1 === step ? 'bg-primary shadow-glow-primary' : 'bg-transparent'}`}
                ></motion.div>
             </div>
           ))}
        </div>

        {/* Content Area */}
        <div className="p-10 min-h-[450px] max-h-[70vh] overflow-y-auto custom-scrollbar">
           <AnimatePresence mode='wait'>
             <motion.div
               key={step}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -20, opacity: 0 }}
               className="space-y-8"
             >
                {step === 1 && (
                  <div className="space-y-8 text-center max-w-xl mx-auto py-10">
                     <h4 className="text-3xl font-black text-white italic tracking-tight uppercase">Select Rental Duration</h4>
                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Pickup Date</label>
                           <div className="p-4 bg-[#0A0E17] border border-white/10 rounded-[2rem] flex items-center justify-center gap-4 hover:border-primary/50 transition-all">
                              <Calendar className="text-primary shrink-0" size={24} />
                              <input 
                                 type="date" 
                                 value={pickupDate}
                                 onChange={(e) => setPickupDate(e.target.value)}
                                 className="bg-transparent text-lg font-black text-white focus:outline-none [color-scheme:dark] w-full"
                              />
                           </div>
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Return Date</label>
                           <div className="p-4 bg-[#0A0E17] border border-white/10 rounded-[2rem] flex items-center justify-center gap-4 hover:border-primary/50 transition-all">
                              <Calendar className="text-primary shrink-0" size={24} />
                              <input 
                                 type="date" 
                                 value={returnDate}
                                 onChange={(e) => setReturnDate(e.target.value)}
                                 className="bg-transparent text-lg font-black text-white focus:outline-none [color-scheme:dark] w-full"
                              />
                           </div>
                        </div>
                     </div>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Duration: <span className="text-white">{calculateDuration()}</span></p>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                     <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">Route Logistics</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          { label: 'Pickup Location', key: 'pickupLocation' }, 
                          { label: 'Return Location', key: 'returnLocation' }
                        ].map((loc) => (
                          <div key={loc.key} className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">{loc.label}</label>
                             <div className="grid grid-cols-1 gap-3">
                                {['Beverly Hills Hub', 'Downtown Executive', 'North Port Sky Station'].map(hub => (
                                  <div 
                                    key={hub} 
                                    onClick={() => handleHubSelect(loc.key, hub)}
                                    className={`p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all group
                                      ${data[loc.key] === hub ? 'bg-primary/10 border-primary/40 shadow-glow-primary' : 'bg-[#0A0E17] border border-white/10 hover:border-white/20'}`}
                                  >
                                     <div className="flex items-center gap-4">
                                        <MapPin size={18} className={data[loc.key] === hub ? 'text-primary' : 'text-gray-600'} />
                                        <span className={`text-xs font-bold uppercase tracking-widest ${data[loc.key] === hub ? 'text-white' : 'text-gray-400'}`}>{hub}</span>
                                     </div>
                                     <div className={`w-5 h-5 rounded-full border-2 transition-all ${data[loc.key] === hub ? 'border-primary bg-primary' : 'border-white/10'}`}>
                                        {data[loc.key] === hub && <CheckCircle2 size={12} className="text-[#0A0E17] m-auto mt-0.5" />}
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 max-w-2xl mx-auto">
                     <h4 className="text-2xl font-black text-white italic tracking-tight uppercase text-center">Driver Identification</h4>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">First Name</label>
                           <input type="text" className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" placeholder="Enter first name" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Last Name</label>
                           <input type="text" className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" placeholder="Enter last name" />
                        </div>
                        <div className="space-y-2 col-span-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Email Address</label>
                           <input type="email" className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-4 px-6 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all" placeholder="name@premium.com" />
                        </div>
                     </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-8 text-center py-6">
                     <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">License Verification</h4>
                     <input 
                        type="file" 
                        id="license-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLicenseUpload}
                     />
                     <label 
                        htmlFor="license-upload"
                        className="max-w-md mx-auto aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all group overflow-hidden relative"
                     >
                        {licenseImage ? (
                           <>
                              <img src={licenseImage} className="w-full h-full object-cover" alt="License Preview" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <p className="text-[10px] font-black text-white uppercase tracking-widest">Click to change</p>
                              </div>
                           </>
                        ) : (
                           <>
                              <div className="p-4 bg-[#0A0E17] rounded-2xl text-gray-500 group-hover:text-primary transition-colors">
                                 <Upload size={32} />
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-white uppercase tracking-widest">Upload Driver's License</p>
                                 <p className="text-[10px] text-gray-500 mt-1 uppercase font-black">Drag and drop or click to browse</p>
                              </div>
                           </>
                        )}
                     </label>
                     <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4 text-left max-w-xl mx-auto">
                        <ShieldCheck className="text-primary shrink-0 mt-0.5" size={20} />
                        <p className="text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-wider">
                           All documents are encrypted and verified using bank-grade security. Verification typically takes less than 60 seconds.
                        </p>
                     </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-8">
                     <h4 className="text-2xl font-black text-white italic tracking-tight uppercase">Elevate Your Experience</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { icon: Shield, label: 'Full Protection', desc: 'Zero deductible coverage', price: '$45/day' },
                          { icon: Baby, label: 'Child Comfort', desc: 'ISOFIX Premium seat', price: '$15/day' },
                          { icon: Headphones, label: 'Elite Support', desc: '24/7 dedicated concierge', price: '$25/day' },
                        ].map((extra, i) => (
                          <div key={i} className="glass-panel p-8 border-white/5 hover:border-primary/30 transition-all cursor-pointer group flex flex-col h-full">
                             <div className="p-4 bg-white/5 rounded-2xl text-primary w-fit mb-6 group-hover:shadow-glow-primary transition-all">
                                <extra.icon size={24} />
                             </div>
                             <h5 className="text-lg font-black text-white uppercase tracking-tight mb-2 italic">{extra.label}</h5>
                             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 flex-1">{extra.desc}</p>
                             <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                <span className="text-sm font-black text-white">{extra.price}</span>
                                <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-[#0A0E17]">
                                   <Plus size={14} />
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-8 max-w-2xl mx-auto">
                     <h4 className="text-2xl font-black text-white italic tracking-tight uppercase text-center">Secure Payment</h4>
                     <div className="space-y-4">
                        {paymentMethods.map((card) => (
                          <div 
                            key={card.id} 
                            onClick={() => {
                              setPaymentMethods(paymentMethods.map(c => ({ ...c, primary: c.id === card.id })));
                            }}
                            className={`p-6 rounded-2xl border flex items-center justify-between cursor-pointer transition-all
                             ${card.primary ? 'bg-primary/5 border-primary/30 shadow-glow-primary' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
                          >
                             <div className="flex items-center gap-4">
                                <CreditCard size={24} className={card.primary ? 'text-primary' : 'text-gray-500'} />
                                <div>
                                   <p className="text-sm font-black text-white uppercase tracking-widest">{card.brand}</p>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Expires {card.exp}</p>
                                </div>
                             </div>
                             {card.primary && <CheckCircle2 size={20} className="text-primary" />}
                          </div>
                        ))}
                        <button 
                          onClick={handleAddPayment}
                          className="w-full py-5 border-2 border-dashed border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-primary/30 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                           <Plus size={16} /> Add New Payment Method
                        </button>
                     </div>
                  </div>
                )}

                {step === 7 && (
                  <div className="space-y-8">
                     <h4 className="text-2xl font-black text-white italic tracking-tight uppercase text-center">Final Review</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8 border-white/5 space-y-6">
                           <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Itinerary Details</h5>
                           <div className="space-y-4">
                              <div className="flex justify-between">
                                 <span className="text-xs text-gray-500 uppercase font-black">Vehicle</span>
                                 <span className="text-xs text-white font-black uppercase tracking-widest">{vehicle?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-xs text-gray-500 uppercase font-black">Duration</span>
                                 <span className="text-xs text-white font-black uppercase tracking-widest">4 Full Cycles</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-xs text-gray-500 uppercase font-black">Station</span>
                                 <span className="text-xs text-white font-black uppercase tracking-widest">Beverly Hills Hub</span>
                              </div>
                           </div>
                        </div>
                        <div className="glass-panel p-8 border-primary/20 bg-primary/5 space-y-6">
                           <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Financial Summary</h5>
                           <div className="space-y-3">
                              <div className="flex justify-between">
                                 <span className="text-xs text-gray-400 uppercase font-bold">Standard Access</span>
                                 <span className="text-xs text-white font-black">$3,400.00</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-xs text-gray-400 uppercase font-bold">Protection Plan</span>
                                 <span className="text-xs text-white font-black">$180.00</span>
                              </div>
                              <div className="pt-4 border-t border-white/10 flex justify-between">
                                 <span className="text-sm text-white font-black uppercase italic tracking-widest">Total Transaction</span>
                                 <span className="text-sm text-primary font-black tracking-tighter">$3,580.00</span>
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 bg-[#0A0E17] border border-white/10 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                           <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-primary">
                              <CheckCircle2 size={12} />
                           </div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                              I agree to the <span className="text-white">Rental Terms</span>, <span className="text-white">Privacy Protocol</span>, and <span className="text-white">Telemetry Monitoring Agreement</span>.
                           </p>
                        </div>
                     </div>
                  </div>
                )}
             </motion.div>
           </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/5 flex justify-between items-center">
           <button 
             onClick={handlePrev}
             disabled={step === 1}
             className={`flex items-center gap-2 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
               ${step === 1 ? 'opacity-0 cursor-default' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
           >
             <ChevronLeft size={16} /> Previous
           </button>
           
           <button 
             onClick={handleNext}
             className="flex items-center gap-3 px-12 py-4 bg-primary text-[#0A0E17] font-black uppercase tracking-[0.2em] rounded-xl text-[10px] italic shadow-glow-primary hover:scale-105 transition-all"
           >
             {step === 7 ? 'Authorize Transaction' : 'Proceed to Link'} <ChevronRight size={18} strokeWidth={3} />
           </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingFlow;
