import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Calendar,
  CreditCard, User, LogOut, Car, X, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import { toast } from 'react-hot-toast';
import carLogo from '../../assets/carlogo.jpg';

const CustomerSidebar = ({ onMenuClick }) => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Successfully logged out');
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 h-screen bg-[#111111] lg:bg-[#111111]/95 backdrop-blur-xl border-r border-white/5 flex flex-col p-8 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between mb-14 mt-2 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md"></div>
            <img
              src={carLogo}
              className="relative w-full h-full border border-primary/30 rounded-full object-cover shadow-glow-primary"
              alt="Luxury Logo"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-primary uppercase italic font-serif">GoFintaza</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-primary/70 font-black mt-0.5">Luxury Rentals</p>
          </div>
        </div>
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 space-y-4">
        <NavLink to="/dashboard" onClick={onMenuClick} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary font-bold' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}>
          <LayoutDashboard size={20} />
          <span className="text-sm font-semibold tracking-wide">Dashboard</span>
        </NavLink>

        <NavLink to="/cars" onClick={onMenuClick} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary font-bold' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}>
          <Car size={20} />
          <span className="text-sm font-semibold tracking-wide">Cars</span>
        </NavLink>

        <NavLink to="/bookings" onClick={onMenuClick} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary font-bold' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}>
          <Calendar size={20} />
          <span className="text-sm font-semibold tracking-wide">My Bookings</span>
        </NavLink>

        <NavLink to="/contract" onClick={onMenuClick} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary font-bold' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}>
          <FileText size={20} />
          <span className="text-sm font-semibold tracking-wide">Contracts</span>
        </NavLink>

        <NavLink to="/payments" onClick={onMenuClick} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary font-bold' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}>
          <CreditCard size={20} />
          <span className="text-sm font-semibold tracking-wide">Payments</span>
        </NavLink>

        <NavLink to="/profile" onClick={onMenuClick} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-primary/10 text-primary border-primary/20 shadow-glow-primary font-bold' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'}`}>
          <User size={20} />
          <span className="text-sm font-semibold tracking-wide">Profile</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-4 px-6 py-4 text-gray-500 hover:text-danger transition-all duration-300 w-full rounded-2xl bg-white/5 border border-white/5 hover:border-danger/20"
        >
          <LogOut size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          <span className="font-bold text-xs uppercase tracking-[0.2em]">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default CustomerSidebar;

