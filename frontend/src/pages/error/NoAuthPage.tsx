import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

export default function NoAuthPage() {
  return (
    <Result
      status="403"
      title="403 No Auth"
      subTitle="您无权限访问此页面"
      extra={
        <Link to="/" replace={true}>
          <Button type="primary">回到首页</Button>
        </Link>
      }
    />
  );
}
