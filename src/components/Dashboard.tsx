import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Calendar } from 'lucide-react';
import { Order } from '../types';
import { computeDashboardData } from '../data/store';

const COLORS = ['#0f172a', '#334155', '#64748b', '#94a3b8'];

export default function Dashboard({ orders }: { orders: Order[] }) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const data = useMemo(() => computeDashboardData(orders, startDate, endDate), [orders, startDate, endDate]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Overview</h1>
          <p className="text-slate-500">Analyze your data across multiple dimensions.</p>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-sm border-none bg-transparent focus:ring-0 text-slate-700 outline-none cursor-pointer"
          />
          <span className="text-slate-300">-</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-sm border-none bg-transparent focus:ring-0 text-slate-700 outline-none cursor-pointer"
          />
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-slate-500 hover:text-slate-900 px-2 font-medium"
            >
              Clear
            </button>
          )}
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
            className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
              <div className="p-2 bg-slate-50 rounded-lg">
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="mt-auto flex items-baseline gap-2">
              <h2 className="text-3xl font-semibold text-slate-900">{kpi.value}</h2>
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
            <p className="text-sm text-slate-500">Daily revenue over time</p>
          </div>
          <div className="h-[300px] w-full">
            {data.revenueOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueOverTime} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10} 
                    tickFormatter={(val) => val.substring(5)} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                    labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Revenue by Product</h3>
            <p className="text-sm text-slate-500">Top performing items</p>
          </div>
          <div className="h-[300px] w-full">
            {data.revenueByProduct.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.revenueByProduct} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                  <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={180} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}
                    formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
                  />
                  <Bar dataKey="value" name="Revenue" fill="#0f172a" radius={[0, 4, 4, 0]} barSize={24} />
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Payment Methods</h3>
            <p className="text-sm text-slate-500">Transaction volume breakdown</p>
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
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="category"
                    stroke="none"
                  >
                    {data.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    itemStyle={{ color: '#0f172a', fontSize: '14px', fontWeight: 500 }}
                    formatter={(value: number) => [`${value} orders`, 'Count']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
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
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <p className="text-sm text-slate-500">Latest transactions</p>
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
                    <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
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
    </div>
  );
}
