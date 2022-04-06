import { AxiosResponse } from 'axios';
import { joinQueryUrl } from '../utils';
import { request } from './request';

// 登录相关
/** 登录接口 POST /misback/login */
export async function login(body: API.ILoginParams): Promise<AxiosResponse<API.ILoginResult>> {
  const formdata = new FormData();
  formdata.append('userName', body.username);
  formdata.append('password', body.password);

  return request.post('/misback/login/', formdata);
}

/** 登出接口 POST /misback/logout */
export async function logout(): Promise<AxiosResponse<API.IResult>> {
  return request.post('/misback/logout/');
}

/** 获取当前用户信息接口 GET /api/misback/user */
export async function fetchUserInfo(): Promise<AxiosResponse<API.INowUserResult>> {
  return request.get('/misback/now-user/');
}

// 用户管理
/** REST获取所有用户接口 GET /api/misback/user */
export async function fetchUsers(body: API.IQueryUserParams): Promise<AxiosResponse<API.IRestResult<Entity.User>>> {
  return request.get(joinQueryUrl('/misback/user', body));
}
