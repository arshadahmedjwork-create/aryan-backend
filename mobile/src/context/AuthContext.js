import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';

const AuthContext = createContext();

const API_URL = Constants.expoConfig?.extra?.API_URL || 'https://aryan-backend-xpnr.onrender.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (e) {
      console.error('Failed to load token', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('[AUTH] Initiating login for:', email);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      console.log('[AUTH] Payload:', params.toString());
      
      const response = await axios.post(`${API_URL}/auth/login`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      console.log('[AUTH] Login status:', response.status);
      const { access_token } = response.data;
      
      // Set temporary token for the profile request
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      console.log('[AUTH] Token assigned, fetching profile...');
      
      // Fetch full profile like the web version does
      const profileRes = await axios.get(`${API_URL}/auth/me`);
      const userData = profileRes.data;
      console.log('[AUTH] Profile retrieved:', userData.role);
      
      await AsyncStorage.setItem('token', access_token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      setUser(userData);
      return true;
    } catch (e) {
      console.error('[AUTH] Transaction Failed');
      if (e.response) {
        console.error('[AUTH] Code:', e.response.status);
        console.error('[AUTH] Data:', JSON.stringify(e.response.data));
      } else {
        console.error('[AUTH] Error:', e.message);
      }
      throw e;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, API_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
