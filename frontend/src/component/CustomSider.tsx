import React from 'react';
import { Layout, Menu } from 'antd';
import { AppstoreAddOutlined, AppstoreOutlined, SettingOutlined, SnippetsOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';

const { SubMenu } = Menu;
const { Sider } = Layout;

export default function CustomSider() {
  return (
    <Sider className="custom-sider">
      <Menu theme="dark" mode="inline" className="custom-menu">
        <Menu.Item key="dashboard">Dashboard</Menu.Item>
        <SubMenu key="user" icon={<UserOutlined />} title="用户页">
          <Menu.Item key="user-settings" icon={<SettingOutlined />}>
            用户设置
          </Menu.Item>
          <Menu.Item key="user-list" icon={<TeamOutlined />}>
            用户列表
          </Menu.Item>
        </SubMenu>
        <SubMenu key="project" icon={<SnippetsOutlined />} title="项目页">
          <Menu.Item key="project-list" icon={<AppstoreOutlined />}>
            项目列表
          </Menu.Item>
          <Menu.Item key="project-add" icon={<AppstoreAddOutlined />}>
            新建项目
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
}
