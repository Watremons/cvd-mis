import React, { ReactElement } from 'react';
import { Breadcrumb, Layout } from 'antd';

import CustomHeader from './CustomHeader';
import CustomSider from './CustomSider';
import CustomFooter from './CustomFooter';

const { Content } = Layout;

export default function CustomLayout(props: { children: ReactElement }) {
  // console.log('props.children', props.children);
  return (
    <Layout>
      <CustomHeader />
      <Layout>
        <CustomSider />
        <Layout style={{ padding: '0 24px 24px' }}>
          {/* <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item key="home">Home</Breadcrumb.Item>
            <Breadcrumb.Item key="list">List</Breadcrumb.Item>
            <Breadcrumb.Item key="app">App</Breadcrumb.Item>
          </Breadcrumb> */}
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280
            }}
          >
            {props.children}
          </Content>
          <CustomFooter />
        </Layout>
      </Layout>
    </Layout>
  );
}
