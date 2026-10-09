import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { getAvailableJobs } from '../api/radar';

export const useJobRadarSubscription = (freelanceId: string, lat: number, lng: number, radiusKm: number = 10) => {
  const queryClient = useQueryClient();
  const queryKey = ['jobRadar', lat, lng, radiusKm, freelanceId];

  const query = useQuery({
    queryKey,
    queryFn: () => getAvailableJobs(lat, lng, radiusKm, freelanceId),
    // ทำงานเมื่อมีพิกัดเท่านั้น
    enabled: lat !== undefined && lng !== undefined,
  });

  useEffect(() => {
    // ดักจับทั้ง INSERT, UPDATE, DELETE (event: '*') เพื่อให้เรดาร์อัปเดตตลอด
    // เช่น เมื่อร้านกดรับหมอแล้ว งานเปลี่ยนสถานะเป็น matched ก็จะหายไปจากเรดาร์
    const channel = supabase
      .channel('job_broadcasts_radar')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_broadcasts' },
        (payload) => {
          console.log('Real-time radar update:', payload);
          // ให้ React Query ดึงข้อมูลใหม่
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    // Cleanup function: ยกเลิกการติดตามเมื่อ Component ถูก Unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, lat, lng, radiusKm]);

  return query;
};
