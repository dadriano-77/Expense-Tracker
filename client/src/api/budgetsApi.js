import axios from 'axios';

const BASE = '/api/budgets';

export const getBudgets = (year, month) => axios.get(BASE, { params: { year, month } }).then(r => r.data);
export const upsertBudget = data => axios.put(BASE, data).then(r => r.data);
export const deleteBudget = id => axios.delete(`${BASE}/${id}`);
