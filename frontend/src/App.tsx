import React from 'react';
import './App.css';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/Overview';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LeetCodeSection } from './components/LeetCodeSection';

// Placeholder pages for other routes
const Analytics = () => <div className="p-8 text-xl">Analytics Page (Coming Soon)</div>;
const Jobs = () => <div className="p-8 text-xl">Jobs Page (Coming Soon)</div>;

export function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/leetcode" element={<LeetCodeSection />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}
