import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, XCircle, Search, AlertCircle, X } from 'lucide-react';
import { getPendingTherapists, verifyTherapist, rejectTherapist, getDocumentUrl } from '../api/admin';

export const VerificationDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: therapists, isLoading, isError } = useQuery({
    queryKey: ['pendingTherapists'],
    queryFn: getPendingTherapists,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyTherapist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTherapists'] });
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: rejectTherapist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingTherapists'] });
    },
    onError: (error: Error) => {
      alert(error.message);
    }
  });

  const handleViewDocument = async (path: string) => {
    setIsLoadingDoc(true);
    setIsModalOpen(true);
    try {
      const url = await getDocumentUrl(path);
      if (url) {
        setSelectedDocUrl(url);
      } else {
        alert('Could not load document.');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
      setIsModalOpen(false);
    } finally {
      setIsLoadingDoc(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocUrl(null);
  };

  const filteredTherapists = therapists?.filter((t) => 
    t.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.phone_number.includes(searchTerm)
  ) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Therapist Verification</h1>
          <p className="text-gray-500">Review and approve new therapist applications.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-medium">
              <tr>
                <th className="px-6 py-4">Therapist Name</th>
                <th className="px-6 py-4">Phone Number</th>
                <th className="px-6 py-4">License Number</th>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-500">Loading pending therapists...</p>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-500 flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    Failed to load data.
                  </td>
                </tr>
              ) : filteredTherapists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No pending therapists found.
                  </td>
                </tr>
              ) : (
                filteredTherapists.map((therapist) => (
                  <tr key={therapist.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{therapist.full_name}</td>
                    <td className="px-6 py-4">{therapist.phone_number}</td>
                    <td className="px-6 py-4 font-mono text-xs">{therapist.license_number || '-'}</td>
                    <td className="px-6 py-4">
                      {therapist.kyc_document_url ? (
                        <button 
                          onClick={() => handleViewDocument(therapist.kyc_document_url)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                        >
                          <FileText size={16} /> View Doc
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">No Document</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => rejectMutation.mutate(therapist.id)}
                          disabled={verifyMutation.isPending || rejectMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => verifyMutation.mutate(therapist.id)}
                          disabled={verifyMutation.isPending || rejectMutation.isPending}
                          className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col z-10"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-blue-500" />
                  KYC Document Verification
                </h3>
                <button 
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-4 min-h-[300px]">
                {isLoadingDoc ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p>Loading secure document...</p>
                  </div>
                ) : selectedDocUrl ? (
                  selectedDocUrl.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={selectedDocUrl} className="w-full h-full min-h-[60vh] rounded-xl border border-gray-200 shadow-sm" />
                  ) : (
                    <img src={selectedDocUrl} alt="KYC Document" className="max-w-full max-h-full object-contain rounded-xl shadow-sm border border-gray-200" />
                  )
                ) : (
                  <p className="text-gray-500">Document not available.</p>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
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
};
