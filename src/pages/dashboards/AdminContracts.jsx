// src/pages/dashboards/AdminContracts.jsx
import React, { useState, useRef } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, Search, Eye, Send, CheckSquare, Trash2, Calendar, 
  User, Car, ShieldAlert, CheckCircle2, AlertTriangle, X,
  Mail, Phone, Clock, FileDown, Inbox, Archive, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminContracts = () => {
  const { 
    contracts, bookings, sendContract, signContract, archiveContract, restoreContract 
  } = useAdminState();

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedContractId, setSelectedContractId] = useState(null);
  const pdfRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Computed counts for top cards
  const totalContracts = contracts.length;
  const pendingSignatures = contracts.filter(c => c.status === 'Sent').length;
  const signedContracts = contracts.filter(c => c.status === 'Signed').length;
  const archivedContracts = contracts.filter(c => c.status === 'Archived').length;

  // Filtered contracts
  const filteredContracts = contracts.filter(c => {
    // Tab filter
    if (activeTab === 'Draft' && c.status !== 'Draft') return false;
    if (activeTab === 'Sent' && c.status !== 'Sent') return false;
    if (activeTab === 'Signed' && c.status !== 'Signed') return false;
    if (activeTab === 'Archived' && c.status !== 'Archived') return false;
    // Exclude archived from 'All' unless viewing 'Archived' tab explicitly
    if (activeTab === 'All' && c.status === 'Archived') return false;

    // Search filter
    const term = search.toLowerCase();
    return (
      c.id.toLowerCase().includes(term) ||
      c.customerName.toLowerCase().includes(term) ||
      c.vehicleName.toLowerCase().includes(term) ||
      c.bookingId.toLowerCase().includes(term)
    );
  });

  const selectedContract = contracts.find(c => c.id === selectedContractId) || (filteredContracts.length > 0 ? filteredContracts[0] : null);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Signed':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Sent':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Draft':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Archived':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const handleSend = (bookingId) => {
    sendContract(bookingId);
  };

  const handleSign = (bookingId) => {
    signContract(bookingId);
  };

  const handleArchive = (contractId) => {
    archiveContract(contractId);
  };

  const handleRestore = (contractId) => {
    restoreContract(contractId);
  };

  const generatePDF = async (action) => {
    if (!selectedContract) return;
    setIsGenerating(true);
    const loadingToast = toast.loading('Generating PDF...');
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
        pdf.save(`Contract_${selectedContract.id}.pdf`);
        toast.success('Contract PDF downloaded successfully.', { id: loadingToast });
      } else if (action === 'preview') {
        previewWindow.location.href = pdf.output('bloburl');
        toast.success('Previewing contract PDF...', { id: loadingToast });
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
            Contracts Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Execute, send, and audit legal compacts and telemetry waivers for fleet reservations.
          </p>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Contracts', val: totalContracts, desc: 'All active drafts & agreements', icon: FileText, color: 'text-[#D4AF37]' },
          { label: 'Pending Signatures', val: pendingSignatures, desc: 'Sent contracts awaiting sign', icon: Clock, color: 'text-blue-400' },
          { label: 'Signed Contracts', val: signedContracts, desc: 'Fully executed legal compacts', icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Archived Contracts', val: archivedContracts, desc: 'Archived / historical records', icon: Archive, color: 'text-gray-400' }
        ].map((card, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-2xl font-black text-white">{card.val}</h3>
              <p className="text-gray-600 text-[9px] font-semibold mt-0.5">{card.desc}</p>
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
          {['All', 'Draft', 'Sent', 'Signed', 'Archived'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-[#111111] border border-white/10 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/40 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-4 px-5">Contract ID</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Vehicle</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Created Date</th>
                  <th className="py-4 px-5">Rental Period</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500 text-sm">
                      No contracts matching current criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c) => (
                    <tr 
                      key={c.id}
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer group ${selectedContract?.id === c.id ? 'bg-white/[0.03]' : ''}`}
                      onClick={() => setSelectedContractId(c.id)}
                    >
                      <td className="py-4 px-5">
                        <span className="font-mono text-sm text-[#D4AF37] group-hover:underline">
                          {c.id}
                        </span>
                        <span className="block text-[10px] text-gray-500 font-mono mt-0.5">
                          {c.bookingId}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-medium text-white">
                        {c.customerName}
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-300">
                        {c.vehicleName}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-400 font-mono">
                        {c.createdDate}
                      </td>
                      <td className="py-4 px-5 text-xs text-gray-400 font-mono">
                        {c.startDate} to {c.endDate}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedContractId(c.id)}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            title="Preview Terms"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.status === 'Draft' && (
                            <button
                              onClick={() => handleSend(c.bookingId)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                              title="Send Contract"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {c.status === 'Sent' && (
                            <button
                              onClick={() => handleSign(c.bookingId)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                              title="Mark Signed"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                          )}
                          {c.status !== 'Archived' ? (
                            <button
                              onClick={() => handleArchive(c.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Archive Contract"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRestore(c.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                              title="Restore Contract"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Contract Console Pane */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-2xl relative h-fit space-y-6">
          {selectedContract ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wide">
                    {selectedContract.id}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Booking ref: {selectedContract.bookingId}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyle(selectedContract.status)}`}>
                  {selectedContract.status}
                </span>
              </div>

              {/* Customer Details */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Customer Details</h4>
                <div className="space-y-1.5 text-xs text-gray-400 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-white">{selectedContract.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-white">{selectedContract.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-white">{selectedContract.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address:</span>
                    <span className="text-white text-right max-w-[180px] truncate">{selectedContract.customerAddress}</span>
                  </div>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Vehicle Details</h4>
                <div className="space-y-1.5 text-xs text-gray-400 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vehicle Name:</span>
                    <span className="text-white uppercase">{selectedContract.vehicleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="text-white">{selectedContract.vehicleCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">License Plate:</span>
                    <span className="text-white uppercase">{selectedContract.licensePlate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rental Dates:</span>
                    <span className="text-white font-mono">{selectedContract.startDate} to {selectedContract.endDate}</span>
                  </div>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Pricing Summary</h4>
                <div className="space-y-1.5 text-xs text-gray-400 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Rental Amount:</span>
                    <span className="text-white">${selectedContract.pricing.rentalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Security Deposit:</span>
                    <span className="text-white">${selectedContract.pricing.securityDeposit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Taxes:</span>
                    <span className="text-white">${selectedContract.pricing.taxes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Fee:</span>
                    <span className="text-white">${selectedContract.pricing.deliveryFee}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5 font-bold">
                    <span className="text-white">Grand Total:</span>
                    <span className="text-[#D4AF37]">${selectedContract.pricing.grandTotal}</span>
                  </div>
                </div>
              </div>

              {/* Signature Status */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Signature Status</h4>
                <div className="space-y-1.5 text-xs text-gray-400 font-semibold">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="text-white uppercase font-bold">{selectedContract.signatureStatus}</span>
                  </div>
                  {selectedContract.signatureStatus === 'Signed' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Signed Date:</span>
                      <span className="text-white font-mono">{selectedContract.signedDate ? new Date(selectedContract.signedDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2 border-t border-white/5 pt-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#D4AF37]">Contract Timeline</h4>
                <div className="space-y-2">
                  {selectedContract.timeline && selectedContract.timeline.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] text-gray-500">
                      <span>{item.title}</span>
                      <span>{new Date(item.date).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 space-y-2">
                {selectedContract.status === 'Draft' && (
                  <button
                    onClick={() => handleSend(selectedContract.bookingId)}
                    className="w-full py-2.5 bg-[#D4AF37] hover:bg-[#cda632] text-black text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send Contract
                  </button>
                )}

                {selectedContract.status === 'Sent' && (
                  <button
                    onClick={() => handleSign(selectedContract.bookingId)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs uppercase tracking-widest font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4" /> Mark Signed
                  </button>
                )}

                {selectedContract.status !== 'Archived' ? (
                  <button
                    onClick={() => handleArchive(selectedContract.id)}
                    className="w-full py-2 bg-transparent hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs uppercase tracking-widest font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Archive Contract
                  </button>
                ) : (
                  <button
                    onClick={() => handleRestore(selectedContract.id)}
                    className="w-full py-2 bg-transparent hover:bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 text-blue-400 text-xs uppercase tracking-widest font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Restore Contract
                  </button>
                )}

                {/* PDF Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button disabled={isGenerating} onClick={() => generatePDF('preview')} className="py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded border border-white/5 disabled:opacity-50">Preview PDF</button>
                  <button disabled={isGenerating} onClick={() => generatePDF('download')} className="py-2 bg-white/5 hover:bg-white/10 text-white text-[9px] font-bold uppercase tracking-widest rounded border border-white/5 disabled:opacity-50">Download PDF</button>
                  <button onClick={() => toast.success(`Contract emailed to ${selectedContract.customerEmail}`)} className="py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-bold uppercase tracking-widest rounded border border-[#D4AF37]/25">Email PDF</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
              <FileText className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm">Select a contract from the table to inspect agreement details, sign, or archive.</p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden PDF Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', backgroundColor: 'white', color: 'black' }}>
        <div ref={pdfRef} className="w-[800px] bg-white text-black p-12 font-sans relative">
          {selectedContract && (
            <div>
              <div className="text-center mb-8 border-b-2 border-black pb-4">
                <h1 className="text-4xl font-serif font-bold uppercase tracking-widest text-black">GoFintaza</h1>
                <p className="text-sm text-gray-600 mt-1">Premium Car Rental Services</p>
                <h2 className="text-2xl font-bold mt-4 uppercase text-gray-800">Rental Contract Agreement</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Contract Details</h3>
                  <p><strong>Contract ID:</strong> {selectedContract.id}</p>
                  <p><strong>Booking ID:</strong> {selectedContract.bookingId}</p>
                  <p><strong>Status:</strong> {selectedContract.status}</p>
                  <p><strong>Created:</strong> {selectedContract.createdDate}</p>
                </div>
                <div>
                  <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Customer Details</h3>
                  <p><strong>Name:</strong> {selectedContract.customerName}</p>
                  <p><strong>Email:</strong> {selectedContract.customerEmail}</p>
                </div>
              </div>

              <div className="mb-8 text-sm">
                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Vehicle & Rental Details</h3>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">Vehicle:</td>
                      <td className="py-2">{selectedContract.vehicleName} ({selectedContract.vehicleCategory})</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">License Plate:</td>
                      <td className="py-2 uppercase">{selectedContract.licensePlate}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">Rental Period:</td>
                      <td className="py-2">{selectedContract.startDate} to {selectedContract.endDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-8 text-sm">
                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Pricing Summary</h3>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">Rental Amount:</td>
                      <td className="py-2">${selectedContract.pricing.rentalAmount}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">Security Deposit:</td>
                      <td className="py-2">${selectedContract.pricing.securityDeposit}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">Taxes:</td>
                      <td className="py-2">${selectedContract.pricing.taxes}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 font-semibold">Delivery Fee:</td>
                      <td className="py-2">${selectedContract.pricing.deliveryFee}</td>
                    </tr>
                    <tr className="border-b-2 border-black">
                      <td className="py-3 font-bold text-lg">Grand Total:</td>
                      <td className="py-3 font-bold text-lg">${selectedContract.pricing.grandTotal}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-12 text-sm">
                <h3 className="font-bold border-b border-gray-300 mb-2 uppercase text-gray-700">Terms & Conditions</h3>
                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                  1. The Renter agrees to operate the vehicle in a safe and legal manner.<br/>
                  2. The vehicle shall not be used for any illegal purposes or driven under the influence of alcohol or drugs.<br/>
                  3. The Renter is responsible for any damage, loss, or theft of the vehicle during the rental period.<br/>
                  4. The security deposit will be refunded upon safe return of the vehicle without any damages or pending fines.<br/>
                  5. In case of late return, additional charges will apply as per the standard hourly rate.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-12 mt-16 pt-8">
                <div className="text-center">
                  <div className="border-b border-black h-8 w-full relative">
                     {selectedContract.signatureStatus === 'Signed' && (
                       <span className="absolute bottom-1 w-full text-center font-serif text-xl text-blue-800 italic">Signed By {selectedContract.customerName}</span>
                     )}
                  </div>
                  <p className="mt-2 text-sm font-semibold">Customer Signature</p>
                  <p className="text-xs text-gray-500">Date: {selectedContract.signedDate ? new Date(selectedContract.signedDate).toLocaleDateString() : '____________'}</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-black h-8 w-full relative">
                     <span className="absolute bottom-1 w-full text-center font-serif text-lg text-black font-bold">GoFintaza Auth</span>
                  </div>
                  <p className="mt-2 text-sm font-semibold">Authorized Signatory</p>
                  <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContracts;
