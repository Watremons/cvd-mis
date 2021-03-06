import React, { useState } from 'react';

import { Alert, message, Tabs } from 'antd';
import { LoginForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import logo from '../../assets/logo.svg';
import './LoginPage.less';
import CustomFooter from '../../component/layout/CustomFooter';

import { fetchNowUser, login } from '../../utils/api/api';
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
    navigate('/dashboard', { replace: true });
  }
  const handleSubmit = async (values: ILoginObj) => {
    try {
      // 登录
      const msg = await login({ userName: values.userName, password: values.password });
      console.log(msg.data);
      setLoginResult(msg.data);
      if (msg.data.status === 200) {
        message.success(msg.data.message);
        if (msg.data.token) {
          values.autoLogin ? localStorage.setItem('token', msg.data.token) : sessionStorage.setItem('token', msg.data.token);
          const { data } = await fetchNowUser();
          if (data.status !== 200) {
            throw Error(`Get Now User Info Error: ${data.message}`);
          }
          const userInfo = data.data;
          if (msg.data.token) {
            if (values.autoLogin) {
              // 自动登录则保存到localStorage，后端控制时长为7 days
              localStorage.setItem('userName', userInfo.userName);
              localStorage.setItem('authority', userInfo.authority.toString());
            } else {
              sessionStorage.setItem('userName', userInfo.userName);
              sessionStorage.setItem('authority', userInfo.authority.toString());
            }
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
      message.error('登录失败，请重试！');
      console.error('login error:', error);
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
                  },
                  { type: 'string', min: 6, max: 20, message: '用户名为6-20字符的英文字符或数字' }
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
                  },
                  { type: 'string', min: 6, max: 20, message: '密码为6-20字符的英文字符或数字' }
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
