import { supabase } from '../../../lib/supabase';

// Fetches available jobs within a radius using a PostgreSQL RPC (Haversine formula)
export const getAvailableJobs = async (lat: number, lng: number, radiusKm: number = 10, freelanceId?: string) => {
  const { data, error } = await supabase.rpc('get_nearby_jobs', {
    search_lat: lat,
    search_lng: lng,
    radius_km: radiusKm,
    freelance_uuid: freelanceId
  });

  if (error) throw error;
  return data;
};

// Inserts a new record into `job_applications`
export const applyForJob = async (jobId: string, freelanceId: string) => {
  const { data, error } = await supabase
    .from('job_applications')
    .insert([
      { job_id: jobId, freelance_id: freelanceId, status: 'applied' }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Updates current_status and location in `freelance_profiles`
export const updateFreelanceStatus = async (
  freelanceId: string, 
  status: 'online' | 'offline' | 'on_job',
  lat?: number,
  lng?: number
) => {
  const updateData: any = { current_status: status };
  if (lat !== undefined) updateData.location_lat = lat;
  if (lng !== undefined) updateData.location_lng = lng;

  const { data, error } = await supabase
    .from('freelance_profiles')
    .update(updateData)
    .eq('id', freelanceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
