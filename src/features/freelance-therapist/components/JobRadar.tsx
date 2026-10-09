import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Clock, Banknote } from 'lucide-react';
import { useJobRadarSubscription } from '../hooks/useJobRadar';
import { applyForJob } from '../api/radar';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface JobRadarProps {
  freelanceId: string;
  lat: number;
  lng: number;
}

export function JobRadar({ freelanceId, lat, lng }: JobRadarProps) {
  const queryClient = useQueryClient();
  // รัศมี 15 กิโลเมตร
  const { data: jobs, isLoading, error } = useJobRadarSubscription(freelanceId, lat, lng, 15); 

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => applyForJob(jobId, freelanceId),
    onSuccess: () => {
      // เมื่อสมัครเสร็จ สั่ง Invalidate เพื่อให้ query ดึงข้อมูลใหม่ 
      // ซึ่ง RPC ตัวใหม่จะตอบกลับมาว่า has_applied = true
      queryClient.invalidateQueries({ queryKey: ['jobRadar'] });
    },
    onError: (err) => {
      console.error(err);
      alert('ไม่สามารถสมัครงานได้ อาจเป็นไปได้ว่าคุณกดสมัครไปแล้วหรืองานนี้โดนแย่งไปแล้วครับ');
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
        <p>กำลังค้นหางานด่วนในพื้นที่ของคุณ...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">เกิดข้อผิดพลาดในการเชื่อมต่อเรดาร์</div>;
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <MapPin className="h-10 w-10 mb-2 opacity-30" />
        <p>ยังไม่มีงานด่วนบริเวณใกล้เคียงในขณะนี้</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-slate-800">งานด่วนรอบตัวคุณ</h2>
        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          {jobs.length} งานที่เปิดรับ
        </span>
      </div>

      <AnimatePresence>
        {jobs.map((job: any) => (
          <motion.div
            key={job.job_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Job Info Section */}
                  <div className="flex-1 p-5 md:p-6 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{job.service_type}</h3>
                      <div className="flex items-center text-slate-500 mt-1 text-sm">
                        <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                        <span className="font-semibold text-slate-700">{job.branch_name}</span>
                        <span className="mx-2">•</span>
                        <span>ห่างออกไป {Number(job.distance_km).toFixed(1)} กม.</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                        <Clock className="w-4 h-4 mr-2 text-slate-500" />
                        <span>เริ่มงาน <span className="font-bold">{new Date(job.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span></span>
                      </div>
                      <div className="flex items-center text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md">
                        ระยะเวลา <span className="font-bold ml-1">{job.duration_minutes} นาที</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Section */}
                  <div className="flex flex-col justify-center bg-slate-50 p-5 md:p-6 md:min-w-[180px] border-t md:border-t-0 md:border-l border-slate-100">
                    <div className="text-right w-full mb-4">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">ค่าจ้าง (THB)</p>
                      <div className="flex items-center justify-end text-emerald-600">
                        <Banknote className="w-5 h-5 mr-1" />
                        <span className="text-3xl font-extrabold tracking-tight">{job.offered_price}</span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full font-medium shadow-sm ${
                        job.has_applied 
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      disabled={job.has_applied || applyMutation.isPending}
                      onClick={() => applyMutation.mutate(job.job_id)}
                      variant={job.has_applied ? 'secondary' : 'default'}
                    >
                      {applyMutation.isPending && applyMutation.variables === job.job_id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : null}
                      {job.has_applied ? 'รอดำเนินการ...' : 'กดรับงานนี้'}
                    </Button>
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
