import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Calendar, Sparkles, Loader2, X, Info } from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { Order } from '../types';
import { computeDashboardData } from '../data/store';

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8'];

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

export default function Dashboard({ orders }: { orders: Order[] }) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  // Simulate initial loading for UX
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const data = useMemo(() => computeDashboardData(orders, startDate, endDate), [orders, startDate, endDate]);

  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    setShowInsightsModal(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Prepare a summary of the data for the AI
      const dataSummary = {
        totalRevenue: data.kpis[0].value,
        totalItems: data.kpis[1].value,
        totalOrders: data.kpis[2].value,
        avgOrderValue: data.kpis[3].value,
        topProducts: data.revenueByProduct.slice(0, 5),
        paymentMethods: data.paymentMethods,
        dateRange: startDate && endDate ? `${startDate} to ${endDate}` : 'All time'
      };

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Analyze this sales data and provide 3-4 key business insights or trends. Be concise and professional.
        Data: ${JSON.stringify(dataSummary)}`,
        config: {
          systemInstruction: "You are a senior business data analyst. Provide actionable insights based on the provided sales data.",
        }
      });

      setInsights(response.text || "Unable to generate insights at this time.");
    } catch (error) {
      console.error("Error generating insights:", error);
      setInsights("An error occurred while generating insights. Please try again.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-64 hidden md:block" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[400px] w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Overview</h1>
          <p className="text-slate-500">Analyze your data across multiple dimensions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          {/* AI Insights Button */}
          <button
            onClick={generateInsights}
            disabled={isGeneratingInsights}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-sm hover:shadow-indigo-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isGeneratingInsights ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Insights
          </button>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 px-3 py-1 border-r border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Range</span>
            </div>
            <div className="flex items-center gap-2 px-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 text-slate-700 outline-none cursor-pointer font-medium"
              />
              <span className="text-slate-300">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm border-none bg-transparent focus:ring-0 text-slate-700 outline-none cursor-pointer font-medium"
              />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
                title="Clear filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {data.kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col group hover:border-indigo-200 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                <Activity className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
              </div>
            </div>
            <div className="mt-auto flex items-baseline gap-2">
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">{kpi.value}</h2>
            </div>
            {kpi.change !== undefined && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className={`flex items-center gap-0.5 text-sm font-medium px-1.5 py-0.5 rounded-md ${kpi.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : kpi.trend === 'down' ? 'text-rose-700 bg-rose-50' : 'text-slate-700 bg-slate-50'}`}>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : kpi.trend === 'down' ? (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  ) : null}
                  {kpi.change > 0 ? '+' : ''}{kpi.change}%
                </span>
                <span className="text-slate-400 text-xs font-medium">vs last period</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
              <p className="text-sm text-slate-500">Daily revenue performance</p>
            </div>
            <Info className="w-4 h-4 text-slate-300" />
          </div>
          <div className="h-[300px] w-full">
            {data.revenueOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueOverTime} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10} 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    itemStyle={{ color: '#4f46e5', fontSize: '14px', fontWeight: 600 }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                    labelStyle={{ color: '#64748b', marginBottom: '8px', fontWeight: 500 }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { dateStyle: 'long' })}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data for selected period</div>
            )}
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Revenue by Product</h3>
              <p className="text-sm text-slate-500">Top performing items</p>
            </div>
            <Info className="w-4 h-4 text-slate-300" />
          </div>
          <div className="h-[300px] w-full">
            {data.revenueByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.revenueByProduct} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={180} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    itemStyle={{ color: '#4f46e5', fontSize: '14px', fontWeight: 600 }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                  />
                  <Bar dataKey="value" name="Revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data for selected period</div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
              <p className="text-sm text-slate-500">Transaction volume breakdown</p>
            </div>
            <Info className="w-4 h-4 text-slate-300" />
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {data.paymentMethods.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="category"
                    stroke="none"
                  >
                    {data.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                    itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}
                    formatter={(value: number) => [`${value} orders`, 'Count']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">No data for selected period</div>
            )}
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
              <p className="text-sm text-slate-500">Latest transactions</p>
            </div>
            <Info className="w-4 h-4 text-slate-300" />
          </div>
          <div className="overflow-x-auto flex-1">
            {data.recentOrders.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Payment</th>
                    <th className="px-4 py-3 font-semibold text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.slice(0, 6).map((order, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 even:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{order.date}</td>
                      <td className="px-4 py-3 text-slate-700">{order.product}</td>
                      <td className="px-4 py-3 text-slate-500">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-medium text-right">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">No orders found for selected period</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Insights Modal */}
      <AnimatePresence>
        {showInsightsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsightsModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">AI Business Insights</h2>
                </div>
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                {isGeneratingInsights ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Analyzing your business metrics...</p>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none">
                    <div className="markdown-body">
                      <Markdown>{insights || ""}</Markdown>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

