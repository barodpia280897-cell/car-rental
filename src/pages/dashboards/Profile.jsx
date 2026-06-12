import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, 
  ShieldCheck, Star, Edit3, Settings, LogOut,
  Camera, CheckCircle2, FileText, Upload,
  DollarSign, TrendingUp, Target, Calendar
} from 'lucide-react';
import { useAdminState } from '../../context/adminStateContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { role } = useSelector(state => state.auth);
  const { drivers } = useAdminState();
  const isDriver = role === 'DRIVER';

  // Find Driver Wilson
  const currentUser = drivers.find(d => d.name === 'David Wilson') || drivers[0];

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || 'David Wilson',
    phone: currentUser?.phone || '(555) 321-4567',
    email: currentUser?.email || 'david@gofintaza.com',
    address: currentUser?.address || '128 Beverly Dr, Beverly Hills, CA',
    licenseNumber: currentUser?.licenseNumber || 'DL-908234-A',
    commercialLicenseNumber: currentUser?.commercialLicenseNumber || 'CDL-40918-B',
    emergencyName: currentUser?.emergencyContact?.name || 'Linda Wilson',
    emergencyPhone: currentUser?.emergencyContact?.phone || '(555) 321-9988'
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Driver information updated successfully.');
  };

  const documentCenter = [
    { name: 'Commercial Driver License (CDL)', number: profileData.commercialLicenseNumber, status: currentUser?.comDocumentStatus || 'Valid', expiry: currentUser?.comExpiry || '2027-10-22', uploadDate: '2025-04-15' },
    { name: 'Government ID / Passport', number: profileData.licenseNumber, status: currentUser?.licDocumentStatus || 'Valid', expiry: currentUser?.licExpiry || '2027-05-15', uploadDate: '2025-04-12' },
    { name: 'Background Check Certificate', number: 'BC-89028-C', status: 'Valid', expiry: '2028-04-12', uploadDate: '2025-04-10' },
    { name: 'Medical Certificate', number: 'MC-11092-D', status: currentUser?.medDocumentStatus || 'Valid', expiry: currentUser?.medExpiry || '2027-02-18', uploadDate: '2025-04-12' },
    { name: 'Insurance Certificate', number: 'IC-20293-A', status: currentUser?.insDocumentStatus || 'Valid', expiry: currentUser?.insExpiry || '2026-12-05', uploadDate: '2025-04-14' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Valid':
      case 'Approved':
        return 'bg-green-500/10 border-green-500/30 text-green-500';
      case 'Expiring Soon':
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
      case 'Expired':
        return 'bg-red-500/10 border-red-500/30 text-red-500';
      default:
        return 'bg-white/5 border-white/10 text-gray-400';
    }
  };

  return (
    <div className="w-full space-y-10 pb-12">
      {/* Header / Cover */}
      <div className="relative">
        <div className="h-48 rounded-[3rem] bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border border-white/5 overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        </div>
        <div className="px-6 md:px-12 -mt-16 flex flex-col md:flex-row items-end gap-8 relative z-10">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-[#0A0A0A] border-4 border-[#0A0A0A] shadow-glow-primary overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover" alt="Profile" />
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-primary text-black rounded-xl shadow-glow-primary hover:scale-110 transition-all">
                 <Camera size={16} />
              </button>
           </div>
           <div className="flex-1 pb-4">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                 <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase font-serif">{profileData.name}</h2>
                 <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-lg shadow-glow-primary">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                       <ShieldCheck size={12} /> Certified Professional Driver
                    </span>
                 </div>
              </div>
              <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
                 Driver Partner since {currentUser?.joinedDate || '2025-04-12'} • Verified Identity
              </p>
           </div>
           <div className="flex gap-3 pb-4">
              {isEditing ? (
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-primary text-black rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all flex items-center gap-2"
                >
                   <CheckCircle2 size={16} /> Save Changes
                </button>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                   <Edit3 size={16} /> Edit Profile
                </button>
              )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-10">
           
           {/* Driver Information Section */}
           <section className="glass-panel p-8 border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Driver Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <User size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Full Name</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.name}</p>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Mail size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Email Address</p>
                       {isEditing ? (
                          <input 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.email}</p>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Phone size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Phone Number</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.phone}</p>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <MapPin size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Residential Address</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.address}</p>
                       )}
                    </div>
                 </div>
              </div>
           </section>

           {/* Professional Information Section */}
           <section className="glass-panel p-8 border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <FileText size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">CDL License Number</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.commercialLicenseNumber}
                            onChange={(e) => setProfileData({ ...profileData, commercialLicenseNumber: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.commercialLicenseNumber}</p>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <FileText size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Government ID Number</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.licenseNumber}
                            onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.licenseNumber}</p>
                       )}
                    </div>
                 </div>
              </div>
           </section>

           {/* Emergency Contact */}
           <section className="glass-panel p-8 border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <User size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Contact Name</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.emergencyName}
                            onChange={(e) => setProfileData({ ...profileData, emergencyName: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.emergencyName}</p>
                       )}
                    </div>
                 </div>

                 <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Phone size={18} className="text-gray-600" />
                    <div className="flex-1">
                       <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Contact Phone</p>
                       {isEditing ? (
                          <input 
                            type="text" 
                            value={profileData.emergencyPhone}
                            onChange={(e) => setProfileData({ ...profileData, emergencyPhone: e.target.value })}
                            className="bg-[#0A0A0A] border border-primary/30 rounded-lg px-2 py-1 text-xs font-bold text-white w-full mt-1 focus:outline-none focus:border-primary"
                          />
                       ) : (
                          <p className="text-xs font-bold text-white">{profileData.emergencyPhone}</p>
                       )}
                    </div>
                 </div>
              </div>
           </section>

           {/* Driver Documents */}
           <section className="glass-panel p-8 border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Driver DocumentsHub</h3>
              <div className="space-y-4">
                 {documentCenter.map((doc, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                       <div className="flex items-start gap-4">
                          <div className="p-3 bg-white/5 rounded-xl text-gray-400 mt-1 shrink-0">
                             <FileText size={20} />
                          </div>
                          <div>
                             <h4 className="text-xs font-black text-white uppercase tracking-tight">{doc.name}</h4>
                             <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">ID: {doc.number} • Uploaded: {doc.uploadDate}</p>
                             <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">Expiry Date: {doc.expiry}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3 self-end sm:self-auto">
                          <span className={`px-2.5 py-1 border rounded-lg text-[8px] font-black uppercase tracking-widest ${getStatusBadge(doc.status)}`}>
                             {doc.status}
                          </span>
                          <button className="p-2 bg-white/5 border border-white/10 hover:border-primary/30 rounded-xl text-gray-400 hover:text-white transition-all">
                             <Upload size={14} />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
           </section>

           {/* Driver Metrics */}
           <section className="glass-panel p-8 border-white/5 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-8">Driver Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                    { icon: Target, label: 'Completion Rate', desc: '98.4% On-time deliveries completed' },
                    { icon: Star, label: 'Driver Rating', desc: '4.95 / 5.0 (Global Rank #12)' },
                    { icon: TrendingUp, label: 'Safety Index', desc: '99% Clean, collision-free history' },
                 ].map((stat, i) => (
                    <div key={i} className="space-y-3 group">
                       <div className="p-3 bg-white/5 rounded-xl text-primary w-fit group-hover:shadow-glow-primary transition-all">
                          <stat.icon size={20} />
                       </div>
                       <h4 className="text-sm font-black text-white uppercase italic tracking-tight font-serif">{stat.label}</h4>
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">{stat.desc}</p>
                    </div>
                 ))}
              </div>
           </section>
        </div>

        {/* Sidebar Wallet & Activity Timeline */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass-panel p-8 border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Earnings Summary</h3>
                 <DollarSign size={16} className="text-primary shadow-glow-primary" />
              </div>
              
              <div className="space-y-8">
                 <div>
                    <div className="flex justify-between items-end mb-3">
                       <p className="text-5xl font-black text-white tracking-tighter italic font-serif">$4,280</p>
                       <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Monthly Earnings</p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '85%' }}
                         className="h-full rounded-full bg-primary shadow-glow-primary"
                       ></motion.div>
                    </div>
                    <div className="flex justify-between mt-3">
                       <span className="text-[8px] font-black text-primary uppercase tracking-widest">Monthly Target: 85%</span>
                       <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">$720 to next payout bonus</span>
                    </div>
                 </div>

                 <div className="p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Operational Summary</p>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Trips Completed</span>
                          <span className="text-sm font-black text-white">{currentUser?.deliveriesCount || 142}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Hours Logged</span>
                          <span className="text-sm font-black text-white">14d 6h</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Asset Rating</span>
                          <span className="text-sm font-black text-green-500">98% Passed</span>
                       </div>
                    </div>
                 </div>

                 <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    Download Earnings Statement
                 </button>
              </div>
           </div>

           {/* Operational Timeline */}
           <div className="glass-panel p-8 border-white/5">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-6">Operational Timeline</h3>
              <div className="space-y-6 relative pl-4 border-l border-white/5">
                 {(currentUser?.timeline || []).map((t, idx) => (
                    <div key={idx} className="space-y-1 relative">
                       <div className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-primary shadow-glow-primary" />
                       <h4 className="text-xs font-black text-white uppercase tracking-wider">{t.title}</h4>
                       <p className="text-[10px] text-gray-500">{t.desc}</p>
                       <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mt-1">{new Date(t.date).toLocaleString()}</p>
                    </div>
                 ))}
                 {(!currentUser?.timeline || currentUser.timeline.length === 0) && (
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">No activities recorded.</p>
                 )}
              </div>
           </div>

           <button className="w-full p-6 bg-red-950/20 border border-red-500/20 rounded-[2rem] flex items-center justify-center gap-3 group hover:bg-red-500/10 transition-all">
              <LogOut size={20} className="text-red-500 group-hover:translate-x-1 transition-transform" />
              <span className="text-xs font-black text-red-500 uppercase tracking-widest">Log Out Session</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
