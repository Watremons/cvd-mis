/* eslint-disable @typescript-eslint/no-explicit-any */
import instance, { McAxiosRequestConfig } from './axios';
import { AxiosInstance, AxiosResponse } from 'axios';

type RequestMethod = 'get' | 'post' | 'delete' | 'put';
class Request {
  private instance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.instance = instance;
  }

  /**
   * @description: get请求，参数同axios的get方法
   * @param {string} url
   * @param {McAxiosRequestConfig} config
   * @return Promise<AxiosResponse<any>>
   */
  public get(url: string, config: McAxiosRequestConfig = {}): Promise<AxiosResponse<any>> {
    return this.request('get', url, config);
  }

  /**
   * @description: post请求，参数同axios的post方法
   * @param {string} url
   * @param {McAxiosRequestConfig} config
   * @return Promise<AxiosResponse<any>>
   */
  public post(url: string, data: any = {}, config: McAxiosRequestConfig = {}): Promise<AxiosResponse<any>> {
    return this.request('post', url, config, data);
  }

  /**
   * @description: delete请求，参数同axios的delete方法
   * @param {string} url
   * @param {McAxiosRequestConfig} config
   * @return Promise<AxiosResponse<any>>
   */
  public delete(url: string, config: McAxiosRequestConfig = {}): Promise<AxiosResponse<any>> {
    return this.request('delete', url, config);
  }

  /**
   * @description: put请求，参数同axios的put方法
   * @param {string} url
   * @param {McAxiosRequestConfig} config
   * @return Promise<AxiosResponse<any>>
   */
  public put(url: string, data: any = {}, config: McAxiosRequestConfig = {}): Promise<AxiosResponse<any>> {
    return this.request('put', url, config, data);
  }

  private async request(method: RequestMethod, url: string, config: McAxiosRequestConfig, ...params: any) {
    const res = await this.instance[method](url, ...params, config);
    return res;
  }
}

export const request = new Request(instance);
