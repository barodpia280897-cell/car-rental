// src/components/booking/LuxuryBookingWizard.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, MapPin, User, FileText,
  Upload, ShieldCheck, CreditCard, CheckCircle2,
  ChevronRight, ChevronLeft, Download, Info,
  Sparkles, PenTool, Type, Shield, Lock, Copy
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

const LuxuryBookingWizard = ({ isOpen, onClose, initialCarName, initialDates = {} }) => {
  const [step, setStep] = useState(1);
  const [selectedCar, setSelectedCar] = useState(null);
  const { vehicles: initialCars } = useSelector(state => state.fleet);

  // Form states
  const [formData, setFormData] = useState({
    // Step 1: Customer Information & Detailed Address
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',

    // Step 2: Rental Information
    pickupDate: initialDates.pickupDate || '',
    returnDate: initialDates.returnDate || '',
    pickupLocation: initialDates.pickupLocation || 'Beverly Hills Hub',

    // Step 3: License Verification
    licenseNumber: '',
    licenseExpiry: '',
    licenseFront: null,
    licenseBack: null,

    // Step 4: Rental Agreement
    agreementAccepted: false,
    infoAccurate: false,
    signatureType: 'draw', // 'draw' or 'type'
    typedSignature: '',
    drawnSignatureData: null,

    // Step 5: Payment Method
    paymentMethod: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [reservationNumber, setReservationNumber] = useState('');
  const [showAgreementPreview, setShowAgreementPreview] = useState(false);

  // References for Drawing Canvas
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Set the selected vehicle based on name
  useEffect(() => {
    const carName = selectedCar?.name || initialCarName;
    if (carName) {
      const found = initialCars.find(c => c.name === carName);
      if (found) setSelectedCar(found);
    }
  }, [initialCarName, selectedCar?.name]);

  // Generate reservation number when completing booking
  useEffect(() => {
    if (step === 6 && !reservationNumber) {
      const sequentialNumber = Math.floor(1000 + Math.random() * 9000);
      setReservationNumber(`GFR-2026-${sequentialNumber}`);
    }
  }, [step, reservationNumber]);

  if (!isOpen) return null;

  // Step names
  const stepsList = [
    { name: 'Customer Info', desc: 'Personal details' },
    { name: 'Lease Terms', desc: 'Select duration' },
    { name: 'Verification', desc: 'Driver credentials' },
    { name: 'Agreement', desc: 'Sign contract' },
    { name: 'Payment & Reservation', desc: 'Select payment' },
    { name: 'Confirmation', desc: 'Reservation active' }
  ];

  // Duration and Pricing Calculations
  const calculateDays = () => {
    if (formData.pickupDate && formData.returnDate) {
      const start = new Date(formData.pickupDate);
      const end = new Date(formData.returnDate);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 1 : diffDays;
      }
    }
    return 0;
  };

  const days = calculateDays();
  const dailyRate = selectedCar ? selectedCar.price : 0;
  const subtotal = days * dailyRate;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const deliveryFee = subtotal > 1500 ? 0 : 150;
  const grandTotal = subtotal + tax + deliveryFee;

  // Validation functions
  const validateStep = (currentStep) => {
    const errors = {};
    if (currentStep === 1) {
      if (!formData.fullName.trim()) errors.fullName = 'Full Name is required';
      if (!formData.email.trim()) {
        errors.email = 'Email Address is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Invalid email address format';
      }
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.streetAddress.trim()) errors.streetAddress = 'Street address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.zipCode.trim()) errors.zipCode = 'ZIP Code is required';
      if (!formData.country.trim()) errors.country = 'Country is required';
    } else if (currentStep === 2) {
      if (!selectedCar) errors.car = 'Please select a vehicle';
      if (!formData.pickupDate) {
        errors.pickupDate = 'Pickup Date is required';
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        if (formData.pickupDate < todayStr) {
          errors.pickupDate = 'Pickup Date cannot be in the past.';
        }
      }
      if (!formData.returnDate) {
        errors.returnDate = 'Return Date is required';
      } else {
        if (formData.returnDate < formData.pickupDate) {
          errors.returnDate = 'Return date must be later than pickup date.';
        } else if (formData.returnDate === formData.pickupDate) {
          errors.returnDate = 'Same-day returns are not allowed. Minimum lease is 1 full cycle.';
        }
      }
    } else if (currentStep === 3) {
      if (!formData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
      if (!formData.licenseExpiry) errors.licenseExpiry = 'License expiry date is required';
      else if (new Date(formData.licenseExpiry) < new Date()) {
        errors.licenseExpiry = 'License has expired';
      }
      if (!formData.licenseFront) errors.licenseFront = 'Front image of driver license is required';
      if (!formData.licenseBack) errors.licenseBack = 'Back image of driver license is required';
    } else if (currentStep === 4) {
      if (!formData.agreementAccepted) errors.agreementAccepted = 'You must accept the rental terms';
      if (!formData.infoAccurate) errors.infoAccurate = 'You must confirm information accuracy';
      if (formData.signatureType === 'type' && !formData.typedSignature.trim()) {
        errors.signature = 'Please type your signature';
      }
      if (formData.signatureType === 'draw' && !formData.drawnSignatureData) {
        errors.signature = 'Please draw your signature';
      }
    } else if (currentStep === 5) {
      if (!formData.paymentMethod) errors.paymentMethod = 'Please select a payment option';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    } else {
      toast.error('Please resolve missing required fields.');
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // License upload handlers
  const handleFileUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [side]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas drawing logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawingRef.current = true;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData(prev => ({
        ...prev,
        drawnSignatureData: canvas.toDataURL()
      }));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({
      ...prev,
      drawnSignatureData: null
    }));
  };

  // Mock document download functions
  const downloadAgreement = () => {
    const text = `GOFINTAZA LUXURY BESPOKE LEASE AGREEMENT\n\n` +
      `Reservation Number: ${reservationNumber || 'PENDING'}\n` +
      `Vehicle: ${selectedCar?.name}\n` +
      `Daily rate: $${dailyRate}\n` +
      `Customer Name: ${formData.fullName}\n` +
      `Delivery Address: ${formData.streetAddress}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}\n\n` +
      `Terms: Full comprehensive insurance and roadside concierge included. Minimum 24-hour cycle. Telemetry monitor fully active.`;

    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Lease_Agreement_${selectedCar?.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Lease agreement document drafted successfully.');
  };

  const downloadSummary = () => {
    const text = `GOFINTAZA LUXURY RENTAL SUMMARY\n\n` +
      `Reservation Number: ${reservationNumber}\n` +
      `Status: PENDING REVIEW\n` +
      `Customer Name: ${formData.fullName}\n` +
      `Vehicle: ${selectedCar?.name}\n` +
      `Rental Dates: ${formData.pickupDate} to ${formData.returnDate} (${days} Days)\n` +
      `Address: ${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}\n` +
      `Payment Method: ${formData.paymentMethod}\n` +
      `Total Amount: $${grandTotal.toLocaleString()}\n\n` +
      `Our rental team has received your reservation request and will contact you shortly to finalize your booking.`;

    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `GoFintaza_Reservation_${reservationNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Reservation summary downloaded.');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => step !== 6 && onClose()}
        className="fixed inset-0 bg-black/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-4xl bg-[#111111] border border-[#D4AF37]/20 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] z-10 flex flex-col max-h-[90vh]"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-[#D4AF37]/10 flex justify-between items-center bg-[#0A0A0A]/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/35 rounded-2xl text-[#D4AF37] shadow-glow-primary">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white font-serif italic">
                Bespoke <span className="text-[#D4AF37]">Reservation</span>
              </h3>
              {step < 6 ? (
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]/70 mt-1">
                  Step {step} of 5: {stepsList[step - 1].name}
                </p>
              ) : (
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-500 mt-1">
                  Reservation Confirmed
                </p>
              )}
            </div>
          </div>
          {step !== 6 && (
            <button
              onClick={onClose}
              className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Progress Timeline (Hidden on mobile for cleaner space) */}
        {step < 6 && (
          <div className="hidden md:flex px-8 py-3.5 bg-[#0A0A0A]/30 border-b border-[#D4AF37]/5 justify-between gap-1">
            {stepsList.slice(0, 5).map((s, idx) => {
              const num = idx + 1;
              const isActive = step === num;
              const isCompleted = step > num;
              return (
                <div key={idx} className="flex-1 flex flex-col gap-1.5">
                  <div className="h-1 rounded-full relative overflow-hidden bg-white/5">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-[#D4AF37]' : isActive ? 'bg-[#D4AF37] animate-pulse' : 'bg-transparent'
                        }`}
                      style={{ width: isCompleted || isActive ? '100%' : '0%' }}
                    />
                  </div>
                  <span className={`text-[8px] uppercase tracking-widest font-black ${isActive ? 'text-[#D4AF37]' : isCompleted ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                    0{num} {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Body Content - Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-[#0C0C0C]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 1: CUSTOMER INFORMATION */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-lg font-bold uppercase tracking-wide text-white">Customer Profile & Delivery Logistics</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Please specify account registration name and delivery hub coordinates</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Data */}
                    <div className="md:col-span-1 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Personal Details</h5>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                          placeholder="e.g. Elena Rodriguez"
                        />
                        {formErrors.fullName && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.fullName}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                          placeholder="elena@vortex.io"
                        />
                        {formErrors.email && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.email}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                          placeholder="+1 (555) 234-5678"
                        />
                        {formErrors.phone && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.phone}</p>}
                      </div>
                    </div>

                    {/* Detailed Delivery Logistics */}
                    <div className="md:col-span-2 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Lease Delivery Address</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Street Address</label>
                          <input
                            type="text"
                            value={formData.streetAddress}
                            onChange={e => setFormData({ ...formData, streetAddress: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                            placeholder="e.g. 1004 Beverly Hills Blvd Suite 40"
                          />
                          {formErrors.streetAddress && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.streetAddress}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">City</label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                            placeholder="Beverly Hills"
                          />
                          {formErrors.city && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.city}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">State / Region</label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                            placeholder="CA"
                          />
                          {formErrors.state && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.state}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">ZIP / Postal Code</label>
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                            placeholder="90210"
                          />
                          {formErrors.zipCode && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.zipCode}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Country</label>
                          <input
                            type="text"
                            value={formData.country}
                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                            placeholder="United States"
                          />
                          {formErrors.country && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.country}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: RENTAL INFORMATION */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-lg font-bold uppercase tracking-wide text-white">Verify Rental Fleet & Schedules</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Calculate total duration, daily lease base rates, and logistics details</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Fields */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Selected Vehicle</label>
                        <select
                          value={selectedCar?.name || ''}
                          onChange={e => {
                            const car = initialCars.find(c => c.name === e.target.value);
                            setSelectedCar(car);
                          }}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3.5 px-4 text-xs font-bold text-white focus:outline-none transition-all"
                        >
                          <option value="" disabled>Select vehicle...</option>
                          {initialCars.map(car => (
                            <option key={car.id} value={car.name}>
                              {car.name} — ${car.price}/Day ({car.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Pickup Station</label>
                        <select
                          value={formData.pickupLocation}
                          onChange={e => setFormData({ ...formData, pickupLocation: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3.5 px-4 text-xs font-bold text-white focus:outline-none transition-all"
                        >
                          <option value="Beverly Hills Hub">Beverly Hills Hub</option>
                          <option value="Downtown Executive">Downtown Executive</option>
                          <option value="North Port Sky Station">North Port Sky Station</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Pickup Date</label>
                          <input
                            type="date"
                            value={formData.pickupDate}
                            onChange={e => setFormData({ ...formData, pickupDate: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none [color-scheme:dark]"
                          />
                          {formErrors.pickupDate && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.pickupDate}</p>}
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Return Date</label>
                          <input
                            type="date"
                            value={formData.returnDate}
                            onChange={e => setFormData({ ...formData, returnDate: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none [color-scheme:dark]"
                          />
                          {formErrors.returnDate && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.returnDate}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Summary Side Card */}
                    <div className="md:col-span-5 bg-[#141414] border border-[#D4AF37]/15 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] mb-3 border-b border-[#D4AF37]/10 pb-1">Price Calculation</h5>
                        {selectedCar ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Vehicle:</span>
                              <span className="font-bold text-white uppercase tracking-wider text-[10px]">{selectedCar.name}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Rental Days:</span>
                              <span className="font-bold text-white">{days > 0 ? `${days} Days` : '0 Days'}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Daily Rate:</span>
                              <span className="font-bold text-white">${selectedCar.price}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Rental Subtotal:</span>
                              <span className="font-bold text-white">${subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Taxes (8%):</span>
                              <span className="font-bold text-white">${tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Delivery Fee:</span>
                              <span className="font-bold text-white">{deliveryFee === 0 ? 'COMPLIMENTARY' : `$${deliveryFee}`}</span>
                            </div>
                            <div className="flex justify-between text-xs pt-2 border-t border-[#D4AF37]/35">
                              <span className="font-black text-[#D4AF37] uppercase tracking-widest text-[8px]">Grand Total:</span>
                              <span className="font-black text-[#D4AF37]">${grandTotal.toLocaleString()}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 italic text-center py-6">Please select a vehicle to view pricing breakdown</p>
                        )}
                      </div>

                      {selectedCar && (
                        <div className="p-3.5 bg-[#D4AF37]/5 border border-[#D4AF37]/25 rounded-xl flex items-start gap-2.5">
                          <Info size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                          <p className="text-[9px] text-[#D4AF37] leading-relaxed uppercase tracking-wider font-bold">
                            Taxes, insurance plans, and delivery logistics will be detailed before finalize.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LICENSE VERIFICATION */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-lg font-bold uppercase tracking-wide text-white">License Authentication Protocol</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Upload driver credentials to secure security clearances</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fields */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Driver Credentials</h5>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Driver License Number</label>
                        <input
                          type="text"
                          value={formData.licenseNumber}
                          onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:shadow-glow-primary transition-all"
                          placeholder="e.g. DL-9823471-Z"
                        />
                        {formErrors.licenseNumber && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.licenseNumber}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">License Expiration Date</label>
                        <input
                          type="date"
                          value={formData.licenseExpiry}
                          onChange={e => setFormData({ ...formData, licenseExpiry: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none [color-scheme:dark]"
                        />
                        {formErrors.licenseExpiry && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.licenseExpiry}</p>}
                      </div>

                      <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-start gap-3">
                        <ShieldCheck size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold leading-relaxed">
                          All files are encrypted and processed securely. Our logistics team verifies details in real time prior to delivery schedule.
                        </p>
                      </div>
                    </div>

                    {/* Upload Boxes */}
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Upload Documents</h5>
                      <div className="grid grid-cols-2 gap-4">
                        {/* License Front */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">License (Front)</label>
                          <input
                            type="file"
                            accept="image/*"
                            id="dl-front"
                            onChange={e => handleFileUpload(e, 'licenseFront')}
                            className="hidden"
                          />
                          <label
                            htmlFor="dl-front"
                            className="aspect-[1.58/1] bg-[#0A0A0A] border border-dashed border-[#D4AF37]/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all overflow-hidden relative"
                          >
                            {formData.licenseFront ? (
                              <img src={formData.licenseFront} className="w-full h-full object-cover" alt="DL Front Preview" />
                            ) : (
                              <div className="text-center p-3">
                                <Upload size={20} className="text-[#D4AF37] mx-auto mb-1.5" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Upload Front</span>
                              </div>
                            )}
                          </label>
                          {formErrors.licenseFront && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.licenseFront}</p>}
                        </div>

                        {/* License Back */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">License (Back)</label>
                          <input
                            type="file"
                            accept="image/*"
                            id="dl-back"
                            onChange={e => handleFileUpload(e, 'licenseBack')}
                            className="hidden"
                          />
                          <label
                            htmlFor="dl-back"
                            className="aspect-[1.58/1] bg-[#0A0A0A] border border-dashed border-[#D4AF37]/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] transition-all overflow-hidden relative"
                          >
                            {formData.licenseBack ? (
                              <img src={formData.licenseBack} className="w-full h-full object-cover" alt="DL Back Preview" />
                            ) : (
                              <div className="text-center p-3">
                                <Upload size={20} className="text-[#D4AF37] mx-auto mb-1.5" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-500">Upload Back</span>
                              </div>
                            )}
                          </label>
                          {formErrors.licenseBack && <p className="text-red-500 text-[8px] uppercase font-bold mt-0.5">{formErrors.licenseBack}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RENTAL AGREEMENT */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-lg font-bold uppercase tracking-wide text-white">Bespoke Rental Compact</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Review lease documents and authorize with legal signature credentials</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Agreement Actions & Checks */}
                    <div className="md:col-span-6 space-y-5">
                      <div className="p-5 bg-[#141414] border border-[#D4AF37]/15 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Agreement Documents</h5>
                        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider font-medium">
                          Please preview the lease terms outlining liability, telemetry trackers, and safety deposits before authorizing.
                        </p>
                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={() => setShowAgreementPreview(true)}
                            className="flex-1 py-2.5 bg-transparent border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all"
                          >
                            Preview Agreement
                          </button>
                          <button
                            onClick={downloadAgreement}
                            className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black text-[9px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02]"
                          >
                            <Download size={12} /> Download PDF
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.agreementAccepted}
                            onChange={e => setFormData({ ...formData, agreementAccepted: e.target.checked })}
                            className="w-4 h-4 rounded border-[#D4AF37]/30 text-[#D4AF37] focus:ring-0 bg-[#0A0A0A] shrink-0 mt-0.5 accent-[#D4AF37]"
                          />
                          <span className="text-[10px] text-gray-400 group-hover:text-white uppercase tracking-wider font-bold leading-relaxed transition-colors">
                            I have read and accept the rental agreement.
                          </span>
                        </label>
                        {formErrors.agreementAccepted && <p className="text-red-500 text-[8px] uppercase font-bold">{formErrors.agreementAccepted}</p>}

                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.infoAccurate}
                            onChange={e => setFormData({ ...formData, infoAccurate: e.target.checked })}
                            className="w-4 h-4 rounded border-[#D4AF37]/30 text-[#D4AF37] focus:ring-0 bg-[#0A0A0A] shrink-0 mt-0.5 accent-[#D4AF37]"
                          />
                          <span className="text-[10px] text-gray-400 group-hover:text-white uppercase tracking-wider font-bold leading-relaxed transition-colors">
                            I confirm all provided information is accurate.
                          </span>
                        </label>
                        {formErrors.infoAccurate && <p className="text-red-500 text-[8px] uppercase font-bold">{formErrors.infoAccurate}</p>}
                      </div>
                    </div>

                    {/* Signature pad */}
                    <div className="md:col-span-6 space-y-4">
                      <div className="flex justify-between items-center border-b border-[#D4AF37]/10 pb-1">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Digital Signature</h5>
                        <div className="flex bg-[#0A0A0A] rounded-lg p-0.5 border border-[#D4AF37]/15">
                          <button
                            onClick={() => setFormData({ ...formData, signatureType: 'draw' })}
                            className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center gap-1 ${formData.signatureType === 'draw' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'
                              }`}
                          >
                            <PenTool size={10} /> Draw
                          </button>
                          <button
                            onClick={() => setFormData({ ...formData, signatureType: 'type' })}
                            className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md transition-all flex items-center gap-1 ${formData.signatureType === 'type' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'
                              }`}
                          >
                            <Type size={10} /> Type
                          </button>
                        </div>
                      </div>

                      {formData.signatureType === 'draw' ? (
                        <div className="space-y-2">
                          <div className="relative border border-[#D4AF37]/20 rounded-xl bg-[#0A0A0A] overflow-hidden">
                            <canvas
                              ref={canvasRef}
                              width={380}
                              height={150}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-[130px] block cursor-crosshair"
                            />
                            <button
                              onClick={clearCanvas}
                              className="absolute bottom-2 right-2 px-2 py-1 bg-white/5 hover:bg-white/10 text-[8px] font-bold uppercase text-gray-400 hover:text-white rounded border border-white/10"
                            >
                              Clear Pad
                            </button>
                          </div>
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest text-center">Draw signature inside the box using pointer/touchscreen</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formData.typedSignature}
                            onChange={e => setFormData({ ...formData, typedSignature: e.target.value })}
                            className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 rounded-xl py-4 px-4 text-lg font-serif italic text-white focus:outline-none focus:shadow-glow-primary transition-all text-center"
                            placeholder="Type Signature (e.g. Elena Rodriguez)"
                          />
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest text-center">Type your name to sign legally</p>
                        </div>
                      )}
                      {formErrors.signature && <p className="text-red-500 text-[8px] uppercase font-bold text-center mt-1">{formErrors.signature}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: PAYMENT METHOD & PERSISTENT SUMMARY */}
              {step === 5 && (
                <div className="space-y-6">
                  <div className="text-center md:text-left space-y-1">
                    <h4 className="text-lg font-bold uppercase tracking-wide text-white">Select Surcharge Settle Channel</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Link cards or select private concierge options for security deposits</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Payment methods */}
                    <div className="md:col-span-7 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Payment Method</h5>
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: 'Credit Card', title: 'Credit / Debit Card', desc: 'Visa • Mastercard • Amex • Debit Card' },
                          { id: 'Zelle', title: 'Zelle Surcharge Settle', desc: 'Instant bank transfer deposit' },
                          { id: 'Cash App', title: 'Cash App', desc: 'Secure Mobile payment option' },
                          { id: 'Pay Later', title: 'Pay at Delivery / Concierge', desc: 'Settle at vehicle drop-off' }
                        ].map(pm => {
                          const isSelected = formData.paymentMethod === pm.id;
                          return (
                            <div
                              key={pm.id}
                              onClick={() => setFormData({ ...formData, paymentMethod: pm.id })}
                              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all group ${isSelected
                                  ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-glow-primary'
                                  : 'bg-[#0A0A0A] border-white/5 hover:border-[#D4AF37]/30'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <CreditCard size={18} className={isSelected ? 'text-[#D4AF37]' : 'text-gray-500'} />
                                <div>
                                  <p className="text-xs font-bold text-white uppercase tracking-wider">{pm.title}</p>
                                  <p className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">{pm.desc}</p>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'
                                }`}>
                                {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {formErrors.paymentMethod && <p className="text-red-500 text-[8px] uppercase font-bold mt-1">{formErrors.paymentMethod}</p>}                      {/* Additional Payment Detail Panels */}
                      <AnimatePresence mode="wait">
                        {formData.paymentMethod === 'Zelle' && (
                          <motion.div
                            key="zelle-panel"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="bg-[#141414] border border-[#D4AF37]/20 rounded-2xl p-5 space-y-4 shadow-glow-primary text-left mt-4"
                          >
                            <div className="flex items-center gap-2 border-b border-[#D4AF37]/10 pb-2">
                              <Info className="text-[#D4AF37] w-4 h-4" />
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Zelle Payment Instructions</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Business Name</p>
                                <p className="font-bold text-white uppercase tracking-wider">GoFintaza LLC</p>
                              </div>
                              <div>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Amount Due</p>
                                <p className="font-bold text-[#D4AF37] font-serif italic">${grandTotal.toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Payment Email</p>
                                <div className="flex items-center justify-between bg-[#0A0A0A] p-2 rounded-xl border border-white/5 mt-0.5">
                                  <a href="mailto:payments@gofintaza.com" className="font-bold text-white tracking-wide hover:underline">
                                    payments@gofintaza.com
                                  </a>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText('payments@gofintaza.com');
                                      toast.success('Zelle email address copied.');
                                    }}
                                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Reservation Reference</p>
                                <p className="font-bold text-white uppercase tracking-wider">{reservationNumber || 'Generated Upon Submission'}</p>
                              </div>
                            </div>
                            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 text-[9px] text-gray-400 font-semibold tracking-wide leading-relaxed">
                              Send the exact amount through Zelle and include your reservation reference in the payment note.
                            </div>
                          </motion.div>
                        )}

                        {formData.paymentMethod === 'Cash App' && (
                          <motion.div
                            key="cashapp-panel"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="bg-[#141414] border border-[#D4AF37]/20 rounded-2xl p-5 space-y-4 shadow-glow-primary text-left mt-4"
                          >
                            <div className="flex items-center gap-2 border-b border-[#D4AF37]/10 pb-2">
                              <Info className="text-[#D4AF37] w-4 h-4" />
                              <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Cash App Payment Instructions</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Cash Tag</p>
                                <div className="flex items-center justify-between bg-[#0A0A0A] p-2 rounded-xl border border-white/5 mt-0.5">
                                  <p className="font-bold text-white tracking-wide">$GoFintaza</p>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      navigator.clipboard.writeText('$GoFintaza');
                                      toast.success('Cash App Cashtag copied.');
                                    }}
                                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <div>
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Amount Due</p>
                                <p className="font-bold text-[#D4AF37] font-serif italic">${grandTotal.toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[8px] text-gray-500 uppercase tracking-widest">Reservation Reference</p>
                                <p className="font-bold text-white uppercase tracking-wider">{reservationNumber || 'Generated Upon Submission'}</p>
                              </div>
                            </div>
                            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 text-[9px] text-gray-400 font-semibold tracking-wide leading-relaxed">
                              Send the exact amount through Cash App and include your reservation reference in the payment note.
                            </div>
                          </motion.div>
                        )}

                        {formData.paymentMethod === 'Pay Later' && (
                          <motion.div
                            key="paylater-panel"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            className="bg-[#141414] border border-[#D4AF37]/20 rounded-2xl p-5 space-y-4 shadow-glow-primary text-left mt-4"
                          >
                            <div className="flex items-center justify-between border-b border-[#D4AF37]/10 pb-2">
                              <div className="flex items-center gap-2">
                                <Info className="text-[#D4AF37] w-4 h-4" />
                                <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Concierge Settlement</h5>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded text-[7px] font-black uppercase tracking-wider">
                                Pending Review
                              </span>
                            </div>
                            <div className="bg-[#0A0A0A] p-3 rounded-xl border border-white/5 text-[9px] text-gray-400 font-semibold tracking-wide leading-relaxed">
                              Reservation will be reviewed by the GoFintaza team. Payment will be collected during vehicle delivery or final reservation confirmation.
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Persistent Payment Summary Card */}
                    <div className="md:col-span-5 bg-[#141414] border border-[#D4AF37]/20 rounded-2xl p-6 space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Invoice Surcharge Breakdown</h5>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Vehicle:</span>
                            <span className="font-bold text-white uppercase tracking-wider text-[10px]">{selectedCar?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rental Cycles:</span>
                            <span className="font-bold text-white">{days} Days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Daily Lease Rate:</span>
                            <span className="font-bold text-white">${dailyRate}/Day</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-white/5">
                            <span className="text-gray-400">Subtotal:</span>
                            <span className="font-bold text-white">${subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Taxes (8%):</span>
                            <span className="font-bold text-white">${tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Delivery Fee:</span>
                            <span className="font-bold text-white">{deliveryFee === 0 ? 'COMPLIMENTARY' : `$${deliveryFee}`}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#D4AF37]/20 flex justify-between items-end">
                        <div>
                          <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Grand Total Due</p>
                          <p className="text-2xl font-black text-[#D4AF37] font-serif italic">${grandTotal.toLocaleString()}</p>
                        </div>
                        <div className="px-2 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/35 rounded text-[8px] font-black text-[#D4AF37] uppercase tracking-widest">
                          Lease Deposit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: CONFIRMATION SCREEN */}
              {step === 6 && (
                <div className="space-y-8 py-6 text-center max-w-xl mx-auto">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 bg-[#D4AF37]/10 border border-[#D4AF37]/45 rounded-full flex items-center justify-center text-[#D4AF37] mx-auto shadow-glow-primary mb-4"
                  >
                    <CheckCircle2 size={36} strokeWidth={2} className="animate-pulse" />
                  </motion.div>

                  <div className="space-y-2">
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-md text-[8px] font-black uppercase tracking-[0.2em]">
                      {reservationNumber} • Pending Review
                    </span>
                    <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-serif italic">
                      Reservation Submitted Successfully
                    </h4>
                    <p className="text-xs text-gray-400 max-w-md mx-auto uppercase tracking-wide leading-relaxed font-semibold">
                      Our rental team has received your reservation request and will contact you shortly to finalize your booking.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-[#141414] border border-[#D4AF37]/15 rounded-2xl p-6 text-left space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1.5">GoFintaza Client Receipt</h5>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Client Name</p>
                        <p className="font-bold text-white uppercase tracking-wider">{formData.fullName}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Lease Vehicle</p>
                        <p className="font-bold text-[#D4AF37] uppercase tracking-wider">{selectedCar?.name}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Pickup Schedule</p>
                        <p className="font-bold text-white">{formData.pickupDate}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Return Schedule</p>
                        <p className="font-bold text-white">{formData.returnDate}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Delivery Address</p>
                        <p className="font-bold text-white uppercase tracking-wide">
                          {formData.streetAddress}, {formData.city}, {formData.state} {formData.zipCode}, {formData.country}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Settle Method</p>
                        <p className="font-bold text-white uppercase tracking-wider">{formData.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Grand Invoice Total</p>
                        <p className="font-black text-white font-serif italic">${grandTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Reservation Status Summary Block */}
                  <div className="bg-[#141414] border border-[#D4AF37]/15 rounded-2xl p-6 text-left space-y-4">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1.5">Reservation Parameters</h5>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Reservation Status</p>
                        <p className="font-bold text-amber-400 uppercase tracking-wider">Pending Review</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Selected Payment Method</p>
                        <p className="font-bold text-white uppercase tracking-wider">{formData.paymentMethod}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Reference Number</p>
                        <p className="font-bold text-[#D4AF37] uppercase tracking-wider">{reservationNumber}</p>
                      </div>
                      <div className="col-span-2 border-t border-white/5 pt-3">
                        <p className="text-[9px] text-gray-400 font-semibold tracking-wide leading-relaxed">
                          A member of the GoFintaza team will contact you shortly to verify availability and finalize your reservation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={downloadSummary}
                      className="flex-1 py-4 bg-transparent border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] font-black uppercase tracking-widest text-[9px] rounded-xl transition-all"
                    >
                      Download Summary
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl transition-all hover:scale-[1.01]"
                    >
                      Close Portal
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Modal Footer (Controls) */}
        {step < 6 && (
          <div className="p-6 md:p-8 border-t border-[#D4AF37]/10 bg-[#0A0A0A]/50 flex justify-between items-center">
            <button
              onClick={handlePrev}
              className={`flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'hover:bg-white/10'
                }`}
            >
              <ChevronLeft size={14} /> Back
            </button>

            <button
              onClick={step === 5 ? () => setStep(6) : handleNext}
              className="flex items-center gap-2 px-10 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-[0.15em] rounded-xl text-[9px] italic shadow-glow-primary hover:scale-[1.02] transition-all"
            >
              {step === 5 ? 'Complete Reservation' : 'Continue'} <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Inline Legal Agreement Preview Overlay */}
      <AnimatePresence>
        {showAgreementPreview && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/90">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center border-b border-[#D4AF37]/10 pb-2">
                <h5 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">Bespoke Lease Agreement Contract</h5>
                <button
                  onClick={() => setShowAgreementPreview(false)}
                  className="p-1 bg-white/5 rounded-md text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto text-gray-400 text-[10px] font-medium leading-relaxed space-y-3 uppercase tracking-wider pr-2 custom-scrollbar">
                <p className="font-bold text-white">1. RENTAL PERIOD & ELIGIBILITY</p>
                <p>
                  The lease duration commences upon the Renter taking possession of the vehicle at the designated delivery time and terminates on the scheduled return date and time. Any unauthorized extension of this rental period is strictly prohibited. Only the primary Renter and designated authorized operators are permitted to drive the vehicle. All drivers must maintain a valid, unrestricted driver's license, be at least 25 years of age, and be fully cleared by the company's screening process.
                </p>
                <p className="font-bold text-white">2. VEHICLE USE & RESPONSIBILITY</p>
                <p>
                  The vehicle shall be operated solely for lawful personal or executive transport. The Renter agrees to comply with all applicable local, state, and federal laws. Off-road driving, towing, or operating the vehicle in any reckless or negligent manner is strictly prohibited. The Renter assumes full financial responsibility for the safe operation, physical security, and protection of the vehicle during the rental period.
                </p>
                <p className="font-bold text-white">3. INSURANCE COVERAGE</p>
                <p>
                  The vehicle is provided with applicable insurance coverage as outlined in the rental package selected by the Renter. The Renter remains responsible for any deductible amounts, excluded damages, negligence, misuse, unauthorized operation, or violations of this Agreement. Coverage limitations and exclusions shall apply in accordance with the selected protection package.
                </p>
                <p className="font-bold text-white">4. VEHICLE CONDITION & FUEL POLICY</p>
                <p>
                  A comprehensive physical inspection must be performed and documented by the Renter prior to departure. The Renter agrees to return the vehicle in the exact cosmetic and mechanical condition as received, normal wear and tear excepted. The Renter shall immediately notify GoFintaza of any accident, theft, mechanical issue, warning indicator, or physical damage occurring during the rental period. Failure to promptly report such incidents may result in additional liability. The vehicle is delivered with a full tank of premium-grade fuel or a fully charged battery, and must be returned in the same condition. Refueling or recharging fees will apply if returned below the initial level.
                </p>
                <p className="font-bold text-white">5. RETURN CONDITIONS & VIOLATIONS</p>
                <p>
                  The vehicle must be returned to the designated location at the agreed-upon time. Late returns without prior authorization will result in additional hourly or daily rental rate surcharges, as well as potential recovery costs. Excessive dirt, interior stains, smoking residue, pet hair, odors, unauthorized modifications, missing accessories, or damage beyond normal wear and tear may result in additional cleaning, repair, restoration, or replacement charges. The Renter is solely responsible for all parking citations, moving violations, traffic fines, toll fees, and associated administrative processing charges incurred during the active rental contract period.
                </p>
                <p className="font-bold text-white">6. ROADSIDE ASSISTANCE</p>
                <p>
                  Emergency roadside assistance may be available based on the rental package selected. Assistance does not cover incidents resulting from negligence, misuse, loss of keys, improper fueling, unauthorized drivers, or violations of this Agreement.
                </p>
                <p className="font-bold text-white">7. GENERAL TERMS</p>
                <p>
                  This document constitutes the entire agreement between the Renter and GoFintaza, and any modifications to this contract must be executed in writing. Failure to comply with any provision of this Agreement may result in immediate termination of the rental arrangement and recovery of the vehicle where permitted by applicable law. GoFintaza reserves the right to refuse future rentals to any individual found in violation of these terms. Any disputes arising from this Agreement shall be governed by and interpreted in accordance with the laws of the State of Florida. The parties agree that any legal action or proceeding relating to this Agreement shall be brought within the State of Florida.
                </p>
              </div>

              <button
                onClick={() => setShowAgreementPreview(false)}
                className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[9px] rounded-lg shadow-md transition-all hover:scale-[1.01]"
              >
                Close Agreement Preview
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LuxuryBookingWizard;
