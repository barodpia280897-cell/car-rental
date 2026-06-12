import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { useSelector, Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import AdminBookings from './pages/dashboards/AdminBookings';
import CustomerBookings from './pages/dashboards/CustomerBookings';
import AdminFinance from './pages/dashboards/AdminFinance';
import AdminCustomers from './pages/dashboards/AdminCustomers';
import AdminTrips from './pages/dashboards/AdminTrips';
import AdminDealership from './pages/dashboards/AdminDealership';
import AdminSettings from './pages/dashboards/AdminSettings';
import OperationsDashboard from './pages/dashboards/OperationsDashboard';
import OperationsSchedule from './pages/dashboards/OperationsSchedule';
import OperationsTasks from './pages/dashboards/OperationsTasks';
import DriverDashboard from './pages/dashboards/DriverDashboard';
import DriverVerification from './pages/dashboards/DriverVerification';
import MyTrips from './pages/dashboards/MyTrips';
import DriverEarnings from './pages/dashboards/DriverEarnings';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import CustomerPayments from './pages/dashboards/CustomerPayments';
import CustomerFleet from './pages/dashboards/CustomerFleet';
import VehicleDetails from './pages/dashboards/VehicleDetails';
import Profile from './pages/dashboards/Profile';
import Fleet from './pages/Fleet';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/auth/Login';
import { Register, ForgotPassword, OTPVerification, LockScreen, SessionExpired } from './pages/auth/AuthPages';
import { store } from './store';
import LandingPage from './pages/LandingPage';
import ContractPage from './pages/ContractPage';
import CarDetailsPage from './pages/CarDetailsPage';
import { AdminOperationalProvider } from './context/adminStateContext';
import AdminContracts from './pages/dashboards/AdminContracts';
import AdminPayments from './pages/dashboards/AdminPayments';
import AdminDeliveries from './pages/dashboards/AdminDeliveries';
import AdminDrivers from './pages/dashboards/AdminDrivers';
import AdminReports from './pages/dashboards/AdminReports';
import UsersManagementPage from './pages/dashboards/UsersManagementPage';

import OperationsVehicles from './pages/dashboards/OperationsVehicles';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const DashboardSwitcher = () => {
  const { user, role } = useSelector(state => state.auth);
  
  if (!user) return <Navigate to="/login" />;

  switch (role) {
    case 'ADMIN': return <AdminDashboard />;
    case 'OPERATIONS': return <OperationsDashboard />;
    case 'DRIVER': return <DriverDashboard />;
    case 'CUSTOMER': return <CustomerDashboard />;
    default: return <AdminDashboard />;
  }
};

const BookingSwitcher = () => {
  const { user, role } = useSelector(state => state.auth);
  if (!user) return <Navigate to="/login" />;
  
  switch (role) {
    case 'ADMIN': return <AdminBookings />;
    case 'CUSTOMER': return <CustomerBookings />;
    default: return <AdminBookings />;
  }
};

const TripSwitcher = () => {
  const { user, role } = useSelector(state => state.auth);
  if (!user) return <Navigate to="/login" />;
  
  switch (role) {
    case 'ADMIN': return <AdminTrips />;
    case 'DRIVER': return <MyTrips />;
    default: return <AdminTrips />;
  }
};

const Layout = () => {
  const { user, role } = useSelector(state => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isDriver = role === 'DRIVER';

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop and Mobile Drawer */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDriver ? 'hidden md:flex' : 'flex'}
      `}>
        <Sidebar onMenuClick={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
        
        <Navbar toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        <main className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${isDriver ? 'p-4 md:p-8' : 'p-4 md:p-8'}`}>
          <div className={`max-w-[1600px] mx-auto ${isDriver ? 'w-full' : ''}`}>
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const FleetSwitcher = () => {
  const { user, role } = useSelector(state => state.auth);
  if (!user) return <Navigate to="/login" />;
  
  switch (role) {
    case 'ADMIN': return <AdminDealership />;
    case 'OPERATIONS': return <OperationsVehicles />;
    case 'CUSTOMER': return <CustomerFleet />;
    default: return <Fleet />;
  }
};

const App = () => {
  return (
    <Provider store={store}>
      <AdminOperationalProvider>
        <Toaster position="top-right" toastOptions={{
          style: { 
            background: '#111827', 
            color: '#fff', 
            border: '1px solid rgba(255,255,255,0.1)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            borderRadius: '16px'
          }
        }} />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/car/:id" element={<CarDetailsPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/otp" element={<OTPVerification />} />
            <Route path="/lock" element={<LockScreen />} />
            <Route path="/session-expired" element={<SessionExpired />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardSwitcher />} />
              <Route path="/contract" element={<ContractPage />} />
              <Route path="/contract/:id" element={<ContractPage />} />
              <Route path="/bookings" element={<BookingSwitcher />} />
              <Route path="/finance" element={<AdminFinance />} />
              <Route path="/customers" element={<AdminCustomers />} />
              <Route path="/trips" element={<TripSwitcher />} />
              <Route path="/dealership" element={<AdminDealership />} />
              <Route path="/fleet" element={<FleetSwitcher />} />
              <Route path="/settings" element={<AdminSettings />} />
              <Route path="/schedule" element={<OperationsSchedule />} />
              <Route path="/tasks" element={<OperationsTasks />} />
              <Route path="/inspection" element={<DriverVerification type="pickup" />} />
              <Route path="/payments" element={<CustomerPayments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/vehicles" element={<FleetSwitcher />} />
              <Route path="/cars" element={<FleetSwitcher />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              
              {/* Expanded Admin Modules */}
              <Route path="/contracts" element={<AdminContracts />} />
              <Route path="/admin-payments" element={<AdminPayments />} />
              <Route path="/deliveries" element={<AdminDeliveries />} />
              <Route path="/drivers" element={<AdminDrivers />} />
              <Route path="/users" element={<UsersManagementPage />} />
              <Route path="/reports" element={<AdminReports />} />
              
              {/* Catch-all for specialized routes */}
              <Route path="*" element={<ComingSoon title="Module" />} />
            </Route>
          </Routes>
        </Router>
      </AdminOperationalProvider>
    </Provider>
  );
};

export default App;
