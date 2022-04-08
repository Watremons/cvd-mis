declare namespace API {
  type IResult = {
    message: string;
    status: number;
  };

  type ILoginResult = IResult & {
    token?: string;
  };

  type INowUserResult = IResult & {
    data: Entity.User;
  };

  type IPageResult = {
    pageSize: number;
    current: number;
    total: number;
  };

  type IRestResult<T> = IPageResult & {
    data: T[];
  };

  type ILoginParams = {
    userName: string;
    password: string;
  };

  type IPageParams = {
    pageSize: number;
    current: number;
  };

  type IQueryUserParams = IPageParams & {
    authority?: string;
    ordering?: string;
    search?: string;
  };

  type ICreateUserParams = {
    userName: string;
    password: string;
    userDes?: string;
    authority: number;
    description?: string;
  };

  type IChooseUserParams = {
    uid: number;
  };

  type IDeleteUserParams = IChooseUserParams;

  type IUpdateUserParams = IChooseUserParams & {
    userName: string;
    userDes?: string;
    authority: number;
    description?: string;
  };

  type ICreateLoginDataParams = {
    uid: number;
    password: string;
  };
}
