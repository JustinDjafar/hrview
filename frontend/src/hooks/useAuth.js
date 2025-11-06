import { useState, useEffect } from 'react';
import api from '../api/axios';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          const response = await api.get('/users/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        localStorage.removeItem('access_token'); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
};