import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Camera, CheckCircle2, 
  ChevronRight, ArrowLeft, AlertTriangle, 
  Zap, Gauge, Trash2, PenTool, X, Upload, 
  BatteryCharging, Info, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminState } from '../../context/adminStateContext';

const DriverVerification = () => {
  const navigate = useNavigate();
  const { deliveries, drivers, submitInspection } = useAdminState();

  const queryParams = new URLSearchParams(window.location.search);
  const deliveryIdFromParam = queryParams.get('id');
  
  const currentUser = drivers.find(d => d.name === 'David Wilson') || drivers[0];
  
  // Find relevant delivery
  const delivery = deliveries.find(d => d.id === deliveryIdFromParam) || 
                   deliveries.find(d => d.driverName === currentUser?.name && d.status === 'Arrived') || 
                   deliveries.find(d => d.driverName === currentUser?.name) || 
                   deliveries[0];

  const type = queryParams.get('type') || (delivery?.status === 'Returned' ? 'Return' : 'Pickup');

  const [step, setStep] = useState(1);
  
  // Step 1: Vehicle Condition Checklist
  const [checklist, setChecklist] = useState({
    exterior: false,
    interior: false,
    tires: false,
    fluids: false,
  });

  // Step 2: Vehicle Information
  const [vehicleInfo, setVehicleInfo] = useState({
    mileage: '12402',
    fuelLevel: '95'
  });

  // Step 3: Damage Report
  const [damageReport, setDamageReport] = useState({
    damageNotes: '',
    scratchNotes: '',
    warningNotes: ''
  });
  const [damagePoints, setDamagePoints] = useState([]);
  const [showDamageMarker, setShowDamageMarker] = useState(false);

  // Step 4: Evidence Collection
  const [photos, setPhotos] = useState({
    front: null,
    rear: null,
    leftSide: null,
    rightSide: null,
    interior: null,
    odometer: null,
    fuelGauge: null,
    damage: null
  });

  // Step 5: Signatures
  const [signatures, setSignatures] = useState({
    driver: false,
    customer: false
  });

  // Step 6: Submission / Status Selection
  const [inspectionStatus, setInspectionStatus] = useState(''); // Passed, Failed, Needs Attention

  const handleToggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddDamagePoint = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDamagePoints([...damagePoints, { x, y }]);
    toast('Damage point marked', { icon: '📍' });
  };

  const handlePhotoUpload = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotos(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
      toast.success(`${key.replace(/([A-Z])/g, ' $1')} photo uploaded.`);
    }
  };

  const isStep1Valid = () => Object.values(checklist).every(Boolean);
  const isStep2Valid = () => vehicleInfo.mileage && vehicleInfo.fuelLevel;
  const isStep4Valid = () => {
    // Front, Rear, Left, Right, Interior, Odometer, Fuel Gauge are mandatory
    return photos.front && photos.rear && photos.leftSide && photos.rightSide && photos.interior && photos.odometer && photos.fuelGauge;
  };
  const isStep5Valid = () => signatures.driver && signatures.customer;
  const isStep6Valid = () => inspectionStatus !== '';

  const handleFinalSubmit = () => {
    if (!isStep6Valid()) {
      toast.error('Please select an Inspection Status.');
      return;
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Submitting Vehicle Inspection...',
        success: 'Inspection successfully logged and sync\'d.',
        error: 'Submission failed',
      }
    ).then(() => {
      if (delivery) {
        submitInspection(delivery.id, {
          checklist,
          vehicleInfo,
          damagePoints,
          damageNotes: `${damageReport.damageNotes} | Scratches: ${damageReport.scratchNotes} | Warnings: ${damageReport.warningNotes}`,
          inspectionStatus
        }, type.toLowerCase());
      }
      navigate('/trips');
    });
  };

  const stepLabels = [
    'Vehicle Condition',
    'Vehicle Information',
    'Damage Report',
    'Evidence Collection',
    'Signatures',
    'Submission'
  ];

  return (
    <div className="w-full pb-24 px-4 space-y-6">
      {/* Pre-Inspection Details Header */}
      {delivery && (
        <div className="bg-[#111111] p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{type} Vehicle Inspection</span>
            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[8px] font-bold text-gray-400">ACTIVE SESSION</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Booking ID</p>
              <p className="text-xs font-bold text-white mt-1">{delivery.bookingId}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Assignment ID</p>
              <p className="text-xs font-bold text-white mt-1">{delivery.id}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Customer</p>
              <p className="text-xs font-bold text-white mt-1">{delivery.customerName}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Driver</p>
              <p className="text-xs font-bold text-white mt-1">{delivery.driverName}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Vehicle</p>
              <p className="text-xs font-bold text-white mt-1">{delivery.vehicleName}</p>
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Inspection Type</p>
              <p className="text-xs font-bold text-primary mt-1">{type}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl text-gray-400">
             <ArrowLeft size={20} />
           </button>
           <div>
             <h2 className="text-2xl font-black text-white uppercase italic tracking-tight leading-none font-serif">
               Vehicle <span className="text-primary not-italic font-serif">Inspection</span>
             </h2>
             <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Inspection Checklist • Step {step}/6</p>
           </div>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-primary uppercase tracking-widest">Step {step}/6</p>
           <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-1">{stepLabels[step-1]}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary shadow-glow-primary' : 'bg-white/5'}`} />
        ))}
      </div>

      <AnimatePresence mode='wait'>
        {/* STEP 1: VEHICLE CONDITION */}
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 border-white/5 space-y-6">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic mb-6">Vehicle Condition Check</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'exterior', label: 'Exterior Inspection' },
                    { key: 'interior', label: 'Interior Inspection' },
                    { key: 'tires', label: 'Tires / Rims Inspection' },
                    { key: 'fluids', label: 'Fluids / Levels Inspection' }
                  ].map(item => (
                     <label key={item.key} className="flex items-center gap-4 p-4 bg-[#0A0A0A] rounded-2xl border border-white/5 cursor-pointer hover:border-primary/30 transition-all group">
                        <div className="relative flex items-center justify-center">
                           <input 
                              type="checkbox" 
                              checked={checklist[item.key]}
                              onChange={() => handleToggleChecklist(item.key)}
                              className="peer appearance-none w-6 h-6 rounded-lg border-2 border-white/10 bg-white/5 checked:bg-primary/20 checked:border-primary transition-all" 
                           />
                           <CheckCircle2 size={14} className="absolute text-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">{item.label} Completed</span>
                     </label>
                  ))}
               </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!isStep1Valid()}
              className="w-full py-6 bg-primary text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-glow-primary disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 text-xs italic"
            >
              Next: Vehicle Information <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {/* STEP 2: VEHICLE INFORMATION */}
        {step === 2 && (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 border-white/5 space-y-6">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic mb-6">Vehicle Details</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Fuel / Battery %</label>
                     <div className="relative">
                        <BatteryCharging className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                        <input 
                           type="number" 
                           value={vehicleInfo.fuelLevel}
                           onChange={(e) => setVehicleInfo({...vehicleInfo, fuelLevel: e.target.value})}
                           className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 outline-none"
                        />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Odometer Mileage</label>
                     <div className="relative">
                        <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
                        <input 
                           type="number" 
                           value={vehicleInfo.mileage}
                           onChange={(e) => setVehicleInfo({...vehicleInfo, mileage: e.target.value})}
                           className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:border-primary/50 outline-none"
                        />
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setStep(1)} className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px]">Back</button>
               <button 
                 onClick={() => setStep(3)} 
                 disabled={!isStep2Valid()}
                 className="flex-[2] py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-glow-primary text-[10px] italic disabled:opacity-50 transition-all"
               >
                 Next: Damage Report
               </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DAMAGE REPORT */}
        {step === 3 && (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 border-white/5 space-y-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">Damage / Defect Reporting</h3>
                  <button 
                     onClick={() => setShowDamageMarker(!showDamageMarker)}
                     className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all
                        ${showDamageMarker ? 'bg-primary/10 border-primary text-primary font-bold shadow-glow-primary' : 'bg-white/5 border-white/10 text-gray-500'}
                     `}
                  >
                     {showDamageMarker ? 'Hide Damage Marker' : 'Interactive Damage Marker'}
                  </button>
               </div>

               {showDamageMarker ? (
                  <div className="space-y-4">
                     <div className="aspect-[3/1] bg-[#0A0A0A] rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center cursor-crosshair group" onClick={handleAddDamagePoint}>
                        <div className="relative w-full h-full p-4 opacity-30 group-hover:opacity-50 transition-opacity">
                           <svg viewBox="0 0 400 200" className="w-full h-full fill-none stroke-white/20 stroke-2">
                              <path d="M50,100 Q50,40 100,30 L300,30 Q350,40 350,100 L350,150 Q350,170 300,180 L100,180 Q50,170 50,150 Z" />
                              <circle cx="100" cy="160" r="20" />
                              <circle cx="300" cy="160" r="20" />
                           </svg>
                        </div>
                        {damagePoints.map((p, i) => (
                           <motion.div 
                              key={i}
                              initial={{ scale: 0 }} animate={{ scale: 1 }}
                              style={{ left: `${p.x}%`, top: `${p.y}%` }}
                              className="absolute w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                           />
                        ))}
                        <div className="absolute top-4 right-4 text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded border border-red-500/20">Click wireframe to place marker</div>
                     </div>
                     <button onClick={() => setDamagePoints([])} className="text-[10px] font-black text-gray-600 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                        <Trash2 size={12} /> Clear Damage Marks
                     </button>
                  </div>
               ) : (
                 <div className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 flex gap-3">
                   <Info size={16} className="text-primary shrink-0 mt-0.5" />
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Use the marker above to place precise visual flags on exterior areas representing scuffs, body scratches, or wheel alignment issues.</p>
                 </div>
               )}

               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                     <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Damage Notes</label>
                     <textarea 
                        value={damageReport.damageNotes}
                        onChange={(e) => setDamageReport({...damageReport, damageNotes: e.target.value})}
                        placeholder="Log any noticeable dents or paint chips..."
                        className="w-full h-20 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:border-primary/50 outline-none resize-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Scratch Notes</label>
                     <textarea 
                        value={damageReport.scratchNotes}
                        onChange={(e) => setDamageReport({...damageReport, scratchNotes: e.target.value})}
                        placeholder="Log any windshield chips or wheel curb rash..."
                        className="w-full h-20 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:border-primary/50 outline-none resize-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest ml-1">Warning Notes</label>
                     <textarea 
                        value={damageReport.warningNotes}
                        onChange={(e) => setDamageReport({...damageReport, warningNotes: e.target.value})}
                        placeholder="Specify if any dashboard light indicator is currently active..."
                        className="w-full h-20 bg-[#0A0A0A] border border-white/10 rounded-xl p-4 text-xs font-bold text-white focus:border-primary/50 outline-none resize-none"
                     />
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setStep(2)} className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px]">Back</button>
               <button onClick={() => setStep(4)} className="flex-[2] py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-glow-primary text-[10px] italic transition-all">Next: Evidence Collection</button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: EVIDENCE COLLECTION */}
        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 border-white/5 space-y-6">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic">Evidence Collection</h3>
               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Upload mandatory vehicle checklist captures to verify status.</p>
               
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'front', label: 'Front Photo (Req.)' },
                    { key: 'rear', label: 'Rear Photo (Req.)' },
                    { key: 'leftSide', label: 'Left Side Photo (Req.)' },
                    { key: 'rightSide', label: 'Right Side Photo (Req.)' },
                    { key: 'interior', label: 'Interior Photo (Req.)' },
                    { key: 'odometer', label: 'Odometer Photo (Req.)' },
                    { key: 'fuelGauge', label: 'Fuel Gauge Photo (Req.)' },
                    { key: 'damage', label: 'Damage Photos (Opt.)' }
                  ].map(pos => (
                     <div key={pos.key} className="aspect-square bg-[#0A0A0A] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-primary/40 transition-all cursor-pointer overflow-hidden relative">
                        {photos[pos.key] ? (
                          <img src={photos[pos.key]} alt={pos.label} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Camera size={24} className="text-gray-700 group-hover:text-primary transition-colors" />
                            <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest text-center px-2 group-hover:text-white transition-colors">{pos.label}</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(pos.key, e)}
                          className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setStep(3)} className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px]">Back</button>
               <button 
                 onClick={() => setStep(5)} 
                 disabled={!isStep4Valid()}
                 className="flex-[2] py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-glow-primary text-[10px] italic disabled:opacity-50 transition-all"
               >
                 Next: Signatures
               </button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: SIGNATURES */}
        {step === 5 && (
          <motion.div 
            key="step5"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Driver Signature */}
            <div className="glass-panel p-6 border-white/5 space-y-4">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic font-serif">Driver Signature</h3>
               <div 
                 onClick={() => setSignatures(prev => ({ ...prev, driver: !prev.driver }))}
                 className="h-28 bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col items-center justify-center relative group overflow-hidden cursor-pointer"
               >
                  {!signatures.driver ? (
                     <>
                        <PenTool className="text-gray-800 mb-2" size={20} />
                        <p className="text-[8px] font-black text-gray-800 uppercase tracking-[0.2em]">Touch Screen to Sign</p>
                     </>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <CheckCircle2 className="text-primary mb-1" size={24} />
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Driver Signature Captured</p>
                     </motion.div>
                  )}
               </div>
            </div>

            {/* Customer Signature */}
            <div className="glass-panel p-6 border-white/5 space-y-4">
               <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic font-serif">Customer Signature</h3>
               <div 
                 onClick={() => setSignatures(prev => ({ ...prev, customer: !prev.customer }))}
                 className="h-28 bg-[#0A0A0A] border border-white/10 rounded-2xl flex flex-col items-center justify-center relative group overflow-hidden cursor-pointer"
               >
                  {!signatures.customer ? (
                     <>
                        <PenTool className="text-gray-800 mb-2" size={20} />
                        <p className="text-[8px] font-black text-gray-800 uppercase tracking-[0.2em]">Touch Screen to Sign</p>
                     </>
                  ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                        <CheckCircle2 className="text-primary mb-1" size={24} />
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Customer Signature Captured</p>
                     </motion.div>
                  )}
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setStep(4)} className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px]">Back</button>
               <button 
                 onClick={() => setStep(6)} 
                 disabled={!isStep5Valid()}
                 className="flex-[2] py-6 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-glow-primary text-[10px] italic disabled:opacity-50 transition-all"
               >
                 Next: Submission
               </button>
            </div>
          </motion.div>
        )}

        {/* STEP 6: SUBMISSION */}
        {step === 6 && (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="glass-panel p-6 border-white/5 space-y-6 text-center">
               <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary border border-primary/20 shadow-glow-primary">
                  <ShieldCheck size={36} />
               </div>
               
               <div>
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter font-serif">Submit Vehicle Inspection</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                     Checklist items confirmed • Details logged <br />
                     Evidence package compiled • Signatures secured
                  </p>
               </div>

               {/* Inspection Status Selector */}
               <div className="space-y-3 text-left">
                  <label className="text-[8px] font-black text-gray-500 uppercase tracking-widest ml-1">Overall Inspection Outcome</label>
                  <div className="grid grid-cols-3 gap-3">
                     {[
                       { key: 'Passed', style: 'border-green-500/20 text-green-500 bg-green-500/5 hover:bg-green-500/10' },
                       { key: 'Failed', style: 'border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10' },
                       { key: 'Needs Attention', style: 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10' }
                     ].map(status => (
                        <button
                           key={status.key}
                           onClick={() => setInspectionStatus(status.key)}
                           className={`py-3.5 border rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-wider transition-all
                              ${inspectionStatus === status.key 
                                ? 'bg-primary/20 border-primary text-primary shadow-glow-primary font-bold' 
                                : status.style}
                           `}
                        >
                           {status.key}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 text-left pt-2">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Odometer Sync</p>
                     <p className="text-xs font-black text-white uppercase">{vehicleInfo.mileage} MILES</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                     <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Evidence Sync</p>
                     <p className="text-xs font-black text-white uppercase">7/7 MANDATORY</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4">
               <button onClick={() => setStep(5)} className="flex-1 py-6 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl text-[10px]">Back</button>
               <button 
                 onClick={handleFinalSubmit}
                 disabled={!isStep6Valid()}
                 className="flex-[2] py-6 bg-primary text-black font-black uppercase tracking-[0.3em] rounded-2xl shadow-glow-primary text-xs italic disabled:opacity-50 transition-all active:scale-95"
               >
                 Submit Inspection
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DriverVerification;
