import React, { useEffect, useState } from 'react';
import { Row, Col, Menu, message } from 'antd';

import { defaultUser } from './constant';
import { fetchNowUser } from '../../utils/api/api';
import ErrorPage from '../error/ErrorPage';
import UserInfo from './UserInfo';
import UserPasswordEdit from './UserPasswordEdit';

export default function UserSetting() {
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('user-info');
  const [nowUserInfo, setNowUserInfo] = useState<Entity.User>(defaultUser);

  useEffect(() => {
    fetchNowUser()
      .then(({ data }) => {
        if (data.status === 200) {
          setNowUserInfo(data.data);
        } else {
          setNowUserInfo({ ...defaultUser, uid: -1 });
          throw Error(`Get Now User Info Error: ${data.message}`);
        }
      })
      .catch(error => {
        message.error(`获取登录用户信息失败:${error}`);
        console.error(error);
      });
  }, []);

  const renderContent = () => {
    switch (selectedMenuKey) {
      case 'user-info':
        return <UserInfo nowUserInfo={nowUserInfo} />;
      case 'user-password-edit':
        return <UserPasswordEdit nowUserInfo={nowUserInfo} />;
    }
  };

  return (
    <Row>
      <Col span={2}>
        <Menu mode="inline">
          <Menu.Item key="user-info" onClick={() => setSelectedMenuKey('user-info')}>
            修改用户信息
          </Menu.Item>
          <Menu.Item key="user-password-edit" onClick={() => setSelectedMenuKey('user-password-edit')}>
            修改用户密码
          </Menu.Item>
        </Menu>
      </Col>
      <Col span={22}>{nowUserInfo.uid === -1 ? <ErrorPage /> : renderContent()}</Col>
    </Row>
  );
}
