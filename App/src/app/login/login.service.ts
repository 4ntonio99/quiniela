// src/features/login/login.service.ts
import api from '../../api/axiosConfig';

export const registerUser = async (credentials: any) => {
  return await api.post('/auth/register', { 
    ...credentials, 
    is_admin: false 
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
};