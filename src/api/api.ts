// import {useUserStoreHook} from "@/store/modules/user";
// import {formatToken, getToken} from "@/utils/auth";
import axios from "axios";
// import axiosTauriApiAdapter from 'axios-tauri-api-adapter';
import { ElMessage } from "element-plus";
console.log(import.meta.env)
export const api = axios.create({
  // 公共配置
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 120000,//2分钟
});
window.apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8021'
api.interceptors.request.use(
  // 在发送请求之前做什么
  (config) => {
    // const data = getToken();
    // if (data) {
    //   const now = new Date().getTime();
    //   const expired = parseInt(data.expires) - now <= 0;
    //   if (expired) {
    //     useUserStoreHook().logOut();
    //   } else {
    //     config.headers["Authorization"] = formatToken(data.accessToken);
    //   }
    // }
    return config;
  },
  // 对请求错误做点什么
  (error) => Promise.reject(useError(error))
);

api.interceptors.response.use(
  // 对响应数据做点什么
  (response) => {
    return response;
  }
);

function useError(error) {
  console.log(error, "errorerror");
  return error;
}

function errorHandle(status: number) {
  switch (status) {
    case 401:
      break;
    default:
      break;
  }
}

window.api = api

