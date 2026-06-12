// src/pages/dashboards/AdminCustomers.jsx
import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ShieldCheck, ShieldAlert, Edit, 
  Eye, X, MapPin, Phone, Mail, Clock,
  CreditCard, Calendar, Star, AlertTriangle, UserX, UserCheck, FileText, CheckCircle2, MessageSquare, Trash2, ArrowUpRight, DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminCustomers = () => {
  const { 
    customers, bookings, contracts, payments, suspendCustomer, reactivateCustomer 
  } = useAdminState();

  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileTab, setProfileTab] = useState('Overview');
  
  // Local edit inputs (sync with save)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');

  // Internal Notes input
  const [noteText, setNoteText] = useState('');
  const [notePriority, setNotePriority] = useState('Medium');

  const tabs = ['All', 'Platinum', 'Gold', 'Standard'];

  const getClientStats = (clientName) => {
    const clientBookings = bookings.filter(b => b.customer === clientName);
    const clientPayments = payments.filter(p => p.customerName === clientName && p.status === 'Paid');
    
    const totalRentals = clientBookings.length;
    const completedRentals = clientBookings.filter(b => b.status === 'Completed').length;
    const activeRentals = clientBookings.filter(b => b.status === 'Active Rental').length;
    const totalSpent = clientPayments.reduce((sum, p) => sum + p.amount, 0);
    const lastBooking = clientBookings[0];
    const lastRentalDate = lastBooking ? lastBooking.startDate : 'N/A';
    const currentActivity = lastBooking ? lastBooking.status : 'Inactive';

    return {
      totalRentals,
      completedRentals,
      activeRentals,
      totalSpent,
      lastRentalDate,
      currentActivity
    };
  };

  const filtered = (customers || []).filter(c => {
    if (!c) return false;
    if (activeTab !== 'All' && c.type !== activeTab) return false;
    const name = c.name || '';
    const id = c.id || '';
    return name.toLowerCase().includes(search.toLowerCase()) || 
           id.toLowerCase().includes(search.toLowerCase());
  });

  const openProfile = (customer, edit = false, initialTab = 'Overview') => {
    setSelectedCustomerId(customer.id);
    setIsEditMode(edit);
    setProfileTab(initialTab);
    setPanelOpen(true);
    
    // Set edit defaults
    setEditName(customer.name || '');
    setEditPhone(customer.phone || '');
    setEditEmail(customer.email || '');
    setEditAddress(customer.address || '');
    setEditEmergencyName(customer.emergencyContact?.name || '');
    setEditEmergencyRelation(customer.emergencyContact?.relation || '');
    setEditEmergencyPhone(customer.emergencyContact?.phone || '');
  };

  const closeProfile = () => {
    setPanelOpen(false);
    setIsEditMode(false);
  };

  // Top overall metrics from context state
  const totalRentalsAcrossAll = bookings.length;
  const completedRentalsAcrossAll = bookings.filter(b => b.status === 'Completed').length;
  const activeRentalsAcrossAll = bookings.filter(b => b.status === 'Active Rental').length; // Replaces Cancelled Rentals card
  const totalRevenueGenerated = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const averageRentalValue = totalRevenueGenerated / (completedRentalsAcrossAll || 1);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleSaveChanges = () => {
    if (selectedCustomer) {
      selectedCustomer.name = editName;
      selectedCustomer.phone = editPhone;
      selectedCustomer.email = editEmail;
      selectedCustomer.address = editAddress;
      selectedCustomer.emergencyContact = {
        name: editEmergencyName,
        relation: editEmergencyRelation,
        phone: editEmergencyPhone
      };
      setIsEditMode(false);
      toast.success('Client profile updated successfully.');
    }
  };

  const submitNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    if (selectedCustomer) {
      const newNote = {
        date: new Date().toISOString(),
        text: noteText,
        priority: notePriority,
        createdBy: 'Admin Agent'
      };
      // Pull and append to customer's notes local list
      selectedCustomer.notes = [newNote, ...(selectedCustomer.notes || [])];
      setNoteText('');
      toast.success('Internal note added.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Client <span className="text-primary font-serif not-italic">Network</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Global Identity Matrix</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search ID, Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-xs font-bold text-white focus:border-primary/50 focus:outline-none focus:shadow-glow-primary transition-all placeholder:text-gray-600"
            />
          </div>
          <button className="p-3.5 bg-[#111111] border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* TOP TABS */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-primary text-black shadow-glow-primary font-bold' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Rentals', val: totalRentalsAcrossAll, desc: 'All lifetime bookings', color: 'text-primary' },
          { label: 'Completed Rentals', val: completedRentalsAcrossAll, desc: 'Successful completed leases', color: 'text-[#D4AF37]' },
          { label: 'Active Rentals', val: activeRentalsAcrossAll, desc: 'Leases currently on road', color: 'text-blue-400' },
          { label: 'Total Revenue Generated', val: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalRevenueGenerated), desc: 'Settled payments', color: 'text-emerald-400' },
          { label: 'Average Rental Value', val: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(averageRentalValue), desc: 'Ticket average per rental', color: 'text-[#D4AF37]' },
        ].map((stat, i) => (
           <div key={i} className="glass-panel p-5 border-white/5 flex flex-col justify-between">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                 <p className="text-xl font-black text-white">{stat.val}</p>
                 <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">{stat.desc}</p>
              </div>
           </div>
        ))}
      </div>

      {/* Customers Table */}
      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-primary font-serif">
                <th className="p-4">Client Info</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Tier</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4">Last Rental Date</th>
                <th className="p-4">Current Activity</th>
                <th className="p-4">Total Bookings</th>
                <th className="p-4">Lifetime Value</th>
                <th className="p-4">Customer Since</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((customer, i) => {
                const stats = getClientStats(customer.name);
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group text-xs text-gray-300">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-black uppercase shadow-glow-primary">
                            {customer.name.charAt(0)}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white leading-tight">{customer.name}</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{customer.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white font-mono">{customer.phone}</td>
                    <td className="p-4">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border 
                          ${customer.type === 'Platinum' ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary' : 
                            customer.type === 'Gold' ? 'bg-primary/5 text-primary/80 border-primary/10' : 
                            'bg-white/5 text-gray-400 border-white/10'}`}>
                          {customer.type}
                       </span>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-1.5">
                          {customer.kyc === 'Verified' && <ShieldCheck size={12} className="text-success" />}
                          {customer.kyc === 'Pending' && <Clock size={12} className="text-amber-500" />}
                          {customer.kyc === 'Rejected' && <ShieldAlert size={12} className="text-danger" />}
                          <span className={`text-[9px] font-black uppercase tracking-widest ${customer.kyc === 'Verified' ? 'text-success' : customer.kyc === 'Pending' ? 'text-amber-500' : 'text-danger'}`}>{customer.kyc}</span>
                       </div>
                    </td>
                    <td className="p-4 font-mono">{stats.lastRentalDate}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                        stats.currentActivity === 'Completed' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                        stats.currentActivity === 'Active Rental' ? 'text-blue-400 border-blue-500/25 bg-blue-500/5' :
                        'text-amber-500 border-amber-500/25 bg-amber-500/5'
                      }`}>
                        {stats.currentActivity}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-white">{stats.totalRentals}</td>
                    <td className="p-4 text-sm font-black text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.totalSpent)}</td>
                    <td className="p-4 font-mono">{customer.joinedDate}</td>
                    <td className="p-4">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border 
                          ${customer.status === 'Active' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                            'bg-danger/10 text-danger border-danger/20'}`}>
                          {customer.status}
                       </span>
                    </td>
                    <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openProfile(customer, false, 'Overview')} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="View Profile"><Eye size={14} /></button>
                         <button onClick={() => openProfile(customer, true, 'Overview')} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors" title="Edit Profile"><Edit size={14} /></button>
                         {customer.status === 'Active' ? (
                           <button onClick={() => suspendCustomer(customer.id)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-colors" title="Suspend"><UserX size={14} /></button>
                         ) : (
                           <button onClick={() => reactivateCustomer(customer.id)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Reactivate"><UserCheck size={14} /></button>
                         )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL CUSTOMER Drawer / modal panel */}
      <AnimatePresence>
        {panelOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0A0A0A]/85 backdrop-blur-md"
              onClick={closeProfile}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="relative w-full md:w-[680px] bg-[#0A0A0A] border-l border-white/10 h-full flex flex-col shadow-2xl z-10"
            >
               {/* Panel Header */}
               <div className="relative h-44 bg-gradient-to-br from-[#111] to-[#0A0A0A] p-6 border-b border-white/5 flex items-end">
                  <button onClick={closeProfile} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white">
                     <X size={16} />
                  </button>

                  <div className="flex items-center gap-4 relative z-10 w-full">
                     <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-2xl text-primary font-black shadow-glow-primary">
                        {selectedCustomer.name.charAt(0)}
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary">
                              {selectedCustomer.type} Tier
                           </span>
                           {selectedCustomer.status === 'Suspended' && (
                              <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border bg-danger/10 text-danger border-danger/20">Suspended</span>
                           )}
                        </div>
                        
                        {isEditMode ? (
                           <input 
                             type="text" 
                             value={editName}
                             onChange={(e) => setEditName(e.target.value)}
                             className="bg-white/5 border border-primary/30 rounded-lg px-2 py-1 text-lg font-black text-white focus:outline-none focus:border-primary w-64"
                           />
                        ) : (
                           <h2 className="text-xl font-black text-white tracking-tight">{selectedCustomer.name}</h2>
                        )}
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{selectedCustomer.id}</p>
                     </div>
                  </div>
               </div>

               {/* Drawer Tab Headers */}
               <div className="flex border-b border-white/5 bg-[#0D0D0D] px-6 overflow-x-auto custom-scrollbar">
                {['Overview', 'Bookings', 'Contracts', 'Payments', 'Documents', 'Communications', 'Notes'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setProfileTab(tab); setIsEditMode(false); }}
                    className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors ${
                      profileTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

               {/* Panel Body */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-[#070707]">
                  
                  {/* OVERVIEW TAB */}
                  {profileTab === 'Overview' && (
                    <div className="space-y-6">
                      
                      {/* Emergency Contact Section */}
                      <div className="bg-[#111111] border border-white/5 p-4 rounded-xl space-y-3">
                        <h5 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 flex items-center gap-1">Emergency Contact Details</h5>
                        
                        {isEditMode ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[8px] text-gray-500 uppercase tracking-widest">Name</label>
                              <input type="text" value={editEmergencyName} onChange={e => setEditEmergencyName(e.target.value)} className="bg-black border border-white/10 rounded px-2.5 py-1 text-xs text-white w-full" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] text-gray-500 uppercase tracking-widest">Relation</label>
                              <input type="text" value={editEmergencyRelation} onChange={e => setEditEmergencyRelation(e.target.value)} className="bg-black border border-white/10 rounded px-2.5 py-1 text-xs text-white w-full" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] text-gray-500 uppercase tracking-widest">Phone</label>
                              <input type="text" value={editEmergencyPhone} onChange={e => setEditEmergencyPhone(e.target.value)} className="bg-black border border-white/10 rounded px-2.5 py-1 text-xs text-white w-full" />
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-400">
                            <div>
                              <p className="text-[8px] text-gray-500 uppercase tracking-widest">Contact Name</p>
                              <p className="text-white mt-0.5">{selectedCustomer.emergencyContact?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-gray-500 uppercase tracking-widest">Relationship</p>
                              <p className="text-white mt-0.5">{selectedCustomer.emergencyContact?.relation || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-gray-500 uppercase tracking-widest">Contact Phone</p>
                              <p className="text-white mt-0.5 font-mono">{selectedCustomer.emergencyContact?.phone || 'N/A'}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* General overview inputs */}
                      <div className="bg-[#111] border border-white/5 p-4 rounded-xl grid grid-cols-2 gap-4 text-xs text-gray-400 font-semibold">
                        <div className="space-y-1.5">
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest">Customer ID</p>
                          <p className="text-white">{selectedCustomer.id}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest">Customer Since</p>
                          <p className="text-white">{selectedCustomer.joinedDate}</p>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest">Risk Level</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] border font-black uppercase ${
                            selectedCustomer.riskScore === 'Low' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' : 'text-red-400 border-red-500/25 bg-red-500/5'
                          }`}>{selectedCustomer.riskScore}</span>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[8px] text-gray-500 uppercase tracking-widest">KYC License Status</p>
                          <p className="text-white uppercase">{selectedCustomer.kyc}</p>
                        </div>

                        {/* Editable profile fields */}
                        <div className="col-span-2 border-t border-white/5 pt-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Phone:</span>
                            {isEditMode ? (
                              <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-0.5 text-white" />
                            ) : (
                              <span className="text-white font-mono">{selectedCustomer.phone}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Email:</span>
                            {isEditMode ? (
                              <input type="text" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-0.5 text-white w-48" />
                            ) : (
                              <span className="text-white">{selectedCustomer.email}</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Address:</span>
                            {isEditMode ? (
                              <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-0.5 text-white w-64" />
                            ) : (
                              <span className="text-white">{selectedCustomer.address}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Relationship Badges */}
                      <div className="bg-[#111] border border-white/5 p-4 rounded-xl space-y-3">
                        <h5 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Rental Relationship Badges</h5>
                        <div className="flex flex-wrap gap-2">
                          {getClientStats(selectedCustomer.name).totalRentals > 5 && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37]">VIP Customer</span>
                          )}
                          {selectedCustomer.type === 'Platinum' && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-blue-500/10 border border-blue-500/25 text-blue-400">Frequent Renter</span>
                          )}
                          {selectedCustomer.riskScore === 'Critical' && (
                            <>
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 border border-red-500/25 text-red-400">Late Return History</span>
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-500/10 border border-red-500/25 text-red-400">High Deposit Risk</span>
                            </>
                          )}
                          {selectedCustomer.status === 'Suspended' && (
                            <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-red-950 text-red-400 border border-red-500/30">Blacklisted</span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-white/5 border border-white/10 text-gray-400">Corporate Client</span>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* BOOKINGS TAB */}
                  {profileTab === 'Bookings' && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-[#D4AF37] border-b border-white/5 pb-2">Client Booking Ledger</h5>
                      <div className="overflow-hidden border border-white/5 rounded-xl bg-black/40">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-[#111111] text-[8px] uppercase tracking-wider text-gray-500">
                              <th className="p-3">Booking ID</th>
                              <th className="p-3">Vehicle</th>
                              <th className="p-3">Pickup Date</th>
                              <th className="p-3">Return Date</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.filter(b => b.customer === selectedCustomer.name).map(b => (
                              <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 text-gray-300 font-semibold">
                                <td className="p-3 font-mono text-[#D4AF37]">{b.id}</td>
                                <td className="p-3 uppercase">{b.vehicleName}</td>
                                <td className="p-3 font-mono">{b.startDate}</td>
                                <td className="p-3 font-mono">{b.endDate}</td>
                                <td className="p-3 font-mono">${b.totalPrice}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                                    b.status === 'Completed' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                                    b.status === 'Active Rental' ? 'text-blue-400 border-blue-500/25 bg-blue-500/5' :
                                    'text-amber-500 border-amber-500/25 bg-amber-500/5'
                                  }`}>{b.status}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* CONTRACTS TAB */}
                  {profileTab === 'Contracts' && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-[#D4AF37] border-b border-white/5 pb-2">Client Contracts Vault</h5>
                      <div className="overflow-hidden border border-white/5 rounded-xl bg-black/40">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-[#111111] text-[8px] uppercase tracking-wider text-gray-500">
                              <th className="p-3">Contract ID</th>
                              <th className="p-3">Vehicle</th>
                              <th className="p-3">Created Date</th>
                              <th className="p-3">Status</th>
                              <th className="p-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contracts.filter(c => c.customerName === selectedCustomer.name).map(c => (
                              <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 text-gray-300 font-semibold">
                                <td className="p-3 font-mono text-[#D4AF37]">{c.id}</td>
                                <td className="p-3 uppercase">{c.vehicleName}</td>
                                <td className="p-3 font-mono">{c.createdDate}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                                    c.status === 'Signed' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                                    'text-amber-500 border-amber-500/25 bg-amber-500/5'
                                  }`}>{c.status}</span>
                                </td>
                                <td className="p-3 text-right">
                                  <button onClick={() => toast.success('Contract PDF Loaded')} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] hover:text-[#D4AF37]">Preview</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* PAYMENTS TAB */}
                  {profileTab === 'Payments' && (
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-[#D4AF37] border-b border-white/5 pb-2">Invoice Receipts History</h5>
                      <div className="overflow-hidden border border-white/5 rounded-xl bg-black/40">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-[#111111] text-[8px] uppercase tracking-wider text-gray-500">
                              <th className="p-3">Transaction ID</th>
                              <th className="p-3">Vehicle</th>
                              <th className="p-3">Amount</th>
                              <th className="p-3">Method</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {payments.filter(p => p.customerName === selectedCustomer.name).map(p => (
                              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 text-gray-300 font-semibold">
                                <td className="p-3 font-mono text-[#D4AF37]">{p.id}</td>
                                <td className="p-3 uppercase">{p.vehicleName}</td>
                                <td className="p-3 font-mono">${p.amount}</td>
                                <td className="p-3 uppercase">{p.method}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                                    p.status === 'Paid' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                                    'text-amber-500 border-amber-500/25 bg-amber-500/5'
                                  }`}>{p.status}</span>
                                </td>
                                <td className="p-3 font-mono">{p.createdDate}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* DOCUMENTS TAB */}
                  {profileTab === 'Documents' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(selectedCustomer.documents || []).map((doc, idx) => (
                        <div key={idx} className="bg-[#111111] border border-white/5 p-4 rounded-xl space-y-2.5 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">{doc.type}</span>
                              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase">{doc.status}</span>
                            </div>
                            <p className="text-xs font-black text-white uppercase mt-1">{doc.name}</p>
                            <p className="text-[8px] text-gray-600 font-mono mt-0.5">Uploaded: {doc.uploadDate || '2026-06-01'}</p>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button onClick={() => toast.success(`Viewing ${doc.name}`)} className="flex-1 py-1 bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold uppercase tracking-widest rounded border border-white/5">Preview</button>
                            <button onClick={() => toast.success(`Downloading ${doc.name}`)} className="flex-1 py-1 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-bold uppercase tracking-widest rounded border border-[#D4AF37]/25">Download</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COMMUNICATIONS TAB */}
                  {profileTab === 'Communications' && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-2.5">
                        <a href={`tel:${selectedCustomer.phone}`} className="flex-1 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Call Customer</a>
                        <button onClick={() => toast.success('Email client initiated.')} className="flex-1 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Send Email</button>
                        <a href={`sms:${selectedCustomer.phone}`} className="flex-1 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Send SMS</a>
                        <a href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}`} className="flex-1 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Open WhatsApp</a>
                      </div>

                      {/* Communications History */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-[#D4AF37] border-b border-white/5 pb-2">Timeline Logs</h5>
                        
                        {/* Let's show communication history from bookings communications log or list */}
                        {bookings.filter(b => b.customer === selectedCustomer.name).map(b => (
                          <div key={b.id} className="space-y-3">
                            {b.communications && b.communications.map((comm, idx) => (
                              <div key={idx} className="flex gap-4 items-start text-xs border-l border-white/10 pl-4 relative">
                                <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-black border border-[#D4AF37] rounded-full flex items-center justify-center text-[8px] text-primary">
                                  {comm.type[0]}
                                </span>
                                <div className="flex-1 space-y-1">
                                  <div className="flex justify-between items-center text-gray-500">
                                    <span className="font-black text-white tracking-widest uppercase">{comm.type}</span>
                                    <span className="font-mono text-[9px]">{new Date(comm.date).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-gray-400 font-semibold">{comm.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* NOTES TAB */}
                  {profileTab === 'Notes' && (
                    <div className="space-y-6">
                      <form onSubmit={submitNote} className="bg-[#111111] border border-white/5 p-4 rounded-xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Write Staff Surcharge Note</h5>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest">Priority level</label>
                            <select
                              value={notePriority}
                              onChange={e => setNotePriority(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded py-2 px-2 text-xs text-white"
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Urgent">Urgent</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] text-gray-500 uppercase tracking-widest">Creator</label>
                            <input type="text" disabled value="Admin Agent" className="w-full bg-black/40 border border-white/5 rounded py-2 px-2 text-xs text-gray-500" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 uppercase tracking-widest">Note details</label>
                          <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded py-2 px-3 text-xs text-white h-16 resize-none"
                            placeholder="Type internal notes..."
                          />
                        </div>
                        <button type="submit" className="w-full py-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-lg">Add Note</button>
                      </form>

                      {/* Display notes timeline */}
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-black uppercase text-[#D4AF37] border-b border-white/5 pb-2">Notes Timeline</h5>
                        {(selectedCustomer.notes || []).map((note, idx) => (
                          <div key={idx} className="p-3 bg-[#111111] border border-white/5 rounded-xl space-y-1 text-xs">
                            <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                              <span className={note.priority === 'Urgent' ? 'text-red-400 font-black' : 'text-primary'}>Priority: {note.priority}</span>
                              <span className="font-mono">{new Date(note.date).toLocaleString()}</span>
                            </div>
                            <p className="text-white normal-case font-semibold">{note.text}</p>
                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest text-right">By: {note.createdBy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

               </div>

               {/* Panel Actions */}
               <div className="p-6 bg-[#111111] border-t border-white/5 grid grid-cols-2 gap-4">
                  {isEditMode ? (
                     <>
                        <button onClick={() => setIsEditMode(false)} className="py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-white/10 transition-all">Cancel</button>
                        <button onClick={handleSaveChanges} className="py-3 bg-primary text-black font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:shadow-glow-primary transition-all">Save Changes</button>
                     </>
                  ) : (
                     <>
                        <button 
                          onClick={() => setIsEditMode(true)}
                          className="py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-[0.2em] text-[9px] hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                        >
                           <Edit size={12} /> Edit Identity
                        </button>
                        {selectedCustomer.status === 'Active' ? (
                          <button 
                            onClick={() => suspendCustomer(selectedCustomer.id)}
                            className="py-3 bg-danger/10 border border-danger/20 rounded-xl text-danger font-black uppercase tracking-[0.2em] text-[9px] hover:bg-danger hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5"
                          >
                             <UserX size={12} /> Suspend Access
                          </button>
                        ) : (
                          <button 
                            onClick={() => reactivateCustomer(selectedCustomer.id)}
                            className="py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 font-black uppercase tracking-[0.2em] text-[9px] hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center gap-1.5"
                          >
                             <UserCheck size={12} /> Reactivate Access
                          </button>
                        )}
                     </>
                  )}
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCustomers;
