import axios, { AxiosRequestConfig } from 'axios';
import { getToken } from '../utils';

export interface McAxiosRequestConfig extends AxiosRequestConfig {
  extraConfig?: {
    tokenRetryCount: number; // 标记当前请求的csrf token重试次数
  };
}

const timeout = 60000; // 请求超时时间和延迟请求超时时间统一设置

const config: McAxiosRequestConfig = {
  // baseURL: (import.meta.env.VITE_BASE_URL as string) || "/",
  baseURL: '/api',
  withCredentials: true,
  timeout,
  headers: {
    'Content-Type': 'application/json',
    token: ''
  }
};

const instance = axios.create(config);

instance.interceptors.request.use(
  async (config: McAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.token = token;
    }
    if (!config.extraConfig?.tokenRetryCount) {
      config.extraConfig = {
        tokenRetryCount: 0
      };
    }
    return config;
  },
  error => {
    // throw error
    error.data = {};
    error.data.msg = '请求异常！';
    return Promise.resolve(error);
  }
);

instance.interceptors.response.use(
  response => {
    const { data } = response;
    const { status } = data;
    if (parseInt(status)) {
      switch (parseInt(status)) {
        case 401: {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          window.location.replace('/login');
          break;
        }
        default:
          break;
      }
    }
    return response;
  },
  async err => {
    if (axios.isCancel(err)) {
      // 取消的请求，不报错
      return;
    }

    if (err.message === 'Network Error') {
      return;
    }
    if (err.message.includes('timeout')) {
      return;
    }
    if (err.response?.status >= 500) {
      return;
    }

    const { data: responseData } = err.response || {};
    const { status } = responseData || {};
    // 判断状态码决定结果
    if (status) {
      switch (parseInt(status)) {
        default:
          break;
      }
    }
    return err.response;
  }
);

export default instance;
