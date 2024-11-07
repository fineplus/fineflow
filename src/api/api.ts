import axios from "axios";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 0,//2分钟
});
window.apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8021'
api.interceptors.request.use(
  // 在发送请求之前做什么
  (config) => {
    return config;
  },
  (error) => Promise.reject(useError(error))
);

api.interceptors.response.use(
  (response) => {
    return response;
  }
);

function useError(error) {
  return error;
}

window.api = api

