import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // غيرها إذا API على رابط ثاني
});

export const fetchEmployees = () => api.get('/employees/');
export const createEmployee = (data) => api.post('/employees/', data);
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export default api;
