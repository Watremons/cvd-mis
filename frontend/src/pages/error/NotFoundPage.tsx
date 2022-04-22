import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Result
      status="404"
      title="404 Not Found"
      subTitle="访问了不存在的页面"
      extra={
        <Link to="/" replace={true}>
          <Button type="primary">回到首页</Button>
        </Link>
      }
    />
  );
}
