import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createJobBroadcast } from '../api/jobs';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  service_type: z.string().min(1, { message: 'Service type is required' }),
  start_time: z.string().min(1, { message: 'Start time is required' }),
  duration_minutes: z.coerce.number().min(30, { message: 'Duration must be at least 30 minutes' }),
  offered_price: z.coerce.number().min(1, { message: 'Price must be greater than 0' }),
});

type FormValues = z.infer<typeof formSchema>;

interface JobBroadcastFormProps {
  branchId: string;
}

export function JobBroadcastForm({ branchId }: JobBroadcastFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_type: '',
      start_time: '',
      duration_minutes: 60,
      offered_price: 300,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => createJobBroadcast({ ...values, branch_id: branchId }),
    onSuccess: () => {
      // เมื่อสร้างงานสำเร็จ แจ้ง React Query ให้อัปเดต UI ทันที
      queryClient.invalidateQueries({ queryKey: ['jobRadar'] }); 
      form.reset();
      alert('Job broadcasted successfully!');
    },
    onError: (error) => {
      console.error(error);
      alert('Failed to broadcast job. Please try again.');
    },
  });

  function onSubmit(values: FormValues) {
    // Supabase TIMESTAMPTZ ต้องการ ISO String (เช่น 2026-10-09T14:30:00.000Z)
    mutation.mutate({
      ...values,
      start_time: new Date(values.start_time).toISOString(),
    });
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-xl text-slate-800">Broadcast New Job</CardTitle>
        <CardDescription className="text-slate-500">
          ประกาศเรียกฟรีแลนซ์ด่วนสำหรับสาขาของคุณ (ระบบจะส่งหาหมอที่กำลังว่างในพื้นที่)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Service Type */}
            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ประเภทการนวด (Service Type)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="เลือกประเภทการให้บริการ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Thai Massage">นวดไทย (Thai Massage)</SelectItem>
                      <SelectItem value="Aroma">นวดอโรม่า (Aroma)</SelectItem>
                      <SelectItem value="Foot Massage">นวดเท้า (Foot Massage)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เวลาเริ่มงาน (Start Time)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>
                      ระบุวันที่และเวลาที่ต้องการให้หมอเริ่มงาน
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration */}
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ระยะเวลา (Duration)</FormLabel>
                    <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกระยะเวลา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="60">60 นาที (1 ชม.)</SelectItem>
                        <SelectItem value="90">90 นาที (1.5 ชม.)</SelectItem>
                        <SelectItem value="120">120 นาที (2 ชม.)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Offered Price */}
            <FormField
              control={form.control}
              name="offered_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ราคาค่าจ้าง (Offered Price - THB)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="300" {...field} />
                  </FormControl>
                  <FormDescription>
                    จำนวนเงินที่จะจ่ายให้ฟรีแลนซ์สำหรับงานนี้
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" disabled={mutation.isPending} className="px-8 bg-blue-600 hover:bg-blue-700">
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ประกาศหางาน (Broadcast Job)
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
