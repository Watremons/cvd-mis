import React from 'react';
import { Col, Card, Tooltip, Skeleton } from 'antd';

import logo from '../../assets/logo.svg';
import AuthorityTag from '../../component/AuthorityTag';

interface IIntroductionRowProps {
  userInfo: Entity.User;
  loading: boolean;
}

export default function IntroductionRow(props: IIntroductionRowProps) {
  const { userInfo, loading } = props;
  // console.log('gutter', gutter);

  return (
    <>
      <Col span={6}>
        <Skeleton active loading={loading}>
          <Card>
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                  欢迎您，{userInfo.userName} <br />
                  您现在有 {userInfo.userProjectNum} 个项目
                </p>
              </header>
            </div>
          </Card>
        </Skeleton>
      </Col>
      <Col span={6}>
        <Skeleton active loading={loading}>
          <Card title="用户权限">
            <Tooltip
              placement="right"
              title={userInfo.authority === 1 ? '可使用用户管理，并可管理所有用户项目' : '不可使用用户管理，只可管理本账号项目'}
            >
              <span>
                <AuthorityTag authority={userInfo.authority} />
              </span>
            </Tooltip>
          </Card>
        </Skeleton>
      </Col>
      <Col span={6}>
        <Skeleton active loading={loading}>
          <Card title="个人简介">{userInfo.userDes}</Card>
        </Skeleton>
      </Col>
      <Col span={6}>
        <Skeleton active loading={loading}>
          <Card title="创建时间">{userInfo.createDate}</Card>
        </Skeleton>
      </Col>
    </>
  );
}
