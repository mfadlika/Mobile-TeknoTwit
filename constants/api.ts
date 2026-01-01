// API Configuration

const BASE_URL = "http://192.168.1.6:3000";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/user/login`,
  SIGNUP: `${BASE_URL}/api/user/signup`,

  GET_USERS: `${BASE_URL}/api/user`,
  GET_USER_BY_ID: (id: string) => `${BASE_URL}/api/user/${id}`,
  GET_USER_BY_USERNAME: (username: string) =>
    `${BASE_URL}/api/user/username/${username}`,

  GET_POSTS: `${BASE_URL}/api/post`,
};

export const API_CONFIG = {
  TIMEOUT: 10000, 
  RETRY_ATTEMPTS: 3,
};

export default API_ENDPOINTS;
