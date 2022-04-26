import React, { useRef, useState } from 'react';
import ProForm, { ProFormText, ProFormTextArea, ProFormInstance } from '@ant-design/pro-form';
import { Card, message } from 'antd';

import { updateUser } from '../../utils/api/api';

interface IUserInfoProps {
  nowUserInfo: Entity.User;
}

export default function UserInfo(props: IUserInfoProps) {
  const { nowUserInfo } = props;
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <Card title="用户信息">
      <ProForm<{
        userName: string;
        userDes: string;
      }>
        formRef={formRef}
        encType="multipart/form-data"
        onFinish={async values => {
          console.log('form values', values);
          setLoading(true);
          try {
            const updateUserRes = await updateUser({
              uid: nowUserInfo.uid,
              userName: values.userName,
              authority: nowUserInfo.authority,
              userDes: values.userDes
            });
            if (updateUserRes.status === 200) {
              message.success('更新用户信息成功！');
              setLoading(false);
              formRef.current?.resetFields(); // 重置表单项
              return true;
            } else {
              throw Error(`Update User Error:${updateUserRes.data}`);
            }
          } catch (error) {
            message.error(`更新用户信息失败:${error}`);
            console.error(error);
          }
          setLoading(false);
          return false;
        }}
        autoFocusFirstInput
      >
        <ProForm.Group>
          <ProFormText
            disabled={loading}
            width="md"
            name="userName"
            label="用户名"
            tooltip="6-20个字符"
            placeholder="请输入用户名"
            initialValue={nowUserInfo.userName}
            fieldProps={{ showCount: true, maxLength: 20, allowClear: true }}
            rules={[
              { required: true, message: '未输入用户名' },
              { type: 'string', min: 6, max: 20, pattern: /(^[A-Za-z0-9]{6,20}$)/, message: '用户名为6-20字符的英文字符或数字' }
            ]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormTextArea
            disabled={loading}
            width="xl"
            name="userDes"
            label="用户简介"
            tooltip="0-50个字符"
            placeholder="请输入用户简介"
            initialValue={nowUserInfo.userDes}
            fieldProps={{ showCount: true, maxLength: 50, allowClear: true }}
          />
        </ProForm.Group>
      </ProForm>
    </Card>
  );
}
