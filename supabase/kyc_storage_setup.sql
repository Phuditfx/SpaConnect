-- Create bucket for KYC documents
insert into storage.buckets (id, name, public)
values ('kyc_documents', 'kyc_documents', false);

-- Set up RLS policies for the bucket
-- 1. Allow authenticated users to upload their own documents
create policy "Allow authenticated users to upload KYC documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'kyc_documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Allow admins to read all KYC documents
-- Assuming admin role is stored in auth.users -> raw_user_meta_data
create policy "Allow admins to read KYC documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'kyc_documents' AND
  (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
);
