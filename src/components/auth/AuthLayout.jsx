import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, UserCheck, ShieldCheck, Star, ArrowLeft } from 'lucide-react';
import carLogo from '../../assets/carlogo.jpg';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A] selection:bg-primary/30 selection:text-white">
      {/* Left Side: Cinematic Automotive Visual - Sticky on Desktop */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen overflow-hidden bg-[#0A0A0A]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1200"
            alt="Luxury Car"
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-[#0A0A0A]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
        </div>

        {/* Brand Overlay */}
        <div className="relative z-10 p-16 flex flex-col justify-between w-full">
          <Link to="/" className="flex items-center gap-4 cursor-pointer group">
            <img src={carLogo} className="w-20 h-20 rounded-2xl border-2 border-primary/40 object-cover shadow-glow-primary group-hover:border-primary transition-all" alt="GoFintaza Logo" />
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-primary font-serif uppercase group-hover:text-accent transition-colors">GoFintaza</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70 font-black mt-0.5">Luxury Rental Experience</p>
            </div>
          </Link>

          <div className="space-y-10">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <h2 className="text-6xl font-black leading-tight tracking-tight text-white uppercase italic font-serif">
                LUXURY <br />
                <span className="text-primary">FLEET.</span>
              </h2>
              <p className="text-gray-400 text-xl font-medium max-w-md leading-relaxed border-l-2 border-primary/30 pl-6">
                An elite fleet of exotic vehicles, tailored for an incomparable driving experience and absolute convenience.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-6 max-w-lg">
              {[
                { icon: Car, label: 'Elite Fleet', val: 'Exotics Catalog' },
                { icon: UserCheck, label: 'Concierge', val: 'VIP Dedicated' },
                { icon: ShieldCheck, label: 'Fully Insured', val: 'Max Liability' },
                { icon: Star, label: 'VIP Access', val: 'Global Priority' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="glass-panel !p-5 border-white/5 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                >
                  <div className="p-3 rounded-xl bg-white/5 text-primary group-hover:shadow-glow-primary transition-all">
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">{stat.label}</p>
                    <p className="text-sm font-black text-white">{stat.val}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex gap-8">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              GOFINTAZA LUXURY PORTAL v4.2.0
            </span>
            <a href="#" className="hover:text-white transition-colors">Rental Policy</a>
            <a href="#" className="hover:text-white transition-colors">Access Protocols</a>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
      </div>

      {/* Right Side: Auth Form - Scrollable */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-16 px-6 lg:px-12 relative bg-[#0A0A0A] min-h-screen">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Back to Home Button */}
        <div className="absolute top-8 right-8 z-20">
          <Link to="/" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-primary transition-colors border border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/20 px-4 py-2.5 rounded-xl">
            <ArrowLeft size={12} strokeWidth={3} /> Back to Website
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg space-y-10 relative z-10"
        >
          <div className="text-center lg:text-left space-y-3">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
              <div className="h-1 w-12 bg-primary rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Security Layer 01</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none font-serif">{title}</h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
