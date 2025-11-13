// client/src/utils/urlHelpers.js
export const getMediaUrl = (path) => {
  console.log('Original path:', path); // Debug log
  
  if (!path) return '/placeholder-avatar.png';
  
  if (path.startsWith('http') || path.startsWith('blob:')) {
    return path;
  }
  
  if (path.startsWith('/uploads')) {
    const API_URL = process.env.REACT_APP_IMAGE_URL || 'http://localhost:4000';
    const fullUrl = `${API_URL}${path}`;
    console.log('Generated URL:', fullUrl); // Debug log
    return fullUrl;
  }
  
  return path;
};