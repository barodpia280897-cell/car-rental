// src/pages/dashboards/AdminReports.jsx
import React, { useState } from 'react';
import { useAdminState } from '../../context/adminStateContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend
} from 'recharts';
import { 
  FileText, Calendar, Download, BarChart2, TrendingUp, 
  Activity, DollarSign, ShieldAlert, Award
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const monthlyUtilization = [
  { month: 'Jan', electric: 65, combustion: 72, hybrid: 80 },
  { month: 'Feb', electric: 70, combustion: 68, hybrid: 85 },
  { month: 'Mar', electric: 75, combustion: 74, hybrid: 88 },
  { month: 'Apr', electric: 82, combustion: 80, hybrid: 91 },
  { month: 'May', electric: 85, combustion: 78, hybrid: 95 },
  { month: 'Jun', electric: 90, combustion: 85, hybrid: 98 },
];

const AdminReports = () => {
  const { vehicles, bookings, payments } = useAdminState();
  const [reportType, setReportType] = useState('utilization'); // 'utilization', 'financial', 'operational'
  const [dateRange, setDateRange] = useState('This Month');

  const handleExport = (format) => {
    toast.success(`Exporting ${reportType} report as ${format.toUpperCase()}... File download started.`);
  };

  // Calculations
  const activeRentals = bookings.filter(b => b.status === 'Active Rental').length;
  const occupancyRate = Math.round((activeRentals / (vehicles.length || 1)) * 100);
  const totalIncome = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-white/10">
        <div>
          <h1 className="text-3xl font-serif uppercase tracking-widest text-[#D4AF37]">
            Fleet Audits & Reports
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Analyze utilization analytics, cash flow, and overall luxury fleet performance.
          </p>
        </div>

        {/* Date Selector and Exports */}
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-[#111] border border-white/10 rounded-lg text-xs text-white"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#cda632] text-black text-xs uppercase tracking-widest font-bold rounded-lg transition-colors flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      {/* Selector Panels */}
      <div className="flex gap-4 border-b border-white/5 p-1 bg-[#111] rounded-lg max-w-fit">
        {[
          { id: 'utilization', label: 'Fleet Utilization', icon: BarChart2 },
          { id: 'financial', label: 'Financial Returns', icon: DollarSign },
          { id: 'operational', label: 'Operational Audits', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-all duration-300 flex items-center gap-2 ${
                reportType === tab.id
                  ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Reporting Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Display Box */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-xl p-5 shadow-2xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-serif text-[#D4AF37] uppercase tracking-wider">
              {reportType === 'utilization' && 'Monthly Fleet Utilization (%)'}
              {reportType === 'financial' && 'Income Yield Curve ($)'}
              {reportType === 'operational' && 'VIP Fleet Delivery Efficiency'}
            </h3>
            <span className="text-xs text-gray-500 font-mono">Real-time calculations active</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {reportType === 'utilization' ? (
                <BarChart data={monthlyUtilization}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="month" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#D4AF37' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase' }} />
                  <Bar dataKey="electric" name="Electric Fleet" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="combustion" name="Exotics (Gas)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hybrid" name="Hybrids" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : reportType === 'financial' ? (
                <AreaChart data={[
                  { day: 'Mon', revenue: 1200 },
                  { day: 'Tue', revenue: 2500 },
                  { day: 'Wed', revenue: 1900 },
                  { day: 'Thu', revenue: 4200 },
                  { day: 'Fri', revenue: 6700 },
                  { day: 'Sat', revenue: 8900 },
                  { day: 'Sun', revenue: 5400 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="day" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" fontSize={11} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#D4AF37' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Daily Cash Receipts" stroke="#D4AF37" fillOpacity={0.2} fill="#D4AF37" />
                </AreaChart>
              ) : (
                <BarChart data={[
                  { target: 'KYC Approval', minutes: 12 },
                  { target: 'Contract Signing', minutes: 28 },
                  { target: 'Driver Handover', minutes: 45 },
                  { target: 'Digital Inspection', minutes: 10 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis dataKey="target" stroke="#666" fontSize={11} />
                  <YAxis stroke="#666" label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#666' }} fontSize={11} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Bar dataKey="minutes" name="Average Processing Duration" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Summary Widgets */}
        <div className="space-y-6">
          {/* Executive Performance Highlights */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-lg font-serif text-white uppercase tracking-wider">Metrics Highlights</h3>
            
            <div className="space-y-3">
              <div className="p-4 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Renter Occupancy</span>
                  <span className="text-xl font-bold font-mono text-[#D4AF37]">{occupancyRate}%</span>
                </div>
                <Award className="w-8 h-8 text-[#D4AF37]/50" />
              </div>

              <div className="p-4 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-500 block">Total Audit Revenue</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalIncome)}
                  </span>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500/50" />
              </div>
            </div>
          </div>

          {/* Quick audit warnings */}
          <div className="bg-[#111] border border-white/10 rounded-xl p-5 shadow-2xl space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Compliance Warnings
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg">
                <strong>Insurance Expiring:</strong> Bentley Bentayga inspection is due within 7 days.
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
                <strong>KYC Review Backlog:</strong> 2 driver licenses are currently pending review check.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminReports;
