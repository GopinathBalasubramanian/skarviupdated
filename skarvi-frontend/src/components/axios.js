// src/axios.js
import axios from 'axios';
import { API_URL } from '../utils/utils';

const instance = axios.create({
  API_URL: API_URL,
});

instance.interceptors.request.use(
  config => {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default instance;
