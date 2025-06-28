import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react'
import type { AnalyticsData } from '../types/leetcode';

interface LeetCodeAnalyticsProps {
  data: AnalyticsData;
  isLoading?: boolean;
}

const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#f59e0b', 
  Hard: '#ef4444'
}

const CUSTOM_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', 
  '#ff00ff', '#00ffff', '#ff0000', '#0000ff', '#ffff00'
]

export const LeetCodeAnalytics: React.FC<LeetCodeAnalyticsProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="dashboard-card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[300px] bg-gray-200 rounded"></div>
            <div className="h-[300px] bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const difficultyData = [
    { name: 'Easy', value: data.easy },
    { name: 'Medium', value: data.medium },
    { name: 'Hard', value: data.hard },
  ];

  const colors = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="dashboard-card p-6">
      <h3 className="text-lg font-semibold mb-6">Problem Statistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {difficultyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 