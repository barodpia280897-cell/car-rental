import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, Plus, Clock, Search, Filter, AlertCircle, 
  Check, X, Car, User, FileText, Wrench, ChevronRight,
  Upload, Eye, Calendar, UserCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const OperationsTasks = () => {
  const { 
    tasks, 
    vehicles,
    bookings,
    customers,
    currentOperationsRole,
    hasOperationalPermission,
    createTask,
    assignTask,
    startTask,
    updateTaskStatus,
    completeTask,
    approveTask,
    escalateTask,
    cancelTask
  } = useAdminState();

  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals / Drawers
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'drawer'
  const [selectedTask, setSelectedTask] = useState(null);
  const [drawerTab, setDrawerTab] = useState('Overview');

  // Forms
  const [taskForm, setTaskForm] = useState({ title: '', type: 'Cleaning', priority: 'Medium', vehicleId: '', notes: '' });

  // Filtering Logic
  const filteredTasks = (tasks || []).filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (task.vehicleName && task.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' ? true : task.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!hasOperationalPermission('Create/Edit/Delete')) {
      toast.error('Insufficient permissions to create tasks.');
      return;
    }
    const vehicle = vehicles.find(v => v.id === parseInt(taskForm.vehicleId));
    createTask({
      title: taskForm.title,
      type: taskForm.type,
      priority: taskForm.priority,
      vehicleId: taskForm.vehicleId ? parseInt(taskForm.vehicleId) : null,
      vehicleName: vehicle ? vehicle.name : 'N/A',
      notes: taskForm.notes
    });
    setTaskForm({ title: '', type: 'Cleaning', priority: 'Medium', vehicleId: '', notes: '' });
    setActiveModal(null);
  };

  const openTaskDrawer = (task) => {
    setSelectedTask(task);
    setDrawerTab('Overview');
    setActiveModal('drawer');
  };

  const getLinkedVehicle = (vehicleId) => vehicles.find(v => v.id === vehicleId);
  const getLinkedBooking = (bookingId) => bookings.find(b => b.id === bookingId);
  const getLinkedCustomer = (customerName) => customers.find(c => c.name === customerName);

  const renderPriorityBadge = (priority) => {
    switch(priority) {
      case 'Critical': return <span className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">Critical</span>;
      case 'High': return <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded">High</span>;
      case 'Medium': return <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded">Medium</span>;
      case 'Low': return <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-400/30 px-2 py-0.5 rounded">Low</span>;
      default: return null;
    }
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 border border-gray-400/30 px-2 py-0.5 rounded">Pending</span>;
      case 'Assigned': return <span className="text-[9px] font-black uppercase tracking-widest text-blue-400 border border-blue-400/30 px-2 py-0.5 rounded">Assigned</span>;
      case 'In Progress': return <span className="text-[9px] font-black uppercase tracking-widest text-accent border border-accent/30 px-2 py-0.5 rounded bg-accent/10">In Progress</span>;
      case 'Waiting Approval': return <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded bg-orange-400/10">Waiting Approval</span>;
      case 'Completed': return <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/30 px-2 py-0.5 rounded bg-emerald-500/10">Completed</span>;
      case 'Escalated': return <span className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/30 px-2 py-0.5 rounded bg-red-500/10">Escalated</span>;
      case 'Cancelled': return <span className="text-[9px] font-black uppercase tracking-widest text-red-500 border border-red-500/30 px-2 py-0.5 rounded">Cancelled</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Cleaning': return <CheckSquare size={14} className="text-blue-400" />;
      case 'Inspection': return <Search size={14} className="text-purple-400" />;
      case 'Maintenance': return <Wrench size={14} className="text-orange-400" />;
      case 'Vehicle Delivery':
      case 'Vehicle Pickup': return <Car size={14} className="text-primary" />;
      case 'Customer Follow Up': return <User size={14} className="text-emerald-400" />;
      case 'Documentation': return <FileText size={14} className="text-gray-400" />;
      case 'Emergency': return <AlertCircle size={14} className="text-red-500" />;
      default: return <CheckSquare size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-glow-primary"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Staff Workflows</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none font-serif">
            Tasks <span className="text-blue-500 not-italic font-serif">Management</span>
          </h2>
        </div>
        
        {hasOperationalPermission('Create/Edit/Delete') && (
          <button 
            onClick={() => setActiveModal('create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <Plus size={16} /> Create Task
          </button>
        )}
      </header>

      {/* Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row justify-between gap-4 border-white/5">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {['All', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 border border-transparent hover:text-white hover:bg-white/5'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tasks..." 
            className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="glass-panel border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Task ID</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Details</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Asset</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Priority</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500">Status</th>
                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTasks.map(task => {
                const createdDate = task.timeline && task.timeline[0] ? new Date(task.timeline[0].date).toLocaleDateString() : 'N/A';
                return (
                <tr key={task.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 whitespace-nowrap">
                    <span className="text-[10px] font-mono text-gray-400">{task.id}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                         {getTypeIcon(task.type)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-wide">{task.title}</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">{task.type} • Created {createdDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {task.vehicleName ? (
                      <span className="text-[10px] font-bold text-gray-300 uppercase">{task.vehicleName}</span>
                    ) : (
                      <span className="text-[10px] text-gray-600 italic">None</span>
                    )}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {renderPriorityBadge(task.priority)}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    {renderStatusBadge(task.status)}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openTaskDrawer(task)}
                      className="text-[9px] font-black uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded transition-all text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/30"
                    >
                      Update / View
                    </button>
                  </td>
                </tr>
              )})}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-xs text-gray-500 italic">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Modals & Drawers */}
      <AnimatePresence>
        {activeModal === 'create' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div onClick={() => setActiveModal(null)} className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl z-10"
            >
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                  <h3 className="text-sm font-black uppercase text-blue-500 tracking-widest">Create Operations Task</h3>
                  <button type="button" onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-white"><X size={16} /></button>
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Task Title</label>
                  <input 
                    type="text" 
                    value={taskForm.title} 
                    onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                    placeholder="e.g. Full interior detail required"
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Category</label>
                    <select 
                      value={taskForm.type} 
                      onChange={e => setTaskForm({...taskForm, type: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      {['Cleaning', 'Inspection', 'Maintenance', 'Vehicle Delivery', 'Vehicle Pickup', 'Documentation', 'Customer Follow Up', 'Emergency'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Priority</label>
                    <select 
                      value={taskForm.priority} 
                      onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
                      className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      {['Low', 'Medium', 'High', 'Critical'].map(prio => (
                        <option key={prio} value={prio}>{prio}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Asset (Vehicle ID)</label>
                  <select 
                    value={taskForm.vehicleId} 
                    onChange={e => setTaskForm({...taskForm, vehicleId: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs"
                  >
                    <option value="">No specific vehicle</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.licensePlate})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] uppercase tracking-wider text-gray-500 mb-1">Notes / Instructions</label>
                  <textarea 
                    value={taskForm.notes} 
                    onChange={e => setTaskForm({...taskForm, notes: e.target.value})}
                    placeholder="Add descriptions..." 
                    className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-xs h-20"
                  />
                </div>
                <button type="submit" className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-lg text-xs transition-colors">Create Task</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* TASK DETAILS DRAWER */}
        {activeModal === 'drawer' && selectedTask && (
          <div className="fixed inset-0 z-[110] flex justify-end">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-sm"
               onClick={() => setActiveModal(null)}
             />
             <motion.div 
               initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
               className="relative w-full sm:w-[550px] bg-[#111111] border-l border-white/10 h-full shadow-2xl flex flex-col"
             >
               {/* Drawer Header */}
               <div className="p-6 border-b border-white/5 flex justify-between items-start">
                  <div>
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tight flex items-center gap-3">
                       {selectedTask.id}
                       {renderPriorityBadge(selectedTask.priority)}
                     </h3>
                     <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{selectedTask.title}</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="p-2 text-gray-500 hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>

               {/* Drawer Tabs */}
               <div className="flex overflow-x-auto border-b border-white/5 custom-scrollbar">
                  {['Overview', 'Vehicle', 'Booking', 'Customer', 'Timeline', 'Attachments'].map(tab => (
                     <button 
                        key={tab}
                        onClick={() => setDrawerTab(tab)}
                        className={`px-6 py-4 text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-colors border-b-2 ${drawerTab === tab ? 'text-blue-500 border-blue-500 bg-white/[0.02]' : 'text-gray-500 border-transparent hover:text-white'}`}
                     >
                        {tab}
                     </button>
                  ))}
               </div>

               {/* Drawer Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
                  {drawerTab === 'Overview' && (
                     <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Status</span>
                              {renderStatusBadge(selectedTask.status)}
                           </div>
                           <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Category</span>
                              <span className="text-xs font-black text-white uppercase">{selectedTask.type}</span>
                           </div>
                           <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Created</span>
                              <span className="text-xs font-bold text-gray-300">{selectedTask.timeline && selectedTask.timeline[0] ? new Date(selectedTask.timeline[0].date).toLocaleString() : 'N/A'}</span>
                           </div>
                           <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                              <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Due Date</span>
                              <span className="text-xs font-bold text-gray-300">{selectedTask.dueDate || 'No set time'}</span>
                           </div>
                           <div className="p-4 bg-white/5 border border-white/5 rounded-xl col-span-2 flex items-center justify-between">
                              <div>
                                <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Assigned Staff</span>
                                <span className="text-xs font-black text-white uppercase">{selectedTask.assignee || 'Unassigned'}</span>
                              </div>
                              <UserCheck className="text-blue-500" size={20} />
                           </div>
                        </div>
                        <div>
                           <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-2">Task Notes / Instructions</span>
                           <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-xl text-gray-300 leading-relaxed font-mono text-[10px]">
                              {selectedTask.notes || 'No operational notes provided.'}
                           </div>
                        </div>
                     </div>
                  )}

                  {drawerTab === 'Vehicle' && (
                     <div className="space-y-4">
                        {selectedTask.vehicleId ? (() => {
                           const v = getLinkedVehicle(selectedTask.vehicleId);
                           if (!v) return <p className="text-gray-500 italic">Vehicle data not found.</p>;
                           return (
                              <div className="space-y-4">
                                 <img src={v.image} alt={v.name} className="w-full h-40 object-cover rounded-xl border border-white/10" />
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                       <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Vehicle</span>
                                       <span className="text-sm font-black text-white uppercase italic">{v.name}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                       <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">License Plate</span>
                                       <span className="text-sm font-mono text-white">{v.licensePlate}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                       <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Fleet Status</span>
                                       <span className="text-xs font-bold text-accent uppercase">{v.status}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                       <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Location</span>
                                       <span className="text-xs font-bold text-white uppercase">{v.location || 'Hub'}</span>
                                    </div>
                                 </div>
                              </div>
                           );
                        })() : (
                           <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-xl">
                              <Car size={32} className="mx-auto text-gray-600 mb-2" />
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">No Vehicle Attached to Task</p>
                           </div>
                        )}
                     </div>
                  )}

                  {drawerTab === 'Booking' && (
                     <div className="space-y-4">
                        {selectedTask.bookingId && selectedTask.bookingId !== 'N/A' ? (() => {
                           const b = getLinkedBooking(selectedTask.bookingId);
                           if (!b) return <p className="text-gray-500 italic">Booking data not found.</p>;
                           return (
                              <div className="grid grid-cols-1 gap-4">
                                 <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center">
                                    <div>
                                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Booking ID</span>
                                      <span className="text-sm font-black text-white uppercase">{b.id}</span>
                                    </div>
                                    <span className="px-2 py-1 bg-white/10 text-white text-[9px] font-black uppercase rounded tracking-wider">{b.status}</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Customer</span>
                                      <span className="text-xs font-bold text-white">{b.customer}</span>
                                   </div>
                                   <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Rental Period</span>
                                      <span className="text-xs font-bold text-white">{b.startDate} <span className="text-gray-600 px-1">to</span> {b.endDate}</span>
                                   </div>
                                 </div>
                              </div>
                           );
                        })() : (
                           <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-xl">
                              <Calendar size={32} className="mx-auto text-gray-600 mb-2" />
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">No Booking Attached to Task</p>
                           </div>
                        )}
                     </div>
                  )}

                  {drawerTab === 'Customer' && (
                     <div className="space-y-4">
                        {selectedTask.customerName && selectedTask.customerName !== 'N/A' ? (() => {
                           const c = getLinkedCustomer(selectedTask.customerName);
                           if (!c) return <p className="text-gray-500 italic">Customer details not available.</p>;
                           return (
                              <div className="grid grid-cols-1 gap-4">
                                 <div className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-500 font-black text-lg">
                                       {c.name.charAt(0)}
                                    </div>
                                    <div>
                                      <span className="text-sm font-black text-white uppercase">{c.name}</span>
                                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ml-2 ${c.status === 'Suspended' ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{c.status || 'Active'}</span>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                   <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Phone</span>
                                      <span className="text-xs font-bold text-white">{c.phone}</span>
                                   </div>
                                   <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                                      <span className="text-[8px] text-gray-500 uppercase tracking-widest block mb-1">Email</span>
                                      <span className="text-xs font-bold text-white">{c.email}</span>
                                   </div>
                                 </div>
                              </div>
                           );
                        })() : (
                           <div className="text-center py-10 bg-white/5 border border-dashed border-white/10 rounded-xl">
                              <User size={32} className="mx-auto text-gray-600 mb-2" />
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">No Customer Attached to Task</p>
                           </div>
                        )}
                     </div>
                  )}

                  {drawerTab === 'Timeline' && (
                     <div className="space-y-4">
                        <div className="relative border-l border-white/10 ml-3 pl-6 space-y-6">
                           {(selectedTask.timeline || []).map((event, index) => (
                              <div key={index} className="relative">
                                 <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[30px] top-1 shadow-glow-primary"></div>
                                 <h4 className="text-xs font-black text-white uppercase">{event.title}</h4>
                                 <p className="text-[10px] text-gray-400 mt-1">{event.desc}</p>
                                 <span className="text-[8px] text-gray-600 font-mono mt-2 block">{new Date(event.date).toLocaleString()}</span>
                              </div>
                           ))}
                           {(selectedTask.timeline || []).length === 0 && (
                              <p className="text-xs text-gray-500 italic">No timeline events recorded.</p>
                           )}
                        </div>
                     </div>
                  )}

                  {drawerTab === 'Attachments' && (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                           {(selectedTask.attachments || []).map((file, i) => (
                              <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group">
                                 <div className="flex items-center gap-2 overflow-hidden">
                                    <FileText size={16} className="text-gray-400 shrink-0" />
                                    <span className="text-[10px] text-gray-300 truncate">{file.name || `Attachment_${i+1}`}</span>
                                 </div>
                                 <button className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>
                        
                        <label className="flex flex-col items-center justify-center p-8 bg-blue-500/5 border border-dashed border-blue-500/30 rounded-xl hover:bg-blue-500/10 transition-colors cursor-pointer text-blue-500">
                           <Upload size={24} className="mb-2" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Upload New Attachment</span>
                           <input type="file" className="hidden" onChange={(e) => toast.success('Attachment added (mocked)')} />
                        </label>
                     </div>
                  )}

               </div>

               {/* Drawer Footer Actions */}
               <div className="p-6 border-t border-white/10 flex flex-wrap gap-3">
                  {selectedTask.status === 'Pending' && hasOperationalPermission('Create/Edit/Delete') && (
                     <button 
                        onClick={() => assignTask(selectedTask.id, currentOperationsRole)}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                     >
                        Assign To Me
                     </button>
                  )}
                  {['Pending', 'Assigned'].includes(selectedTask.status) && hasOperationalPermission('Update Task Status') && (
                     <button 
                        onClick={() => { startTask(selectedTask.id); setActiveModal(null); }}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                     >
                        Start Task
                     </button>
                  )}
                  {selectedTask.status === 'In Progress' && hasOperationalPermission('Complete Tasks') && (
                     <button 
                        onClick={() => { completeTask(selectedTask.id); setActiveModal(null); }}
                        className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                     >
                        Complete Task
                     </button>
                  )}
                  {selectedTask.status === 'Waiting Approval' && hasOperationalPermission('Create/Edit/Delete') && (
                     <button 
                        onClick={() => { approveTask(selectedTask.id); setActiveModal(null); }}
                        className="flex-1 py-3 bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                     >
                        Approve Task
                     </button>
                  )}
                  {['Pending', 'Assigned', 'In Progress'].includes(selectedTask.status) && hasOperationalPermission('Update Task Status') && (
                     <button 
                        onClick={() => { escalateTask(selectedTask.id); setActiveModal(null); }}
                        className="py-3 px-4 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                     >
                        Escalate
                     </button>
                  )}
                  {['Pending', 'Assigned', 'In Progress'].includes(selectedTask.status) && hasOperationalPermission('Create/Edit/Delete') && (
                     <button 
                        onClick={() => { cancelTask(selectedTask.id); setActiveModal(null); }}
                        className="py-3 px-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors"
                     >
                        Cancel
                     </button>
                  )}
               </div>

             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OperationsTasks;
