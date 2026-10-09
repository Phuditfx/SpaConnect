import { supabase } from '../../../lib/supabase';

// Creates a new job broadcast and deducts credits via RPC
export const createJobBroadcast = async (jobData: {
  branch_id: string;
  service_type: string;
  start_time: string;
  duration_minutes: number;
  offered_price: number;
}) => {
  const { data, error } = await supabase.rpc('broadcast_job_with_credits', {
    p_branch_id: jobData.branch_id,
    p_service_type: jobData.service_type,
    p_start_time: jobData.start_time,
    p_duration_minutes: jobData.duration_minutes,
    p_offered_price: jobData.offered_price,
    p_credit_cost: 10
  });

  if (error) {
    throw new Error(error.message);
  }

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
