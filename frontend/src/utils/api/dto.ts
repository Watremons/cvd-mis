interface IResult {
  message: string;
  status: number;
}

export interface ILoginResult extends IResult {
  token: string;
}
