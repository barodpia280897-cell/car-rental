import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Bell, Command, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../store/authSlice';
import { toast } from 'react-hot-toast';

const Navbar = ({ toggleMobileMenu }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, role } = useSelector(state => state.auth);

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const getMockNotifications = (userRole) => {
    switch(userRole) {
      case 'ADMIN':
        return [
          { id: 1, category: 'KYC Alert', text: 'Sarah Connor submitted identity verification proofs.', time: '2m ago' },
          { id: 2, category: 'Deposit', text: 'Received reservation deposit $1,250 for RSV-8829.', time: '15m ago' },
          { id: 3, category: 'Telemetry', text: 'Unit UNIT-092 speed anomaly report triggered.', time: '1h ago' }
        ];
      case 'OPERATIONS':
        return [
          { id: 1, category: 'Fleet Prep', text: 'Bentley Continental GT returned from bay. Restocking cabin.', time: '10m ago' },
          { id: 2, category: 'Inspection', text: 'Tesla Model S scheduled for diagnostic check at 16:00.', time: '30m ago' }
        ];
      case 'DRIVER':
        return [
          { id: 1, category: 'New Trip', text: 'You have been assigned to relocations for Rivian R1T.', time: '5m ago' },
          { id: 2, category: 'Inspection', text: 'Please complete pre-pickup inspection for UNIT-901.', time: '1h ago' }
        ];
      default:
        return [
          { id: 1, category: 'Booking Confirmation', text: 'Your lease contract for Rolls-Royce Spectre is pending.', time: '1h ago' }
        ];
    }
  };

  const [notifications, setNotifications] = useState(getMockNotifications(role));

  useEffect(() => {
    setNotifications(getMockNotifications(role));
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileOpen(prev => !prev);
    setIsNotificationOpen(false);
  };

  const toggleNotification = (e) => {
    e.stopPropagation();
    setIsNotificationOpen(prev => !prev);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Successfully logged out', {
      style: { background: '#111111', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.2)' }
    });
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-20 md:h-24 bg-transparent border-b border-white/5 flex items-center justify-between px-4 md:px-8 z-10 shrink-0"
    >
      <div className="flex items-center gap-4 flex-1 lg:flex-none">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="relative w-full md:w-[400px] group hidden sm:block">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-lg transition-opacity opacity-0 group-focus-within:opacity-100"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-primary/70 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search fleet telemetry..." 
              className="w-full bg-[#111111]/80 backdrop-blur-md border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-sm focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all text-white placeholder-gray-500"
            />
            <div className="absolute right-4 hidden md:flex items-center gap-1 text-gray-500 text-xs font-semibold px-2 py-1 bg-white/5 rounded-md border border-white/10">
              <Command size={12} /> K
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6 ml-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={toggleNotification} 
            className="relative p-2 md:p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
          >
            <Bell size={20} className="drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 md:top-2 right-1.5 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-primary rounded-full border-2 border-[#0A0A0A] shadow-[0_0_8px_rgba(212,175,55,0.8)] animate-pulse-slow"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-[#111111] border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-left font-sans space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">System Alerts</h4>
                  {notifications.length > 0 && (
                    <button 
                      onClick={() => {
                        setNotifications([]);
                        toast.success('Cleared all notifications');
                      }}
                      className="text-[9px] font-black text-primary uppercase hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                
                <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-3">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-white/5 border border-white/5 rounded-xl text-left space-y-1 hover:border-primary/20 transition-all cursor-pointer">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{notif.category}</span>
                          <span className="text-[8px] text-gray-500 uppercase">{notif.time}</span>
                        </div>
                        <p className="text-xs font-bold text-white leading-snug">{notif.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                      No active alerts
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={toggleProfile} 
            className="flex items-center gap-3 md:gap-4 pl-4 md:pl-6 border-l border-white/10 cursor-pointer group select-none"
          >
            <div className="text-right hidden xs:block">
              <p className="text-xs md:text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{user || 'Guest'}</p>
              <p className="text-[10px] text-primary/70 font-semibold tracking-wide uppercase">{role || 'Visitor'}</p>
            </div>
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md group-hover:opacity-100 transition-opacity"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-[#161B26] to-[#0A0E17] border border-primary/40 rounded-xl flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-glow-primary uppercase">
                {getInitials(user)}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-[#111111] border border-white/10 rounded-2xl p-2 shadow-2xl z-50 text-left font-sans"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-xs text-gray-500 uppercase font-black tracking-widest">Signed In As</p>
                  <p className="text-sm font-bold text-white mt-1 truncate">{user || 'Guest'}</p>
                  <p className="text-[9px] text-primary/80 font-black uppercase tracking-widest mt-0.5">{role || 'Visitor'}</p>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  >
                    Update Profile
                  </button>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-semibold text-danger hover:bg-danger/10 rounded-xl transition-all"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
