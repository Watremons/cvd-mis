import React from 'react';
import { Dropdown, Layout, Menu, message } from 'antd';
import { DownOutlined, LogoutOutlined } from '@ant-design/icons';

import logo from '../../logo.svg';
import './CustomHeader.less';

import { logout } from '../../utils/api/api';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

export default function CustomHeader() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  function handleMenuClick() {
    logout().then(({ data }) => {
      if (data.status == 200) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('authority');
        sessionStorage.removeItem('authority');
        localStorage.removeItem('userName');
        sessionStorage.removeItem('userName');
        message.success('登出成功!');
        /** 跳转回初始页 */
        if (!navigate) return;
        navigate('/login', { replace: true });
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
      <Menu theme="dark" mode="horizontal"></Menu>
      <Dropdown.Button
        className="dropdown"
        overlay={dropdownMenu}
        placement="bottomRight"
        icon={<DownOutlined />}
        onClick={() => navigate('user/user-setting', { replace: true })}
      >
        {userName ?? '未知用户'}
      </Dropdown.Button>
    </Header>
  );
}
