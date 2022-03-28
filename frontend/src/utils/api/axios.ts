import axios, { AxiosRequestConfig } from 'axios';

export interface McAxiosRequestConfig extends AxiosRequestConfig {
  extraConfig?: {
    tokenRetryCount: number; // 标记当前请求的csrf token重试次数
  };
}

const timeout = 60000; // 请求超时时间和延迟请求超时时间统一设置

const config: McAxiosRequestConfig = {
  // baseURL: (import.meta.env.VITE_BASE_URL as string) || "/",
  baseURL: '/api',
  timeout,
  headers: {
    'Content-Type': 'application/json'
  }
};

const instance = axios.create(config);

instance.interceptors.request.use(async (config: McAxiosRequestConfig) => {
  if (!config.extraConfig?.tokenRetryCount) {
    config.extraConfig = {
      tokenRetryCount: 0
    };
  }
  return config;
});

instance.interceptors.response.use(
  response => {
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
