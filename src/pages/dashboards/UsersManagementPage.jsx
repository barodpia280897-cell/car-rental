// src/pages/dashboards/UsersManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Search, Phone, Mail, Calendar, Plus, 
  Eye, Edit2, X, CheckCircle, Ban, AlertCircle, Users,
  UserCheck, ShieldCheck, ShieldAlert, Key, MapPin, Briefcase
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Initial Mock Users to populate the table nicely
const INITIAL_USERS = [
  {
    employeeId: 'ADM-001',
    name: 'Alexander Stone',
    username: 'alex.stone',
    email: 'admin@gofintaza.com',
    phone: '(555) 123-4567',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-15'
  },
  {
    employeeId: 'OPS-001',
    name: 'Marcus Chen',
    username: 'marcus.chen',
    email: 'marcus@gofintaza.com',
    phone: '(555) 234-5678',
    role: 'Operations Manager',
    status: 'Active',
    createdAt: '2026-02-10'
  },
  {
    employeeId: 'DRV-001',
    name: 'David Wilson',
    username: 'david.wilson',
    email: 'david@gofintaza.com',
    phone: '(555) 321-4567',
    role: 'Driver',
    status: 'Active',
    createdAt: '2025-04-12',
    driverDetails: {
      hireDate: '2025-04-12',
      licenseId: 'DL-908234-A',
      commercialLicenseId: 'CDL-40918-B',
      licenseExpiryDate: '2027-05-15',
      homeAddress: '128 Beverly Dr, Beverly Hills, CA',
      emergencyName: 'Linda Wilson',
      emergencyPhone: '(555) 321-9988'
    }
  },
  {
    employeeId: 'OPS-002',
    name: 'Sarah Connor',
    username: 'sarah.connor',
    email: 'sarah.c@gofintaza.com',
    phone: '(555) 345-6789',
    role: 'Operations Manager',
    status: 'Pending',
    createdAt: '2026-06-01'
  },
  {
    employeeId: 'OPS-003',
    name: 'Elizabeth Vance',
    username: 'eli.vance',
    email: 'elizabeth@gofintaza.com',
    phone: '(555) 456-7890',
    role: 'Operations Manager',
    status: 'Inactive',
    createdAt: '2026-03-22'
  }
];

