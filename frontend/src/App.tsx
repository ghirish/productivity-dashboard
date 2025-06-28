import React from 'react';
import './App.css';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/Overview';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeetCodeSection } from './components/LeetCodeSection';
import { ProductivityPage } from './components/ProductivityPage';
import { IntegrationsPage } from './components/IntegrationsPage';
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

const Jobs = () => (
  <div className="space-y-8 animate-fade-in">
    <div className="glass-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Job Search Tracker</h1>
          <p className="subtitle-text">
            Manage your job applications and track your progress
          </p>
        </div>
        <button className="modern-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="glass-card p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Applications Sent</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">24</p>
        </div>
        <div className="glass-card p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Interviews</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">5</p>
        </div>
        <div className="glass-card p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">Response Rate</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">21%</p>
        </div>
        <div className="glass-card p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">This Week</h3>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">3</p>
        </div>
      </div>

      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
          Job Tracker Coming Soon
        </h3>
        <p className="subtitle-text max-w-md mx-auto">
          A comprehensive job application tracking system with status management, 
          interview scheduling, and progress analytics.
        </p>
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
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}
