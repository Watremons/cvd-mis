import React from 'react';
import { Dropdown, Layout, Menu } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

import logo from '../logo.svg';
import './CustomHeader.less';
import { useAppSelector } from '../redux/hook';

const { Header } = Layout;

export default function CustomHeader() {
  const username = useAppSelector(state => state.userReducer.userName);
  console.log(username);
  function handleMenuClick(e: any) {
    console.log('click logout');
  }

  const dropdownMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className="custom-header">
      <div className="icon-box">
        <img src={logo} className="logo" />
        混凝土振捣检测系统
      </div>
      <Menu theme="dark" mode="horizontal">
        {/* <Menu.Item key="user">{username}</Menu.Item> */}
      </Menu>
      <Dropdown.Button className="dropdown" overlay={dropdownMenu} placement="bottom">
        {username ?? '未知用户'}
      </Dropdown.Button>
    </Header>
  );
}
