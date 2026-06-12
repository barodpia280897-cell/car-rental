// src/pages/dashboards/AdminBookings.jsx
import React, { useState, useRef } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Search, Eye, CheckCircle2, X, Check, Zap, FileText, Calendar, 
  User, Shield, CreditCard, Truck, Clipboard, MessageSquare, Phone, Mail,
  AlertTriangle, Plus, Clock, FileCheck, Trash2, UserCheck, ShieldAlert
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminBookings = () => {
  const { 
    bookings, vehicles, drivers, contracts, payments, deliveries,
    verifyLicense, sendContract, resendContract, signContract, voidContract, archiveContract,
    recordPayment, refundPayment, releaseDeposit, generateInvoice,
    scheduleDelivery, assignDriver, markInTransit, markDelivered, markReturned,
    logCommunication, addInternalNote, addFollowUpReminder, cancelBooking, completeInspection
  } = useAdminState();

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  
  // Details Modal Sub-Tab
  const [detailTab, setDetailTab] = useState('Overview');

  const invoiceRef = useRef(null);
  const docRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);

  const generateInvoicePDF = async (action) => {
    if (!selectedBooking) return;
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating Invoice PDF...');
    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      if (action === 'download') {
        pdf.save(`Invoice_${selectedBooking.paymentInfo?.invoiceNumber || selectedBooking.id}.pdf`);
        toast.success('Invoice PDF downloaded successfully.', { id: loadingToast });
      } else if (action === 'preview') {
        window.open(pdf.output('bloburl'), '_blank');
        toast.success('Previewing invoice PDF...', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error generating Invoice PDF:', error);
      toast.error('Failed to generate Invoice PDF', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDocumentPDF = async (doc, action) => {
    if (!selectedBooking) return;
    setIsGenerating(true);
    const loadingToast = toast.loading(`Generating PDF for ${doc.title}...`);
    try {
      setActiveDoc(doc);
      // Wait for React to render the updated hidden container
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const element = docRef.current;
      if (!element) {
        throw new Error("Document reference not found in DOM");
      }
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      if (action === 'download') {
        pdf.save(`${doc.file}`);
        toast.success(`${doc.title} downloaded successfully.`, { id: loadingToast });
      } else if (action === 'preview') {
        window.open(pdf.output('bloburl'), '_blank');
        toast.success(`Previewing ${doc.title}...`, { id: loadingToast });
      }
    } catch (error) {
      console.error('Error generating Document PDF:', error);
      toast.error(`Failed to generate PDF for ${doc.title}`, { id: loadingToast });
    } finally {
      setIsGenerating(false);
      setActiveDoc(null);
    }
  };
  
  // Interactive modal inputs
  const [assignDriverId, setAssignDriverId] = useState('');
  const [schedAddress, setSchedAddress] = useState('');
  const [schedDate, setSchedDate] = useState('');
  
  // Inspection form states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutFuel, setCheckoutFuel] = useState('100');
  const [checkoutMileage, setCheckoutMileage] = useState('');
  const [checkoutDamageNotes, setCheckoutDamageNotes] = useState('');
  const [checkoutAdminSign, setCheckoutAdminSign] = useState('');
  const [checkoutCustSign, setCheckoutCustSign] = useState('');

  const [isInInspectionModalOpen, setIsInInspectionModalOpen] = useState(false);
  const [checkinFuel, setCheckinFuel] = useState('100');
  const [checkinMileage, setCheckinMileage] = useState('');
  const [checkinAssessment, setCheckinAssessment] = useState('');
  const [checkinCharges, setCheckinCharges] = useState('0');

  // Communication logs input
  const [commType, setCommType] = useState('Call');
  const [commContent, setCommContent] = useState('');

  // Settle payments input
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('Credit Card');
  const [payTxn, setPayTxn] = useState('');

  // Internal Notes input
  const [noteContent, setNoteContent] = useState('');
  const [notePriority, setNotePriority] = useState('Medium');

  // Follow up input
  const [reminderContent, setReminderContent] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Pending' && b.status !== 'Pending Review') return false;
    if (activeTab === 'Active' && b.status !== 'Active Rental') return false;
    if (activeTab === 'Completed' && b.status !== 'Completed') return false;
    
    const term = search.toLowerCase();
    return (b.customer || '').toLowerCase().includes(term) || 
           b.id.toLowerCase().includes(term) ||
           (b.vehicleName || '').toLowerCase().includes(term);
  });

  const selectedBooking = bookings.find(b => b.id === selectedBookingId);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Review':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'License Verified':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Contract Sent':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Contract Signed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Payment Pending':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Payment Completed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Driver Assigned':
        return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
      case 'Delivery Scheduled':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'In Transit':
        return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Delivered':
        return 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20';
      case 'Active Rental':
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Returned':
        return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Completed':
        return 'border border-[#D4AF37] text-[#D4AF37] bg-transparent';
      case 'Cancelled':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-white bg-white/5 border-white/10';
    }
  };

  const handleOpenDetails = (booking) => {
    setSelectedBookingId(booking.id);
    setDetailTab('Overview');
  };

  const submitCheckoutInspection = (e) => {
    e.preventDefault();
    if (!checkoutFuel || !checkoutMileage || !checkoutAdminSign || !checkoutCustSign) {
      toast.error('All fields including signatures are required for Checkout.');
      return;
    }
    completeInspection(selectedBooking.id, 'out', {
      fuel: parseInt(checkoutFuel),
      mileage: parseInt(checkoutMileage),
      damageNotes: checkoutDamageNotes || 'None',
      adminSignature: checkoutAdminSign,
      customerSignature: checkoutCustSign,
      timestamp: new Date().toISOString()
    });
    setIsCheckoutModalOpen(false);
    setCheckoutMileage('');
    setCheckoutDamageNotes('');
    setCheckoutAdminSign('');
    setCheckoutCustSign('');
  };

  const submitCheckinInspection = (e) => {
    e.preventDefault();
    if (!checkinFuel || !checkinMileage) {
      toast.error('Return fuel level and mileage are required.');
      return;
    }
    completeInspection(selectedBooking.id, 'in', {
      fuel: parseInt(checkinFuel),
      mileage: parseInt(checkinMileage),
      damageAssessment: checkinAssessment || 'None',
      additionalCharges: parseFloat(checkinCharges || '0'),
      timestamp: new Date().toISOString()
    });
    setIsInInspectionModalOpen(false);
    setCheckinMileage('');
    setCheckinAssessment('');
    setCheckinCharges('0');
  };

  const submitCommLog = (e) => {
    e.preventDefault();
    if (!commContent.trim()) return;
    logCommunication(selectedBooking.id, commType, commContent);
    setCommContent('');
  };

  const submitPaymentRecord = (e) => {
    e.preventDefault();
    if (!payAmount) return;
    recordPayment(selectedBooking.id, parseFloat(payAmount), payMethod, payTxn);
    setPayAmount('');
    setPayTxn('');
  };

  const submitNote = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    addInternalNote(selectedBooking.id, noteContent, notePriority);
    setNoteContent('');
  };

  const submitReminder = (e) => {
    e.preventDefault();
    if (!reminderContent.trim() || !reminderDate) return;
    addFollowUpReminder(selectedBooking.id, reminderContent, reminderDate);
    setReminderContent('');
    setReminderDate('');
  };

  // Lifecycle Stages List
  const stages = [
    'Pending Review',
    'License Verified',
    'Contract Sent',
    'Contract Signed',
    'Payment Completed',
    'Driver Assigned',
    'Delivery Scheduled',
    'In Transit',
    'Delivered',
    'Active Rental',
    'Returned',
    'Completed'
  ];

  const getCurrentStageIndex = (status) => {
    if (status === 'Cancelled') return -1;
    // Map status variations
    let currentStatus = status;
    if (status === 'Payment Pending') currentStatus = 'Contract Signed';
    return stages.indexOf(currentStatus);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Bookings <span className="text-primary font-serif not-italic">Management</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Central Booking Ledger V.3.0</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          <div className="relative flex-1 xl:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search reservations ledger..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-primary/50 focus:outline-none focus:shadow-glow-primary transition-all placeholder:text-gray-600"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto custom-scrollbar">
        {['All', 'Pending', 'Active', 'Completed'].map(tab => (
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

      {/* Booking Table */}
      <div className="glass-panel overflow-hidden border-white/5 bg-[#111111]/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#111111]">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">Booking ID</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">Customer</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">Car</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">License Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">Contract Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">Delivery</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif">Booking Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-primary font-serif text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredBookings.map((booking, index) => (
                  <motion.tr 
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="p-4 text-xs font-bold text-white">{booking.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic uppercase">{booking.customer}</span>
                        <span className="text-[9px] font-bold text-gray-600 tracking-tighter">{booking.customerEmail}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-bold text-white uppercase">{booking.vehicleName}</td>
                    <td className="p-4 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                        booking.licenseStatus === 'Verified' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' : 'text-yellow-500 border-yellow-500/25 bg-yellow-500/5'
                      }`}>
                        {booking.licenseStatus}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                        booking.contractStatus === 'Signed' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' : 'text-amber-500 border-amber-500/25 bg-amber-500/5'
                      }`}>
                        {booking.contractStatus}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="text-gray-400 font-bold uppercase tracking-wider">{booking.deliveryStatus}</span>
                      {booking.driverName && booking.driverName !== 'Unassigned' && (
                        <p className="text-[8px] text-[#D4AF37] font-semibold">Driver: {booking.driverName}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleOpenDetails(booking)} 
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-black uppercase tracking-widest text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                      >
                        Manage Booking
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED TABBED DETAILS MODAL */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0A0A0A]/90 backdrop-blur-md"
              onClick={() => setSelectedBookingId(null)}
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-[#111111] border border-[#D4AF37]/25 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[95vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center bg-[#0A0A0A]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#D4AF37]/10 border border-[#D4AF37]/35 rounded-xl text-[#D4AF37]">
                    <Eye size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white font-serif">{selectedBooking.id} Control Room</h3>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Assigned Customer: {selectedBooking.customer}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedBookingId(null)} className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white"><X size={18} /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/5 bg-[#0D0D0D] px-6 overflow-x-auto custom-scrollbar">
                {['Overview', 'Customer', 'Vehicle', 'Contract', 'Payment', 'Delivery', 'Documents', 'Notes'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`px-4 py-3 text-[9px] font-black uppercase tracking-widest border-b-2 whitespace-nowrap transition-colors ${
                      detailTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content Panel */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-[#0A0A0A] space-y-6 max-h-[60vh] custom-scrollbar">
                
                {/* OVERVIEW TAB */}
                {detailTab === 'Overview' && (
                  <div className="space-y-6">
                    {/* Visual Lifecycle Progress Tracker */}
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-2 mb-4">Operations Lifecycle Stage</h5>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {stages.map((stage, idx) => {
                          const currentIdx = getCurrentStageIndex(selectedBooking.status);
                          const isCompleted = idx < currentIdx;
                          const isActive = idx === currentIdx;
                          return (
                            <div 
                              key={stage} 
                              className={`p-2.5 rounded-lg border text-center transition-all ${
                                isActive 
                                  ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-white shadow-glow-primary scale-[1.03]'
                                  : isCompleted
                                  ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400'
                                  : 'bg-white/5 border-white/5 text-gray-600'
                              }`}
                            >
                              <div className="text-[7px] font-black uppercase tracking-widest leading-none mb-1">
                                Stage {idx + 1}
                              </div>
                              <div className="text-[9px] font-bold truncate" title={stage}>
                                {stage}
                              </div>
                              {isCompleted && <Check size={10} className="mx-auto mt-1 text-emerald-400" />}
                              {isActive && <Zap size={10} className="mx-auto mt-1 text-[#D4AF37] animate-pulse" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Unverified License Block warning */}
                    {selectedBooking.licenseStatus === 'Pending Review' && (
                      <div className="bg-yellow-500/5 border border-yellow-500/25 p-4 rounded-xl flex items-center gap-3">
                        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Verification Lockout Active</p>
                          <p className="text-xs font-semibold text-gray-400 mt-0.5">Driver license verification required before proceeding.</p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div className="md:col-span-5 bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Itinerary Parameters</h5>
                        <div className="space-y-3 text-xs font-bold text-gray-400">
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Client Name</p>
                            <p className="text-white">{selectedBooking.customer}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Assigned Vehicle</p>
                            <p className="text-[#D4AF37] uppercase">{selectedBooking.vehicleName}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Lease Duration</p>
                            <p className="text-white">{selectedBooking.startDate} to {selectedBooking.endDate}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Operational Status</p>
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[8px] border uppercase ${getStatusColor(selectedBooking.status)}`}>
                              {selectedBooking.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-7 bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 font-serif">Workflow Operations Console</h5>
                        <div className="flex flex-wrap gap-2.5">
                          {/* License Verification */}
                          <button 
                            onClick={() => verifyLicense(selectedBooking.id, true)} 
                            className="px-3.5 py-2.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-colors"
                          >
                            Approve License
                          </button>
                          <button 
                            onClick={() => verifyLicense(selectedBooking.id, false)} 
                            className="px-3.5 py-2.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Reject License
                          </button>

                          {/* Contracts */}
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified'}
                            onClick={() => sendContract(selectedBooking.id)} 
                            className="px-3.5 py-2.5 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
                          >
                            Send Contract
                          </button>
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified'}
                            onClick={() => resendContract(selectedBooking.id)} 
                            className="px-3.5 py-2.5 bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                          >
                            Resend Contract
                          </button>
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified'}
                            onClick={() => signContract(selectedBooking.id)} 
                            className="px-3.5 py-2.5 bg-emerald-400 text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
                          >
                            Mark Contract Signed
                          </button>

                          {/* Payment */}
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified'}
                            onClick={() => { setDetailTab('Payment'); }} 
                            className="px-3.5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Record Payment
                          </button>

                          {/* Delivery & Logistics */}
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified'}
                            onClick={() => { setDetailTab('Delivery'); }} 
                            className="px-3.5 py-2.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                          >
                            Schedule Delivery / Assign Driver
                          </button>
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified' || selectedBooking.deliveryStatus !== 'Assigned'}
                            onClick={() => markInTransit(selectedBooking.id)} 
                            className="px-3.5 py-2.5 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                          >
                            Mark In Transit
                          </button>
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified' || selectedBooking.deliveryStatus !== 'In Transit'}
                            onClick={() => { setIsCheckoutModalOpen(true); }} 
                            className="px-3.5 py-2.5 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            Mark Delivered (Checkout Inspection)
                          </button>
                          <button 
                            disabled={selectedBooking.licenseStatus !== 'Verified' || selectedBooking.deliveryStatus !== 'Delivered'}
                            onClick={() => { setIsInInspectionModalOpen(true); }} 
                            className="px-3.5 py-2.5 bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
                          >
                            Mark Returned (Checkin Inspection)
                          </button>

                          {/* Cancel */}
                          <button 
                            onClick={() => cancelBooking(selectedBooking.id)} 
                            className="px-3.5 py-2.5 bg-red-950/40 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-900/40 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CUSTOMER TAB */}
                {detailTab === 'Customer' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Risk Management Profile */}
                      <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 flex items-center gap-1.5">
                          <ShieldAlert size={12} className="text-primary" /> Customer Risk Profile
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-xs font-bold text-gray-400">
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Risk Level</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              selectedBooking.riskProfile.riskLevel === 'High' ? 'text-red-500 border-red-500/20 bg-red-500/5' :
                              selectedBooking.riskProfile.riskLevel === 'Medium' ? 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5' :
                              'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                            }`}>
                              {selectedBooking.riskProfile.riskLevel}
                            </span>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Outstanding Balance</p>
                            <p className={`text-white ${selectedBooking.riskProfile.outstandingBalance > 0 ? 'text-red-400 font-bold' : ''}`}>
                              ${selectedBooking.riskProfile.outstandingBalance}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Previous Damage History</p>
                            <p className="text-white text-xs">{selectedBooking.riskProfile.damageHistory}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Blacklist Status</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                              selectedBooking.riskProfile.blacklisted ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-gray-400 border-white/10'
                            }`}>
                              {selectedBooking.riskProfile.blacklisted ? 'BLACKLISTED' : 'ACTIVE / CLEAR'}
                            </span>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Last Contacted Date</p>
                            <p className="text-white text-xs">{selectedBooking.lastContactedDate || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Contact card info */}
                      <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Contact Details</h5>
                        <div className="space-y-3 text-xs font-bold text-gray-400">
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">Email Address</p>
                            <p className="text-white">{selectedBooking.customerEmail}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest">License Status</p>
                            <p className="text-white uppercase">{selectedBooking.licenseStatus}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <a href={`tel:${selectedBooking.phone || '5550192'}`} className="px-3 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Call Customer</a>
                          <a href={`sms:${selectedBooking.phone || '5550192'}`} className="px-3 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Send SMS</a>
                          <a href={`https://wa.me/${selectedBooking.phone || '5550192'}`} className="px-3 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Open WhatsApp</a>
                          <button onClick={() => toast.success(`Email draft opened for ${selectedBooking.customerEmail}`)} className="px-3 py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-lg text-center text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all">Send Email</button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Log */}
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 mb-4">Communication History Timeline</h5>
                      <div className="space-y-4">
                        {selectedBooking.communications && selectedBooking.communications.length > 0 ? (
                          selectedBooking.communications.map((comm, idx) => (
                            <div key={idx} className="flex gap-4 items-start text-xs border-l border-white/10 pl-4 relative">
                              <span className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 bg-black border border-[#D4AF37] rounded-full flex items-center justify-center text-[8px] text-primary">
                                {comm.type[0]}
                              </span>
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center text-gray-500">
                                  <span className="font-black text-white tracking-widest uppercase">{comm.type}</span>
                                  <span>{new Date(comm.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-400 font-semibold">{comm.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 font-bold uppercase">No records logged yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* VEHICLE TAB */}
                {detailTab === 'Vehicle' && (
                  <div className="space-y-6">
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl grid grid-cols-2 md:grid-cols-3 gap-6 text-xs font-bold text-gray-400">
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Assigned Exotic</p>
                        <p className="text-white uppercase">{selectedBooking.vehicleName}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Vehicle Category</p>
                        <p className="text-white uppercase">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.type || 'Exotic'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">VIN Number</p>
                        <p className="text-white uppercase font-mono">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.vinNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Plate Number</p>
                        <p className="text-white uppercase">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.licensePlate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Active Mileage</p>
                        <p className="text-white">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.mileage || '1,200 mi'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Fuel level</p>
                        <p className="text-white">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.fuel || '95%'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Insurance Expiry</p>
                        <p className="text-white">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.insuranceExpiry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Registration Expiry</p>
                        <p className="text-white">{vehicles.find(v => v.id === selectedBooking.vehicleId)?.registrationExpiry || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Current Status</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-[8px] border uppercase ${
                          vehicles.find(v => v.id === selectedBooking.vehicleId)?.status === 'Available' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                          vehicles.find(v => v.id === selectedBooking.vehicleId)?.status === 'Maintenance' ? 'text-red-400 border-red-500/25 bg-red-500/5' :
                          'text-amber-500 border-amber-500/25 bg-amber-500/5'
                        }`}>
                          {vehicles.find(v => v.id === selectedBooking.vehicleId)?.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setDetailTab('Documents')} 
                        className="flex-1 py-3 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all"
                      >
                        Vehicle Documents Shortcut
                      </button>
                      <button 
                        onClick={() => {
                          if (selectedBooking.deliveryStatus === 'Delivered') {
                            setIsInInspectionModalOpen(true);
                          } else {
                            setIsCheckoutModalOpen(true);
                          }
                        }} 
                        className="flex-1 py-3 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/35 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#D4AF37] transition-all"
                      >
                        Vehicle Inspection Shortcut
                      </button>
                    </div>
                  </div>
                )}

                {/* CONTRACT TAB */}
                {detailTab === 'Contract' && (
                  <div className="space-y-6">
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                      <p className="text-xs font-bold text-gray-400 uppercase">Compact Agreement Parameters</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Contract Status:</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                          selectedBooking.contractStatus === 'Signed' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                          selectedBooking.contractStatus === 'Draft' ? 'text-gray-400 border-white/10' :
                          'text-amber-500 border-amber-500/25 bg-amber-500/5'
                        }`}>
                          {selectedBooking.contractStatus}
                        </span>
                      </div>

                      {/* Contract Action Buttons */}
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        <button 
                          disabled={selectedBooking.licenseStatus !== 'Verified'}
                          onClick={() => sendContract(selectedBooking.id)} 
                          className="px-3.5 py-2.5 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
                        >
                          Send Contract
                        </button>
                        <button 
                          disabled={selectedBooking.licenseStatus !== 'Verified'}
                          onClick={() => resendContract(selectedBooking.id)} 
                          className="px-3.5 py-2.5 bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                        >
                          Resend Contract
                        </button>
                        <button 
                          disabled={selectedBooking.licenseStatus !== 'Verified'}
                          onClick={() => signContract(selectedBooking.id)} 
                          className="px-3.5 py-2.5 bg-emerald-400 text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500 transition-colors"
                        >
                          Mark Signed
                        </button>
                        <button 
                          onClick={() => voidContract(selectedBooking.id)} 
                          className="px-3.5 py-2.5 bg-red-950/40 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-900/40 transition-colors"
                        >
                          Void Contract
                        </button>
                        <button 
                          onClick={() => archiveContract(selectedBooking.id)} 
                          className="px-3.5 py-2.5 bg-zinc-800 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          Archive Contract
                        </button>
                        <button 
                          onClick={() => toast.success('Contract PDF preview loaded.')} 
                          className="px-3.5 py-2.5 bg-white/5 border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-white/10"
                        >
                          Preview Contract
                        </button>
                        <button 
                          onClick={() => toast.success('Contract PDF Downloaded.')} 
                          className="px-3.5 py-2.5 bg-[#D4AF37] text-black text-[9px] font-bold uppercase tracking-widest rounded-lg"
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>

                    {/* Contract Timeline */}
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 mb-4">Contract Operations Timeline</h5>
                      <div className="space-y-3">
                        {selectedBooking.contractTimeline && selectedBooking.contractTimeline.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-gray-400 border-b border-white/5 pb-2">
                            <div>
                              <p className="font-bold text-white uppercase">{item.title}</p>
                              <p className="text-[10px] text-gray-500">{item.desc}</p>
                            </div>
                            <span className="text-[10px] text-gray-500">{new Date(item.date).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* PAYMENT TAB */}
                {detailTab === 'Payment' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-3 text-xs text-gray-400">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Receipt Parameters</h5>
                        <div className="flex justify-between">
                          <span>Invoice Number:</span>
                          <span className="text-white font-bold">{selectedBooking.paymentInfo.invoiceNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction ID:</span>
                          <span className="text-white font-mono">{selectedBooking.paymentInfo.transactionId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="text-white font-bold uppercase">{selectedBooking.paymentInfo.method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Invoice Status:</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold border uppercase ${
                            selectedBooking.paymentInfo.status === 'Paid' ? 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5' :
                            'text-amber-500 border-amber-500/25 bg-amber-500/5'
                          }`}>
                            {selectedBooking.paymentInfo.status}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-2 text-xs text-gray-400">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Pricing Breakdown</h5>
                        <div className="flex justify-between">
                          <span>Rental Amount:</span>
                          <span className="text-white font-bold">${selectedBooking.paymentInfo.rentalAmount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Security Deposit:</span>
                          <span className="text-white font-bold">${selectedBooking.paymentInfo.securityDeposit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxes (8%):</span>
                          <span className="text-white font-bold">${selectedBooking.paymentInfo.taxes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Fee:</span>
                          <span className="text-white font-bold">${selectedBooking.paymentInfo.deliveryFee}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/10 pt-2 font-black text-white">
                          <span>Grand Total:</span>
                          <span className="text-[#D4AF37]">${selectedBooking.paymentInfo.grandTotal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 mb-4">Operations</h5>
                      
                      <div className="flex flex-wrap gap-2.5 mb-4">
                        <button disabled={isGenerating} onClick={() => generateInvoicePDF('preview')} className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/10 disabled:opacity-50">Generate Invoice</button>
                        <button disabled={isGenerating} onClick={() => generateInvoicePDF('download')} className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg border border-white/10 disabled:opacity-50">Download Invoice</button>
                        <button onClick={() => refundPayment(selectedBooking.id)} className="px-3.5 py-2 bg-red-950/40 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-red-900/40">Refund Payment</button>
                        <button onClick={() => releaseDeposit(selectedBooking.id)} className="px-3.5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500/20">Release Deposit</button>
                      </div>

                      {selectedBooking.paymentInfo.status === 'Pending' && (
                        <form onSubmit={submitPaymentRecord} className="space-y-3 pt-2 border-t border-white/5">
                          <p className="text-xs text-white font-bold uppercase">Record Manual Settle Surcharge</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <input
                              type="number"
                              value={payAmount}
                              onChange={e => setPayAmount(e.target.value)}
                              className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                              placeholder="Amount ($)"
                            />
                            <input
                              type="text"
                              value={payTxn}
                              onChange={e => setPayTxn(e.target.value)}
                              className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                              placeholder="Transaction ID (Optional)"
                            />
                            <select
                              value={payMethod}
                              onChange={e => setPayMethod(e.target.value)}
                              className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-2 text-xs text-white focus:outline-none"
                            >
                              <option value="Credit Card">Credit Card</option>
                              <option value="Stripe">Stripe</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Cash">Cash</option>
                              <option value="Zelle">Zelle</option>
                            </select>
                          </div>
                          <button type="submit" className="w-full py-2 bg-[#D4AF37] text-black font-black uppercase text-[9px] tracking-widest rounded-lg">Record Settle Surcharge</button>
                        </form>
                      )}
                    </div>

                    {/* Payment History Timeline */}
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl font-bold text-xs text-gray-400">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 mb-4">Payment Timeline</h5>
                      <div className="space-y-3">
                        {selectedBooking.paymentTimeline && selectedBooking.paymentTimeline.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                            <div>
                              <p className="font-bold text-white uppercase">{item.title}</p>
                              <p className="text-[10px] text-gray-500">{item.desc}</p>
                            </div>
                            <span className="text-[10px] text-gray-500">{new Date(item.date).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* DELIVERY TAB */}
                {detailTab === 'Delivery' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-5 bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-3 text-xs text-gray-400">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Logistics Status</h5>
                      <div className="flex justify-between">
                        <span>Delivery address:</span>
                        <span className="text-white font-bold">{selectedBooking.deliveryInfo.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduled Date:</span>
                        <span className="text-white font-bold">{selectedBooking.deliveryInfo.scheduledDate ? new Date(selectedBooking.deliveryInfo.scheduledDate).toLocaleString() : 'Not Scheduled'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Driver:</span>
                        <span className="text-white font-bold">{selectedBooking.deliveryInfo.driverName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicle Assigned:</span>
                        <span className="text-[#D4AF37] font-bold uppercase">{selectedBooking.vehicleName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="text-white font-bold uppercase">{selectedBooking.deliveryInfo.status}</span>
                      </div>
                    </div>

                    <div className="md:col-span-7 bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1 font-serif">Logistics Dispatch Center</h5>
                      
                      {/* Driver filter: Only display "Available" status drivers */}
                      <div className="space-y-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Update parameters</p>
                        <div className="flex flex-wrap gap-2.5">
                          <button 
                            onClick={() => {
                              const ad = prompt("Enter delivery address:", selectedBooking.deliveryInfo.address);
                              const dt = prompt("Enter date & time (YYYY-MM-DDTHH:MM):", selectedBooking.deliveryInfo.scheduledDate || '2026-06-10T10:00');
                              if (ad && dt) scheduleDelivery(selectedBooking.id, ad, dt);
                            }}
                            className="px-3.5 py-2.5 bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Schedule Logistics Dispatch
                          </button>

                          {/* Driver assign select dropdown */}
                          <div className="flex gap-2 w-full mt-2">
                            <select
                              value={assignDriverId}
                              onChange={e => setAssignDriverId(e.target.value)}
                              className="bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none flex-1"
                            >
                              <option value="">Select Available Driver...</option>
                              {/* Filter drivers strictly to Available status */}
                              {drivers.filter(d => d.status === 'Available').map(d => (
                                <option key={d.id} value={d.id}>{d.name} ({d.deliveriesCount} deliveries)</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                if (!assignDriverId) return;
                                assignDriver(selectedBooking.id, assignDriverId);
                                setAssignDriverId('');
                              }}
                              className="px-4 py-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-lg"
                            >
                              Assign Driver
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-2">
                          <button 
                            disabled={selectedBooking.deliveryStatus !== 'Assigned'}
                            onClick={() => markInTransit(selectedBooking.id)} 
                            className="px-3 py-2 bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30"
                          >
                            Mark In Transit
                          </button>
                          <button 
                            disabled={selectedBooking.deliveryStatus !== 'In Transit'}
                            onClick={() => setIsCheckoutModalOpen(true)} 
                            className="px-3 py-2 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30"
                          >
                            Mark Delivered
                          </button>
                          <button 
                            disabled={selectedBooking.deliveryStatus !== 'Delivered'}
                            onClick={() => setIsInInspectionModalOpen(true)} 
                            className="px-3 py-2 bg-purple-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-30"
                          >
                            Mark Returned
                          </button>
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="pt-4 border-t border-white/5 space-y-2 text-xs font-bold text-gray-500">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Delivery Timeline Logs</p>
                        {selectedBooking.deliveryInfo.timeline && selectedBooking.deliveryInfo.timeline.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                            <span className="text-white">{item.title} ({item.desc})</span>
                            <span>{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* DOCUMENTS TAB */}
                {detailTab === 'Documents' && (
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Operational KYC & Document Ledger</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { title: 'Driver License Front', type: 'KYC', file: 'dl_front.jpg', desc: 'Valid until 2030' },
                        { title: 'Driver License Back', type: 'KYC', file: 'dl_back.jpg', desc: 'Valid until 2030' },
                        { title: 'Signed Contract', type: 'Contract', file: 'signed_contract.pdf', desc: 'Signed via DocuSign' },
                        { title: 'Insurance Certificate', type: 'Vehicle', file: 'insurance_cert.pdf', desc: 'Expires 2027-04-15' },
                        { title: 'Vehicle Registration', type: 'Vehicle', file: 'registration.pdf', desc: 'Expires 2027-08-30' },
                        { title: 'Vehicle Inspection Report', type: 'Operations', file: 'checkout_inspection.pdf', desc: 'Logged on checkout' },
                        { title: 'Damage Report', type: 'Operations', file: 'damage_assessment.pdf', desc: 'No active claims' },
                        { title: 'Delivery Handover Form', type: 'Operations', file: 'handover.pdf', desc: 'Signed by Admin & Cust' },
                        { title: 'Return Inspection Form', type: 'Operations', file: 'return_inspection.pdf', desc: 'Logged on checkin' }
                      ].map((doc, idx) => (
                        <div key={idx} className="bg-[#111111] border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest font-black">{doc.type}</span>
                              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase">LOGGED</span>
                            </div>
                            <p className="text-xs font-black text-white uppercase mt-1.5">{doc.title}</p>
                            <p className="text-[9px] font-bold text-gray-600 mt-0.5">{doc.desc}</p>
                          </div>
                          
                          <div className="flex gap-2 pt-2 border-t border-white/5">
                            <button disabled={isGenerating} onClick={() => generateDocumentPDF(doc, 'preview')} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold uppercase tracking-widest rounded border border-white/5 disabled:opacity-50">Preview</button>
                            <button disabled={isGenerating} onClick={() => generateDocumentPDF(doc, 'download')} className="flex-1 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-bold uppercase tracking-widest rounded border border-[#D4AF37]/25 disabled:opacity-50">Download</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NOTES & COMMUNICATIONS TAB */}
                {detailTab === 'Notes' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Log forms */}
                    <div className="md:col-span-5 space-y-6">
                      <form onSubmit={submitNote} className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Add Internal Note</h5>
                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 uppercase tracking-widest">Priority level</label>
                          <select
                            value={notePriority}
                            onChange={e => setNotePriority(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                          >
                            <option value="Low">Low Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="High">High Priority</option>
                            <option value="Urgent">Urgent Alert</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 uppercase tracking-widest">Note details</label>
                          <textarea
                            value={noteContent}
                            onChange={e => setNoteContent(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white h-20 resize-none"
                            placeholder="Type internal note here..."
                          />
                        </div>
                        <button type="submit" className="w-full py-2 bg-[#D4AF37] text-black text-[9px] font-black uppercase tracking-widest rounded-lg">Add Note</button>
                      </form>

                      <form onSubmit={submitReminder} className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Schedule Follow-up Reminder</h5>
                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 uppercase tracking-widest">Reminder Date</label>
                          <input
                            type="date"
                            value={reminderDate}
                            onChange={e => setReminderDate(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none [color-scheme:dark]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 uppercase tracking-widest">Message</label>
                          <textarea
                            value={reminderContent}
                            onChange={e => setReminderContent(e.target.value)}
                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white h-16 resize-none"
                            placeholder="Details of the follow up task..."
                          />
                        </div>
                        <button type="submit" className="w-full py-2 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-[#D4AF37]/25 text-[#D4AF37] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all">Schedule Reminder</button>
                      </form>
                    </div>

                    {/* Timeline logs */}
                    <div className="md:col-span-7 space-y-6">
                      <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Internal Notes Log</h5>
                        <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          {selectedBooking.notes && selectedBooking.notes.map((note, idx) => (
                            <div key={idx} className="p-2.5 bg-white/5 border border-white/5 rounded-lg">
                              <div className="flex justify-between text-[8px] text-gray-500 mb-1">
                                <span className={`font-black ${note.priority === 'Urgent' ? 'text-red-500' : 'text-primary'}`}>Priority: {note.priority}</span>
                                <span>{new Date(note.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-white text-xs font-semibold normal-case">{note.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unified Admin Activity Log */}
                      <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-primary border-b border-[#D4AF37]/10 pb-1">Admin Activity Log</h5>
                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          {selectedBooking.activityLogs && selectedBooking.activityLogs.map((log, idx) => (
                            <div key={idx} className="flex justify-between items-center py-1.5 border-b border-white/5">
                              <span className="text-white">{log.action}</span>
                              <span className="text-[8px] text-gray-600">{new Date(log.date).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10 bg-[#0A0A0A]/50 text-right">
                <button onClick={() => setSelectedBookingId(null)} className="px-10 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-black uppercase text-xs rounded-xl shadow-md transition-all hover:scale-[1.01]">
                  Done Managing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED CHECK-OUT INSPECTION MODAL */}
      <AnimatePresence>
        {isCheckoutModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsCheckoutModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#111111] border border-[#D4AF37]/25 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-2 mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Record Check-Out Inspection</h4>
                <button onClick={() => setIsCheckoutModalOpen(false)} className="p-1 text-gray-500 hover:text-white"><X size={16} /></button>
              </div>

              <form onSubmit={submitCheckoutInspection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Fuel level (%)</label>
                    <input
                      type="number"
                      value={checkoutFuel}
                      onChange={e => setCheckoutFuel(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mileage (mi)</label>
                    <input
                      type="number"
                      value={checkoutMileage}
                      onChange={e => setCheckoutMileage(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                      placeholder="e.g. 4820"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Damage Photos (Mock Upload)</label>
                  <input
                    type="text"
                    disabled
                    value="[Camera ready] Mock_damage_photos_linked.png"
                    className="w-full bg-[#0A0A0A]/50 border border-white/5 rounded-lg py-2 px-3 text-xs text-gray-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Damage Notes & Comments</label>
                  <textarea
                    value={checkoutDamageNotes}
                    onChange={e => setCheckoutDamageNotes(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white h-16 resize-none"
                    placeholder="Describe scratches, tire wear, rim scuffs or type 'None'"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Admin Signature (Print Name)</label>
                    <input
                      type="text"
                      value={checkoutAdminSign}
                      onChange={e => setCheckoutAdminSign(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                      placeholder="Admin Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Customer Signature (Print Name)</label>
                    <input
                      type="text"
                      value={checkoutCustSign}
                      onChange={e => setCheckoutCustSign(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                      placeholder="Customer Name"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase text-[9px] tracking-widest rounded-xl"
                  onClick={() => {
                    // Trigger delivery state change
                    setTimeout(() => markDelivered(selectedBooking.id), 100);
                  }}
                >
                  Complete Checkout & Confirm Delivery
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED CHECK-IN INSPECTION MODAL */}
      <AnimatePresence>
        {isInInspectionModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsInInspectionModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#111111] border border-[#D4AF37]/25 rounded-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex justify-between items-center border-b border-[#D4AF37]/15 pb-2 mb-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">Record Check-In Inspection</h4>
                <button onClick={() => setIsInInspectionModalOpen(false)} className="p-1 text-gray-500 hover:text-white"><X size={16} /></button>
              </div>

              <form onSubmit={submitCheckinInspection} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Return Fuel Level (%)</label>
                    <input
                      type="number"
                      value={checkinFuel}
                      onChange={e => setCheckinFuel(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Return Mileage (mi)</label>
                    <input
                      type="number"
                      value={checkinMileage}
                      onChange={e => setCheckinMileage(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                      placeholder="e.g. 4950"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Damage Assessment</label>
                  <textarea
                    value={checkinAssessment}
                    onChange={e => setCheckinAssessment(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white h-16 resize-none"
                    placeholder="Describe any new damages or specify 'None'"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Additional Surcharges ($)</label>
                  <input
                    type="number"
                    value={checkinCharges}
                    onChange={e => setCheckinCharges(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-xs text-white"
                    placeholder="Cleaning, low fuel or damage fees"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase text-[9px] tracking-widest rounded-xl"
                  onClick={() => {
                    // Trigger returned state change
                    setTimeout(() => markReturned(selectedBooking.id), 100);
                  }}
                >
                  Complete Checkin & Finalize Return
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Invoice PDF Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: 'white', color: 'black' }}>
        <div ref={invoiceRef} className="w-[800px] bg-white text-black p-12 font-sans relative">
          {selectedBooking && (
            <div>
              <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                  <h1 className="text-4xl font-serif font-bold uppercase tracking-widest text-black">GoFintaza</h1>
                  <p className="text-sm text-gray-600 mt-1">Premium Car Rental Services</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold uppercase text-gray-800">Invoice</h2>
                  <p className="text-lg font-mono font-bold mt-1">{selectedBooking.paymentInfo?.invoiceNumber || 'INV-TEMP'}</p>
                  <p className="text-sm text-gray-600">Issue Date: {selectedBooking.createdAt ? selectedBooking.createdAt.split('T')[0] : new Date().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Due Date: {selectedBooking.startDate || 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Invoice To</h3>
                  <p className="font-bold text-lg">{selectedBooking.customer}</p>
                  <p>{selectedBooking.customerEmail}</p>
                </div>
                <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Reservation Details</h3>
                  <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
                  <p><strong>Vehicle:</strong> {selectedBooking.vehicleName}</p>
                  <p><strong>Rental Period:</strong> {selectedBooking.startDate} to {selectedBooking.endDate}</p>
                  <p><strong>Invoice Status:</strong> <span className="uppercase font-bold text-amber-600">{selectedBooking.paymentInfo?.status || 'Pending'}</span></p>
                </div>
              </div>

              <div className="mb-8 text-sm">
                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Billing Breakdown</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-800 bg-gray-100 font-bold">
                      <th className="py-2 px-2 text-left">Description</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">
                        <span className="font-bold uppercase">{selectedBooking.vehicleName}</span><br/>
                        <span className="text-gray-500 text-xs">Exotic Rental Surcharge</span>
                      </td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo?.rentalAmount}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">Security Deposit (Refundable)</td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo?.securityDeposit}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">Taxes & Admin Fees (8%)</td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo?.taxes}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">Delivery & Logistics Dispatch Fee</td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo?.deliveryFee}</td>
                    </tr>
                    <tr className="border-b-2 border-black font-black">
                      <td className="py-4 px-2 text-xl text-right uppercase">Grand Total:</td>
                      <td className="py-4 px-2 text-xl text-right text-black">${selectedBooking.paymentInfo?.grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-300 pt-8">
                <p className="font-bold text-black uppercase tracking-wider mb-2">Thank you for your booking!</p>
                <p>For any questions regarding this invoice, contact billing@gofintaza.com</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Document PDF Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: 'white', color: 'black' }}>
        <div ref={docRef} className="w-[800px] bg-white text-black p-12 font-sans relative">
          {selectedBooking && activeDoc && (
            <div>
              <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                  <h1 className="text-4xl font-serif font-bold uppercase tracking-widest text-black">GoFintaza</h1>
                  <p className="text-sm text-gray-600 mt-1">Premium Car Rental Services</p>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold uppercase text-gray-800 font-serif">Operational KYC Ledger</h2>
                  <p className="text-sm text-gray-600 mt-1">Booking Ref: {selectedBooking.id}</p>
                  <p className="text-sm text-gray-600">Client: {selectedBooking.customer}</p>
                </div>
              </div>

              <div className="bg-gray-100 p-6 rounded-xl border border-gray-300 mb-8">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs uppercase text-gray-500 font-bold">Document Title</p>
                    <p className="text-lg font-bold uppercase">{activeDoc.title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 font-bold">Document Type / ID</p>
                    <p className="text-lg font-mono font-bold">{activeDoc.type} / {activeDoc.file}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 font-bold">Verification Status</p>
                    <p className="text-green-600 font-bold uppercase">VERIFIED & LOGGED</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-500 font-bold">Remarks</p>
                    <p className="text-gray-700 font-semibold">{activeDoc.desc}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Document Content based on Title */}
              <div className="border border-gray-300 p-8 rounded-xl min-h-[350px] bg-white">
                {activeDoc.title.includes('License') && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 font-serif">Driver License Record Card</h3>
                    <div className="border-4 border-dashed border-gray-400 p-8 rounded-2xl max-w-md mx-auto bg-gray-50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[9px] font-black tracking-widest px-4 py-1 uppercase transform rotate-45 translate-x-8 translate-y-3">
                        EXOTIC
                      </div>
                      <div className="flex gap-6 items-start">
                        <div className="w-24 h-32 bg-gray-200 rounded-lg flex flex-col items-center justify-center border border-gray-300 text-gray-400">
                          <User size={40} />
                          <span className="text-[8px] uppercase font-bold mt-2">PHOTO MOCK</span>
                        </div>
                        <div className="flex-1 space-y-2 text-xs">
                          <p className="text-lg font-black text-gray-800 uppercase leading-none">{selectedBooking.customer}</p>
                          <p className="text-gray-600 font-mono">DL NO: DL-{selectedBooking.id.split('-')[2] || '98734'}</p>
                          <p className="text-gray-600 font-mono">CLASS: C (NON-COMMERCIAL)</p>
                          <p className="text-gray-600 font-mono">EXPIRY: 2030-12-31</p>
                          <div className="pt-4 flex items-center gap-1.5 text-green-600 font-bold">
                            <CheckCircle2 size={16} />
                            <span>APPROVED BY GOFINTAZA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDoc.title.includes('Contract') && (
                  <div className="space-y-4 text-xs leading-relaxed text-gray-700">
                    <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 font-serif">Signed Lease Compact Waiver</h3>
                    <p>This document serves as proof of digital signature for the rental agreement associated with booking <strong>{selectedBooking.id}</strong>. The lessee, <strong>{selectedBooking.customer}</strong>, has fully acknowledged and signed the GoFintaza terms of lease on the vehicle <strong>{selectedBooking.vehicleName}</strong>.</p>
                    
                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg mt-6">
                      <p className="font-bold text-gray-800 uppercase tracking-widest mb-2">Signature telemetry logs</p>
                      <p className="font-mono text-[10px]"><strong>Lessee Signature:</strong> digital://{selectedBooking.customer.replace(/\s+/g, '').toLowerCase()}@gofintaza.com</p>
                      <p className="font-mono text-[10px]"><strong>Signature Status:</strong> {selectedBooking.contractStatus === 'Signed' ? 'SIGNED & EXECUTED' : 'AWAITING SIGNATURE'}</p>
                      <p className="font-mono text-[10px]"><strong>IP Verification:</strong> 192.168.1.104 (Authenticated SSL Session)</p>
                    </div>
                  </div>
                )}

                {activeDoc.title.includes('Insurance') && (
                  <div className="space-y-4 text-xs text-gray-700">
                    <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 font-serif">Certificate of Insurance Verification</h3>
                    <p>GoFintaza has verified the third-party automotive liability insurance for booking <strong>{selectedBooking.id}</strong>.</p>
                    <table className="w-full text-left mt-6 border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Policy Number</td>
                          <td className="font-mono text-gray-600 py-2">POL-EXOTIC-{selectedBooking.id.split('-')[2] || '40219'}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Liability Limit</td>
                          <td className="text-gray-600 py-2">$1,000,000 Combined Single Limit (CSL)</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Collision & Comprehensive</td>
                          <td className="text-gray-600 py-2">Verified ($2,500 Deductible pre-funded)</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Coverage Period</td>
                          <td className="text-gray-600 py-2">{selectedBooking.startDate} to {selectedBooking.endDate}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {activeDoc.title.includes('Registration') && (
                  <div className="space-y-4 text-xs text-gray-700">
                    <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 font-serif">Official Vehicle Registration Card</h3>
                    <p>State registration telemetry card details for the assigned vehicle.</p>
                    <table className="w-full text-left mt-6 border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Registered Vehicle</td>
                          <td className="text-gray-600 py-2 uppercase font-semibold">{selectedBooking.vehicleName}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Plate Number</td>
                          <td className="text-gray-600 font-mono py-2">LXR-905B</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">VIN / Chassis Ref</td>
                          <td className="text-gray-600 font-mono py-2">1FVHC8D5RSV209384</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Owner</td>
                          <td className="text-gray-600 py-2">GoFintaza Luxury Fleet LLC</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {!activeDoc.title.includes('License') && !activeDoc.title.includes('Contract') && !activeDoc.title.includes('Insurance') && !activeDoc.title.includes('Registration') && (
                  <div className="space-y-4 text-xs text-gray-700">
                    <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 border-b border-gray-200 pb-2 font-serif">{activeDoc.title}</h3>
                    <p>Operational logs and documentation verifying logistics delivery handover status and telemetry diagnostics parameters.</p>
                    <table className="w-full text-left mt-6 border-collapse text-xs">
                      <tbody>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Booking ID Ref</td>
                          <td className="text-gray-600 font-mono py-2">{selectedBooking.id}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Lessee Name</td>
                          <td className="text-gray-600 py-2">{selectedBooking.customer}</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Logistics Officer Signature</td>
                          <td className="text-gray-600 py-2">Marcus Chen (Operations Admin)</td>
                        </tr>
                        <tr className="border-b border-gray-200 py-2">
                          <td className="font-bold py-2">Verification Timestamp</td>
                          <td className="text-gray-600 font-mono py-2">{selectedBooking.createdAt}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mt-16 text-center text-xs text-gray-500 border-t border-gray-300 pt-8">
                <p className="font-bold text-black uppercase tracking-wider mb-2">GoFintaza Logistics Verification Protocol</p>
                <p>For operations audit requests, please contact dispatch@gofintaza.com</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
