import { supabase } from '../../../lib/supabase';

// Inserts a new record into `job_broadcasts`
export const createJobBroadcast = async (jobData: {
  branch_id: string;
  service_type: string;
  start_time: string;
  duration_minutes: number;
  offered_price: number;
}) => {
  const { data, error } = await supabase
    .from('job_broadcasts')
    .insert([jobData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fetches records from `job_applications` joined with `freelance_profiles`
export const getJobApplicants = async (jobId: string) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      id,
      status,
      created_at,
      freelance_profiles (
        id,
        full_name,
        phone_number,
        is_verified,
        current_status
      )
    `)
    .eq('job_id', jobId);

  if (error) throw error;
  return data;
};

// Updates the application status, job broadcast status, and creates a POS session via Edge Function
export const acceptApplicant = async (applicationId: string) => {
  const { data, error } = await supabase.functions.invoke('accept-applicant', {
    body: { applicationId }
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  
  return data;
};
