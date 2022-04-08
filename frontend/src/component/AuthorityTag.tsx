import React from 'react';
import { Tag } from 'antd';

export default function AuthorityTag(props: { authority: number }) {
  const { authority } = props;
  switch (authority) {
    case 0:
      return <Tag color="green">普通用户</Tag>;
    case 1:
      return <Tag color="red">管理员</Tag>;
    default:
      return <Tag color="default">权限错误: {authority}</Tag>;
  }
}
