import { TablePaginationConfig } from 'antd';

export const defaultPagination: TablePaginationConfig = {
  pageSize: 10,
  current: 1,
  total: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  showSizeChanger: true,
  showTotal: (total: number, range: [number, number]) => `第${range[0]}-${range[1]}条 共${total}条`,
  showTitle: true
};

export const defaultUser: Entity.User = {
  uid: 0,
  userName: 'unknown',
  userDes: undefined,
  createDate: 0,
  authority: 0,
  userProjectNum: 0,
  description: undefined
};
