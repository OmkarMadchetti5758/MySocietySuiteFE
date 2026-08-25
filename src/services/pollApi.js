import apiClient from './apiClient';

export const pollApi = {
  getPolls: async (params = {}) => {
    const res = await apiClient.get('/polls', { params });
    return res.data;
  },

  getPollById: async (id) => {
    const res = await apiClient.get(`/polls/${id}`);
    return res.data;
  },

  createPoll: async (data) => {
    const res = await apiClient.post('/polls', data);
    return res.data;
  },

  updatePoll: async (id, data) => {
    const res = await apiClient.put(`/polls/${id}`, data);
    return res.data;
  },

  deletePoll: async (id) => {
    const res = await apiClient.delete(`/polls/${id}`);
    return res.data;
  },

  votePoll: async (id, optionId) => {
    const res = await apiClient.post(`/polls/${id}/vote`, { optionId });
    return res.data;
  },

  getPollResults: async (id) => {
    const res = await apiClient.get(`/polls/${id}/results`);
    return res.data;
  },
};
