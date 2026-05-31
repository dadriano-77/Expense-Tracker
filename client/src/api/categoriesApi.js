import axios from 'axios';

const BASE = '/api/categories';

export const getCategories = () => axios.get(BASE).then(r => r.data);
export const createCategory = data => axios.post(BASE, data).then(r => r.data);
export const updateCategory = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteCategory = id => axios.delete(`${BASE}/${id}`);
