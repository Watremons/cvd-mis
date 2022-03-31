import { AxiosResponse } from 'axios';
import { request } from './request';

import { ILoginResult, INowUserResult } from './dto';

/** 登录接口 POST /misback/login */
export async function login(body: API.LoginParams): Promise<AxiosResponse<ILoginResult>> {
  const formdata = new FormData();
  formdata.append('userName', body.username);
  formdata.append('password', body.password);

  return request.post('/misback/login/', formdata);
}

/**获取用户信息接口 GET /api/misback/user */
export async function fetchUserInfo(): Promise<AxiosResponse<INowUserResult>> {
  return request.get('/misback/now-user/');
}
