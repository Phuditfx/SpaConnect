import { supabase } from '../../../lib/supabase';

// Fetch therapists who are pending verification
export const getPendingTherapists = async () => {
  const { data, error } = await supabase
    .from('freelance_profiles')
    .select('id, full_name, phone_number, license_number, kyc_document_url, current_status, is_verified')
    .eq('current_status', 'pending_verification')
    .eq('is_verified', false);

  if (error) {
    throw new Error(`Failed to fetch pending therapists: ${error.message}`);
  }

  return data;
};

// Verify a therapist
export const verifyTherapist = async (freelanceId: string) => {
  const { data, error } = await supabase
    .from('freelance_profiles')
    .update({ 
      is_verified: true, 
      current_status: 'available' // Or whatever default active status is
    })
    .eq('id', freelanceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to verify therapist: ${error.message}`);
  }

  return data;
};

// Reject a therapist
export const rejectTherapist = async (freelanceId: string) => {
  const { data, error } = await supabase
    .from('freelance_profiles')
    .update({ 
      is_verified: false, 
      current_status: 'rejected' 
    })
    .eq('id', freelanceId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to reject therapist: ${error.message}`);
  }

  return data;
};

// Get signed URL for KYC document (since bucket is private)
export const getDocumentUrl = async (path: string) => {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from('kyc_documents')
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }

  return data.signedUrl;
};
