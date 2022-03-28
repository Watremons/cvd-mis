/* eslint-disable @typescript-eslint/no-explicit-any */
import instance, { McAxiosRequestConfig } from './axios';
import { AxiosInstance, AxiosResponse } from 'axios';

type RequestMethod = 'get' | 'post';
class Request {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  /**
   * @description: get请求，参数同axios的get方法，额外增加showLoading参数用于控制全局loading状态
   * @param {string} url
   * @param {McAxiosRequestConfig} config
   * @return Promise<AxiosResponse<any>>
   */
  public get(url: string, config: McAxiosRequestConfig = {}): Promise<AxiosResponse<any>> {
    return this.request('get', url, config);
  }

  /**
   * @description: post请求，参数同axios的post方法，额外增加showLoading参数用于控制全局loading状态
   * @param {string} url
   * @param {McAxiosRequestConfig} config
   * @return Promise<AxiosResponse<any>>
   */
  public post(url: string, data: any = {}, config: McAxiosRequestConfig = {}): Promise<AxiosResponse<any>> {
    return this.request('post', url, config, data);
  }

  private async request(method: RequestMethod, url: string, config: McAxiosRequestConfig, ...params: any) {
    const res = await this.instance[method](url, ...params, config);
    return res;
  }
}

export const request = new Request(instance);
