import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, UploadCloud, FileCheck, ShieldCheck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const CustomerDocs = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            Digital <span className="text-primary">Vault</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">Compliance & Identity Documents</p>
        </div>
        <button className="px-6 py-3 bg-primary text-[#0A0E17] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-glow-primary hover:scale-105 transition-transform flex items-center gap-2">
          <UploadCloud size={16} /> Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
        {/* Document List */}
        <div className="lg:col-span-2 space-y-6">
           <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Required Identity Files</h3>
           
           <div className="space-y-4">
              {[
                { name: 'Driver\'s License (Front)', status: 'Verified', date: 'May 10, 2026', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
                { name: 'Driver\'s License (Back)', status: 'Verified', date: 'May 10, 2026', icon: CheckCircle2, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
                { name: 'Proof of Insurance', status: 'Pending Review', date: 'May 14, 2026', icon: Clock, color: 'text-highlight', bg: 'bg-highlight/10 border-highlight/20' },
                { name: 'International Driving Permit', status: 'Missing', date: 'Required for EU', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-white/5 border-white/10' },
              ].map((doc, i) => (
                 <motion.div 
                    key={i} 
                    whileHover={{ x: 5 }}
                    className={`flex items-center justify-between p-5 glass-panel border ${doc.bg} group cursor-pointer`}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${doc.color}`}>
                          <doc.icon size={20} />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-white tracking-wide">{doc.name}</h4>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{doc.date}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${doc.color}`}>{doc.status}</span>
                       <button className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                          <Download size={16} />
                       </button>
                    </div>
                 </motion.div>
              ))}
           </div>

           <h3 className="text-lg font-black text-white uppercase italic tracking-tight pt-4">Rental Agreements</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                 { id: 'AGR-4921', car: 'Model S Plaid', date: 'May 12, 2026' },
                 { id: 'AGR-3810', car: 'Lucid Air Grand', date: 'Apr 20, 2026' },
              ].map(agr => (
                 <div key={agr.id} className="p-5 glass-panel border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                       <FileText size={20} className="text-gray-500 group-hover:text-primary transition-colors" />
                       <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 font-black tracking-widest">{agr.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{agr.car}</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{agr.date}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Security Info */}
        <div className="space-y-6">
           <div className="glass-panel p-8 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-glow-primary">
                 <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Zero-Trust Security</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-medium mb-6">
                 Your identity documents are encrypted at rest using AES-256 and are only accessible by authorized compliance nodes. AERO-DRIVE guarantees complete data sovereignty.
              </p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">End-to-End Encryption</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Automated Redaction</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Biometric Linked</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDocs;
