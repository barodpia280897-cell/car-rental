// src/pages/LandingPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../store/fleetSlice';
import {
  Car, Shield, Clock, MapPin,
  ArrowRight, Phone, Mail, Award,
  Sparkles, Calendar, User, CheckCircle, X,
  FileText, MessageSquare, Info, ShieldCheck, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import logo from '../assets/carlogo.jpg';
import { motion, AnimatePresence } from 'framer-motion';
import LuxuryBookingWizard from '../components/booking/LuxuryBookingWizard';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuredSectionRef = useRef(null);
  const bookingSectionRef = useRef(null);
  const conciergeSectionRef = useRef(null);

  // Search & Filter State
  const [searchLocation, setSearchLocation] = useState('Beverly Hills Hub');
  const [searchPickupDate, setSearchPickupDate] = useState('');
  const [searchReturnDate, setSearchReturnDate] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const dispatch = useDispatch();
  const { vehicles: initialCars, loading } = useSelector((state) => state.fleet);
  
  const [filteredCars, setFilteredCars] = useState([]);

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  useEffect(() => {
    setFilteredCars(initialCars);
  }, [initialCars]);

  // Booking Wizard Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedCarName, setPreselectedCarName] = useState('');

  // Vehicle Details Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailCar, setDetailCar] = useState(null);
  const [activeDetailImage, setActiveDetailImage] = useState('');

  // Trust Policies Modal State
  const [activePolicy, setActivePolicy] = useState(null);

  // Scroll function
  const scrollToSection = (elementRef) => {
    if (elementRef && elementRef.current) {
      window.scrollTo({
        top: elementRef.current.offsetTop - 80,
        behavior: 'smooth',
      });
    }
  };

  // Availability Search Action
  const handleCheckAvailability = (e) => {
    e.preventDefault();
    setIsSearchActive(true);
    
    // Filter cars based on category
    let results = initialCars;
    if (searchCategory) {
      results = initialCars.filter(car => car.type.toLowerCase() === searchCategory.toLowerCase());
    }
    setFilteredCars(results);

    toast.success(`Search completed. Found ${results.length} available exotics!`, {
      style: { background: '#111', color: '#D4AF37', border: '1px solid #D4AF37' }
    });

    // Scroll to catalog section to show results
    scrollToSection(featuredSectionRef);
  };

  // Clear filters
  const handleResetSearch = () => {
    setIsSearchActive(false);
    setSearchCategory('');
    setSearchPickupDate('');
    setSearchReturnDate('');
    setFilteredCars(initialCars);
  };

  const handleSelectCar = (carName) => {
    setPreselectedCarName(carName);
    setIsBookingModalOpen(true);
  };

  const handleOpenDetails = (car) => {
    setDetailCar(car);
    setActiveDetailImage(car.image);
    setIsDetailModalOpen(true);
  };

  // Spec helper for details modal
  const getCarSpecs = (carObj) => {
    if (!carObj) return {};
    const name = carObj.name.toLowerCase();
    let specs = {
      seats: '4 Seats',
      doors: '2 Doors',
      transmission: 'Automatic',
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37]/30 selection:text-white font-sans antialiased overflow-x-hidden">
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
          <button onClick={() => scrollToSection(featuredSectionRef)} className="text-gray-400 hover:text-[#D4AF37] transition-colors">Catalog</button>
          <button onClick={() => scrollToSection(conciergeSectionRef)} className="text-gray-400 hover:text-[#D4AF37] transition-colors">Concierge</button>
          <button onClick={() => { setPreselectedCarName(''); setIsBookingModalOpen(true); }} className="text-gray-400 hover:text-[#D4AF37] transition-colors">Reserve Now</button>
        </nav>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            onClick={() => navigate('/login')}
            className="px-3 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-lg shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            Sign In
          </button>
          <button
            onClick={() => { setPreselectedCarName(''); setIsBookingModalOpen(true); }}
            className="px-3 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-lg shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:scale-105 transition-all duration-300 whitespace-nowrap"
          >
            Reserve Vehicle
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 overflow-hidden">
        {/* Ambient Overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.06)_0%,transparent_70%)] z-0 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A]/40 to-[#0A0A0A]" />

        {/* Digital grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-60 z-0" />

        {/* Background Image Placeholder */}
        <div className="absolute inset-0 -z-10 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1600&auto=format&fit=crop"
            alt="Luxury vehicle background"
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 z-10 flex flex-col items-center w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative w-full max-w-4xl bg-[#111111]/70 backdrop-blur-md border border-[#D4AF37]/20 rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-[0_10px_50px_rgba(0,0,0,0.8)] overflow-hidden group hover:border-[#D4AF37]/35 transition-colors duration-500"
          >
            {/* Ambient gold glows */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.25em]">
              <Sparkles size={12} className="animate-spin-slow" /> Curated Mobility Experience
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white font-serif italic uppercase">
              Luxury Car Rentals <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11]">
                Delivered To You
              </span>
            </h2>

            <p className="max-w-xl mx-auto text-gray-400 text-xs md:text-sm leading-relaxed tracking-wide font-medium">
              Experience the pinnacle of elite transport. We provide tailored executive delivery right to your terminal, estate, or suite. Fully insured, meticulously detailed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => scrollToSection(featuredSectionRef)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:scale-[1.03] transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Browse Catalog <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
              <button
                onClick={() => { setPreselectedCarName(''); setIsBookingModalOpen(true); }}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all duration-300"
              >
                Reserve Now
              </button>
            </div>

            {/* Badges */}
            <div className="absolute -left-6 top-8 hidden lg:flex items-center gap-3 bg-[#111111]/90 backdrop-blur-md border border-[#D4AF37]/35 px-4 py-3 rounded-2xl shadow-lg hover:border-[#D4AF37] transition-all">
              <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]"><Award size={18} /></div>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">VIP Status</p>
                <p className="text-[10px] font-black text-white uppercase tracking-tight">5.0 Star Concierge</p>
              </div>
            </div>

            <div className="absolute -right-6 bottom-8 hidden lg:flex items-center gap-3 bg-[#111111]/90 backdrop-blur-md border border-[#D4AF37]/35 px-4 py-3 rounded-2xl shadow-lg hover:border-[#D4AF37] transition-all">
              <div className="p-2 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]"><Car size={18} /></div>
              <div className="text-left">
                <p className="text-[8px] uppercase tracking-widest text-gray-500 font-bold">Live Catalog</p>
                <p className="text-[10px] font-black text-white uppercase tracking-tight">9 Luxury Exotics</p>
              </div>
            </div>
          </motion.div>

          {/* Section 1: Availability Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="w-full max-w-4xl bg-[#111111]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-5 md:p-6 shadow-2xl text-left"
          >
            <form onSubmit={handleCheckAvailability} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <MapPin size={10} /> Pickup Location
                </label>
                <select
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="Beverly Hills Hub">Beverly Hills Hub</option>
                  <option value="Downtown Executive">Downtown Executive</option>
                  <option value="North Port Sky Station">North Port Sky Station</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <Calendar size={10} /> Pickup Date
                </label>
                <input
                  type="date"
                  value={searchPickupDate}
                  onChange={e => setSearchPickupDate(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <Calendar size={10} /> Return Date
                </label>
                <input
                  type="date"
                  value={searchReturnDate}
                  onChange={e => setSearchReturnDate(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-2.5 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
                  <Car size={10} /> Vehicle Category
                </label>
                <select
                  value={searchCategory}
                  onChange={e => setSearchCategory(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#D4AF37]/15 rounded-xl py-3 px-3 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="">All Categories</option>
                  <option value="Electric">Electric</option>
                  <option value="Sport">Sport</option>
                  <option value="SUV">SUV</option>
                  <option value="Convertible">Convertible</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl hover:scale-[1.02] shadow-[0_4px_15px_rgba(212,175,55,0.2)] transition-all flex items-center justify-center gap-1.5 italic"
              >
                Check Availability
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section ref={featuredSectionRef} className="py-24 bg-[#111111] relative border-y border-[#D4AF37]/10">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div className="h-1 w-16 bg-[#D4AF37] mx-auto rounded-full" />
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-serif">
              {isSearchActive ? 'Available ' : 'Featured '}
              <span className="text-[#D4AF37] font-serif not-italic">Exotics</span>
            </h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Pristine Condition • Real-Time Availability</p>
              {isSearchActive && (
                <button
                  onClick={handleResetSearch}
                  className="px-2.5 py-1 bg-white/5 border border-white/10 hover:border-[#D4AF37] text-gray-400 hover:text-white rounded-md text-[8px] font-black uppercase tracking-widest transition-all"
                >
                  Reset Search Filter
                </button>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-2xl overflow-hidden shadow-2xl hover:border-[#D4AF37]/40 hover:shadow-glow-primary transition-all duration-500 group flex flex-col h-full"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-md text-[9px] font-black uppercase tracking-widest">
                    {car.type}
                  </span>
                  
                  <span className={`absolute top-4 right-4 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-md border ${
                    car.name.includes('GT3')
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : car.id % 4 === 1
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : car.id % 4 === 2
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : car.id % 4 === 3
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                  }`}>
                    {car.name.includes('GT3') ? 'Next Available: June 15' : 
                     car.id % 4 === 1 ? 'Available Today' : 
                     car.id % 4 === 2 ? 'Available Tomorrow' : 
                     car.id % 4 === 3 ? 'Reserved' : 'Maintenance'}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight text-white font-serif">{car.name}</h4>
                      <p className="text-[9px] text-[#D4AF37] uppercase font-bold tracking-widest mt-0.5">{car.color}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-[#D4AF37]">${car.price}</p>
                      <p className="text-[8px] text-gray-500 uppercase tracking-wider font-semibold">/ Day</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-[#D4AF37]/10 text-gray-400 font-medium">
                    <div>Range: <span className="text-white font-bold">{car.specs.range}</span></div>
                    <div>Top Speed: <span className="text-white font-bold">{car.specs.topSpeed}</span></div>
                  </div>

                  {/* Section 2: Cards with View Details & Book Now Actions */}
                  <div className="flex gap-3 pt-2 mt-auto">
                    <button
                      onClick={() => handleOpenDetails(car)}
                      className="w-full py-3 bg-transparent border border-[#D4AF37]/30 text-white font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleSelectCar(car.name)}
                      className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[9px] rounded-lg shadow-lg hover:bg-white hover:text-black transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Bespoke Process Section Upgrade (8 steps) */}
      <section className="py-24 bg-[#0A0A0A] relative">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-serif">
              Bespoke <span className="text-[#D4AF37] font-serif not-italic">Process</span>
            </h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Seamless Eight-Step Luxury Delivery</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { step: '01', title: 'Browse Fleet', desc: 'Sift through our tailored showroom exotics.' },
              { step: '02', title: 'Select Vehicle', desc: 'Identify the model suited for your lease.' },
              { step: '03', title: 'Enter Dates', desc: 'Schedule pickup & return times.' },
              { step: '04', title: 'Upload License', desc: 'Secure digital credential approvals.' },
              { step: '05', title: 'Sign Agreement', desc: 'Sign the legal digital lease compact.' },
              { step: '06', title: 'Make Payment', desc: 'Settle deposit fees securely.' },
              { step: '07', title: 'Delivery Scheduled', desc: 'Drop-off timeline coordinated by VIP concierge.' },
              { step: '08', title: 'Vehicle Delivered', desc: 'Exotics dropped right to your doorstep.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.05, border: '1px solid #D4AF37' }}
                className="bg-[#111111] border border-[#D4AF37]/10 p-5 rounded-2xl text-center space-y-3 relative group transition-all duration-300"
              >
                <span className="text-xl font-black text-[#D4AF37]/20 group-hover:text-[#D4AF37]/60 transition-colors font-serif">{item.step}</span>
                <h4 className="text-[10px] font-black uppercase tracking-wider text-white font-serif">{item.title}</h4>
                <p className="text-[9px] text-gray-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-[#111111] relative border-y border-[#D4AF37]/10">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-serif">
              Why <span className="text-[#D4AF37] font-serif not-italic">Choose Us</span>
            </h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Unparalleled Luxury Standards</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: 'Free Delivery', desc: 'Complimentary delivery right to your private hub or suite.' },
              { icon: Award, title: 'Luxury Fleet', desc: 'The newest exotics, hand-polished and detailed for perfection.' },
              { icon: Shield, title: 'Fully Insured', desc: 'Comprehensive coverage plan options to drive with peace of mind.' },
              { icon: Clock, title: '24/7 Support', desc: 'Private concierge specialists available at any hour.' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="space-y-4 text-center group transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] mx-auto group-hover:shadow-glow-primary transition-all">
                  <item.icon size={24} />
                </div>
                <h4 className="text-sm font-black uppercase tracking-widest text-white font-serif">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA Section - Section 7: Improved Buttons */}
      <section className="py-24 bg-[#0A0A0A] relative overflow-hidden border-t border-[#D4AF37]/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.03)_0%,transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="bg-[#111111] border border-[#D4AF37]/20 rounded-3xl p-10 md:p-16 text-center space-y-8 shadow-2xl relative overflow-hidden group hover:border-[#D4AF37]/40 transition-all duration-500">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] mx-auto shadow-glow-primary mb-2">
              <Sparkles size={28} className="animate-pulse" />
            </div>

            <div className="space-y-4">
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-serif text-white leading-none">
                Experience the <span className="text-[#D4AF37]">Extraordinary</span>
              </h3>
              <p className="max-w-xl mx-auto text-gray-400 text-xs md:text-sm leading-relaxed tracking-wide font-medium">
                Reserve your bespoke luxury vehicle today. Our VIP client concierge will handle everything from secure scheduling to terminal/doorstep delivery.
              </p>
            </div>

            {/* Section 7 - Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={() => { setPreselectedCarName(''); setIsBookingModalOpen(true); }}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl shadow-[0_4px_25px_rgba(212,175,55,0.35)] hover:scale-105 transition-all duration-300"
              >
                Reserve Vehicle
              </button>
              <button
                onClick={() => scrollToSection(featuredSectionRef)}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/20 text-white hover:bg-white/5 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all duration-300"
              >
                Browse Fleet
              </button>
              <button
                onClick={() => scrollToSection(conciergeSectionRef)}
                className="w-full sm:w-auto px-8 py-4 bg-transparent border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 font-black uppercase tracking-widest text-[9px] rounded-xl transition-all duration-300"
              >
                Contact Concierge
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Rental Trust & Legal policies Section */}
      <section className="py-24 bg-[#111111] relative border-t border-[#D4AF37]/10">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-4"
          >
            <div className="h-1 w-16 bg-[#D4AF37] mx-auto rounded-full" />
            <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight font-serif text-white">
              Rental <span className="text-[#D4AF37] font-serif not-italic">Policies</span>
            </h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Transparency and Client Safety Assurances</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { id: 'agreement', title: 'Rental Agreement', desc: 'Full lease terms & conditions of exotic vehicle hires.' },
              { id: 'insurance', title: 'Insurance Policy', desc: 'Comprehensive coverage details, waivers & security deposits.' },
              { id: 'cancellation', title: 'Cancellation Policy', desc: 'Window periods, concierge reservation holds, & refund structures.' },
              { id: 'damage', title: 'Damage Protection', desc: 'Liability limitations, telemetry monitor regulations, & deductibles.' },
              { id: 'faq', title: 'FAQ Hub', desc: 'Quick reference regarding delivery logistics, fuels, & certifications.' }
            ].map((policy, idx) => (
              <motion.div
                key={idx}
                onClick={() => setActivePolicy(policy.id)}
                className="bg-[#0A0A0A] border border-[#D4AF37]/15 p-6 rounded-2xl hover:border-[#D4AF37] cursor-pointer hover:shadow-glow-primary transition-all duration-300 space-y-3 group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="p-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] w-fit">
                    <FileText size={18} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white group-hover:text-[#D4AF37] transition-colors">{policy.title}</h4>
                  <p className="text-[9px] text-gray-500 leading-relaxed font-semibold">{policy.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#D4AF37] pt-2">
                  Read Policy <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 (Concierge Assistance Buttons) */}
      <section ref={conciergeSectionRef} className="py-16 bg-[#0A0A0A] border-t border-[#D4AF37]/10 relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Private Client Concierge</p>
          <h3 className="text-2xl font-black uppercase tracking-tight text-white font-serif italic">Need Assistance?</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto uppercase tracking-wide font-semibold">
            Our luxury lease coordinates are available to arrange custom dates, customized routes, or private terminal deliveries.
          </p>

          <div className="text-xs text-gray-500 uppercase tracking-widest space-y-1.5 pt-2 font-bold">
            <p>Phone: <span className="text-white font-black">(555) 123-4567</span></p>
            <p>Email: <a href="mailto:concierge@gofintaza.com" className="text-[#D4AF37] hover:underline font-black">concierge@gofintaza.com</a></p>
            <p>Hours: <span className="text-white font-black">Mon-Sun | 24/7 Luxury Support</span></p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="tel:+15550192"
              className="px-6 py-3.5 bg-transparent border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              <Phone size={14} /> Call Us
            </a>
            <a
              href="sms:+15550192"
              className="px-6 py-3.5 bg-transparent border border-white/10 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              <Mail size={14} /> Text Us
            </a>
            <a
              href="https://wa.me/15550192"
              className="px-6 py-3.5 bg-transparent border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              <MessageSquare size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

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
        {isBookingModalOpen && (
          <LuxuryBookingWizard
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            initialCarName={preselectedCarName}
            initialDates={{
              pickupDate: searchPickupDate,
              returnDate: searchReturnDate,
              pickupLocation: searchLocation
            }}
          />
        )}
      </AnimatePresence>

      {/* SECTION 3: VEHICLE DETAILS MODAL */}
      <AnimatePresence>
        {isDetailModalOpen && detailCar && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailModalOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-3xl bg-[#111111] border border-[#D4AF37]/25 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center bg-[#0A0A0A]/50">
                <div className="flex items-center gap-3">
                  <Car className="text-[#D4AF37]" size={20} />
                  <h3 className="text-lg font-black uppercase text-white font-serif">{detailCar.name} Specifications</h3>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar bg-[#0C0C0C]">
                {/* Gallery component */}
                <div className="space-y-4">
                  <div className="h-64 rounded-2xl overflow-hidden border border-[#D4AF37]/15 relative bg-black">
                    <img src={activeDetailImage} className="w-full h-full object-cover" alt="Main View" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      detailCar.image,
                      'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=400&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=400&auto=format&fit=crop',
                      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop'
                    ].map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveDetailImage(img)}
                        className={`aspect-[1.58/1] rounded-lg overflow-hidden border cursor-pointer ${
                          activeDetailImage === img ? 'border-[#D4AF37]' : 'border-white/5'
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info and Spec Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Info */}
                  <div className="space-y-4 bg-[#141414] border border-[#D4AF37]/10 p-5 rounded-2xl">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Bespoke Rates</h5>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Daily</p>
                        <p className="font-bold text-[#D4AF37]">${detailCar.price}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Weekly</p>
                        <p className="font-bold text-white">${Math.round(detailCar.price * 7 * 0.88)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase font-black">Monthly</p>
                        <p className="font-bold text-white">${Math.round(detailCar.price * 30 * 0.75)}</p>
                      </div>
                    </div>

                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1 pt-2">Included Benefits</h5>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2"><CheckCircle size={10} className="text-[#D4AF37]" /> Free Delivery Included</div>
                      <div className="flex items-center gap-2"><CheckCircle size={10} className="text-[#D4AF37]" /> Fully Insured Lease Coverages</div>
                      <div className="flex items-center gap-2"><CheckCircle size={10} className="text-[#D4AF37]" /> 24/7 Dedicated Client Hotline</div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="space-y-4 bg-[#141414] border border-[#D4AF37]/10 p-5 rounded-2xl">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Spec Sheets</h5>
                    <div className="grid grid-cols-2 gap-3 text-xs uppercase tracking-wider">
                      <div>
                        <p className="text-[8px] text-gray-500 font-bold">Seats capacity</p>
                        <p className="text-white font-bold">{getCarSpecs(detailCar).seats}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-bold">Body doors</p>
                        <p className="text-white font-bold">{getCarSpecs(detailCar).doors}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-bold">Transmission</p>
                        <p className="text-white font-bold">{getCarSpecs(detailCar).transmission}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-bold">Fuel category</p>
                        <p className="text-white font-bold">{getCarSpecs(detailCar).fuelType}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-bold">Engine output</p>
                        <p className="text-white font-bold">{getCarSpecs(detailCar).horsepower}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 font-bold">Top Speed</p>
                        <p className="text-white font-bold">{detailCar.specs.topSpeed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rental Information */}
                <div className="p-4 bg-[#0A0A0A] border border-[#D4AF37]/10 rounded-2xl grid grid-cols-3 gap-4 text-center text-xs">
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Security Deposit</p>
                    <p className="text-white font-bold">{getCarSpecs(detailCar).deposit}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Minimum Lease Days</p>
                    <p className="text-white font-bold">{getCarSpecs(detailCar).minDays} Days</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase tracking-widest font-black">Delivery Location</p>
                    <p className="text-white font-bold">{getCarSpecs(detailCar).delivery}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t border-[#D4AF37]/10 bg-[#0A0A0A]/50 flex justify-between items-center gap-4">
                <button
                  onClick={() => { setIsDetailModalOpen(false); navigate(`/car/${detailCar.id}`); }}
                  className="flex-1 py-3.5 bg-transparent border border-white/20 hover:border-[#D4AF37] text-white hover:text-[#D4AF37] font-black uppercase tracking-widest text-[9px] rounded-xl transition-all"
                >
                  View Full Details Page
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleSelectCar(detailCar.name);
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase tracking-widest text-[9px] rounded-xl shadow-md hover:scale-[1.01] transition-all"
                >
                  Reserve Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POLICY MODALS */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/90">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#111111] border border-[#D4AF37]/30 rounded-2xl p-6 space-y-4 shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-[#D4AF37]/10 pb-2">
                <h5 className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                  {activePolicy === 'agreement' && 'Rental Agreement Policy'}
                  {activePolicy === 'insurance' && 'Insurance Coverage Policy'}
                  {activePolicy === 'cancellation' && 'Reservation Cancellation Policy'}
                  {activePolicy === 'damage' && 'Damage Protection Policy'}
                  {activePolicy === 'faq' && 'Faq Hub Policy'}
                </h5>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="p-1 bg-white/5 rounded-md text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="text-gray-400 text-[10px] uppercase tracking-wider font-semibold leading-relaxed space-y-3">
                {activePolicy === 'agreement' && (
                  <>
                    <p>1. Hires are pre-scheduled. The lessee must present valid driver licenses and original matching credit credentials during delivery.</p>
                    <p>2. Mileage limits are configured at 150 miles per cycle. Excess mileage yields a surcharge of $2.50 per mile.</p>
                  </>
                )}
                {activePolicy === 'insurance' && (
                  <>
                    <p>1. Basic liability covers third-party damage. Comprehensive coverage options reduce collision deductibles down to $500.</p>
                    <p>2. Security deposits of $1,000 to $5,000 are placed on reservation hold. Deposits are released immediately upon vehicle clearance.</p>
                  </>
                )}
                {activePolicy === 'cancellation' && (
                  <>
                    <p>1. Cancellations made more than 48 hours prior to delivery qualify for a full deposit refund.</p>
                    <p>2. Cancellations inside 48 hours receive a 50% reservation hold credit valid for future leases.</p>
                  </>
                )}
                {activePolicy === 'damage' && (
                  <>
                    <p>1. GPS telemetry tracking monitors vehicle velocity and cornering metrics. Reckless operation results in immediate lease termination.</p>
                    <p>2. All cosmetic body scratches, rim abrasions, or interior spill details are documented and deducted from deposits.</p>
                  </>
                )}
                {activePolicy === 'faq' && (
                  <>
                    <p>Q: Do you deliver directly to airports?</p>
                    <p>A: Yes, our coordinates cover direct terminal drop-offs at LAX, private jet hubs, and local hotels.</p>
                    <p>Q: What fuel grade is required?</p>
                    <p>A: All gasoline engines require 91 Octane premium gasoline. Receipts must be shown during collection.</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setActivePolicy(null)}
                className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[9px] rounded-lg shadow-md transition-all hover:scale-[1.01]"
              >
                Close Policy
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
