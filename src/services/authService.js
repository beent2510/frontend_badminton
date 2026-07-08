import axiosInstance from './axiosConfig';

const authService = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  verifyEmail: (data) => axiosInstance.post('/auth/verify-email', data),
  resendVerification: (data) => axiosInstance.post('/auth/resend-verification', data),
  me: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.post('/auth/logout'),
  updateProfile: (data) => axiosInstance.put('/auth/profile', data),
};

export default authService;
