// src/pages/login.tsx
import axios from 'axios';
import { API_URL } from '../../utils/utils';

export function loginUser(username: string, password: string) {
  return axios.post(`${API_URL}/api/token`, { username, password }, {
    headers: {
      'Content-Type': 'application/json',
    }
  });
}