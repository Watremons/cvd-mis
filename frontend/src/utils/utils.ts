import { FilterValue, SorterResult } from 'antd/es/table/interface';

export const getToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  // console.log('token', token);
  if (token) {
    return token;
  } else {
    return false;
  }
};

export const toFormdata = (rawData: { [key: string]: string | number | File }) => {
  const formdata = new FormData();
  Object.keys(rawData).forEach((key: string) => {
    formdata.append(key, rawData[key].toString());
  });
  return formdata;
};

export const toRawFormdata = (rawData: { [key: string]: string | File }) => {
  const formdata = new FormData();
  Object.keys(rawData).forEach((key: string) => {
    formdata.append(key, rawData[key]);
  });
  return formdata;
};

export const joinQueryUrl = (baseUrl: string, body: { [key: string]: string | number }): string => {
  let startFlag = true;
  let queryUrl = baseUrl;
  Object.keys(body).forEach((key: string) => {
    if (body[key]) {
      const startChar = startFlag ? '?' : '&';
      startFlag = false;
      queryUrl = queryUrl.concat(startChar, key, '=', body[key].toString());
    }
  });
  return queryUrl;
};

export const joinOrderValue = (sorter: SorterResult<Entity.User> | SorterResult<Entity.User>[]) => {
  let sorterList: SorterResult<Entity.User>[] = [];
  sorterList = sorterList.concat(sorter);
  const orderValue: string[] = [];
  sorterList.forEach((element: SorterResult<Entity.User>) => {
    if (element?.columnKey && element?.order) {
      if (element?.order === 'ascend') {
        orderValue.push(element.columnKey.toString());
      } else if (element?.order === 'descend') {
        orderValue.push(`-${element.columnKey.toString()}`);
      }
    }
  });
  return orderValue.join(',');
};

export const joinFilterValue = (filterValueList: FilterValue | null): string => {
  return Array.of(filterValueList).join(',');
};
