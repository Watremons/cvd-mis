import React, { useRef, useState } from 'react';

import { Card, message } from 'antd';
import ProForm, { ProFormInstance, ProFormText } from '@ant-design/pro-form';
import { updateLoginData } from '../../utils/api/api';

interface IUserPasswordEditProps {
  nowUserInfo: Entity.User;
}

export default function UserPasswordEdit(props: IUserPasswordEditProps) {
  const { nowUserInfo } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Card title="修改密码">
      <ProForm<{
        password: string;
        verifyPassword: string;
      }>
        formRef={formRef}
        encType="multipart/form-data"
        onFinish={async values => {
          console.log('form values', values);
          setLoading(true);
          try {
            const updateLoginDataRes = await updateLoginData({
              uid: nowUserInfo.uid,
              password: values.password
            });
            if (updateLoginDataRes.status === 200) {
              message.success('修改密码成功！');
              setLoading(false);
              formRef.current?.resetFields(); // 重置表单项
              return true;
            } else {
              throw Error(`Update User Error:${updateLoginDataRes.data}`);
            }
          } catch (error) {
            message.error(`修改密码失败:${error}`);
            console.error(error);
          }
          setLoading(false);
          return false;
        }}
        autoFocusFirstInput
      >
        <ProForm.Group>
          <ProFormText.Password
            disabled={loading}
            width="md"
            name="password"
            label="密码"
            tooltip="6-20个字符"
            placeholder="请输入密码"
            fieldProps={{ showCount: true, maxLength: 20, allowClear: true }}
            rules={[
              { required: true, message: '未输入用户密码' },
              { type: 'string', min: 6, max: 20, pattern: /(^[A-Za-z0-9]{6,20}$)/, message: '密码为6-20字符的英文字符或数字' }
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText.Password
            disabled={loading}
            width="md"
            name="verifyPassword"
            label="确认密码"
            tooltip="6-20个字符"
            placeholder="请再次输入密码"
            fieldProps={{ showCount: true, maxLength: 20, allowClear: true }}
            rules={[
              { required: true, message: '未再次输入密码确认' },
              { type: 'string', min: 6, max: 20, pattern: /(^[A-Za-z0-9]{6,20}$)/, message: '密码为6-20字符的英文字符或数字' }
            ]}
          />
        </ProForm.Group>
      </ProForm>
    </Card>
  );
}
