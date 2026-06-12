import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-32 h-32 mb-8"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse"></div>
        <div className="relative w-full h-full bg-gradient-to-br from-[#161B26] to-[#0A0E17] border-2 border-primary/40 rounded-3xl flex items-center justify-center text-primary shadow-glow-primary">
          <Cpu size={48} strokeWidth={1.5} className="animate-pulse-slow" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-highlight rounded-xl flex items-center justify-center shadow-glow-accent border border-highlight/30">
          <ShieldAlert size={16} className="text-[#0A0E17]" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-4"
      >
        <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic italic">
          {title} <span className="text-primary">Offline</span>
        </h2>
        <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">Protocol Synchronization in Progress</p>
        <div className="h-1 w-24 bg-primary/20 mx-auto rounded-full overflow-hidden">
          <motion.div 
            animate={{ x: [-100, 100] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="h-full w-1/2 bg-primary shadow-glow-primary"
          ></motion.div>
        </div>
        <p className="text-gray-400 font-medium pt-4">
          The {title.toLowerCase()} telemetry interface is currently under construction for the AERO-DRIVE OS. Deployment scheduled for next phase.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/')}
        className="mt-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-white transition-colors group"
      >
        <ArrowLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> 
        Return to Command Center
      </motion.button>
    </div>
  );
};

export default ComingSoon;
