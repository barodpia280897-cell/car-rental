// src/pages/dashboards/CustomerDashboard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Star, MapPin, Zap, 
  ChevronRight, Calendar, Heart, 
  ShieldCheck, CreditCard, Clock,
  ArrowRight, Compass, Award,
  Trophy, TrendingUp, CheckCircle2, MessageSquare
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { vehicles } = useSelector(state => state.fleet);
  const { bookings } = useSelector(state => state.booking);
  
  const [searchLocation, setSearchLocation] = React.useState('Beverly Hills Hub');
  const [pickupDate, setPickupDate] = React.useState('');
  const [returnDate, setReturnDate] = React.useState('');

  const recommendedCars = vehicles.slice(0, 3);
  
  // Calculate specific Customer Dashboard Metrics
  const activeBooking = bookings.find(b => b.status === 'Active');
  const upcomingRental = bookings.find(b => b.status === 'Confirmed' || b.status === 'Pending' || b.status === 'Pending Approval');
  const totalRentals = bookings.length;
  const paymentStatus = bookings.length > 0 ? bookings[0].paymentStatus : 'N/A';

  const handleSearch = () => {
    navigate('/fleet'); // redirect to fleet listing
  };

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO BOOKING SEARCH */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[500px] rounded-[3rem] overflow-hidden group shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
      >
        <img 
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1600" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3s] opacity-70"
          alt="Luxury Car"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E17]/60 via-transparent to-[#0A0E17]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E17]/90 via-transparent to-transparent"></div>
        
        <div className="absolute inset-0 flex flex-col justify-center p-12 lg:p-20 space-y-8">
          <div className="space-y-4 max-w-3xl">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
               <div className="h-1 w-12 bg-primary rounded-full shadow-glow-primary"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">AERO-DRIVE PREMIER ACCESS</span>
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] italic">
               THE ART OF <br />
               <span className="text-primary not-italic">VELOCITY.</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base font-medium max-w-lg leading-relaxed">
               Bespoke automotive experiences curated for the world's most discerning drivers.
            </p>
          </div>

          {/* Booking Search Box */}
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass-panel !p-2 rounded-[2rem] border-white/10 flex flex-col lg:flex-row items-center gap-2 max-w-5xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-3xl"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 w-full">
              <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors rounded-2xl cursor-pointer group">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                   <MapPin size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Pickup Location</p>
                   <select 
                     value={searchLocation}
                     onChange={(e) => setSearchLocation(e.target.value)}
                     className="bg-transparent text-sm font-bold text-white focus:outline-none w-full cursor-pointer appearance-none"
                   >
                      <option className="bg-[#0A0E17]">Beverly Hills Hub</option>
                      <option className="bg-[#0A0E17]">Downtown Executive</option>
                      <option className="bg-[#0A0E17]">North Port Sky Station</option>
                   </select>
                </div>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border-y md:border-y-0 md:border-x border-white/5 rounded-2xl cursor-pointer">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                   <Calendar size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Pickup Date</p>
                   <input 
                     type="date" 
                     value={pickupDate}
                     onChange={(e) => setPickupDate(e.target.value)}
                     className="bg-transparent text-sm font-bold text-white focus:outline-none w-full cursor-pointer [color-scheme:dark]"
                   />
                </div>
              </div>
              <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors rounded-2xl cursor-pointer">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                   <Clock size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Return Date</p>
                   <input 
                     type="date" 
                     value={returnDate}
                     onChange={(e) => setReturnDate(e.target.value)}
                     className="bg-transparent text-sm font-bold text-white focus:outline-none w-full cursor-pointer [color-scheme:dark]"
                   />
                </div>
              </div>
            </div>
            <button 
              onClick={handleSearch}
              className="w-full lg:w-auto px-10 py-5 bg-primary text-[#0A0E17] font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-105 transition-all text-xs italic flex items-center justify-center gap-3"
            >
               Search Vehicles <ArrowRight size={18} strokeWidth={3} />
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. CUSTOMER METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2">
        {/* Card 1: Active Booking */}
        <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
            <Zap size={40} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Booking</p>
          {activeBooking ? (
            <div className="space-y-2">
              <h4 className="text-xl font-black text-white uppercase truncate">{activeBooking.vehicleName}</h4>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">ID: {activeBooking.id}</p>
              <div className="px-2 py-0.5 bg-accent/20 border border-accent/30 text-accent rounded text-[8px] font-black uppercase tracking-wider w-fit">
                {activeBooking.status}
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest pt-2">No Active Rental</p>
          )}
        </div>

        {/* Card 2: Upcoming Rental */}
        <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
            <Calendar size={40} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Upcoming Rental</p>
          {upcomingRental ? (
            <div className="space-y-2">
              <h4 className="text-xl font-black text-white uppercase truncate">{upcomingRental.vehicleName}</h4>
              <p className="text-[9px] text-primary font-black uppercase tracking-wide">Starts: {upcomingRental.startDate}</p>
              <div className="px-2 py-0.5 bg-primary/20 border border-primary/30 text-primary rounded text-[8px] font-black uppercase tracking-wider w-fit">
                {upcomingRental.status}
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest pt-2">No Upcoming Trips</p>
          )}
        </div>

        {/* Card 3: Total Rentals */}
        <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
            <Trophy size={40} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Rentals</p>
          <h3 className="text-3xl font-black text-white tracking-tighter pt-2">{totalRentals}</h3>
          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-1">Completed Journeys</p>
        </div>

        {/* Card 4: Payment Status */}
        <div className="glass-panel p-6 border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-primary">
            <CreditCard size={40} />
          </div>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Payment Status</p>
          <h3 className={`text-2xl font-black uppercase pt-2 ${paymentStatus === 'Paid' ? 'text-accent' : 'text-highlight'}`}>
            {paymentStatus}
          </h3>
          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mt-1">Last Transaction Status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-2">
        {/* Left Column: Recent Activity & Recommended Catalog */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* 3. RECENT BOOKING ACTIVITY */}
          <section className="glass-panel p-8 border-white/5 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Recent Booking Activity</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Transaction Ledger & Status Sync</p>
              </div>
              <button 
                onClick={() => navigate('/bookings')}
                className="text-primary hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group"
              >
                View History <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-4">
              {bookings.map((booking, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer" onClick={() => navigate('/bookings')}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#161B26] to-[#0A0E17] border border-white/10 flex items-center justify-center text-primary">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">{booking.vehicleName}</h4>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                        ID: {booking.id} • Dates: {booking.startDate} to {booking.endDate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-6">
                    <div>
                      <p className="text-xs font-black text-white">${booking.totalPrice}</p>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${booking.status === 'Confirmed' || booking.status === 'Active' ? 'text-accent' : 'text-gray-500'}`}>
                        {booking.status}
                      </p>
                    </div>
                    {booking.status === 'Pending' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/contract/${booking.id}`);
                        }}
                        className="px-3 py-1.5 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[8px] rounded-lg hover:bg-white"
                      >
                        Sign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. RECOMMENDED CARS */}
          <section className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight uppercase italic">Curated <span className="text-primary">Selection</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Recommended for your driving profile</p>
              </div>
              <button onClick={() => navigate('/fleet')} className="text-primary font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors flex items-center gap-2 group">
                 Explore All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendedCars.map((car) => (
                <motion.div 
                  key={car.id}
                  whileHover={{ y: -10 }}
                  className="glass-panel !p-0 border-white/5 overflow-hidden group cursor-pointer"
                  onClick={() => navigate(`/vehicle/${car.id}`)}
                >
                  <div className="relative h-48">
                    <img src={car.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={car.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161B26] via-transparent to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <button className="p-2.5 rounded-xl bg-[#0A0E17]/60 backdrop-blur-md text-white hover:text-danger transition-colors">
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-lg font-black text-white tracking-tight">{car.name}</h4>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{car.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white tracking-tighter">${car.price}</p>
                        <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">/ day</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Loyalty Tier & Support */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* LOYALTY BENEFITS */}
          <div className="glass-panel p-8 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl -z-10"></div>
             <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary shadow-glow-primary">
                   <Award size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Platinum Tier</h3>
                   <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Elite Member Since 2024</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span>Tier Progress</span>
                      <span className="text-primary">850 / 1000 PTS</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        className="h-full bg-primary shadow-glow-primary"
                      ></motion.div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   {[
                     { icon: Trophy, label: 'Priority Delivery', desc: 'Cars delivered to your door' },
                     { icon: TrendingUp, label: 'Free Upgrades', desc: 'On all executive class bookings' },
                     { icon: Zap, label: 'Zero Deposit', desc: 'No holding fee for platinum' }
                   ].map((benefit, i) => (
                     <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-primary/10 transition-colors flex items-start gap-4 group">
                        <benefit.icon size={18} className="text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                           <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{benefit.label}</p>
                           <p className="text-[9px] text-gray-500 font-medium">{benefit.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Support Quick Access */}
          <div className="glass-panel p-8 border-white/5 bg-[#0A0E17] group cursor-pointer hover:border-primary/30 transition-all">
             <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">24/7 Concierge</h3>
                   <p className="text-[10px] text-gray-500 font-bold">Priority support for Elite members</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary group-hover:text-[#0A0E17] transition-all">
                   <MessageSquare size={18} />
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
