import api from '../services/api';

const BASE = '/swapkeeper';

export const getDashboard = () =>
    api.get(`${BASE}/dashboard`).then(r => r.data);

export const getItems = () =>
    api.get(`${BASE}/items`).then(r => r.data);

export const createItem = (data) =>
    api.post(`${BASE}/items`, data).then(r => r.data);

export const updateItem = (id, data) =>
    api.put(`${BASE}/items/${id}`, data).then(r => r.data);

export const deleteItem = (id) =>
    api.delete(`${BASE}/items/${id}`).then(r => r.data);

export const getOrders = () =>
    api.get(`${BASE}/orders`).then(r => r.data);

export const acceptOrder = (id) =>
    api.put(`${BASE}/orders/${id}/accept`).then(r => r.data);

export const declineOrder = (id) =>
    api.put(`${BASE}/orders/${id}/decline`).then(r => r.data);

export const getProfile = () =>
    api.get(`${BASE}/profile`).then(r => r.data);

export const updateProfile = (data) =>
    api.put(`${BASE}/profile`, data).then(r => r.data);
