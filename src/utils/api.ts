import axios from "axios";
// import axiosTauriApiAdapter from 'axios-tauri-api-adapter';

export const api = axios.create({
    // 公共配置
    baseURL: '',
    timeout: 55000,//2分钟
    // ...import.meta.env.MODE == 'tauri' ? ({adapter: axiosTauriApiAdapter}) : {}
});
api.interceptors.request.use(
    // 在发送请求之前做什么
    config => {
        return config;
    },
    // 对请求错误做点什么
    error => Promise.reject(error)
);

api.interceptors.response.use(
    // 对响应数据做点什么
    response => {
        return response;
    },
);

function errorHandle(status: number) {
    switch (status) {
        case 401:
            break;
        default:
            break;
    }
}

window.commApi = api