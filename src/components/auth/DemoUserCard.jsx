import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const DemoUserCard = ({ user, onClick }) => {
  return (
    <motion.button
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(user)}
      className={`relative glass-panel !p-4 border border-white/5 flex items-center gap-4 text-left group hover:border-primary/50 transition-all overflow-hidden ${user.glow}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-[#0A0E17] font-black shadow-lg bg-gradient-to-br ${user.color} group-hover:scale-110 transition-transform`}>
        {user.name[0]}
        <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="flex-1 min-w-0 z-10">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-black text-white tracking-tight group-hover:text-primary transition-colors">{user.name}</h4>
          <span className="text-[8px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-black uppercase tracking-[0.1em]">
            {user.role}
          </span>
        </div>
        <p className="text-[10px] text-gray-600 font-bold mt-1 line-clamp-1 uppercase tracking-wider">{user.desc}</p>
      </div>
      
      <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-all">
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </motion.button>
  );
};

export default DemoUserCard;
