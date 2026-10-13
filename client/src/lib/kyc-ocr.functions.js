import apiClient from './apiClient';

export const extractKycDocument = async (fileOrBase64) => {
  // If it's a file object (e.g. from a file input)
  let file = fileOrBase64;
  
  if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
    // Convert base64 to File object if necessary
    const res = await fetch(fileOrBase64);
    const blob = await res.blob();
    file = new File([blob], 'upload.png', { type: blob.type });
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post('/kyc/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (err) {
    console.error('OCR Extraction failed:', err);
    throw new Error('Failed to process OCR document on the backend.');
  }
};

export const readKycDocument = extractKycDocument;