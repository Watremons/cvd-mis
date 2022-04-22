import { Button, Result } from 'antd';
import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <Result
      status="500"
      title="500 Error"
      subTitle="服务器或页面出现错误"
      extra={
        <Link to="/" replace={true}>
          <Button type="primary">回到首页</Button>
        </Link>
      }
    />
  );
}
