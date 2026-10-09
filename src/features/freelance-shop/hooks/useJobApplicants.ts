import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { getJobApplicants } from '../api/jobs';

export const useJobApplicantsSubscription = (jobId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['jobApplicants', jobId];

  const query = useQuery({
    queryKey,
    queryFn: () => getJobApplicants(jobId),
    enabled: !!jobId,
  });

  useEffect(() => {
    if (!jobId) return;

    // ดักจับเฉพาะเวลามีคนใหม่กด "สมัคร" (INSERT) เข้ามาที่ job_id นี้เท่านั้น
    const channel = supabase
      .channel(`job_applications_${jobId}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'job_applications',
          filter: `job_id=eq.${jobId}` // กรองเฉพาะงานนี้
        },
        (payload) => {
          console.log('New application received:', payload);
          // ให้ React Query ดึงข้อมูลใหม่ (จะได้ข้อมูล freelance_profiles ที่ join ไว้มาด้วย)
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, jobId]);

  return query;
};
