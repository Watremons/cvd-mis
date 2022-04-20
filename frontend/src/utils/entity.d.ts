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

  // enum AuthType {
  //   user = 0,
  //   admin = 1
  // }

  class LoginData {
    uid: number;
    password: string;
  }

  // enum StatusType {
  //   todo = 0,
  //   doing = 1,
  //   done = 2
  // }

  class Point {
    x: number;
    y: number;
    value: number;
  }

  class Project {
    pid: number;
    projectName: string;
    videoFile: string;
    projectStatus: number;
    uid: number;
    taskId?: string;
    description?: string;
    projectHeatmapUrl?: string;
    projectThumbUrl?: string;
    projectRawVideoUrl?: string;
    projectResultVideoUrl?: string;
    projectResultPointList?: Point[];
  }
}
