interface IResult {
  message: string;
  status: number;
}

export interface ILoginResult extends IResult {
  token?: string;
}

export interface INowUserResult extends IResult {
  data: API.IUserInfo;
}
