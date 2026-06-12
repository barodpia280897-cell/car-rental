// src/pages/dashboards/AdminPayments.jsx
import React, { useState, useRef } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  DollarSign, Search, CreditCard, CheckCircle2, RefreshCw, 
  FileSpreadsheet, ShieldAlert, ArrowUpRight, ArrowDownRight, Clock, Plus,
  FileText, X, AlertTriangle, Eye, Send, Download, Mail, Calendar, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminPayments = () => {
  const { 
    payments, bookings, vehicles, invoices, deposits, refunds,
    recordPayment, refundPayment, releaseDeposit, partialReleaseDeposit, forfeitDeposit
  } = useAdminState();

  const [activeTab, setActiveTab] = useState('Payments'); // 'Payments', 'Deposits', 'Refunds', 'Invoices'
  const [search, setSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const pdfRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state for recording manual payment
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordBookingId, setRecordBookingId] = useState('');
  const [recordAmount, setRecordAmount] = useState('');
  const [recordMethod, setRecordMethod] = useState('Credit Card');
  const [recordTxnRef, setRecordTxnRef] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordNotes, setRecordNotes] = useState('');

  // Partial Release Form
  const [isPartialReleaseOpen, setIsPartialReleaseOpen] = useState(false);
  const [partialBookingId, setPartialBookingId] = useState('');
  const [releaseAmount, setReleaseAmount] = useState('');
  const [forfeitAmount, setForfeitAmount] = useState('');

  // Search filter matching
  const matchesSearch = (item) => {
    const term = search.toLowerCase();
    const id = item.id || item.invoiceNumber || item.bookingId || '';
    const name = item.customerName || '';
    const carName = item.vehicleName || '';
    return id.toLowerCase().includes(term) || name.toLowerCase().includes(term) || carName.toLowerCase().includes(term);
  };

  // Lists filtered by search
  const filteredPayments = payments.filter(matchesSearch);
  const filteredInvoices = invoices.filter(matchesSearch);
  const filteredDeposits = deposits.filter(matchesSearch);
  const filteredRefunds = refunds.filter(matchesSearch);

  // Financial Stats calculation from state context
  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const securityDepositsHeld = deposits.filter(d => d.status === 'Held').reduce((sum, d) => sum + d.amount, 0);
  const refundsIssued = refunds.filter(r => r.status === 'Completed').reduce((sum, r) => sum + r.amount, 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
      case 'Released':
      case 'Approved':
      case 'Completed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending':
      case 'Held':
      case 'Sent':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Refunded':
      case 'Partially Released':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Overdue':
      case 'Forfeited':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Cancelled':
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const handleManualPaymentSubmit = (e) => {
    e.preventDefault();
    if (!recordBookingId || !recordAmount) {
      toast.error('Please specify booking reference and charge amount.');
      return;
    }
    recordPayment(recordBookingId, parseFloat(recordAmount), recordMethod, recordTxnRef);
    setIsRecordModalOpen(false);
    setRecordBookingId('');
    setRecordAmount('');
    setRecordTxnRef('');
    setRecordNotes('');
  };

  const handlePartialReleaseSubmit = (e) => {
    e.preventDefault();
    if (!partialBookingId || !releaseAmount) {
      toast.error('Specify release parameters.');
      return;
    }
    partialReleaseDeposit(partialBookingId, parseFloat(releaseAmount), parseFloat(forfeitAmount || 0));
    setIsPartialReleaseOpen(false);
    setPartialBookingId('');
    setReleaseAmount('');
    setForfeitAmount('');
  };

  const handleRefundSurcharge = (bookingId, amount) => {
    const reason = prompt('Specify refund reason:', 'Booking Cancellation');
    const method = prompt('Specify refund method (Credit Card/Stripe/Zelle/Cash):', 'Stripe');
    if (reason && method) {
      refundPayment(bookingId, amount, reason, method);
    }
  };

  // Determine currently selected item details
  const getSelectedItem = () => {
    if (!selectedItemId) return null;
    if (activeTab === 'Payments') return payments.find(p => p.id === selectedItemId);
    if (activeTab === 'Invoices') return invoices.find(i => i.invoiceNumber === selectedItemId);
    if (activeTab === 'Deposits') return deposits.find(d => d.id === selectedItemId);
    if (activeTab === 'Refunds') return refunds.find(r => r.id === selectedItemId);
    return null;
  };

  const selectedItem = getSelectedItem() || (activeTab === 'Payments' ? payments[0] : (activeTab === 'Invoices' ? invoices[0] : (activeTab === 'Deposits' ? deposits[0] : refunds[0])));

  // Find linked booking
  const selectedBooking = selectedItem ? bookings.find(b => b.id === selectedItem.bookingId) : null;

  const generateReceiptPDF = async (action) => {
    if (!selectedBooking) return;
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating Receipt PDF...');
    let previewWindow;
    if (action === 'preview') {
      previewWindow = window.open('about:blank', '_blank');
      if (!previewWindow) {
        toast.error('Popup blocked! Please allow popups for this site.', { id: loadingToast });
        setIsGenerating(false);
        return;
      }
    }
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      if (action === 'download') {
        const receiptNo = `REC-${selectedBooking.paymentInfo.invoiceNumber.split('-')[2] || selectedBooking.id}`;
        pdf.save(`Receipt_${receiptNo}.pdf`);
        toast.success('Receipt PDF downloaded successfully.', { id: loadingToast });
      } else if (action === 'preview') {
        previewWindow.location.href = pdf.output('bloburl');
        toast.success('Previewing receipt PDF...', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (previewWindow) previewWindow.close();
      toast.error('Failed to generate PDF', { id: loadingToast });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-serif uppercase tracking-widest text-[#D4AF37]">
            Payments & Audits
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track rental revenue, security deposits, invoices, refunds, and client payment cycles.
          </p>
        </div>
        <button
          onClick={() => setIsRecordModalOpen(true)}
          className="px-4 py-2.5 bg-[#D4AF37] hover:bg-[#cda632] text-black text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black" /> Record Payment
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', val: totalRevenue, desc: 'Fully settled rental transactions', icon: ArrowUpRight, color: 'text-emerald-400' },
          { label: 'Pending Payments', val: pendingPayments, desc: 'Awaiting deposit/invoice settle', icon: Clock, color: 'text-amber-500' },
          { label: 'Security Deposits Held', val: securityDepositsHeld, desc: 'Active escrows locked in vault', icon: CreditCard, color: 'text-[#D4AF37]' },
          { label: 'Refunds Issued', val: refundsIssued, desc: 'Total returned capital', icon: ArrowDownRight, color: 'text-red-400' }
        ].map((card, i) => (
          <div key={i} className="bg-[#111111] border border-white/5 p-5 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest block">{card.label}</span>
              <span className="text-2xl font-bold font-mono mt-1 text-white block">
                {formatCurrency(card.val)}
              </span>
              <span className="text-gray-600 text-[9px] font-semibold block mt-0.5">{card.desc}</span>
            </div>
            <div className={`p-3 bg-white/5 rounded-xl border border-white/10 ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex border-b border-white/5 p-1 bg-[#111] rounded-lg max-w-fit overflow-x-auto">
          {['Payments', 'Invoices', 'Deposits', 'Refunds'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedItemId(null); }}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#111111] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {activeTab === 'Payments' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-5">Transaction ID</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Car</th>
                    <th className="py-4 px-5">Type / Method</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Deposit</th>
                    <th className="py-4 px-5">Grand Total</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedItemId(p.id)} className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedItem?.id === p.id ? 'bg-white/[0.03]' : ''}`}>
                      <td className="py-4 px-5 font-mono text-xs text-[#D4AF37]">{p.id}<span className="block text-[8px] text-gray-500 font-mono">{p.bookingId}</span></td>
                      <td className="py-4 px-5 text-xs font-bold text-white">{p.customerName}</td>
                      <td className="py-4 px-5 text-xs text-gray-300">{p.vehicleName}</td>
                      <td className="py-4 px-5 text-xs text-gray-400 uppercase">{p.method}</td>
                      <td className="py-4 px-5 text-xs font-mono text-white">{formatCurrency(p.amount)}</td>
                      <td className="py-4 px-5 text-xs font-mono text-gray-400">{formatCurrency(p.deposit)}</td>
                      <td className="py-4 px-5 text-xs font-mono text-[#D4AF37]">{formatCurrency(p.grandTotal)}</td>
                      <td className="py-4 px-5"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(p.status)}`}>{p.status}</span></td>
                      <td className="py-4 px-5 text-[10px] text-gray-500 font-mono">{p.createdDate}</td>
                      <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                        {p.status === 'Pending' ? (
                          <button onClick={() => { setRecordBookingId(p.bookingId); setRecordAmount(p.amount); setIsRecordModalOpen(true); }} className="px-2 py-1 bg-[#D4AF37] text-black text-[9px] font-black uppercase rounded">Collect</button>
                        ) : (
                          p.status === 'Paid' && <button onClick={() => handleRefundSurcharge(p.bookingId, p.amount)} className="px-2 py-1 bg-red-950/40 text-red-400 border border-red-500/20 text-[9px] font-black uppercase rounded">Refund</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Invoices' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-5">Invoice Number</th>
                    <th className="py-4 px-5">Booking ID</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Vehicle</th>
                    <th className="py-4 px-5">Issue Date</th>
                    <th className="py-4 px-5">Due Date</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.invoiceNumber} onClick={() => setSelectedItemId(inv.invoiceNumber)} className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedItem?.invoiceNumber === inv.invoiceNumber ? 'bg-white/[0.03]' : ''}`}>
                      <td className="py-4 px-5 font-mono text-xs text-[#D4AF37]">{inv.invoiceNumber}</td>
                      <td className="py-4 px-5 text-xs text-gray-400 font-mono">{inv.bookingId}</td>
                      <td className="py-4 px-5 text-xs font-bold text-white">{inv.customerName}</td>
                      <td className="py-4 px-5 text-xs text-gray-300">{inv.vehicleName}</td>
                      <td className="py-4 px-5 text-[10px] text-gray-500 font-mono">{inv.issueDate}</td>
                      <td className="py-4 px-5 text-[10px] text-gray-500 font-mono">{inv.dueDate}</td>
                      <td className="py-4 px-5 text-xs font-mono text-white">{formatCurrency(inv.amount)}</td>
                      <td className="py-4 px-5"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(inv.status)}`}>{inv.status}</span></td>
                      <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => toast.success('Previewing Invoice')} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white"><Eye size={12} /></button>
                          <button onClick={() => toast.success('Downloading Invoice')} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-white"><Download size={12} /></button>
                          <button onClick={() => toast.success('Invoice Sent to Customer')} className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-[#D4AF37]"><Send size={12} /></button>
                          {inv.status !== 'Paid' && (
                            <button onClick={() => { setRecordBookingId(inv.bookingId); setRecordAmount(inv.amount); setIsRecordModalOpen(true); }} className="px-2 py-0.5 bg-emerald-500 text-black text-[8px] font-black uppercase rounded">Mark Paid</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Deposits' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-5">Deposit ID</th>
                    <th className="py-4 px-5">Booking ID</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Vehicle</th>
                    <th className="py-4 px-5">Deposit Amount</th>
                    <th className="py-4 px-5">Collected Date</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDeposits.map((d) => (
                    <tr key={d.id} onClick={() => setSelectedItemId(d.id)} className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedItem?.id === d.id ? 'bg-white/[0.03]' : ''}`}>
                      <td className="py-4 px-5 font-mono text-xs text-[#D4AF37]">{d.id}</td>
                      <td className="py-4 px-5 text-xs text-gray-400 font-mono">{d.bookingId}</td>
                      <td className="py-4 px-5 text-xs font-bold text-white">{d.customerName}</td>
                      <td className="py-4 px-5 text-xs text-gray-300">{d.vehicleName}</td>
                      <td className="py-4 px-5 text-xs font-mono text-white">{formatCurrency(d.amount)}</td>
                      <td className="py-4 px-5 text-[10px] text-gray-500 font-mono">{d.collectedDate || 'Not Captured'}</td>
                      <td className="py-4 px-5"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(d.status)}`}>{d.status}</span></td>
                      <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          {d.status === 'Held' && (
                            <>
                              <button onClick={() => releaseDeposit(d.bookingId)} className="px-2 py-0.5 bg-emerald-500 text-black text-[8px] font-black uppercase rounded">Release</button>
                              <button onClick={() => { setPartialBookingId(d.bookingId); setReleaseAmount(d.amount - 200); setForfeitAmount(200); setIsPartialReleaseOpen(true); }} className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase rounded">Partial</button>
                              <button onClick={() => forfeitDeposit(d.bookingId)} className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase rounded">Forfeit</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'Refunds' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-4 px-5">Refund ID</th>
                    <th className="py-4 px-5">Booking ID</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Amount</th>
                    <th className="py-4 px-5">Reason</th>
                    <th className="py-4 px-5">Method</th>
                    <th className="py-4 px-5">Date</th>
                    <th className="py-4 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRefunds.map((r) => (
                    <tr key={r.id} onClick={() => setSelectedItemId(r.id)} className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedItem?.id === r.id ? 'bg-white/[0.03]' : ''}`}>
                      <td className="py-4 px-5 font-mono text-xs text-[#D4AF37]">{r.id}</td>
                      <td className="py-4 px-5 text-xs text-gray-400 font-mono">{r.bookingId}</td>
                      <td className="py-4 px-5 text-xs font-bold text-white">{r.customerName}</td>
                      <td className="py-4 px-5 text-xs font-mono text-white">{formatCurrency(r.amount)}</td>
                      <td className="py-4 px-5 text-xs text-gray-300">{r.reason}</td>
                      <td className="py-4 px-5 text-xs text-gray-400 uppercase">{r.method}</td>
                      <td className="py-4 px-5 text-[10px] text-gray-500 font-mono">{r.createdDate}</td>
                      <td className="py-4 px-5"><span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] border uppercase ${getStatusColor(r.status)}`}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detailed Contract Console Pane */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-2xl relative h-fit space-y-6">
          {selectedItem ? (
            <div className="space-y-5">
              <div className="flex justify-between items-start border-b border-white/5 pb-3">
                <div>
                  <h3 className="text-base font-serif text-[#D4AF37] uppercase tracking-wide">
                    {selectedItem.id || selectedItem.invoiceNumber}
                  </h3>
                  <p className="text-[10px] text-gray-500 font-mono">Ref: {selectedItem.bookingId}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border uppercase ${getStatusColor(selectedItem.status)}`}>
                  {selectedItem.status}
                </span>
              </div>

              {/* Receipt Management */}
              {selectedBooking && selectedBooking.paymentStatus === 'Paid' && (
                <div className="bg-black/30 border border-white/5 p-4 rounded-xl space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37] border-b border-[#D4AF37]/10 pb-1">Receipt Manager</h4>
                  <div className="space-y-1 text-xs font-semibold text-gray-400">
                    <div className="flex justify-between">
                      <span>Receipt Number:</span>
                      <span className="text-white font-mono">REC-{selectedBooking.paymentInfo.invoiceNumber.split('-')[2]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer:</span>
                      <span className="text-white">{selectedBooking.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehicle Name:</span>
                      <span className="text-white uppercase">{selectedBooking.vehicleName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rental Surcharge:</span>
                      <span className="text-white">${selectedBooking.paymentInfo.rentalAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Deposit Captured:</span>
                      <span className="text-white">${selectedBooking.paymentInfo.securityDeposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes:</span>
                      <span className="text-white">${selectedBooking.paymentInfo.taxes}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-1 font-bold text-white">
                      <span>Grand Total:</span>
                      <span className="text-[#D4AF37]">${selectedBooking.paymentInfo.grandTotal}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
                    <button disabled={isGenerating} onClick={() => generateReceiptPDF('preview')} className="py-1 bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold uppercase tracking-widest rounded border border-white/5 disabled:opacity-50">Preview</button>
                    <button disabled={isGenerating} onClick={() => generateReceiptPDF('download')} className="py-1 bg-white/5 hover:bg-white/10 text-white text-[8px] font-bold uppercase tracking-widest rounded border border-white/5 disabled:opacity-50">Download</button>
                    <button onClick={() => toast.success(`Receipt emailed to ${selectedBooking.customerEmail}`)} className="py-1 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[8px] font-bold uppercase tracking-widest rounded border border-[#D4AF37]/25">Email</button>
                  </div>
                </div>
              )}

              {/* Payment Timeline */}
              {selectedBooking && (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Payment Timeline</h4>
                  <div className="space-y-2 border-l border-white/10 pl-3">
                    <div className="text-xs text-gray-500 font-semibold relative">
                      <span className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                      <p className="text-white font-bold uppercase">Invoice Generated</p>
                      <p className="text-[9px]">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                    </div>
                    {selectedBooking.contractStatus === 'Sent' && (
                      <div className="text-xs text-gray-500 font-semibold relative">
                        <span className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-blue-400"></span>
                        <p className="text-white font-bold uppercase">Invoice Sent</p>
                        <p className="text-[9px]">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                      </div>
                    )}
                    {selectedBooking.paymentStatus === 'Paid' && (
                      <>
                        <div className="text-xs text-gray-500 font-semibold relative">
                          <span className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
                          <p className="text-white font-bold uppercase">Payment Received</p>
                          <p className="text-[9px]">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold relative">
                          <span className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-purple-400"></span>
                          <p className="text-white font-bold uppercase">Deposit Collected</p>
                          <p className="text-[9px]">{new Date(selectedBooking.createdAt).toLocaleString()}</p>
                        </div>
                      </>
                    )}
                    {deposits.find(d => d.bookingId === selectedBooking.id)?.status === 'Released' && (
                      <div className="text-xs text-gray-500 font-semibold relative">
                        <span className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-gray-400"></span>
                        <p className="text-white font-bold uppercase">Deposit Released</p>
                        <p className="text-[9px]">{new Date().toLocaleString()}</p>
                      </div>
                    )}
                    {selectedBooking.paymentStatus === 'Refunded' && (
                      <div className="text-xs text-gray-500 font-semibold relative">
                        <span className="absolute -left-[16px] top-1.5 w-2 h-2 rounded-full bg-red-400"></span>
                        <p className="text-white font-bold uppercase">Refund Issued</p>
                        <p className="text-[9px]">{new Date().toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <DollarSign className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm">Select a transaction ledger item to review details, timeline, and invoice receipt parameters.</p>
            </div>
          )}
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRecordModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-md font-serif text-[#D4AF37] uppercase tracking-wider">Record Rental Payment</h3>
                <button onClick={() => setIsRecordModalOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleManualPaymentSubmit} className="space-y-4 text-xs font-bold text-gray-400">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500">Select Active Booking</label>
                  <select
                    value={recordBookingId}
                    onChange={(e) => {
                      setRecordBookingId(e.target.value);
                      const b = bookings.find(x => x.id === e.target.value);
                      if (b) {
                        setRecordAmount(b.paymentInfo?.grandTotal || b.totalPrice);
                        setRecordTxnRef(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
                      }
                    }}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2.5 px-3 text-xs text-white"
                    required
                  >
                    <option value="">Select Booking...</option>
                    {bookings.filter(b => b.paymentStatus !== 'Paid').map(b => (
                      <option key={b.id} value={b.id}>{b.id} — {b.customer} ({b.vehicleName})</option>
                    ))}
                  </select>
                </div>

                {recordBookingId && (
                  <div className="p-3 bg-black/40 border border-white/5 rounded-lg space-y-1 text-gray-400">
                    <p className="text-[8px] uppercase tracking-widest text-[#D4AF37]">Vehicle Information</p>
                    <p className="text-white uppercase">{bookings.find(b => b.id === recordBookingId)?.vehicleName}</p>
                    <p className="text-[10px]">Plate: {vehicles.find(v => v.id === bookings.find(b => b.id === recordBookingId)?.vehicleId)?.licensePlate}</p>
                    <p className="text-[10px]">Invoice Ref: {bookings.find(b => b.id === recordBookingId)?.paymentInfo.invoiceNumber}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500">Payment Amount ($)</label>
                    <input
                      type="number"
                      value={recordAmount}
                      onChange={e => setRecordAmount(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white"
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500">Payment Channel</label>
                    <select
                      value={recordMethod}
                      onChange={e => setRecordMethod(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-2 text-white"
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Stripe">Stripe</option>
                      <option value="Zelle">Zelle</option>
                      <option value="Cash App">Cash App</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Pay Later">Pay Later</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500">Transaction Reference</label>
                    <input
                      type="text"
                      value={recordTxnRef}
                      onChange={e => setRecordTxnRef(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white"
                      placeholder="Txn ID"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500">Payment Date</label>
                    <input
                      type="date"
                      value={recordDate}
                      onChange={e => setRecordDate(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-1.5 px-3 text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-widest text-gray-500">Notes</label>
                  <textarea
                    value={recordNotes}
                    onChange={e => setRecordNotes(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white h-12 resize-none"
                    placeholder="Transaction remarks..."
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[9px] rounded-xl">Record Payment</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PARTIAL RELEASE DEPOSIT MODAL */}
      <AnimatePresence>
        {isPartialReleaseOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPartialReleaseOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-sm bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-md font-serif text-[#D4AF37] uppercase tracking-wider">Partial Deposit Release</h3>
                <button onClick={() => setIsPartialReleaseOpen(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handlePartialReleaseSubmit} className="space-y-4 text-xs font-bold text-gray-400">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500">Release Amount ($)</label>
                    <input
                      type="number"
                      value={releaseAmount}
                      onChange={e => setReleaseAmount(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white"
                      placeholder="Release"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500">Forfeit Amount ($)</label>
                    <input
                      type="number"
                      value={forfeitAmount}
                      onChange={e => setForfeitAmount(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white"
                      placeholder="Forfeit"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black font-black uppercase tracking-widest text-[9px] rounded-xl">Confirm Release</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden Receipt PDF Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: 'white', color: 'black' }}>
        <div ref={pdfRef} className="w-[800px] bg-white text-black p-12 font-sans relative">
          {selectedBooking && (
            <div>
              <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
                <div>
                  <h1 className="text-4xl font-serif font-bold uppercase tracking-widest text-black">GoFintaza</h1>
                  <p className="text-sm text-gray-600 mt-1">Premium Car Rental Services</p>
                </div>
                <div className="text-right">
                  <h2 className="text-3xl font-bold uppercase text-gray-800">Receipt</h2>
                  <p className="text-lg font-mono font-bold mt-1">REC-{selectedBooking.paymentInfo.invoiceNumber.split('-')[2] || selectedBooking.id}</p>
                  <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Billed To</h3>
                  <p className="font-bold text-lg">{selectedBooking.customer}</p>
                  <p>{selectedBooking.customerEmail}</p>
                </div>
                <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Payment Info</h3>
                  <p><strong>Booking Ref:</strong> {selectedBooking.id}</p>
                  <p><strong>Invoice Ref:</strong> {selectedBooking.paymentInfo.invoiceNumber}</p>
                  <p><strong>Status:</strong> <span className="uppercase font-bold text-green-600">Paid</span></p>
                </div>
              </div>

              <div className="mb-8 text-sm">
                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Rental Details</h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-800 bg-gray-100">
                      <th className="py-2 px-2">Description</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">
                        <span className="font-bold uppercase">{selectedBooking.vehicleName}</span><br/>
                        <span className="text-gray-500 text-xs">Rental Surcharge</span>
                      </td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo.rentalAmount}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">Security Deposit Capture</td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo.securityDeposit}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-2">Taxes & Fees</td>
                      <td className="py-3 px-2 text-right">${selectedBooking.paymentInfo.taxes}</td>
                    </tr>
                    <tr className="border-b-2 border-black">
                      <td className="py-4 px-2 font-bold text-xl text-right uppercase">Total Paid:</td>
                      <td className="py-4 px-2 font-bold text-xl text-right">${selectedBooking.paymentInfo.grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-300 pt-8">
                <p className="font-bold text-black uppercase tracking-wider mb-2">Thank you for your business!</p>
                <p>If you have any questions concerning this receipt, contact us at billing@gofintaza.com</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
