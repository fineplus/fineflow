import axios from "axios";

export const api = axios.create({
    baseURL: '',
    timeout: 0,
});
api.interceptors.request.use(
    config => {
        return config;
    },
    error => Promise.reject(error)
);

window.commApi = api