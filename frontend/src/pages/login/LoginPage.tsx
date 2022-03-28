import React, { useState } from 'react';

import { Alert, message, Tabs } from 'antd';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';

import logo from '../../logo.svg';
import './LoginPage.less';

import { defaultLoginResult } from './constant';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import CustomFooter from '../../component/CustomFooter';
import { login } from '../../utils/api/api';
import { useNavigate } from 'react-router-dom';
import { ILoginResult } from '../../utils/api/dto';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24
    }}
    message={content}
    type="error"
    showIcon
  />
);

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState<string>('account'); // type is account or mobild
  const [loginResult, setLoginResult] = useState<ILoginResult>(defaultLoginResult);
  if (localStorage.getItem('token') || sessionStorage.getItem('token')) {
    if (navigate) navigate('/', { replace: true });
  }
  const handleSubmit = async (values: API.LoginParams) => {
    console.log('loginParams', values);
    try {
      // 登录
      const msg = await login({ ...values });
      if (msg.data.status === 200) {
        const defaultLoginSuccessMessage = msg.data.message;
        message.success(defaultLoginSuccessMessage);
        if (msg.data.token) {
          if (values.autoLogin) {
            localStorage.setItem('token', msg.data.token);
          } else {
            sessionStorage.setItem('token', msg.data.token);
          }
        }
        // await fetchUserInfo();
        /** 跳转回初始页 */
        if (!navigate) return;
        navigate('/', { replace: true });
        return;
      }
      console.log(msg.data);
      // 如果失败去设置用户错误信息
      // setUserLoginState(msg);
    } catch (error) {
      const defaultLoginFailureMessage = '登录失败，请重试！';
      message.error(defaultLoginFailureMessage);
    }
  };

  return (
    <div className={'container'}>
      <div className={'content'}>
        <LoginForm
          logo={<img alt="logo" src={logo} />}
          title="混凝土振捣检测系统"
          subTitle="通过yolo定点检测混凝土振捣情况"
          initialValues={{ autoLogin: true }}
          onFinish={async (values: API.LoginParams) => {
            await handleSubmit(values);
          }}
        >
          <Tabs activeKey={loginType} onChange={setLoginType}>
            <Tabs.TabPane key="account" tab={'账户密码登录'} />
          </Tabs>
          {loginResult.status === 404 && loginType === 'account' && <LoginMessage content={loginResult.message} />}
          {loginType === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={'prefixIcon'} />
                }}
                placeholder={'用户名: admin or user'}
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!'
                  }
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />
                }}
                placeholder={'密码:'}
                rules={[
                  {
                    required: true,
                    message: '请输入密码！'
                  }
                ]}
              />
            </>
          )}
          <div
            style={{
              marginBottom: 24
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right'
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
      <CustomFooter />
    </div>
  );
}
