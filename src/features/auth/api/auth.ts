import { supabase } from '../../../lib/supabase';

/**
 * Uploads a KYC document to the `kyc_documents` bucket.
 * The path will be structured as `{userId}/{fileName}`.
 */
export const uploadKYCDocument = async (file: File, userId: string) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('kyc_documents')
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Update freelance_profiles with the document URL or path
  const { error: profileError } = await supabase
    .from('freelance_profiles')
    .update({ 
      kyc_document_url: data.path,
      // Setting status to pending_verification
      current_status: 'pending_verification' 
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Profile update failed: ${profileError.message}`);
  }

  return data;
};
