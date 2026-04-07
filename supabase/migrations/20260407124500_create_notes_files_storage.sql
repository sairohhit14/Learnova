-- Create storage bucket for notes files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'notes-files',
  'notes-files',
  false,
  10485760, -- 10MB in bytes
  ARRAY['text/plain', 'text/markdown', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- Create policy for users to upload their own notes files
CREATE POLICY "Users can upload their own notes files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'notes-files' AND
  auth.role() = 'authenticated'
);

-- Create policy for users to read their own notes files
CREATE POLICY "Users can read their own notes files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'notes-files' AND
  auth.role() = 'authenticated'
);

-- Create policy for users to update their own notes files
CREATE POLICY "Users can update their own notes files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'notes-files' AND
  auth.role() = 'authenticated'
);

-- Create policy for users to delete their own notes files
CREATE POLICY "Users can delete their own notes files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'notes-files' AND
  auth.role() = 'authenticated'
);
