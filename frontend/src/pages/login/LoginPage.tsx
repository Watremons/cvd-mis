import React, { useState } from 'react';

import { Alert, message, Tabs } from 'antd';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import logo from '../../logo.svg';
import './LoginPage.less';
import CustomFooter from '../../component/CustomFooter';

import { fetchUserInfo, login } from '../../utils/api/api';
import { getToken } from '../../utils/utils';
import { defaultLoginResult } from './constant';

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

interface ILoginObj {
  userName: string;
  password: string;
  autoLogin: boolean;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState<string>('account'); // type is account or mobild
  const [loginResult, setLoginResult] = useState<API.ILoginResult>(defaultLoginResult);

  if (getToken()) {
    if (navigate) navigate('/', { replace: true });
  }
  const handleSubmit = async (values: ILoginObj) => {
    try {
      // 登录
      const msg = await login({ userName: values.userName, password: values.password });
      setLoginResult(msg.data);
      if (msg.data.status === 200) {
        const defaultLoginSuccessMessage = msg.data.message;
        message.success(defaultLoginSuccessMessage);
        const { data } = await fetchUserInfo();
        const userInfo = data.data;

        if (msg.data.token) {
          if (values.autoLogin) {
            // 自动登录则保存到localStorage，后端控制时长为7 days
            localStorage.setItem('token', msg.data.token);
            localStorage.setItem('userName', userInfo.userName);
            localStorage.setItem('authority', userInfo.authority.toString());
          } else {
            sessionStorage.setItem('token', msg.data.token);
            sessionStorage.setItem('userName', userInfo.userName);
            sessionStorage.setItem('authority', userInfo.authority.toString());
          }
        }

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
          onFinish={async (values: ILoginObj) => {
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
                name="userName"
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
