import axios from 'axios';

const BASE = '/api/auth';

export const login = data => axios.post(`${BASE}/login`, data).then(r => r.data);
export const register = data => axios.post(`${BASE}/register`, data).then(r => r.data);
