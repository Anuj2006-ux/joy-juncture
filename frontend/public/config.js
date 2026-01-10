// API Configuration for static HTML pages
// Update this URL when deploying to production
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://your-backend.onrender.com'; // Replace with your actual backend URL

window.API_URL = API_URL;
