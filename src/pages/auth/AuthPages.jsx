import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft, ChevronRight, ShieldCheck, Fingerprint, RefreshCcw } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';

export const Register = () => (
  <AuthLayout title="Initialization" subtitle="Register your identity on the AERO-DRIVE mobility grid.">
    <form className="space-y-6">
      <div className="space-y-4">
        <div className="relative group">
          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
          <input type="text" placeholder="Legal Identity Name" className="w-full bg-[#111827]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 focus:bg-[#111827]/80 transition-all placeholder:text-gray-700" />
        </div>
        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
          <input type="email" placeholder="Communication Node (Email)" className="w-full bg-[#111827]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 focus:bg-[#111827]/80 transition-all placeholder:text-gray-700" />
        </div>
        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
          <input type="password" placeholder="Encryption Key (Password)" className="w-full bg-[#111827]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 focus:bg-[#111827]/80 transition-all placeholder:text-gray-700" />
        </div>
      </div>
      <button className="w-full py-5 bg-primary text-[#0A0A0A] font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group text-xs italic">
        Register Identity <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
      </button>
      <p className="text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
        Identity already exists? <Link to="/login" title="Login" className="text-primary hover:text-white transition-colors border-b border-primary/20">Authorize Session</Link>
      </p>
    </form>
  </AuthLayout>
);

export const ForgotPassword = () => (
  <AuthLayout title="Key Recovery" subtitle="Broadcast a recovery signal to your registered node.">
    <form className="space-y-8">
      <div className="relative group">
        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
        <input type="email" placeholder="Communication Node (Email)" className="w-full bg-[#111827]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 focus:bg-[#111827]/80 transition-all placeholder:text-gray-700" />
      </div>
      <button className="w-full py-5 bg-primary text-[#0A0A0A] font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-[1.01] transition-all text-xs italic">
        Transmit Recovery Signal
      </button>
      <Link to="/login" title="Back" className="flex items-center justify-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]">
        <ArrowLeft size={14} strokeWidth={3} /> Abort Recovery
      </Link>
    </form>
  </AuthLayout>
);

export const OTPVerification = () => (
  <AuthLayout title="Pulse Sync" subtitle="Enter the 6-digit synchronization code sent to your device.">
    <div className="space-y-10">
      <div className="flex justify-between gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <input 
            key={i} 
            type="text" 
            maxLength="1" 
            className="w-14 h-16 bg-[#111827]/50 border border-white/5 rounded-2xl text-center text-2xl font-black text-primary focus:outline-none focus:border-primary/50 focus:shadow-glow-primary transition-all shadow-glass"
          />
        ))}
      </div>
      <button className="w-full py-5 bg-primary text-[#0A0A0A] font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-[1.01] transition-all text-xs italic">
        Synchronize Pulse
      </button>
      <p className="text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
        No signal received? <button className="text-primary hover:text-white transition-colors">Retransmit OTP</button>
      </p>
    </div>
  </AuthLayout>
);

export const LockScreen = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8 relative overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    <div className="absolute inset-0 z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
    </div>
    
    <div className="glass-panel !p-12 max-w-sm w-full text-center space-y-10 relative z-10 border-primary/20">
      <div className="relative inline-block group">
        <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-xl group-hover:bg-primary/50 transition-all"></div>
        <div className="relative w-28 h-28 bg-gradient-to-br from-[#111111] to-[#0A0A0A] border-2 border-primary/40 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-glow-primary">
          AR
        </div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent border-4 border-[#111111] rounded-xl shadow-glow-accent" />
      </div>
      
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Grid Locked</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2">Resume Session: Alex Rivera</p>
      </div>

      <div className="relative group">
        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
        <input type="password" placeholder="Key Phrase" className="w-full bg-[#0A0A0A] border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-700" />
      </div>

      <button className="w-full py-5 bg-primary text-[#0A0A0A] font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary hover:scale-[1.01] transition-all text-xs italic flex items-center justify-center gap-3">
        <Fingerprint size={20} /> Re-Authorize
      </button>
    </div>
  </div>
);

export const SessionExpired = () => (
  <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8 relative overflow-hidden">
     <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#EF4444 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
     
    <div className="glass-panel !p-12 max-w-md w-full text-center space-y-8 border-danger/20">
      <div className="relative w-24 h-24 bg-danger/10 text-danger rounded-3xl flex items-center justify-center mx-auto border border-danger/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <RefreshCcw size={48} strokeWidth={3} className="animate-spin-slow" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">Link Severed</h2>
        <p className="text-gray-500 font-medium leading-relaxed">Your telemetry session has timed out due to grid inactivity. Secure re-authorization is required.</p>
      </div>

      <Link to="/login" title="Re-Link" className="flex items-center justify-center gap-3 w-full py-5 bg-danger text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_35px_rgba(239,68,68,0.5)] transition-all text-xs italic">
        <ShieldCheck size={20} /> Establish New Link
      </Link>
    </div>
  </div>
);