const UsersManagementPage = () => {
  const location = useLocation();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [activeUser, setActiveUser] = useState(null);
  
  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    role: 'Admin',
    status: 'Pending',
    password: '',
    confirmPassword: '',
    // Driver-specific fields
    hireDate: new Date().toISOString().split('T')[0],
    licenseId: '',
    commercialLicenseId: '',
    licenseExpiryDate: '',
    homeAddress: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    employeeId: '',
    name: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    status: '',
    // Driver-specific fields
    hireDate: '',
    licenseId: '',
    commercialLicenseId: '',
    licenseExpiryDate: '',
    homeAddress: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  // Handle navigation redirect state
  useEffect(() => {
    if (location.state && location.state.openCreateModal) {
      const defaultRole = location.state.defaultRole || 'Driver';
      setFormData(prev => ({
        ...prev,
        role: defaultRole
      }));
      setIsCreateModalOpen(true);
      // Clear navigation state to prevent re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Helper to generate Employee ID
  const generateEmployeeId = (role, currentUsers) => {
    const rolePrefixes = {
      'Admin': 'ADM',
      'Operations Manager': 'OPS',
      'Driver': 'DRV'
    };
    
    const prefix = rolePrefixes[role] || 'USR';
    const existingWithPrefix = currentUsers.filter(u => u.employeeId.startsWith(prefix));
    
    // Extract numbers and find the maximum
    let maxNum = 0;
    existingWithPrefix.forEach(u => {
      const match = u.employeeId.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
  };

  // KPI Calculations
  const totalUsers = users.length;
  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const pendingUsersCount = users.filter(u => u.status === 'Pending').length;
  const driversCount = users.filter(u => u.role === 'Driver').length;
  const operationsStaffCount = users.filter(u => 
    u.role === 'Operations Manager'
  ).length;

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    
    // Form Validation
    if (!formData.name.trim()) return toast.error('Full Name is required.');
    if (!formData.username.trim()) return toast.error('Username is required.');
    if (!formData.email.trim()) return toast.error('Email Address is required.');
    if (!formData.phone.trim()) return toast.error('Mobile Phone is required.');
    
    if (formData.password.length < 8) {
      return toast.error('Password must be at least 8 characters long.');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }

    if (formData.role === 'Driver') {
      if (!formData.licenseExpiryDate) {
        return toast.error('License Expiry Date is mandatory for Drivers.');
      }
    }

    const newEmpId = generateEmployeeId(formData.role, users);
    
    const newUser = {
      employeeId: newEmpId,
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: formData.status || 'Pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (formData.role === 'Driver') {
      newUser.driverDetails = {
        hireDate: formData.hireDate,
        licenseId: formData.licenseId,
        commercialLicenseId: formData.commercialLicenseId,
        licenseExpiryDate: formData.licenseExpiryDate,
        homeAddress: formData.homeAddress,
        emergencyName: formData.emergencyName,
        emergencyPhone: formData.emergencyPhone
      };
    }

    setUsers(prev => [newUser, ...prev]);
    toast.success(`User ${newUser.name} created successfully with ID: ${newEmpId}`);
    
    // Reset Form
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      role: 'Admin',
      status: 'Pending',
      password: '',
      confirmPassword: '',
      hireDate: new Date().toISOString().split('T')[0],
      licenseId: '',
      commercialLicenseId: '',
      licenseExpiryDate: '',
      homeAddress: '',
      emergencyName: '',
      emergencyPhone: ''
    });
    setIsCreateModalOpen(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) return toast.error('Full Name is required.');
    if (!editFormData.username.trim()) return toast.error('Username is required.');
    if (!editFormData.email.trim()) return toast.error('Email Address is required.');
    if (!editFormData.phone.trim()) return toast.error('Mobile Phone is required.');

    if (editFormData.role === 'Driver') {
      if (!editFormData.licenseExpiryDate) {
        return toast.error('License Expiry Date is mandatory for Drivers.');
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.employeeId === editFormData.employeeId) {
        const updated = {
          ...u,
          name: editFormData.name,
          username: editFormData.username,
          email: editFormData.email,
          phone: editFormData.phone,
          status: editFormData.status
        };

        if (u.role === 'Driver') {
          updated.driverDetails = {
            hireDate: editFormData.hireDate,
            licenseId: editFormData.licenseId,
            commercialLicenseId: editFormData.commercialLicenseId,
            licenseExpiryDate: editFormData.licenseExpiryDate,
            homeAddress: editFormData.homeAddress,
            emergencyName: editFormData.emergencyName,
            emergencyPhone: editFormData.emergencyPhone
          };
        }
        return updated;
      }
      return u;
    }));

    toast.success(`User updated successfully.`);
    setIsEditModalOpen(false);
  };

  const toggleUserStatus = (employeeId) => {
    setUsers(prev => prev.map(u => {
      if (u.employeeId === employeeId) {
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        toast.success(`User ${u.name} status updated to ${newStatus}`);
        return { ...u, status: newStatus };
      }
      return u;
    }));
  };

  const openView = (user) => {
    setActiveUser(user);
    setIsViewModalOpen(true);
  };

  const openEdit = (user) => {
    setActiveUser(user);
    setEditFormData({
      employeeId: user.employeeId,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      hireDate: user.driverDetails?.hireDate || '',
      licenseId: user.driverDetails?.licenseId || '',
      commercialLicenseId: user.driverDetails?.commercialLicenseId || '',
      licenseExpiryDate: user.driverDetails?.licenseExpiryDate || '',
      homeAddress: user.driverDetails?.homeAddress || '',
      emergencyName: user.driverDetails?.emergencyName || '',
      emergencyPhone: user.driverDetails?.emergencyPhone || ''
    });
    setIsEditModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Pending':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Inactive':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-400 bg-white/5 border-white/10';
    }
  };

  // Filtering Logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
    const matchesStatus = selectedStatusFilter === 'All' || u.status === selectedStatusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic font-serif">
            Users <span className="text-primary not-italic font-serif">Management</span>
          </h2>
          <p className="text-gray-500 font-bold tracking-[0.2em] uppercase text-[10px] mt-2">
            Create and manage system users, permissions, and access credentials.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-glow-primary hover:bg-[#cda632] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-black" /> Create User
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', val: totalUsers, desc: 'Registered system accounts', icon: Users, color: 'text-primary' },
          { label: 'Active Users', val: activeUsersCount, desc: 'Current active logins', icon: UserCheck, color: 'text-emerald-400' },
          { label: 'Pending Users', val: pendingUsersCount, desc: 'Awaiting activation', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Drivers', val: driversCount, desc: 'Chauffeur staff profiles', icon: Briefcase, color: 'text-blue-400' },
          { label: 'Operations Staff', val: operationsStaffCount, desc: 'Ops & admin handlers', icon: ShieldCheck, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 border-white/5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
              </div>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-80`} />
            </div>
            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-2">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID, name, username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-xs font-bold text-white focus:border-primary/50 focus:outline-none transition-all placeholder:text-gray-600"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          {/* Role Filter */}
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 focus:border-primary/50 focus:outline-none transition-all"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Operations Manager">Operations Manager</option>
            <option value="Driver">Driver</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 focus:border-primary/50 focus:outline-none transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel overflow-hidden border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-primary font-serif">
                <th className="p-4">Employee ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Created Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => (
                  <tr key={u.employeeId} className="border-b border-white/5 hover:bg-white/5 transition-all text-xs text-gray-300">
                    <td className="p-4 font-mono font-bold text-primary">{u.employeeId}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{u.name}</span>
                        <span className="text-[10px] text-gray-500">@{u.username}</span>
                      </div>
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeClass(u.status)}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 font-mono">{u.createdAt}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openView(u)}
                          title="View Details"
                          className="p-2 bg-white/5 border border-white/10 hover:border-primary rounded-lg text-gray-400 hover:text-primary transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          title="Edit User"
                          className="p-2 bg-white/5 border border-white/10 hover:border-emerald-400 rounded-lg text-gray-400 hover:text-emerald-400 transition-all"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u.employeeId)}
                          title={u.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                          className={`p-2 bg-white/5 border border-white/10 rounded-lg transition-all ${
                            u.status === 'Active' 
                              ? 'hover:border-red-500 text-gray-400 hover:text-red-500' 
                              : 'hover:border-emerald-400 text-gray-400 hover:text-emerald-400'
                          }`}
                        >
                          {u.status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 italic">
                    No users matching criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4 my-8"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Create System User</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Define new staff credentials and workspace privileges</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Username *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="e.g. johndoe"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="e.g. staff@gofintaza.com"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="e.g. (555) 012-3456"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 font-serif text-primary">Privilege Role *</label>
                    <select
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Driver">Driver</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Default Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                    >
                      <option value="Pending">Pending (Default)</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Driver Fields */}
                {formData.role === 'Driver' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4"
                  >
                    <div className="border-b border-white/5 pb-1 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Fleet Driver Credentials
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Hire / Start Date</label>
                        <input
                          type="date"
                          value={formData.hireDate}
                          onChange={e => setFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Driving License ID</label>
                        <input
                          type="text"
                          value={formData.licenseId}
                          onChange={e => setFormData(prev => ({ ...prev, licenseId: e.target.value }))}
                          placeholder="DL-XXXXXX-X"
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-mono focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">License Expiry Date *</label>
                        <input
                          type="date"
                          value={formData.licenseExpiryDate}
                          onChange={e => setFormData(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none border-amber-500/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Commercial License ID</label>
                        <input
                          type="text"
                          value={formData.commercialLicenseId}
                          onChange={e => setFormData(prev => ({ ...prev, commercialLicenseId: e.target.value }))}
                          placeholder="CDL-XXXXX-X"
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-mono focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Home Address</label>
                        <input
                          type="text"
                          value={formData.homeAddress}
                          onChange={e => setFormData(prev => ({ ...prev, homeAddress: e.target.value }))}
                          placeholder="Enter current residency"
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-black/40 border border-white/5 rounded-lg">
                      <div className="col-span-2 text-[9px] font-black uppercase text-gray-500 mb-1">Emergency Contact Info</div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={formData.emergencyName}
                          onChange={e => setFormData(prev => ({ ...prev, emergencyName: e.target.value }))}
                          placeholder="e.g. Spouse / Next of Kin"
                          className="w-full px-2.5 py-1.5 bg-black border border-white/10 rounded text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={formData.emergencyPhone}
                          onChange={e => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                          placeholder="e.g. (555) 999-9999"
                          className="w-full px-2.5 py-1.5 bg-black border border-white/10 rounded text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Password *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimum 8 characters"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Confirm Password *</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D4AF37] text-black font-bold uppercase tracking-wider rounded-lg text-xs mt-4 shadow-glow-primary hover:bg-[#cda632] transition-all"
                >
                  Create Account
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW USER MODAL */}
      <AnimatePresence>
        {isViewModalOpen && activeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex justify-between items-start border-b border-white/10 pb-4">
                {/* Employee ID, Name, and Role near the top */}
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                    {activeUser.employeeId}
                  </span>
                  <h3 className="text-xl font-serif text-white font-bold mt-2">{activeUser.name}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3 h-3 text-primary" /> {activeUser.role} Account Profile
                  </p>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Username</span>
                    <span className="text-white font-bold font-mono">@{activeUser.username}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${getStatusBadgeClass(activeUser.status)}`}>
                      {activeUser.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Email Address</span>
                    <span className="text-white font-bold break-all">{activeUser.email}</span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                    <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Mobile Phone</span>
                    <span className="text-white font-bold">{activeUser.phone}</span>
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                  <span className="block text-[9px] uppercase tracking-wider text-gray-500 mb-1">Account Created Date</span>
                  <span className="text-gray-400 font-bold font-mono">{activeUser.createdAt}</span>
                </div>

                {/* Driver Specific Details */}
                {activeUser.role === 'Driver' && activeUser.driverDetails && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 mt-2">
                    <div className="text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-1">
                      <Briefcase className="w-3.5 h-3.5" /> Chauffeur Driver Profile
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[9px] text-gray-500 uppercase">Hire Date</span>
                        <span className="text-white font-bold font-mono">{activeUser.driverDetails.hireDate}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-500 uppercase">License Expiry</span>
                        <span className="text-amber-500 font-bold font-mono">{activeUser.driverDetails.licenseExpiryDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[9px] text-gray-500 uppercase">Driving License ID</span>
                        <span className="text-white font-bold font-mono">{activeUser.driverDetails.licenseId || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-500 uppercase">Commercial ID</span>
                        <span className="text-white font-bold font-mono">{activeUser.driverDetails.commercialLicenseId || 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <span className="block text-[9px] text-gray-500 uppercase">Home Address</span>
                      <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" /> {activeUser.driverDetails.homeAddress || 'N/A'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-2 bg-black/40 border border-white/5 rounded">
                      <div>
                        <span className="block text-[9px] text-gray-500 uppercase">Emergency Name</span>
                        <span className="text-white font-bold">{activeUser.driverDetails.emergencyName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-500 uppercase">Emergency Phone</span>
                        <span className="text-white font-bold">{activeUser.driverDetails.emergencyPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="w-full py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold uppercase tracking-wider rounded-lg text-xs transition-all"
                >
                  Close Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {isEditModalOpen && activeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10 space-y-4 my-8"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">Edit User Profile</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                    Modify profile details for Employee: <span className="font-mono text-primary font-bold">{editFormData.employeeId}</span>
                  </p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 font-serif text-primary">Employee ID (Read Only)</label>
                    <input
                      type="text"
                      value={editFormData.employeeId}
                      className="w-full px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-gray-500 text-xs font-mono font-bold cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Username *</label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={e => setEditFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={e => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Mobile Phone *</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={e => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={e => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-bold focus:border-primary/50 focus:outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Conditional Driver Edit Fields */}
                {editFormData.role === 'Driver' && (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                    <div className="border-b border-white/5 pb-1 text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Chauffeur Driver Info
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Hire / Start Date</label>
                        <input
                          type="date"
                          value={editFormData.hireDate}
                          onChange={e => setEditFormData(prev => ({ ...prev, hireDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Driving License ID</label>
                        <input
                          type="text"
                          value={editFormData.licenseId}
                          onChange={e => setEditFormData(prev => ({ ...prev, licenseId: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-mono focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">License Expiry Date *</label>
                        <input
                          type="date"
                          value={editFormData.licenseExpiryDate}
                          onChange={e => setEditFormData(prev => ({ ...prev, licenseExpiryDate: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Commercial License ID</label>
                        <input
                          type="text"
                          value={editFormData.commercialLicenseId}
                          onChange={e => setEditFormData(prev => ({ ...prev, commercialLicenseId: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs font-mono focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Home Address</label>
                        <input
                          type="text"
                          value={editFormData.homeAddress}
                          onChange={e => setEditFormData(prev => ({ ...prev, homeAddress: e.target.value }))}
                          className="w-full px-3 py-2 bg-black border border-white/10 rounded-lg text-white text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-black/40 border border-white/5 rounded-lg">
                      <div className="col-span-2 text-[9px] font-black uppercase text-gray-500 mb-1">Emergency Contact Info</div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Contact Name</label>
                        <input
                          type="text"
                          value={editFormData.emergencyName}
                          onChange={e => setEditFormData(prev => ({ ...prev, emergencyName: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-black border border-white/10 rounded text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={editFormData.emergencyPhone}
                          onChange={e => setEditFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                          className="w-full px-2.5 py-1.5 bg-black border border-white/10 rounded text-xs focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-5 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold uppercase tracking-wider rounded-lg text-xs transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-500 text-black font-bold uppercase tracking-wider rounded-lg text-xs shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:bg-emerald-600 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersManagementPage;
