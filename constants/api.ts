// API Configuration
import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://localhost:3000";

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/user/login`,
  SIGNUP: `${BASE_URL}/api/user/signup`,

  GET_USERS: `${BASE_URL}/api/user`,
  GET_USER_BY_ID: (id: string) => `${BASE_URL}/api/user/${id}`,
  GET_USER_BY_USERNAME: (username: string) =>
    `${BASE_URL}/api/user/username/${username}`,

  GET_POSTS: `${BASE_URL}/api/post`,
  CREATE_POST: `${BASE_URL}/api/post`,
  GET_POST_BY_ID: (id: string | number) => `${BASE_URL}/api/post/${id}`,
};

export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export default API_ENDPOINTS;
