// src/pages/dashboards/AdminDrivers.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Search, Phone, Mail, Calendar, 
  MapPin, CheckCircle, RefreshCw, AlertCircle, Plus, 
  Eye, FileText, Star, ShieldAlert, Award, FileSpreadsheet, X, Clock, HelpCircle, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDrivers = () => {
  const navigate = useNavigate();
  const { drivers, bookings, deliveries, registerDriver, toggleDriverAvailability } = useAdminState();
  const [search, setSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // 'All', 'Available', 'Assigned', 'On Leave', 'Suspended'
  const [profileTab, setProfileTab] = useState('Overview');

  const filteredDrivers = (drivers || []).filter(d => {
    if (!d) return false;
    if (activeTab === 'Available' && d.availability !== 'Available') return false;
    if (activeTab === 'Assigned' && d.status !== 'Assigned') return false;
    if (activeTab === 'On Leave' && d.availability !== 'On Leave') return false;
    if (activeTab === 'Suspended' && d.availability !== 'Suspended') return false;

    const term = search.toLowerCase();
    const name = d.name || '';
    const licenseNumber = d.licenseNumber || '';
    const email = d.email || '';
    return (
      name.toLowerCase().includes(term) ||
      licenseNumber.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Assigned':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'On Route':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Completed Assignment':
        return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20';
      case 'Off Duty':
        return 'text-gray-400 bg-white/5 border-white/10';
      default:
        return 'text-white bg-white/5 border-white/10';
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'Available':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-glow-primary';
      case 'Unavailable':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'On Leave':
        return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'Suspended':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  const getDocStatusColor = (status) => {
    switch (status) {
      case 'Valid':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Expiring Soon':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20 animate-pulse';
      case 'Expired':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  // Top overall stats
  const totalDrivers = (drivers || []).length;
  const availableDrivers = (drivers || []).filter(d => d.availability === 'Available').length;
  const assignedDrivers = (drivers || []).filter(d => d.status === 'Assigned').length;
  const driversOnRoute = (drivers || []).filter(d => d.status === 'On Route').length;
  
  // Completed deliveries count from active deliveries context
  const completedToday = (deliveries || []).filter(d => d.status === 'Closed' || d.status === 'Returned').length;
  
  // Average Rating
  const averageRating = totalDrivers > 0 
    ? ((drivers || []).reduce((sum, d) => sum + (d.rating || 5.0), 0) / totalDrivers).toFixed(1)
    : '5.0';

  // Drivers Requiring Attention (Alerts warning count of expired/expiring docs)
  const driversRequiringAttention = (drivers || []).filter(d => 
    d.licDocumentStatus === 'Expired' || d.comDocumentStatus === 'Expired' || 
    d.licDocumentStatus === 'Expiring Soon' || d.comDocumentStatus === 'Expiring Soon' ||
    d.insDocumentStatus === 'Expired' || d.medDocumentStatus === 'Expired'
  ).length;



  const selectedDriver = (drivers || []).find(d => d.id === selectedDriverId) || (drivers && drivers[0]);

  // Check if driver has compliance alerts
  const hasComplianceAlert = (driver) => {
    return (
      driver.licDocumentStatus === 'Expired' || 
      driver.comDocumentStatus === 'Expired' ||
      driver.insDocumentStatus === 'Expired' ||
      driver.medDocumentStatus === 'Expired'
    );
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Chauffeur <span className="text-primary not-italic font-serif">Operations</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Fleet Chauffeur & Dispatch Compliance Matrix</p>
        </div>
        <button
          onClick={() => navigate('/users', { state: { openCreateModal: true, defaultRole: 'Driver' } })}
          className="px-6 py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-glow-primary hover:bg-[#cda632] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black" /> Create Driver Account
        </button>
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        {[
          { label: 'Total Drivers', val: totalDrivers, desc: 'Registered staff roster', color: 'text-[#D4AF37]' },
          { label: 'Available Drivers', val: availableDrivers, desc: 'On standby list', color: 'text-emerald-400' },
          { label: 'Assigned Drivers', val: assignedDrivers, desc: 'Assigned deliveries', color: 'text-blue-400' },
          { label: 'Drivers On Route', val: driversOnRoute, desc: 'Currently en route', color: 'text-red-400' },
          { label: 'Deliveries Today', val: completedToday, desc: 'Assignments completed', color: 'text-indigo-400' },
          { label: 'Average Rating', val: `${averageRating} ★`, desc: 'VIP passenger ratings', color: 'text-[#D4AF37]' },
          { label: 'Attention Required', val: driversRequiringAttention, desc: 'Compliance warnings', color: 'text-red-500', isCritical: driversRequiringAttention > 0 },
        ].map((stat, i) => (
           <div key={i} className={`glass-panel p-4 border-white/5 flex flex-col justify-between ${stat.isCritical ? 'border-red-500/25 bg-red-950/5 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : ''}`}>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                 <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                 <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">{stat.desc}</p>
              </div>
           </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        {['All', 'Available', 'Assigned', 'On Leave', 'Suspended'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap
              ${activeTab === tab 
                ? 'bg-primary text-black shadow-glow-primary font-bold' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roster list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Active Duty Standby</h3>
             <div className="relative w-72">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input
                 type="text"
                 placeholder="Search drivers, license ID..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-primary/50 focus:outline-none transition-all placeholder:text-gray-600"
               />
             </div>
          </div>

          <div className="glass-panel overflow-hidden border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111111] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-primary font-serif">
                    <th className="p-4">Chauffeur</th>
                    <th className="p-4">License ID</th>
                    <th className="p-4">Duty Status</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4">Total Trips</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDrivers.map(d => {
                    const isSelected = selectedDriver?.id === d.id;
                    const alertActive = hasComplianceAlert(d);
                    return (
                      <tr 
                        key={d.id} 
                        className={`border-b border-white/5 hover:bg-white/5 transition-all text-xs text-gray-300 cursor-pointer ${
                          isSelected ? 'bg-white/[0.02]' : ''
                        }`}
                        onClick={() => setSelectedDriverId(d.id)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-9 h-9 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-primary font-black uppercase relative">
                                {(d?.name || 'Chauffeur').split(' ').filter(Boolean).map(n => n[0]).join('')}
                                {alertActive && (
                                  <span className="absolute -top-1 -right-1 p-0.5 bg-red-600 rounded-full text-white" title="Compliance alert: Expired documents detected!">
                                    <ShieldAlert size={10} />
                                  </span>
                                )}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                                  {d.name}
                                </p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{d.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-300">{d.licenseNumber}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] border font-black uppercase tracking-widest ${getStatusColor(d.status)}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] border font-black uppercase tracking-widest ${getAvailabilityColor(d.availability)}`}>
                            {d.availability}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-white text-center">{d.deliveriesCount}</td>
                        <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                          <select
                            value={d.availability}
                            onChange={(e) => toggleDriverAvailability(d.id, e.target.value)}
                            className="bg-black/80 border border-white/10 rounded px-2.5 py-1 text-[10px] font-black uppercase text-primary hover:border-primary/50 cursor-pointer outline-none"
                          >
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Compliance Drawer Console (Right Panel) */}
        <div className="bg-[#111] border border-white/5 rounded-xl p-5 shadow-2xl space-y-6">
          {selectedDriver ? (
            <div className="space-y-6">
              <div className="text-center pb-4 border-b border-white/5 space-y-2 relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-[#D4AF37] text-2xl font-black shadow-glow-primary mx-auto">
                   {(selectedDriver?.name || 'Chauffeur').split(' ').filter(Boolean).map(n => n[0]).join('')}
                </div>
                <h3 className="text-lg font-serif text-white uppercase tracking-wide font-black">{selectedDriver.name}</h3>
                <div className="flex gap-2 justify-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] border font-black uppercase ${getStatusColor(selectedDriver.status)}`}>
                    {selectedDriver.status}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[8px] border font-black uppercase ${getAvailabilityColor(selectedDriver.availability)}`}>
                    {selectedDriver.availability}
                  </span>
                </div>
              </div>

              {/* Console Tabs */}
              <div className="flex border-b border-white/5 bg-[#0D0D0D] px-2 overflow-x-auto custom-scrollbar">
                {['Overview', 'Assignments', 'Documents', 'Performance', 'Timeline'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setProfileTab(tab)}
                    className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors ${
                      profileTab === tab ? 'border-primary text-primary font-bold' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content Panels */}
              <div className="space-y-4 text-xs font-semibold text-gray-400">
                
                {/* OVERVIEW TAB */}
                {profileTab === 'Overview' && (
                  <div className="space-y-4">
                    {/* Profile Summary Block (Correction 5) */}
                    <div className="grid grid-cols-3 gap-2 bg-black/40 border border-white/5 p-3.5 rounded-xl">
                      <div className="text-center">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">Total Trips</span>
                        <span className="text-sm font-black text-white font-mono">{selectedDriver.deliveriesCount}</span>
                      </div>
                      <div className="text-center border-x border-white/5">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">VIP Rating</span>
                        <span className="text-sm font-black text-primary font-mono">{selectedDriver.rating} ★</span>
                      </div>
                      <div className="text-center">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">On-Time</span>
                        <span className="text-sm font-black text-emerald-400 font-mono">98%</span>
                      </div>
                      <div className="col-span-3 border-t border-white/5 pt-2 mt-2 flex justify-between text-[8px] text-gray-500 font-mono uppercase tracking-widest">
                        <span>Hired Since: {selectedDriver.joinedDate}</span>
                        <span>Last Active: 2026-06-03</span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl space-y-3">
                      <h4 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 flex items-center gap-1"><Info size={10} /> Chauffeur Profile Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-500">Full Name:</span>
                          <span className="text-white font-bold">{selectedDriver.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-500">License ID:</span>
                          <span className="text-white font-mono font-bold">{selectedDriver.licenseNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-500">Commercial License:</span>
                          <span className="text-white font-mono font-bold">{selectedDriver.commercialLicenseNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-500">Phone:</span>
                          <span className="text-white font-mono">{selectedDriver.phone}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                          <span className="text-gray-500">Email:</span>
                          <span className="text-white font-mono text-[11px]">{selectedDriver.email}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-gray-500">Address:</span>
                          <span className="text-white text-right max-w-[200px] truncate">{selectedDriver.address}</span>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact Block */}
                    <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl space-y-2.5">
                      <h4 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Emergency Contact</h4>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Contact Person:</span>
                        <span className="text-white font-bold">{selectedDriver.emergencyContact?.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Mobile Phone:</span>
                        <span className="text-white font-mono">{selectedDriver.emergencyContact?.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ASSIGNMENTS TAB */}
                {profileTab === 'Assignments' && (
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Assigned Logistics Ledger</h4>
                    
                    {/* Active Assignment */}
                    <div className="space-y-2">
                      <h5 className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Active Task</h5>
                      {(deliveries || []).filter(dl => dl.driverName === selectedDriver.name && dl.status !== 'Closed').map(dl => (
                        <div key={dl.id} className="p-3 bg-white/5 border border-white/5 rounded-lg space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="font-mono text-primary font-bold text-[10px]">{dl.id}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${getStatusColor(dl.status)}`}>{dl.status}</span>
                          </div>
                          <p className="text-white font-bold text-xs uppercase">{dl.vehicleName}</p>
                          <div className="text-[10px] text-gray-500 leading-snug">
                            <div>Customer: <strong className="text-white">{dl.customerName}</strong></div>
                            <div>Address: {dl.address}</div>
                            <div>Scheduled: {dl.scheduleDate}</div>
                          </div>
                          <div className="flex gap-2 pt-1 border-t border-white/5 mt-2">
                            <button onClick={() => toast.success(`Navigating to Booking ${dl.bookingId}`)} className="flex-1 py-1 bg-white/5 border border-white/10 rounded text-[9px] hover:text-primary uppercase font-black tracking-widest">Open Booking</button>
                            <button onClick={() => toast.success(`Navigating to Dispatch Logistics for ${dl.id}`)} className="flex-1 py-1 bg-white/5 border border-white/10 rounded text-[9px] hover:text-primary uppercase font-black tracking-widest">Open Delivery</button>
                          </div>
                        </div>
                      ))}
                      {(deliveries || []).filter(dl => dl.driverName === selectedDriver.name && dl.status !== 'Closed').length === 0 && (
                        <p className="text-[10px] text-gray-600 italic">No active assignments on file.</p>
                      )}
                    </div>

                    {/* Historical Assignments list */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <h5 className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Completed Deliveries</h5>
                      <div className="overflow-hidden border border-white/5 rounded-lg">
                        <table className="w-full text-left text-[10px] border-collapse bg-black/20">
                          <thead>
                            <tr className="bg-white/5 border-b border-white/10 font-bold uppercase tracking-wider text-[8px] text-gray-500">
                              <th className="p-2">Ref ID</th>
                              <th className="p-2">Vehicle</th>
                              <th className="p-2">Customer</th>
                              <th className="p-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(deliveries || []).filter(dl => dl.driverName === selectedDriver.name && dl.status === 'Closed').map(dl => (
                              <tr key={dl.id} className="border-b border-white/5 hover:bg-white/5 text-gray-300 font-semibold">
                                <td className="p-2 font-mono text-primary">{dl.id}</td>
                                <td className="p-2 uppercase truncate max-w-[80px]">{dl.vehicleName}</td>
                                <td className="p-2">{dl.customerName}</td>
                                <td className="p-2 text-right text-emerald-400">Closed</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENTS TAB (Correction 2) */}
                {profileTab === 'Documents' && (
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Compliance Document Vault</h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { name: 'Driver License', status: selectedDriver.licDocumentStatus, expiry: selectedDriver.licExpiry },
                        { name: 'Commercial License', status: selectedDriver.comDocumentStatus, expiry: selectedDriver.comExpiry },
                        { name: 'Government ID Card', status: 'Valid', expiry: '2029-08-30' },
                        { name: 'Liability Insurance', status: selectedDriver.insDocumentStatus, expiry: selectedDriver.insExpiry },
                        { name: 'Background Check', status: 'Valid', expiry: '2028-04-12' },
                        { name: 'Medical Certificate', status: selectedDriver.medDocumentStatus, expiry: selectedDriver.medExpiry },
                      ].map((doc, idx) => (
                        <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-lg flex justify-between items-center">
                          <div className="space-y-1.5 flex-1 pr-4">
                            <span className="text-white font-bold text-xs flex items-center gap-1.5 uppercase tracking-wide">
                              <FileText size={12} className="text-gray-500" /> {doc.name}
                            </span>
                            <div className="flex gap-2 items-center">
                              <span className="text-[8px] text-gray-500 font-mono">Expiry: {doc.expiry}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[7px] font-black border uppercase tracking-widest ${getDocStatusColor(doc.status)}`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => toast.success(`Loading preview for ${doc.name}`)} className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white" title="Preview"><Eye size={12} /></button>
                            <button onClick={() => toast.success(`Downloading ${doc.name}`)} className="p-1.5 bg-white/5 hover:bg-[#D4AF37] hover:text-black rounded text-gray-400" title="Download"><FileSpreadsheet size={12} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PERFORMANCE TAB (Correction 3) */}
                {profileTab === 'Performance' && (
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Performance Analytics</h4>
                    
                    {/* Performance Metrics Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-center">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">On-Time Deliveries</span>
                        <span className="text-lg font-black text-emerald-400">98.5%</span>
                      </div>
                      <div className="p-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-center">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">Late / Cancelled</span>
                        <span className="text-lg font-black text-red-400">0%</span>
                      </div>
                      <div className="p-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-center">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">Incident Reports</span>
                        <span className="text-lg font-black text-red-500 font-mono">{(selectedDriver.incidents || []).length}</span>
                      </div>
                      <div className="p-3 bg-[#0A0A0A] border border-white/5 rounded-xl text-center">
                        <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-0.5">VIP Customer Rating</span>
                        <span className="text-lg font-black text-[#D4AF37] font-mono">{selectedDriver.rating} ★</span>
                      </div>
                    </div>

                    {/* Incident Log Section */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <h5 className="text-[8px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><ShieldAlert size={10} className="text-red-500" /> Chauffeur Incident Registry</h5>
                      
                      {selectedDriver.incidents && selectedDriver.incidents.length > 0 ? (
                        <div className="overflow-hidden border border-white/5 rounded-lg bg-black/25">
                          <table className="w-full text-left text-[10px] border-collapse">
                            <thead>
                              <tr className="bg-white/5 border-b border-white/10 font-bold uppercase tracking-wider text-[8px] text-gray-500">
                                <th className="p-2">Date</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Severity</th>
                                <th className="p-2 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedDriver.incidents.map((inc, i) => (
                                <tr key={i} className="border-b border-white/5 text-gray-300 font-semibold">
                                  <td className="p-2 font-mono">{inc.date}</td>
                                  <td className="p-2 uppercase text-[9px] text-white font-bold">{inc.type}</td>
                                  <td className="p-2">
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                      inc.severity === 'Minor' ? 'text-amber-500 border-amber-500/25 bg-amber-500/5' : 'text-red-400 border-red-500/25 bg-red-500/5'
                                    }`}>{inc.severity}</span>
                                  </td>
                                  <td className="p-2 text-right text-emerald-400 font-mono uppercase text-[8px]">{inc.resolutionStatus}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-600 italic">Compliance is green. No incidents reported.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* TIMELINE TAB */}
                {profileTab === 'Timeline' && (
                  <div className="space-y-4">
                    <h4 className="text-[9px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Chauffeur Journey Timeline</h4>
                    <div className="relative border-l border-white/10 pl-4 space-y-4 pt-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {selectedDriver.timeline && selectedDriver.timeline.length > 0 ? (
                        selectedDriver.timeline.map((item, idx) => (
                          <div key={idx} className="relative">
                            <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-[#D4AF37] rounded-full border border-black shadow-glow-primary" />
                            <span className="text-[8px] text-gray-500 font-mono block">{new Date(item.date).toLocaleString()}</span>
                            <span className="text-xs text-white font-bold block">{item.title}</span>
                            <span className="text-[10px] text-gray-400">{item.desc}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-gray-500 italic">No timeline tracking metrics logged.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <User className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm">Select a driver from the roster to inspect compliance credentials, performance reviews, and assignments logs.</p>
            </div>
          )}
        </div>
      </div>

      {/* Register Driver Modal removed */}
    </div>
  );
};

export default AdminDrivers;
