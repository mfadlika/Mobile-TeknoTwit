// API Configuration
import Constants from "expo-constants";

// Get local IP for development (replace 'localhost' with your computer's IP address)
// For iOS simulator: use 'localhost'
// For Android emulator: use '10.0.2.2'
// For physical device: use your computer's IP (e.g., '192.168.1.x')
const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://10.0.2.2:3000";

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

  FOLLOW: (userId: string | number) =>
    `${BASE_URL}/api/follow/follow/${userId}`,
  UNFOLLOW: (userId: string | number) =>
    `${BASE_URL}/api/follow/unfollow/${userId}`,
  CHECK_FOLLOW_STATUS: (userId: string | number) =>
    `${BASE_URL}/api/follow/status/${userId}`,
  GET_FOLLOWERS: (userId: string | number) =>
    `${BASE_URL}/api/follow/followers/${userId}`,
  GET_FOLLOWING: (userId: string | number) =>
    `${BASE_URL}/api/follow/following/${userId}`,
};

export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export default API_ENDPOINTS;
