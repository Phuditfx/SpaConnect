import React from 'react';
import { JobRadar } from '../components/JobRadar';

export const TherapistRadarPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Job Radar</h1>
        <p className="text-gray-500 text-sm">Find and apply to freelance requests from spa shops in real-time.</p>
      </div>
      <div className="flex-1 bg-gray-50 overflow-hidden">
        <JobRadar />
      </div>
    </div>
  );
};
