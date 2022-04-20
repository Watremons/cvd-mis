import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  SettingOutlined,
  SnippetsOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

import './CustomSider.less';

const { SubMenu } = Menu;
const { Sider } = Layout;

export default function CustomSider() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedOpenKeys, setSelectedOpenKeys] = useState<string[]>([]);
  const location = useLocation();

  const onCollapse = (nowCollapsed: boolean) => setCollapsed(nowCollapsed);

  const onSubMenuClick = ({ key }: { key: string }) => {
    if (selectedOpenKeys.includes(key)) {
      setSelectedOpenKeys((nowKeys: string[]) => nowKeys.filter((nowKey: string) => nowKey !== key));
    } else {
      setSelectedOpenKeys((nowKeys: string[]) => [...nowKeys, key]);
    }
  };

  useEffect(() => {
    const paths = location.pathname.split('/');

    if (paths.length < 1) return;
    setSelectedKeys([paths[paths.length - 1]]);

    if (paths.length < 2) return;
    setSelectedOpenKeys((nowKeys: string[]) => [...nowKeys, paths[paths.length - 2]]);
  }, [location.pathname]);

  return (
    <Sider className="custom-sider" collapsible collapsed={collapsed} onCollapse={onCollapse}>
      <Menu theme="dark" mode="inline" className="custom-menu" selectedKeys={selectedKeys} openKeys={selectedOpenKeys}>
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="dashboard/">Dashboard</Link>
        </Menu.Item>
        <SubMenu key="user" icon={<UserOutlined />} title="用户页" onTitleClick={onSubMenuClick}>
          <Menu.Item key="user-setting" icon={<SettingOutlined />}>
            <Link to="user/user-setting">用户设置</Link>
          </Menu.Item>
          <Menu.Item key="user-manage" icon={<TeamOutlined />}>
            <Link to="user/user-manage">用户管理</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="project" icon={<SnippetsOutlined />} title="项目页" onTitleClick={onSubMenuClick}>
          <Menu.Item key="project-manage" icon={<AppstoreOutlined />}>
            <Link to="project/project-manage">项目管理</Link>
          </Menu.Item>
          <Menu.Item key="project-create" icon={<AppstoreAddOutlined />}>
            <Link to="project/project-create">新建项目</Link>
          </Menu.Item>
        </SubMenu>
      </Menu>
    </Sider>
  );
}
