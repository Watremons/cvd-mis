import { AxiosResponse } from 'axios';
import { request } from './request';

import { ILoginResult } from './dto';

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams): Promise<AxiosResponse<ILoginResult>> {
  const formdata = new FormData();
  formdata.append('userName', body.username);
  formdata.append('password', body.password);

  return request.post('/misback/login/', formdata);
}
