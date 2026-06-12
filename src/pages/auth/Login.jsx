import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Github, Chrome, ChevronRight, Fingerprint } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AuthLayout from '../../components/auth/AuthLayout';
import DemoUserCard from '../../components/auth/DemoUserCard';
import { loginStart, loginSuccess } from '../../store/authSlice';
import { loginUser } from '../../store/authSlice';
import { completeBooking } from '../../store/bookingSlice';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const demoUsers = [
    { name: 'Marcus Chen', role: 'Admin', desc: 'Central logistics dashboard', color: 'from-primary to-[#8A7320]', roleId: 'ADMIN', glow: 'shadow-glow-primary' },
    { name: 'Sarah Miller', role: 'Operations', desc: 'Deployment sync overview', color: 'from-primary to-[#8A7320]', roleId: 'OPERATIONS', glow: 'shadow-glow-primary' },
    { name: 'David Wilson', role: 'Driver', desc: 'Rental delivery checklist', color: 'from-primary to-[#8A7320]', roleId: 'DRIVER', glow: 'shadow-glow-primary' },
    // { name: 'Elena Rodriguez', role: 'Customer', desc: 'Personal itineraries portal', color: 'from-primary to-[#8A7320]', roleId: 'CUSTOMER', glow: 'shadow-glow-primary' },
  ];

  // Maps demo role cards to real seeded credentials
  const demoCredentials = {
    ADMIN:      { email: 'admin@carrental.com',    password: 'password123' },
    OPERATIONS: { email: 'ops@carrental.com',      password: 'password123' },
    DRIVER:     { email: 'driver@carrental.com',   password: 'password123' },
    CUSTOMER:   { email: 'customer@carrental.com', password: 'password123' },
  };

  const handleDemoLogin = async (user) => {
    const creds = demoCredentials[user.roleId];
    if (!creds) return;

    const result = await dispatch(loginUser(creds));

    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${user.name.split(' ')[0]}.`, {
        style: { background: '#111111', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }
      });

      if (user.roleId === 'CUSTOMER') {
        const tempBooking = localStorage.getItem('temp_booking');
        if (tempBooking) {
          try {
            const parsed = JSON.parse(tempBooking);
            dispatch(completeBooking({ ...parsed, fullName: user.name, status: 'Pending' }));
            localStorage.removeItem('temp_booking');
            navigate(`/contract/${parsed.id}`);
            return;
          } catch (e) {
            console.error(e);
          }
        }
      }
      navigate('/dashboard');
    } else {
      toast.error(result.payload || 'Login failed. Make sure the seed data is loaded.', {
        style: { background: '#111111', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Encryption key required');
    handleDemoLogin({ name: email.split('@')[0], role: 'System Admin', roleId: 'ADMIN', glow: 'shadow-glow-primary' });
  };

  return (
    <AuthLayout 
      title="Secure Sign In" 
      subtitle="Access your premium vehicle rental dashboard."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input 
              type="email" 
              placeholder="Username / Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111111]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 focus:bg-[#111111]/80 transition-all placeholder:text-gray-700"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-primary transition-colors w-5 h-5" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111111]/50 border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white font-bold text-sm focus:outline-none focus:border-primary/50 focus:bg-[#111111]/80 transition-all placeholder:text-gray-700"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
               <input type="checkbox" className="peer appearance-none w-5 h-5 rounded-lg border border-white/10 bg-white/5 checked:bg-primary/20 checked:border-primary/50 transition-all" />
               <ChevronRight className="absolute w-3 h-3 text-primary opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
            </div>
            <span className="text-gray-500 font-black uppercase tracking-widest text-[10px] group-hover:text-white transition-colors">Remember Me</span>
          </label>
          <Link to="/forgot-password" core="true" className="text-primary hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors">
            Forgot Password?
          </Link>
        </div>

        <button 
          type="submit"
          className="w-full py-5 bg-primary text-[#0A0A0A] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 group text-xs italic"
        >
          <Fingerprint size={20} className="text-[#0A0A0A]" />
          Access Portal <ChevronRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} size={18} />
        </button>


      </form>

      <div className="mt-16 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">Simulate Operational Roles</h3>
          <div className="h-[1px] flex-1 bg-white/5 ml-6 opacity-30"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoUsers.map((user, i) => (
            <DemoUserCard 
              key={i} 
              user={user} 
              onClick={handleDemoLogin} 
            />
          ))}
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs font-bold uppercase tracking-widest mt-12">
        New to GoFintaza? <Link to="/register" title="Create Identity" className="text-primary hover:text-white transition-colors border-b-2 border-primary/20 pb-0.5">Create Account</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
