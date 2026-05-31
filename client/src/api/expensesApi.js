import axios from 'axios';

const BASE = '/api/expenses';

export const getExpenses = (params = {}) => axios.get(BASE, { params }).then(r => r.data);
export const createExpense = data => axios.post(BASE, data).then(r => r.data);
export const updateExpense = (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data);
export const deleteExpense = id => axios.delete(`${BASE}/${id}`);
