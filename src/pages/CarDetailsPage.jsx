// src/pages/CarDetailsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/fleetSlice';
import logo from '../assets/carlogo.jpg';
import {
  ArrowLeft, Star, Shield, Clock, MapPin,
  Calendar, CheckCircle, Info, Sparkles,
  ChevronRight, Heart, Share2, Users, Compass, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LuxuryBookingWizard from '../components/booking/LuxuryBookingWizard';

const CarDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vehicles: initialCars } = useSelector((state) => state.fleet);
  
  const [car, setCar] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    if (initialCars.length === 0) {
      dispatch(fetchVehicles());
    }
  }, [dispatch, initialCars.length]);

  // Specifications based on car data
  const getCarSpecs = (carObj) => {
    if (!carObj) return {};
    const name = carObj.name.toLowerCase();
    
    // Default specs
    let specs = {
      seats: '4 Seats',
      doors: '2 Doors',
      transmission: 'Automatic Dual-Clutch',
      fuelType: 'Premium Gasoline',
      horsepower: '600 HP',
      deposit: '$2,500',
      minDays: 2,
      delivery: 'Available'
    };

    if (name.includes('spectre')) {
      specs = { seats: '4 Seats', doors: '2 Doors', transmission: 'Direct-Drive EV', fuelType: 'Electric (EV)', horsepower: '577 HP', deposit: '$3,500', minDays: 2, delivery: 'Complimentary' };
    } else if (name.includes('revuelto')) {
      specs = { seats: '2 Seats', doors: '2 Doors', transmission: '8-Speed DCT', fuelType: 'PHEV Hybrid V12', horsepower: '1,001 HP', deposit: '$5,000', minDays: 3, delivery: 'Complimentary' };
    } else if (name.includes('g-class')) {
      specs = { seats: '5 Seats', doors: '4 Doors', transmission: '9-Speed Automatic', fuelType: 'Twin-Turbo V8', horsepower: '577 HP', deposit: '$2,000', minDays: 1, delivery: 'Available' };
    } else if (name.includes('m8')) {
      specs = { seats: '4 Seats', doors: '2 Doors', transmission: '8-Speed Automatic', fuelType: 'Twin-Turbo V8', horsepower: '617 HP', deposit: '$1,500', minDays: 1, delivery: 'Available' };
    } else if (name.includes('plaid')) {
      specs = { seats: '5 Seats', doors: '4 Doors', transmission: 'Direct-Drive EV', fuelType: 'Tri-Motor EV', horsepower: '1,020 HP', deposit: '$1,200', minDays: 1, delivery: 'Available' };
    } else if (name.includes('911')) {
      specs = { seats: '2 Seats', doors: '2 Doors', transmission: '7-Speed PDK', fuelType: 'Flat-6 Gasoline', horsepower: '502 HP', deposit: '$3,500', minDays: 2, delivery: 'Complimentary' };
    } else if (name.includes('sf90')) {
      specs = { seats: '2 Seats', doors: '2 Doors', transmission: '8-Speed DCT', fuelType: 'PHEV Hybrid V8', horsepower: '986 HP', deposit: '$5,000', minDays: 3, delivery: 'Complimentary' };
    } else if (name.includes('dbs')) {
      specs = { seats: '2 Seats', doors: '2 Doors', transmission: '8-Speed Automatic', fuelType: 'Twin-Turbo V12', horsepower: '715 HP', deposit: '$4,000', minDays: 2, delivery: 'Complimentary' };
    } else if (name.includes('continental')) {
      specs = { seats: '4 Seats', doors: '2 Doors', transmission: '8-Speed DCT', fuelType: 'Twin-Turbo W12', horsepower: '626 HP', deposit: '$3,000', minDays: 2, delivery: 'Complimentary' };
    }
    return specs;
  };

  useEffect(() => {
    if (initialCars.length > 0) {
      const foundCar = initialCars.find(c => String(c.id) === String(id));
      if (foundCar) {
        setCar(foundCar);
        setActiveImage(foundCar.image_url || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=400');
      }
    }
    window.scrollTo(0, 0);
  }, [id, initialCars]);

  if (!car) return null;

  const specs = getCarSpecs(car);

  // Gallery Images
  const galleryImages = [
    car.image,
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
  ];

  // Pricing calculations
  const weeklyRate = Math.round(car.price * 7 * 0.88);
  const monthlyRate = Math.round(car.price * 30 * 0.75);

  const handleBookClick = () => {
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37]/30 selection:text-white font-sans antialiased overflow-x-hidden pb-12">
      {/* Luxury Navbar */}
      <header className="fixed top-0 inset-x-0 h-20 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#D4AF37]/10 flex items-center justify-between px-3 md:px-12 z-50">
        <div className="flex items-center gap-2 md:gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
          <img src={logo} alt="Client Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-lg border border-[#D4AF37]/20 shadow-glow-primary" />
          <div>
            <h1 className="text-sm md:text-xl font-bold tracking-widest text-[#D4AF37] uppercase font-serif whitespace-nowrap">
              GOFINTAZA <span className="text-white font-light"></span>
            </h1>
            <p className="hidden md:block text-[7px] uppercase tracking-[0.4em] text-[#D4AF37]/80 -mt-0.5">Bespoke Concierge</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors">Home</button>
          <button onClick={() => { navigate('/'); setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 100); }} className="text-gray-400 hover:text-[#D4AF37] transition-colors">Policies</button>
          <button onClick={handleBookClick} className="text-[#D4AF37] hover:text-white transition-colors">Reserve Now</button>
        </nav>

        <button
          onClick={() => navigate('/')}
          className="shrink-0 px-3 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-lg shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-all duration-300 flex items-center gap-1 whitespace-nowrap"
        >
          <ArrowLeft className="w-2.5 h-2.5 md:w-3 md:h-3" /> Back to Catalog
        </button>
      </header>

      {/* Main Details Wrapper */}
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-16 space-y-12">
        {/* Breadcrumb / Back Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-[#111111]/70 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl text-xs font-bold text-[#D4AF37] uppercase tracking-widest hover:bg-[#D4AF37]/10 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={14} /> Catalog
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard.'); }}
              className="p-3 bg-[#111111]/70 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={() => toast.success(`${car.name} added to favorites`)}
              className="p-3 bg-[#111111]/70 backdrop-blur-md border border-[#D4AF37]/20 rounded-xl text-gray-400 hover:text-rose-500 transition-colors"
            >
              <Heart size={16} />
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Area: Media Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="h-[400px] md:h-[480px] rounded-3xl overflow-hidden border border-[#D4AF37]/20 shadow-glow-primary relative bg-black group">
              <img
                src={activeImage}
                alt={car.name}
                className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] rounded-md text-[9px] font-black uppercase tracking-widest">
                {car.type} Category
              </span>
            </div>

            {/* Thumbnail Navigation */}
            <div className="grid grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[1.58/1] rounded-xl overflow-hidden border cursor-pointer bg-black transition-all ${
                    activeImage === img ? 'border-[#D4AF37] scale-95 shadow-glow-primary' : 'border-[#D4AF37]/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${car.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Overview / Tabs */}
            <div className="bg-[#111111]/80 backdrop-blur-md border border-[#D4AF37]/10 rounded-2xl p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-wider text-white border-b border-[#D4AF37]/10 pb-2 font-serif italic">
                Bespoke Specifications
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  { label: 'Seats capacity', value: specs.seats, icon: Users },
                  { label: 'Body style doors', value: specs.doors, icon: Compass },
                  { label: 'Transmission config', value: specs.transmission, icon: Zap },
                  { label: 'Power output', value: specs.horsepower, icon: Sparkles },
                  { label: 'Fuel system', value: specs.fuelType, icon: Info },
                  { label: 'Top velocity', value: car.specs.topSpeed || '200 mph', icon: Compass }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5">
                      <item.icon size={10} className="text-[#D4AF37]" /> {item.label}
                    </p>
                    <p className="text-xs font-black text-white uppercase">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-[#D4AF37]/5">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">Premium Bespoke Features Included</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-[#D4AF37]" /> Comprehensive Safety Suite
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-[#D4AF37]" /> Adaptive Luxury Ride Suspension
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-[#D4AF37]" /> Premium Concert Sound System
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-[#D4AF37]" /> 24/7 Dedicated Client Concierge
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Area: Pricing & Booking Actions Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111111]/80 backdrop-blur-md border border-[#D4AF37]/20 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase text-white font-serif">{car.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Star size={12} fill="#D4AF37" className="text-[#D4AF37]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    5.0 Star Rated (Bespoke Standard)
                  </span>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Lease Rate Options</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl p-3 text-center">
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Daily</p>
                    <p className="text-lg font-black text-[#D4AF37]">${car.price}</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl p-3 text-center">
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Weekly</p>
                    <p className="text-lg font-black text-[#D4AF37]">${weeklyRate}</p>
                  </div>
                  <div className="bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl p-3 text-center">
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest">Monthly</p>
                    <p className="text-lg font-black text-[#D4AF37]">${monthlyRate}</p>
                  </div>
                </div>
              </div>

              {/* Security & Surcharges Details */}
              <div className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-2xl p-4 space-y-3 text-xs uppercase tracking-wider font-bold">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-[9px]">Security Deposit:</span>
                  <span className="text-white">{specs.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-[9px]">Min Rental Period:</span>
                  <span className="text-white">{specs.minDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-[9px]">Delivery Logistics:</span>
                  <span className="text-white">{specs.delivery}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-[9px]">Availability status:</span>
                  <span className="text-emerald-500">In Stock</span>
                </div>
              </div>

              {/* Insurance & Protection summary */}
              <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl flex items-start gap-3">
                <Shield size={20} className="text-[#D4AF37] shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-white uppercase tracking-widest mb-0.5">Insurance Coverage Included</p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-wider leading-relaxed">
                    Lease rate includes standard liability. Deductible reduction and comprehensive protections are active upon license check.
                  </p>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handleBookClick}
                className="w-full py-4.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Reserve Selected Exotics <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Fleet Information Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-[#111111]/80 backdrop-blur-md border border-[#D4AF37]/10 rounded-2xl p-6 space-y-4"
            >
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-2">
                Fleet Information
              </h3>
              <div className="space-y-3 text-xs uppercase tracking-wider font-bold">
                <div className="flex flex-col md:flex-row md:justify-between gap-1">
                  <span className="text-gray-500 text-[9px]">Plate Number</span>
                  <span className="text-white">{car.plateNumber || 'LXR-905B'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-1">
                  <span className="text-gray-500 text-[9px]">Mileage</span>
                  <span className="text-white">{car.mileage || '12,340 Miles'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-1">
                  <span className="text-gray-500 text-[9px]">Last Service</span>
                  <span className="text-white">{car.lastServiceDate || 'May 15, 2026'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-1">
                  <span className="text-gray-500 text-[9px]">Next Service</span>
                  <span className="text-white">{car.nextServiceDate || 'Aug 15, 2026'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-1">
                  <span className="text-gray-500 text-[9px]">Registration Expiry</span>
                  <span className="text-white">{car.registrationExpiry || 'Dec 31, 2026'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between gap-1">
                  <span className="text-gray-500 text-[9px]">Insurance Expiry</span>
                  <span className="text-white">{car.insuranceExpiry || 'Jan 15, 2027'}</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-1 pt-1 border-t border-white/5">
                  <span className="text-gray-500 text-[9px]">Vehicle Status</span>
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-widest w-fit">
                    {car.vehicleStatus || 'Available'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Concierge Hotline Card */}
            <div className="bg-[#111111]/80 border border-[#D4AF37]/10 rounded-2xl p-6 text-center space-y-3">
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Private client Concierge hotline</p>
              <div className="flex justify-center gap-3">
                <a href="tel:+155598234" className="px-4 py-2 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                  Call Concierge
                </a>
                <a href="https://wa.me/155598234" className="px-4 py-2 border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-[#0A0A0A] border-t border-[#D4AF37]/10 py-12 text-center text-gray-500 text-xs">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Client Logo" className="w-10 h-10 object-contain rounded-lg border border-[#D4AF37]/10" />
            <div className="text-left">
              <h5 className="font-black tracking-widest text-[#D4AF37] uppercase font-serif">GOFINTAZA LUXURY</h5>
              <p className="text-[7px] uppercase tracking-[0.3em] text-[#D4AF37]/80">Elite Logistics Platform</p>
            </div>
          </div>

          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Lease</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Contact Concierge</a>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-widest font-semibold border-t border-[#D4AF37]/5 pt-6 text-gray-600">
          © {new Date().getFullYear()} GoFintaza Luxury Rentals. All Telemetry Secured.
        </p>
      </footer>

      {/* Booking Wizard Popup */}
      <AnimatePresence>
        {isBookingOpen && (
          <LuxuryBookingWizard
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            initialCarName={car.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarDetailsPage;
