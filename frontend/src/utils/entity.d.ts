declare namespace Entity {
  class User {
    uid: number;
    userName: string;
    userDes?: string;
    createDate: number;
    authority: number;
    userProjectNum: number;
    description?: string;
  }

  class LoginData {
    uid: number;
    password: string;
  }
}
