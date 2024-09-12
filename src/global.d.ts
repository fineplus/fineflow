import Vue from 'vue'
import AxiosInstance from "axios";

declare global {
    interface Window {
        Vue: typeof Vue;
        nodeCommon: any;
        fine: any;
        api: AxiosInstance;
        commApi: AxiosInstance;//需要完整的baseurl
        apiUrl: string;
        __TAURI__: any;
    }
}