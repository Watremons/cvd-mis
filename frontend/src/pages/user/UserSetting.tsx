import React, { useState } from 'react';
import { Row, Col, Menu } from 'antd';

import ErrorPage from '../error/ErrorPage';
import UserInfo from './UserInfo';
import UserPasswordEdit from './UserPasswordEdit';
import { useAppSelector } from '../../redux/hook';

export default function UserSetting() {
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('user-info');
  const nowUserInfo = useAppSelector(state => state.userReducer);

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
