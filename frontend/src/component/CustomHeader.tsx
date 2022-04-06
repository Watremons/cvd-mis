import React from 'react';
import { Dropdown, Layout, Menu, message } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';

import logo from '../logo.svg';
import './CustomHeader.less';

import { logout } from '../utils/api/api';

const { Header } = Layout;

export default function CustomHeader() {
  const username = localStorage.getItem('username');
  function handleMenuClick() {
    logout().then(({ data }) => {
      if (data.status == 200) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        message.success('登出成功!');
      }
    });
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
