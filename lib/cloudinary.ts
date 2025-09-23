// src/lib/cloudinary.ts

// Use environment variables for Cloudinary credentials
// This will now correctly pick up "Boracay_upload2" from your .env file
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Validate environment variables
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.error('Missing Cloudinary environment variables. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.');
  throw new Error('Missing Cloudinary environment variables.');
}

// Add these console logs for debugging
console.log('Cloudinary Cloud Name (from env):', CLOUDINARY_CLOUD_NAME);
console.log('Cloudinary Upload Preset (from env):', CLOUDINARY_UPLOAD_PRESET);


// Upload images to Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  // The 'folder' parameter here determines the subfolder within your Cloudinary account.
  // If you want images to go into a different folder (e.g., 'Website' as seen in a previous screenshot),
  // you would change 'properties' to 'Website' here.
  formData.append('folder', 'properties'); 
  formData.append('quality', 'auto:good');

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  console.log('Uploading image to URL:', uploadUrl); // Add this log

  const response = await fetch(
    uploadUrl,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Cloudinary upload error response:', errorData); // Add this log
    throw new Error(errorData.error?.message || 'Image upload failed');
  }

  const data = await response.json();
  console.log('Cloudinary upload successful, secure_url:', data.secure_url); // Add this log
  return data.secure_url;
};

// Upload PDFs to Cloudinary
export const uploadPdf = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  // The 'folder' parameter here determines the subfolder within your Cloudinary account.
  // If you want PDFs to go into a different folder, change 'properties' here.
  formData.append('folder', 'properties'); 
  formData.append('resource_type', 'raw'); // Important for PDF uploads

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
  console.log('Uploading PDF to URL:', uploadUrl); // Add this log

  const response = await fetch(
    uploadUrl,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Cloudinary PDF upload error response:', errorData); // Add this log
    throw new Error(errorData.error?.message || 'PDF upload failed');
  }

  const data = await response.json();
  console.log('Cloudinary PDF upload successful, secure_url:', data.secure_url); // Add this log
  return data.secure_url;
};
