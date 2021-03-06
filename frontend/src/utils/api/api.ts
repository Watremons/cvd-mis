import { AxiosResponse } from 'axios';
import { joinQueryUrl, toFormdata, toRawFormdata } from '../utils';
import { request } from './request';

// 统计信息相关
/** 获取用户注册统计信息接口 GET /misback/user-stat/ */
export async function fetchUserStat(): Promise<AxiosResponse<API.IUserStatResult>> {
  return request.get('/misback/user-stat/');
}

// 登录相关
/** 登录接口 POST /misback/login */
export async function login(body: API.ILoginParams): Promise<AxiosResponse<API.ILoginResult>> {
  return request.post('/misback/login/', toFormdata(body));
}

/** 登出接口 POST /misback/logout/ */
export async function logout(): Promise<AxiosResponse<API.IResult>> {
  return request.post('/misback/logout/');
}

/** 获取当前用户信息接口 GET /api/misback/now-user/ */
export async function fetchNowUser(): Promise<AxiosResponse<API.INowUserResult>> {
  return request.get('/misback/now-user/');
}

// 用户管理
/** REST获取所有用户接口 GET /api/misback/user */
export async function fetchUsers(body: API.IQueryUserParams): Promise<AxiosResponse<API.IRestResult<Entity.User>>> {
  return request.get(joinQueryUrl('/misback/user', body));
}

/** REST新增用户接口 GET /api/misback/user */
export async function createUser(body: API.ICreateUserParams): Promise<AxiosResponse<Entity.User>> {
  return request.post('/misback/user', toFormdata(body));
}

/** REST获取单个用户接口 GET /api/misback/user/<int:pk>/ */
export async function fetchUser(body: API.IChooseUserParams): Promise<AxiosResponse<Entity.User>> {
  return request.get(`/misback/user/${body.uid}/`);
}

/** REST删除用户接口 DELETE /api/misback/user/<int:pk>/ */
export async function deleteUser(body: API.IDeleteUserParams): Promise<AxiosResponse<Entity.User>> {
  return request.delete(`/misback/user/${body.uid}/`);
}

/** REST修改用户信息接口 PUT /api/misback/user/<int:pk>/ */
export async function updateUser(body: API.IUpdateUserParams): Promise<AxiosResponse<Entity.User>> {
  return request.put(`/misback/user/${body.uid}/`, toFormdata(body));
}

/** REST新增用户登录信息接口 POST /api/misback/logindata */
export async function createLoginData(body: API.ICreateLoginDataParams): Promise<AxiosResponse<Entity.LoginData>> {
  return request.post('/misback/logindata/', toFormdata(body));
}

/** REST修改用户登录信息接口 DELETE /api/misback/logindata/<int:pk>/ */
export async function updateLoginData(body: API.IUpdateLoginDataParams): Promise<AxiosResponse<Entity.User>> {
  return request.put(`/misback/logindata/${body.uid}/`, toFormdata(body));
}

// 项目管理
/** 新增检测项目信息接口 POST /api/misback/create-project/ */
export async function createProject(body: API.ICreateProjectParams): Promise<AxiosResponse<API.IResult>> {
  return request.post('/misback/create-project/', toRawFormdata(body), { headers: { 'Content-Type': 'multipart/form-data' } });
}

/** REST新增检测项目信息接口 GET /api/misback/project */
export async function fetchProjects(body: API.IQueryProjectParams): Promise<AxiosResponse<API.IRestResult<Entity.Project>>> {
  return request.get(joinQueryUrl('/misback/project', body));
}

/** REST删除检测项目接口 DELETE /api/misback/project/<int:pk>/ */
export async function deleteProject(body: API.IDeleteProjectParams): Promise<AxiosResponse<Entity.Project>> {
  return request.delete(`/misback/project/${body.pid}/`);
}

/** 运行检测项目接口 POST /api/misback/run-detect/ */
export async function runDetect(body: API.IChooseProjectParams): Promise<AxiosResponse<API.IResult>> {
  return request.post('misback/run-detect/', toFormdata(body));
}

/** REST新增获取单个项目信息接口 GET /api/misback/project/<int:pk>/ */
export async function fetchProject(body: API.IChooseProjectParams): Promise<AxiosResponse<Entity.Project>> {
  return request.get(`misback/project/${body.pid}/`);
}

/** 获取检测项目运行情况接口 GET /api/misback/async-result/str:taskId/ */
export async function asyncResult(body: API.IQueryAsyncResultParams): Promise<AxiosResponse<API.IAsyncResult>> {
  return request.get(`misback/async-result/${body.taskId}/`);
}

/** 获取所有用户缩略信息接口 GET /api/misback/user */
export async function fetchUsersBasic(): Promise<AxiosResponse<API.IRestResult<Entity.User>>> {
  return request.get('/misback/user-basic/');
}
