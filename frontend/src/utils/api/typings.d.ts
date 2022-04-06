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
    username: string;
    password: string;
    autoLogin: boolean;
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
}
