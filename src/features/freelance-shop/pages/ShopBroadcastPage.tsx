import React from 'react';
import { JobBroadcastForm } from '../components/JobBroadcastForm';
import { ApplicantList } from '../components/ApplicantList';

import { CreditWalletCard } from '../components/CreditWalletCard';

export const ShopBroadcastPage: React.FC = () => {
  // For testing purposes, we hardcode a jobId to always show the ApplicantList.
  // In a real app, this would come from a query checking for an active job_broadcast.
  const activeJobId = "test-job-id";
  // Mock branch ID for testing the credit wallet
  const branchId = "test-branch-id";

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Freelance Request</h1>
        <p className="text-gray-500">Broadcast a new job to available therapists in the area.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Form & Wallet */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          <div className="h-48">
            <CreditWalletCard branchId={branchId} />
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Create Request</h2>
            <JobBroadcastForm />
          </div>
        </div>

        {/* Right Column: Applicants (Conditionally shown, but mocked to true here) */}
        <div className="xl:col-span-2">
          {activeJobId ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[500px]">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Therapist Applicants</h2>
                <p className="text-sm text-gray-500 mt-1">Review and select a therapist for your active request.</p>
              </div>
              <div className="flex-1 bg-gray-50/30 rounded-b-2xl">
                <ApplicantList jobId={activeJobId} />
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 h-full min-h-[500px] flex items-center justify-center p-8 text-center text-gray-400">
              <p>No active job broadcast.<br/>Create a request to see applicants.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
