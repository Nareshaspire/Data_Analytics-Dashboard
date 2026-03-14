/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LayoutDashboard, Database, Settings, Menu, Bell, Search, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import { allOrders } from './data/store';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 bg-slate-950 text-slate-300 w-72 flex-shrink-0 transition-transform duration-300 ease-in-out z-30 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-inner shadow-white/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Nexus Analytics</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">Main Menu</div>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 bg-white/10 text-white rounded-xl transition-colors shadow-sm">
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors">
              <Database className="w-5 h-5" />
              <span className="font-medium">Data Sources</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </a>
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden flex-shrink-0">
              <img src="https://picsum.photos/seed/architect/100/100" alt="Profile" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-white truncate">Lead Architect</span>
              <span className="text-xs text-slate-500 truncate">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100/80 rounded-xl text-slate-500 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all border border-transparent focus-within:border-indigo-500/30 w-80">
              <Search className="w-4 h-4" />
              <input
                type="text"
                placeholder="Search metrics, reports, or data..."
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto bg-slate-50/50">
          <Dashboard orders={allOrders} />
        </div>
      </main>
    </div>
  );
}
