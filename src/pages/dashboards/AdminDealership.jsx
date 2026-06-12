// src/pages/dashboards/AdminDealership.jsx
import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, Tag, Search, Filter, Plus, ChevronRight, 
  Info, ShieldCheck, Zap, DollarSign, BarChart3,
  Edit, Trash2, MoreHorizontal, Eye, X, Check, CheckSquare,
  FileText, Calendar, Shield, MapPin, Settings, HelpCircle, Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDealership = () => {
  const { 
    vehicles, bookings, addVehicle, editVehicle, deleteVehicle, updateVehicleStatus 
  } = useAdminState();

  const [activeTab, setActiveTab] = useState('All Cars');
  const [search, setSearch] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [modalTab, setModalTab] = useState('Overview');
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [carToEdit, setCarToEdit] = useState(null);

  // Expanded Form States matching requested vehicle model
  const [formData, setFormData] = useState({
    name: '',
    make: '',
    model: '',
    year: '2024',
    vinNumber: '',
    licensePlate: '',
    mileage: '',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: '4',
    color: '',
    dailyRate: '',
    weeklyRate: '',
    monthlyRate: '',
    insuranceExpiry: '2027-06-30',
    registrationExpiry: '2027-12-31',
    currentLocation: 'Beverly Hills Hub',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'
  });

  const filteredInventory = vehicles.filter(car => {
    const term = search.toLowerCase();
    const matchesSearch = 
      (car.name || '').toLowerCase().includes(term) || 
      (car.id || '').toString().includes(term) ||
      (car.make || '').toLowerCase().includes(term) ||
      (car.model || '').toLowerCase().includes(term);
    
    if (activeTab === 'Available' && car.status !== 'Available') return false;
    if (activeTab === 'Active' && car.status !== 'Active Rental') return false;
    if (activeTab === 'Service' && car.status !== 'Maintenance') return false;
    
    return matchesSearch;
  });

  const handleAddCar = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dailyRate) {
      toast.error('Vehicle Name and Daily Rate are required.');
      return;
    }
    const newId = Date.now();
    const newCar = {
      id: newId,
      name: formData.name,
      make: formData.make || formData.name.split(' ')[0],
      model: formData.model || formData.name.split(' ').slice(1).join(' '),
      year: formData.year,
      vinNumber: formData.vinNumber || `1FVHC8D5${newId}2093`,
      licensePlate: formData.licensePlate || `LXR-${Math.floor(100 + Math.random() * 900)}B`,
      mileage: formData.mileage ? `${formData.mileage} mi` : '0 mi',
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      seats: formData.seats,
      color: formData.color || 'Obsidian Black',
      price: parseFloat(formData.dailyRate), // standard daily rate mapper
      dailyRate: parseFloat(formData.dailyRate),
      weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : parseFloat(formData.dailyRate) * 6,
      monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : parseFloat(formData.dailyRate) * 22,
      insuranceExpiry: formData.insuranceExpiry,
      registrationExpiry: formData.registrationExpiry,
      currentLocation: formData.currentLocation,
      status: formData.status,
      image: formData.image || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
      fuel: '100%',
      nextService: 'Dec 2026',
      revenue: '$0',
      trips: 0,
      documents: {
        insurance: `/docs/insurance_${newId}.pdf`,
        registration: `/docs/reg_${newId}.pdf`,
        inspectionReports: [
          { date: new Date().toISOString().split('T')[0], result: 'Passed', inspector: 'Executive Audit' }
        ],
        maintenanceRecords: []
      },
      specs: {
        zeroToSixty: '3.5s',
        topSpeed: '150 mph',
        range: '300 mi',
        drivetrain: 'AWD'
      }
    };

    addVehicle(newCar);
    toast.success('Luxury vehicle asset registered in fleet!');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditCar = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dailyRate) {
      toast.error('Vehicle Name and Daily Rate are required.');
      return;
    }
    const updated = {
      id: carToEdit.id,
      name: formData.name,
      make: formData.make,
      model: formData.model,
      year: formData.year,
      vinNumber: formData.vinNumber,
      licensePlate: formData.licensePlate,
      mileage: formData.mileage.includes('mi') ? formData.mileage : `${formData.mileage} mi`,
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      seats: formData.seats,
      color: formData.color,
      price: parseFloat(formData.dailyRate),
      dailyRate: parseFloat(formData.dailyRate),
      weeklyRate: parseFloat(formData.weeklyRate),
      monthlyRate: parseFloat(formData.monthlyRate),
      insuranceExpiry: formData.insuranceExpiry,
      registrationExpiry: formData.registrationExpiry,
      currentLocation: formData.currentLocation,
      status: formData.status,
      image: formData.image
    };

    editVehicle(updated);
    toast.success('Vehicle metrics committed.');
    setShowEditModal(false);
    setCarToEdit(null);
    resetForm();
  };

  const handleDeleteCar = (id) => {
    if (window.confirm('Are you sure you want to permanently decommission this vehicle asset?')) {
      deleteVehicle(id);
      toast.success('Vehicle asset decommissioned from luxury fleet.');
    }
  };

  const startEdit = (car) => {
    setCarToEdit(car);
    setFormData({
      name: car.name || '',
      make: car.make || '',
      model: car.model || '',
      year: car.year || '2024',
      vinNumber: car.vinNumber || '',
      licensePlate: car.licensePlate || '',
      mileage: (car.mileage || '').replace(' mi', ''),
      transmission: car.transmission || 'Automatic',
      fuelType: car.fuelType || car.type || 'Electric',
      seats: car.seats || '4',
      color: car.color || '',
      dailyRate: car.dailyRate || car.price || '',
      weeklyRate: car.weeklyRate || (car.price ? car.price * 6 : ''),
      monthlyRate: car.monthlyRate || (car.price ? car.price * 22 : ''),
      insuranceExpiry: car.insuranceExpiry || '2027-06-30',
      registrationExpiry: car.registrationExpiry || '2027-12-31',
      currentLocation: car.currentLocation || 'Beverly Hills Hub',
      status: car.status || 'Available',
      image: car.image || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      make: '',
      model: '',
      year: '2024',
      vinNumber: '',
      licensePlate: '',
      mileage: '',
      transmission: 'Automatic',
      fuelType: 'Electric',
      seats: '4',
      color: '',
      dailyRate: '',
      weeklyRate: '',
      monthlyRate: '',
      insuranceExpiry: '2027-06-30',
      registrationExpiry: '2027-12-31',
      currentLocation: 'Beverly Hills Hub',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800'
    });
  };

  // Get rentals for the selected car
  const getCarRentals = (carId) => {
    const matching = bookings.filter(b => b.vehicleId === carId);
    
    const upcoming = matching.filter(b => ['Pending Review', 'Booked', 'Reserved', 'Payment Pending', 'Payment Completed'].includes(b.status));
    const active = matching.filter(b => b.status === 'Active Rental');
    const history = matching.filter(b => ['Completed', 'Cancelled'].includes(b.status));
    
    return { upcoming, active, history };
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h2 className="text-4xl font-serif tracking-widest text-[#D4AF37] uppercase leading-none">
            Fleet Management
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">VIP Exotics Catalog & Telemetry Operations</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search exotics catalog..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-[#D4AF37]/50 focus:outline-none transition-all placeholder:text-gray-600"
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-6 py-3 bg-[#D4AF37] hover:bg-[#cda632] text-black rounded-xl flex items-center gap-2 font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Plus size={16} /> Add Car
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        {['All Cars', 'Available', 'Active', 'Service'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-[#D4AF37] text-black' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode='popLayout'>
          {filteredInventory.map((car, index) => (
            <motion.div 
              key={car.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#111] overflow-hidden border border-white/10 rounded-xl group relative shadow-2xl"
            >
              <div className="h-56 relative overflow-hidden">
                <img 
                   src={car.image} 
                   alt={car.name} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E17] via-transparent to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border backdrop-blur-md
                    ${car.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                      car.status === 'Active Rental' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30' : 
                      car.status === 'Booked' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/20 text-amber-500 border-amber-500/30'}`}>
                    {car.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-serif text-white uppercase tracking-tight leading-tight">{car.name}</h4>
                    <p className="text-[9px] font-mono text-[#D4AF37] uppercase tracking-widest mt-1">Plate: {car.licensePlate || 'LXR-901B'}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-lg font-bold font-mono text-[#D4AF37]">${car.dailyRate || car.price}/day</p>
                     <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Lease Rate</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6 text-center text-xs border-y border-white/5 py-3 text-gray-400">
                   <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Color</p>
                      <p className="font-bold text-white uppercase truncate text-[10px]">{car.color}</p>
                   </div>
                   <div className="border-x border-white/5">
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Odometer</p>
                      <p className="font-bold text-white text-[10px]">{car.mileage}</p>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-gray-600 uppercase mb-1">Transmission</p>
                      <p className="font-bold text-white text-[10px]">{car.transmission || 'Auto'}</p>
                   </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedCar(car)}
                    className="flex-1 py-3 bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#D4AF37]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye size={14} /> View Details
                  </button>
                  <button 
                    onClick={() => startEdit(car)}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteCar(car.id)}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Vehicle Detail Drawer */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end sm:items-stretch sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedCar(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full sm:w-[600px] bg-[#111111] border-l border-white/10 h-full p-8 shadow-2xl flex flex-col z-10"
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-4">
                     <div className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                        <Car size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-serif text-white uppercase tracking-tight">{selectedCar.name}</h3>
                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Plate ID: {selectedCar.licensePlate || 'LXR-901B'}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedCar(null)} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                {/* Tabs Navigation */}
                <div className="flex gap-4 mb-6 border-b border-white/5 overflow-x-auto custom-scrollbar">
                   {['Overview', 'Bookings', 'Maintenance', 'Documents', 'Revenue'].map(tab => (
                      <button 
                         key={tab}
                         onClick={() => setModalTab(tab)}
                         className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all whitespace-nowrap
                            ${modalTab === tab ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
                      >
                         {tab}
                      </button>
                   ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                   
                   {/* OVERVIEW TAB */}
                   {modalTab === 'Overview' && (
                      <div className="space-y-6">
                         <div className="rounded-2xl overflow-hidden border border-white/10 aspect-video">
                            <img src={selectedCar.image} className="w-full h-full object-cover" alt="Vehicle Detail" />
                         </div>

                         <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center">
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Status Protocol</p>
                               <span className="text-xs font-black text-[#D4AF37] uppercase italic">{selectedCar.status}</span>
                            </div>
                            <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center">
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Fuel / Charge</p>
                               <span className="text-xs font-black text-emerald-400 uppercase italic">{selectedCar.fuel || '100%'}</span>
                            </div>
                            <div className="p-4 bg-black/40 border border-white/5 rounded-xl text-center">
                               <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Seats</p>
                               <span className="text-xs font-bold text-white uppercase italic">{selectedCar.seats || '4'} Seats</span>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2">Specifications</h4>
                            <div className="bg-[#1a1a1a] p-5 border border-white/10 rounded-xl space-y-3">
                               {[
                                 { label: 'Make', val: selectedCar.make || selectedCar.name.split(' ')[0] },
                                 { label: 'Model', val: selectedCar.model || selectedCar.name.split(' ').slice(1).join(' ') },
                                 { label: 'Year', val: selectedCar.year },
                                 { label: 'VIN Number', val: selectedCar.vinNumber || 'N/A' },
                                 { label: 'License Plate', val: selectedCar.licensePlate || 'N/A' },
                                 { label: 'Odometer Reading', val: selectedCar.mileage },
                                 { label: 'Transmission', val: selectedCar.transmission || 'Automatic' },
                                 { label: 'Fuel / Propulsion', val: selectedCar.fuelType || selectedCar.type },
                                 { label: 'Finish Color', val: selectedCar.color },
                                 { label: 'Daily Rental Rate', val: `$${selectedCar.dailyRate || selectedCar.price} / day` },
                                 { label: 'Weekly Lease Rate', val: `$${selectedCar.weeklyRate || (selectedCar.dailyRate || selectedCar.price) * 6} / week` },
                                 { label: 'Monthly Lease Rate', val: `$${selectedCar.monthlyRate || (selectedCar.dailyRate || selectedCar.price) * 22} / month` },
                                 { label: 'Insurance Expiration', val: selectedCar.insuranceExpiry || '2027-04-15' },
                                 { label: 'Registration Expiration', val: selectedCar.registrationExpiry || '2027-08-30' },
                                 { label: 'Operational Hub', val: selectedCar.currentLocation || 'Beverly Hills Hub' }
                               ].map((item, i) => (
                                  <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                     <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">{item.label}</span>
                                     <span className="text-white font-mono font-medium">{item.val}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   )}

                   {/* BOOKINGS TAB */}
                   {modalTab === 'Bookings' && (() => {
                      const { upcoming, active, history } = getCarRentals(selectedCar.id);
                      return (
                         <div className="space-y-6">
                            {/* Active Rentals */}
                            <div className="space-y-2">
                               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2">Active Rental</h4>
                               {active.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic p-4 bg-black/30 border border-white/5 rounded-xl">No active rentals currently.</p>
                               ) : (
                                  active.map(b => (
                                     <div key={b.id} className="p-4 bg-black/40 border border-[#D4AF37]/30 rounded-xl flex justify-between items-center">
                                        <div>
                                           <span className="text-xs font-mono text-[#D4AF37] block">{b.id}</span>
                                           <span className="text-sm text-white font-bold block mt-1">{b.customer}</span>
                                           <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{b.startDate} to {b.endDate}</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] border bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 font-bold uppercase">Active</span>
                                     </div>
                                  ))
                               )}
                            </div>

                            {/* Upcoming Rentals */}
                            <div className="space-y-2">
                               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2">Upcoming Rentals</h4>
                               {upcoming.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic p-4 bg-black/30 border border-white/5 rounded-xl">No upcoming rentals scheduled.</p>
                               ) : (
                                  upcoming.map(b => (
                                     <div key={b.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                                        <div>
                                           <span className="text-xs font-mono text-gray-400 block">{b.id}</span>
                                           <span className="text-sm text-white font-bold block mt-1">{b.customer}</span>
                                           <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">{b.startDate} to {b.endDate}</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-[9px] border bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold uppercase">Reserved</span>
                                     </div>
                                  ))
                               )}
                            </div>

                            {/* Rental History */}
                            <div className="space-y-2">
                               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2">Rental History</h4>
                               {history.length === 0 ? (
                                  <p className="text-xs text-gray-500 italic p-4 bg-black/30 border border-white/5 rounded-xl">No past booking records.</p>
                               ) : (
                                  history.map(b => (
                                     <div key={b.id} className="p-4 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                                        <div>
                                           <span className="font-mono text-gray-500 block">{b.id}</span>
                                           <span className="text-white font-semibold block mt-0.5">{b.customer}</span>
                                           <span className="text-[10px] text-gray-400 font-mono block">{b.startDate} to {b.endDate}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] border ${b.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                           {b.status}
                                        </span>
                                     </div>
                                  ))
                               )}
                            </div>
                         </div>
                      );
                   })()}

                   {/* MAINTENANCE TAB */}
                   {modalTab === 'Maintenance' && (
                      <div className="space-y-6">
                         <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                            <div className="flex items-center gap-4 mb-3">
                               <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                                  <Zap size={20} />
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Next Scheduled Service</p>
                                   <p className="text-sm font-black text-white uppercase italic">{selectedCar.nextService || 'Dec 2026'}</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className="h-full w-[80%] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2">Service History</h4>
                            {selectedCar.maintenanceHistory && selectedCar.maintenanceHistory.length > 0 ? (
                              selectedCar.maintenanceHistory.map((item, i) => (
                                <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                                   <div>
                                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.description}</p>
                                      <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">Logged: {item.date} {item.cost ? `| Cost: $${item.cost}` : ''}</p>
                                   </div>
                                   <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 rounded-full">{item.status || 'Success'}</span>
                                 </div>
                              ))
                            ) : (
                              [
                                { label: 'Annual Inspection', date: 'Jan 14, 2026', status: 'Cleared' },
                                { label: 'Tire Rotation', date: 'Nov 12, 2025', status: 'Success' },
                                { label: 'Brake Fluid Flush', date: 'Aug 28, 2025', status: 'Success' },
                              ].map((item, i) => (
                                 <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                                    <div>
                                       <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</p>
                                       <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">{item.date}</p>
                                    </div>
                                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 rounded-full">{item.status}</span>
                                  </div>
                              ))
                            )}
                         </div>
                      </div>
                   )}

                   {/* DOCUMENTS TAB */}
                   {modalTab === 'Documents' && (
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] ml-2">Legal Renter Documents</h4>
                            
                            <div className="grid grid-cols-1 gap-3">
                               {/* Insurance */}
                               <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <Shield className="w-5 h-5 text-[#D4AF37]" />
                                     <div>
                                        <span className="text-xs font-bold text-white block">Insurance Certificate Waiver</span>
                                        <span className="text-[10px] text-gray-500 font-mono">Expires: {selectedCar.insuranceExpiry || '2027-04-15'}</span>
                                     </div>
                                  </div>
                                  <a 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); toast.success('Loading insurance PDF waiver from secure vault...'); }}
                                    className="text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-wider"
                                  >
                                     View PDF
                                  </a>
                               </div>

                               {/* Registration */}
                               <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                     <FileText className="w-5 h-5 text-[#D4AF37]" />
                                     <div>
                                        <span className="text-xs font-bold text-white block">DMV License Registration</span>
                                        <span className="text-[10px] text-gray-500 font-mono">Expires: {selectedCar.registrationExpiry || '2027-08-30'}</span>
                                     </div>
                                  </div>
                                  <a 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); toast.success('Loading registration documentation...'); }}
                                    className="text-xs font-bold text-[#D4AF37] hover:underline uppercase tracking-wider"
                                  >
                                     View PDF
                                  </a>
                               </div>

                               {/* Inspection Reports */}
                               <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                     <CheckSquare className="w-4 h-4 text-emerald-400" />
                                     <span className="text-xs font-bold text-white uppercase tracking-wider">Inspection Reports</span>
                                  </div>
                                  {selectedCar.documents?.inspectionReports?.map((ins, i) => (
                                     <div key={i} className="flex justify-between items-center text-xs">
                                        <div>
                                           <span className="text-gray-300 block">{ins.inspector} Audit</span>
                                           <span className="text-[10px] text-gray-500 font-mono">{ins.date}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-emerald-400 font-semibold">{ins.result}</span>
                                     </div>
                                  )) || (
                                     <p className="text-xs text-gray-500 italic">No inspections logged.</p>
                                  )}
                               </div>

                               {/* Maintenance Records */}
                               <div className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-3">
                                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                     <Settings className="w-4 h-4 text-[#D4AF37]" />
                                     <span className="text-xs font-bold text-white uppercase tracking-wider">Maintenance Records</span>
                                  </div>
                                  {selectedCar.documents?.maintenanceRecords?.map((rec, i) => (
                                     <div key={i} className="text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                                        <div className="flex justify-between font-semibold">
                                           <span className="text-white">{rec.type}</span>
                                           <span className="text-emerald-400 font-mono">${rec.cost}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-mono">{rec.date} | {rec.notes}</span>
                                     </div>
                                  )) || (
                                     <p className="text-xs text-gray-500 italic">No maintenance records logged.</p>
                                  )}
                               </div>

                            </div>
                         </div>
                      </div>
                   )}

                   {/* REVENUE TAB */}
                   {modalTab === 'Revenue' && (
                      <div className="space-y-6">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Lifetime Revenue</p>
                               <p className="text-2xl font-bold font-mono text-white italic">{selectedCar.revenue || '$124,500'}</p>
                            </div>
                            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                               <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Trip Count</p>
                               <p className="text-2xl font-bold font-mono text-white italic">{selectedCar.trips || '14'} trips</p>
                            </div>
                         </div>
                      </div>
                   )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 shrink-0">
                  <div className="flex gap-4">
                     <button onClick={() => setSelectedCar(null)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all italic">
                        Close
                     </button>
                     <select 
                       onChange={(e) => {
                         updateVehicleStatus(selectedCar.id, e.target.value);
                         setSelectedCar(prev => ({ ...prev, status: e.target.value }));
                         toast.success(`Vehicle status set to ${e.target.value}`);
                       }}
                       value={selectedCar.status}
                       className="flex-[2] py-4 bg-[#D4AF37] text-black rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-center cursor-pointer focus:outline-none"
                     >
                       <option value="Available">Set Available</option>
                       <option value="Booked">Set Booked</option>
                       <option value="Active Rental">Set Active Rental</option>
                       <option value="Maintenance">Set Maintenance</option>
                     </select>
                  </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Add / Edit Vehicle Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-3xl bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar z-10"
            >
              <h3 className="text-2xl font-serif text-white uppercase italic tracking-wider mb-6 pb-2 border-b border-white/10 text-[#D4AF37]">
                {showAddModal ? 'New Fleet Acquisition' : 'Edit Asset Specifications'}
              </h3>
              
              <form onSubmit={showAddModal ? handleAddCar : handleEditCar} className="space-y-6 text-left">
                
                {/* SECTION 1: CORE VEHICLE DETAILS */}
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-1">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">1. Core Vehicle Details</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Vehicle Name (Display Name)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rolls-Royce Spectre" 
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Current Hub Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Beverly Hills Hub" 
                        value={formData.currentLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentLocation: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Make</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rolls-Royce" 
                        value={formData.make}
                        onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Model</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Spectre" 
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Year</label>
                      <input 
                        type="text" 
                        placeholder="2024" 
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">License Plate</label>
                      <input 
                        type="text" 
                        placeholder="e.g. LXR-901B" 
                        value={formData.licensePlate}
                        onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: TECHNICAL SPECIFICATIONS */}
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-1">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">2. Technical Specifications</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">VIN Number</label>
                      <input 
                        type="text" 
                        placeholder="1FVHC8D5..." 
                        value={formData.vinNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, vinNumber: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Odometer (mi)</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 1200" 
                          value={formData.mileage}
                          onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Seats Count</label>
                        <input 
                          type="number" 
                          placeholder="e.g. 4" 
                          value={formData.seats}
                          onChange={(e) => setFormData(prev => ({ ...prev, seats: e.target.value }))}
                          className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Transmission</label>
                      <select
                        value={formData.transmission}
                        onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                        <option value="F1 Dual-Clutch">F1 Dual-Clutch</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Fuel / Propulsion Type</label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Electric">Electric</option>
                        <option value="Gasoline (Premium)">Gasoline (Premium)</option>
                        <option value="Hybrid (PHEV)">Hybrid (PHEV)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Finish Color</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Midnight Blue" 
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: RENTAL PRICING */}
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-1">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">3. Rental Pricing Structure</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Daily Rate ($)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 450" 
                        value={formData.dailyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dailyRate: e.target.value }))}
                        className="w-full bg-black border border-[#D4AF37]/50 rounded-xl py-2.5 px-3 text-xs text-[#D4AF37] font-bold focus:outline-none focus:border-[#D4AF37] transition-all" 
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Weekly Rate ($)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 2700" 
                        value={formData.weeklyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, weeklyRate: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Monthly Rate ($)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 9900" 
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthlyRate: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: COMPLIANCE & STATUS */}
                <div className="space-y-4">
                  <div className="border-b border-white/5 pb-1">
                    <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest">4. Compliance & Logistics</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Insurance Expiry</label>
                      <input 
                        type="date" 
                        value={formData.insuranceExpiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, insuranceExpiry: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Registration Expiry</label>
                      <input 
                        type="date" 
                        value={formData.registrationExpiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, registrationExpiry: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]" 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Availability Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]" 
                      >
                        <option value="Available">Available</option>
                        <option value="Booked">Booked</option>
                        <option value="Active Rental">Active Rental</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 block mb-1">Image URL</label>
                    <input 
                      type="text" 
                      placeholder="https://images.unsplash.com/..." 
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-xs font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all" 
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4 border-t border-white/5">
                  <button 
                    type="button"
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }} 
                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#D4AF37] text-black rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    {showAddModal ? 'Register Asset' : 'Commit Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDealership;
