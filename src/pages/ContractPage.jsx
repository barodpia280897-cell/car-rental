// src/pages/ContractPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  FileText, ShieldCheck, Edit, CheckSquare, 
  ArrowLeft, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { signContract } from '../store/bookingSlice';
import { toast } from 'react-hot-toast';

const rentalTerms = `1. VEHICLE USAGE AND LIMITATIONS
The Renter agrees that the leased vehicle will be driven solely by the authorized individuals listed in this agreement. The vehicle shall not be used for any illegal purposes, off-road driving, racing, or any activity that voids the insurance coverage.

2. INSURANCE AND LIABILITY
The Renter accepts full financial responsibility for any damage, loss, or theft of the vehicle during the rental period, up to the full value of the vehicle, unless covered by the provided insurance policy. A valid credit card must remain on file for the duration of the lease.

3. CONDITION OF VEHICLE
The Renter acknowledges receiving the vehicle in excellent condition. The Renter agrees to return the vehicle in the exact same condition, normal wear and tear excepted. Any interior damage, smoking, or excessive dirt will result in a detailing fee of no less than $500.

4. TELEMETRY AND MONITORING
For security and insurance purposes, all vehicles in our exotic fleet are equipped with GPS tracking and telemetry monitoring. The Renter consents to the collection of location, speed, and driving behavior data during the rental period.`;

const getContractTemplate = (id, customer, vehicle, dates) => `GOFINTAZA BESPOKE LEASE AGREEMENT
Reference ID: ${id}

This Luxury Vehicle Rental Agreement is made and entered into on this day by and between GoFintaza Elite Fleet ("Owner") and ${customer} ("Renter").

VEHICLE DETAILS
The Owner agrees to lease the following vehicle to the Renter:
Vehicle: ${vehicle}

LEASE PERIOD
The Renter shall have possession of the vehicle for the following period:
Dates: ${dates}

By signing below, the Renter acknowledges they have read, understood, and agreed to all Terms & Conditions specified in this document and the attached addendums.`;

const ContractPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { bookings } = useSelector(state => state.booking);
  
  // Find matching booking or default to first pending
  const booking = bookings.find(b => b.id === id) || bookings.find(b => b.status === 'Pending') || bookings[0];

  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');
  const [errors, setErrors] = useState({});

  if (!booking) {
    return (
      <div className="py-20 text-center glass-panel max-w-md mx-auto">
        <AlertTriangle className="mx-auto text-danger mb-6" size={48} />
        <h3 className="text-xl font-black text-white uppercase italic">No Pending Bookings</h3>
        <p className="text-gray-500 font-bold text-sm mt-2 uppercase tracking-widest">Sign contracts from your itineraries.</p>
        <button onClick={() => navigate('/bookings')} className="mt-6 px-6 py-3 bg-primary text-[#0A0E17] font-black uppercase text-xs rounded-xl">
          View Bookings
        </button>
      </div>
    );
  }

  const contractText = getContractTemplate(
    booking.id,
    booking.customer || 'Guest Customer',
    booking.vehicleName,
    `${booking.startDate} to ${booking.endDate}`
  );

  const handleSign = (e) => {
    e.preventDefault();
    const errs = {};
    if (!agreed) errs.agreed = 'You must accept the terms of the agreement';
    if (!signature.trim()) errs.signature = 'Signature is required to validate lease';

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Dispatch action to sign the contract (updates status to 'Pending Approval')
    dispatch(signContract(booking.id));
    toast.success('Lease agreement authorized. Awaiting Administrator verification.', {
      style: { background: '#111', color: '#7CFFB2', border: '1px solid #7CFFB2' }
    });
    navigate('/bookings');
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={() => navigate('/bookings')}
          className="p-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center gap-2 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Itineraries</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
          Agreement Reference: {booking.id}
        </span>
      </div>

      <header className="text-center space-y-4">
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
          Rental <span className="text-primary">Agreement</span>
        </h2>
        <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px]">
          Luxury Vehicle Rental Agreement
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Agreement Details & Signature */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. AGREEMENT PREVIEW */}
          <section className="glass-panel p-6 border-white/5 space-y-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-2">Agreement Preview</h3>
            <pre className="w-full bg-[#0A0E17] p-5 rounded-2xl border border-white/5 text-gray-400 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {contractText}
            </pre>
          </section>

          {/* 2. TERMS & CONDITIONS */}
          <section className="glass-panel p-6 border-white/5 space-y-4">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-2">Terms & Conditions</h3>
            <div className="h-60 overflow-y-auto bg-[#0A0E17] p-5 rounded-2xl border border-white/5 text-gray-400 text-xs leading-relaxed space-y-4 custom-scrollbar">
              {rentalTerms.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Interactive Signing Module */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleSign} className="glass-panel p-6 border-primary/20 bg-primary/[0.02] space-y-6 sticky top-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/20 rounded-xl text-primary shadow-glow-primary">
                <Edit size={20} />
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider italic">Sign Contract</h4>
            </div>

            {/* Checkbox Acceptance */}
            <div className="space-y-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 appearance-none w-5 h-5 rounded border border-white/10 checked:bg-primary/20 checked:border-primary/50 transition-all flex items-center justify-center after:content-['✓'] after:text-primary after:opacity-0 checked:after:opacity-100 after:text-xs"
                />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed group-hover:text-white transition-colors">
                  I have read, understood, and agree to all terms and conditions contained in this Rental Agreement.
                </span>
              </label>
              {errors.agreed && <p className="text-danger text-[9px] uppercase tracking-wider font-bold mt-1">{errors.agreed}</p>}
            </div>

            {/* Signature Input */}
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                Type Full Name Signature
              </label>
              <input 
                type="text" 
                placeholder="Renter's Full Name"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="w-full bg-[#0A0E17] border border-white/10 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
              />
              {errors.signature && <p className="text-danger text-[9px] uppercase tracking-wider font-bold mt-1">{errors.signature}</p>}
            </div>

            {/* Security Note */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex gap-3 text-left">
              <ShieldCheck className="text-accent shrink-0" size={16} />
              <p className="text-[9px] text-gray-500 leading-relaxed uppercase tracking-wider font-semibold">
                This electronic signature confirms acceptance of all rental terms and conditions and is legally binding.
              </p>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-[#0A0E17] font-black uppercase tracking-[0.2em] rounded-xl text-xs shadow-glow-primary hover:scale-[1.02] transition-all flex justify-center items-center gap-2"
            >
              <CheckCircle size={14} /> Accept Contract
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContractPage;
