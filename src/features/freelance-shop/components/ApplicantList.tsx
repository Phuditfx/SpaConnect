import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Star, User, Phone, CheckCircle, Clock } from 'lucide-react';
import { useJobApplicantsSubscription } from '../hooks/useJobApplicants';
import { acceptApplicant } from '../api/jobs';

interface ApplicantListProps {
  jobId: string;
}

export const ApplicantList: React.FC<ApplicantListProps> = ({ jobId }) => {
  const queryClient = useQueryClient();
  const { data: applicants, isLoading, isError } = useJobApplicantsSubscription(jobId);
  const [acceptedApplicantId, setAcceptedApplicantId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (applicationId: string) => acceptApplicant(applicationId),
    onSuccess: (data, variables) => {
      setAcceptedApplicantId(variables);
      // Re-fetch to ensure sync with DB
      queryClient.invalidateQueries({ queryKey: ['jobApplicants', jobId] });
    },
    onError: (error) => {
      console.error('Failed to accept applicant:', error);
      alert('เกิดข้อผิดพลาดในการตอบรับ กรุณาลองใหม่อีกครั้ง');
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 animate-pulse shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-200 rounded-xl w-full mt-4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500 text-center p-8 bg-red-50 rounded-2xl">ไม่สามารถโหลดข้อมูลผู้สมัครได้</div>;
  }

  // Filter only those who applied or are already accepted
  const activeApplicants = applicants?.filter((app: any) => app.status === 'applied' || app.status === 'matched') || [];
  
  // Check if any applicant is accepted (either locally right now, or previously in DB)
  const matchedApplicant = activeApplicants.find((app: any) => app.status === 'matched' || app.id === acceptedApplicantId);

  // --- Success State ---
  if (matchedApplicant) {
    const profile = matchedApplicant.freelance_profiles;
    const mockRating = (4.5 + (profile.id.charCodeAt(0) % 5) / 10).toFixed(1);

    return (
      <div className="p-4 md:p-8 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white border-2 border-green-100 rounded-3xl p-8 max-w-md w-full shadow-xl shadow-green-500/10 text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} strokeWidth={2} />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Therapist Matched!</h2>
          <p className="text-gray-500 mb-8">คุณได้เลือกพนักงานคนนี้เรียบร้อยแล้ว</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {profile.full_name}
                  {profile.is_verified && <ShieldCheck className="text-blue-500 w-5 h-5 shrink-0" />}
                </h3>
                <div className="flex items-center gap-1 text-amber-500 font-medium mt-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{mockRating}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600 bg-white p-3 rounded-xl border border-gray-100 mt-4">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="font-medium">{profile.phone_number}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Empty State ---
  if (activeApplicants.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
      >
        <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mb-6">
          <Clock size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีผู้สมัครในขณะนี้</h3>
        <p className="text-gray-500 max-w-sm">
          ระบบกำลังค้นหาพนักงานที่เหมาะสมให้คุณ โปรดรอสักครู่ พนักงานจะเห็นประกาศของคุณและกดรับงานเร็วๆ นี้
        </p>
      </motion.div>
    );
  }

  // --- List/Grid State ---
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <AnimatePresence>
        {activeApplicants.map((applicant: any) => {
          const profile = applicant.freelance_profiles;
          // Generate a consistent mock rating based on ID
          const mockRating = (4.5 + (profile.id.charCodeAt(0) % 5) / 10).toFixed(1);

          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={applicant.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <User size={32} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 truncate">
                    <span className="truncate">{profile.full_name}</span>
                    {profile.is_verified && (
                      <ShieldCheck className="text-blue-500 w-5 h-5 shrink-0" />
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1 text-amber-500 font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{mockRating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone_number}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50">
                <button
                  onClick={() => mutation.mutate(applicant.id)}
                  disabled={mutation.isPending}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {mutation.isPending && mutation.variables === applicant.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Accept Therapist'
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
