import React from 'react';
import './App.css';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/Overview';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeetCodeSection } from './components/LeetCodeSection';
import { ProductivityPage } from './components/ProductivityPage';
import { IntegrationsPage } from './components/IntegrationsPage';
import JobsPage from './components/JobsPage';
import { BarChart3, Briefcase, Plus, TrendingUp } from 'lucide-react';

// Modern placeholder pages
const Analytics = () => (
  <div className="space-y-8 animate-fade-in">
    <div className="glass-card p-8">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 
                        flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-slate-600 dark:text-slate-300" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
        <p className="subtitle-text mb-6">
          Comprehensive insights into your productivity and progress
        </p>
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
          <div className="glass-card p-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Performance Metrics</h3>
            <p className="text-xs subtitle-text">Track your coding performance over time</p>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Goal Progress</h3>
            <p className="text-xs subtitle-text">Monitor your achievement towards set goals</p>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold text-slate-600 dark:text-slate-300 mb-2">Time Analysis</h3>
            <p className="text-xs subtitle-text">Understand how you spend your coding time</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);



export function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/leetcode" element={<LeetCodeSection />} />
          <Route path="/productivity" element={<ProductivityPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}
