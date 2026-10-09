import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createJobBroadcast } from '../api/jobs';

const formSchema = z.object({
  service_type: z.string().min(1, { message: 'Service type is required' }),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  duration_minutes: z.string().min(1, { message: 'Duration must be selected' }),
  offered_price: z.string().min(1, { message: 'Price is required' }),
});

type FormValues = z.infer<typeof formSchema>;

export interface JobBroadcastFormProps {
  branchId: string;
}

export function JobBroadcastForm({ branchId }: JobBroadcastFormProps) {
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_type: '',
      start_time: '',
      duration_minutes: '60',
      offered_price: '300',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createJobBroadcast({ 
      service_type: values.service_type,
      start_time: new Date(values.start_time).toISOString(),
      duration_minutes: parseInt(values.duration_minutes),
      offered_price: parseFloat(values.offered_price),
      branch_id: branchId 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobRadar'] }); 
      reset();
      alert('Job broadcasted successfully!');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to broadcast job. Please try again.');
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-800">Broadcast New Job</h2>
        <p className="text-sm text-slate-500 mt-1">
          ประกาศเรียกฟรีแลนซ์ด่วนสำหรับสาขาของคุณ (ระบบจะส่งหาหมอที่กำลังว่างในพื้นที่)
        </p>
      </div>
      
      <div className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Service Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเภทการนวด (Service Type)</label>
            <select 
              {...register('service_type')}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.service_type ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">เลือกประเภทการให้บริการ</option>
              <option value="Thai Massage">นวดไทย (Thai Massage)</option>
              <option value="Aroma">นวดอโรม่า (Aroma)</option>
              <option value="Foot Massage">นวดเท้า (Foot Massage)</option>
            </select>
            {errors.service_type && <p className="mt-1 text-xs text-red-500">{errors.service_type.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">เวลาเริ่มงาน (Start Time)</label>
              <input 
                type="datetime-local" 
                {...register('start_time')}
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.start_time ? 'border-red-500' : 'border-slate-300'}`}
              />
              <p className="mt-1 text-xs text-slate-500">ระบุวันที่และเวลาที่ต้องการให้หมอเริ่มงาน</p>
              {errors.start_time && <p className="mt-1 text-xs text-red-500">{errors.start_time.message}</p>}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ระยะเวลา (Duration)</label>
              <select 
                {...register('duration_minutes')}
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.duration_minutes ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="60">60 นาที (1 ชม.)</option>
                <option value="90">90 นาที (1.5 ชม.)</option>
                <option value="120">120 นาที (2 ชม.)</option>
              </select>
              {errors.duration_minutes && <p className="mt-1 text-xs text-red-500">{errors.duration_minutes.message}</p>}
            </div>
          </div>

          {/* Offered Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ราคาค่าจ้าง (Offered Price - THB)</label>
            <input 
              type="number" 
              placeholder="300"
              {...register('offered_price')}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.offered_price ? 'border-red-500' : 'border-slate-300'}`}
            />
            <p className="mt-1 text-xs text-slate-500">จำนวนเงินที่จะจ่ายให้ฟรีแลนซ์สำหรับงานนี้</p>
            {errors.offered_price && <p className="mt-1 text-xs text-red-500">{errors.offered_price.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={mutation.isPending} 
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ประกาศหางาน (Broadcast Job)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
