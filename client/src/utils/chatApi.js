import api from './api';

export const getRooms = () => api.get('/rooms').then((res) => res.data);
export const getAllUsers = () => api.get('/rooms/users').then((res) => res.data);
export const createRoom = (memberId) => api.post('/rooms', { memberId }).then((res) => res.data);
export const getMessages = (roomId) => api.get(`/messages/${roomId}`).then((res) => res.data);