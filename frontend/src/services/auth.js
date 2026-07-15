import { apiFetch } from './api';

export const authService = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: formData,
      noAuth: true,
    });
    
    if (data.access_token) {
      localStorage.setItem('token', data.access_token);
    }
    return data;
  },

  register: async (email, password) => {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: { email, password },
      noAuth: true,
    });
  },

  getCurrentUser: async () => {
    try {
      return await apiFetch('/auth/me');
    } catch (e) {
      localStorage.removeItem('token');
      throw e;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  }
};
