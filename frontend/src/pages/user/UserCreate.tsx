import React from 'react';
import { Button, message, SelectProps } from 'antd';
import ProForm, { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';
import { createLoginData, createUser, deleteUser } from '../../utils/api/api';
import AuthorityTag from '../../component/AuthorityTag';

interface IUserCreateProps {
  onCreateFinish: () => void;
}

export default function UserCreate(props: IUserCreateProps) {
  const { onCreateFinish } = props;
  return (
    <ModalForm<{
      userName: string;
      userDes?: string;
      authority: number;
      description?: string;
      password: string;
    }>
      title="新增用户"
      trigger={
        <Button type="primary">
          <PlusOutlined />
          新增用户
        </Button>
      }
      autoFocusFirstInput
      modalProps={{
        onCancel: () => console.log('关闭对话框')
      }}
      onFinish={async values => {
        try {
          message.success('提交成功');
          const createUserRes = await createUser(values);
          if (createUserRes.status === 201) {
            const uid = createUserRes.data.uid;
            const createUserLoginRes = await createLoginData({ uid: uid, password: values.password });
            if (createUserLoginRes.status === 201) {
              console.log('createLoginRes', createUserLoginRes);
              message.success('新建用户成功');
              return true;
            } else {
              await deleteUser({ uid: uid });
              throw Error(`Create UserLoginData Error: ${createUserLoginRes}`);
            }
          } else {
            throw Error(`Create User Error: ${createUserRes}`);
          }
        } catch (error) {
          message.error('创建用户失败，请重试！');
          console.error(error);
        }
        onCreateFinish();
        return false;
      }}
    >
      <ProForm.Group>
        <ProFormText
          width="md"
          name="userName"
          label="用户名"
          tooltip="6-20个字符"
          placeholder="请输入用户名"
          fieldProps={{ showCount: true, maxLength: 20, allowClear: true }}
          rules={[
            { required: true, message: '未输入用户名' },
            { type: 'string', min: 6, max: 20, pattern: /(^[A-Za-z0-9]{6,20}$)/, message: '用户名为6-20字符的英文字符或数字' }
          ]}
        />
        <ProFormSelect
          width="xs"
          options={[
            {
              label: '管理员',
              value: 1
            },
            {
              label: '普通用户',
              value: 0
            }
          ]}
          name="authority"
          label="用户权限"
          fieldProps={{
            optionItemRender: (item: SelectProps) => <AuthorityTag authority={item.value} />
          }}
          rules={[
            { required: true, message: '未选择用户权限' },
            { type: 'number', enum: [0, 1], message: '选择的用户权限不存在' }
          ]}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormText.Password
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
        <ProFormTextArea
          width="xl"
          name="userDes"
          label="用户简介"
          tooltip="0-50个字符"
          placeholder="请输入用户简介"
          fieldProps={{ showCount: true, maxLength: 50, allowClear: true }}
        />
      </ProForm.Group>
      <ProForm.Group>
        <ProFormTextArea
          width="xl"
          name="description"
          label="备注"
          tooltip="0-50个字符"
          placeholder="请输入备注"
          fieldProps={{ showCount: true, maxLength: 50, allowClear: true }}
        />
      </ProForm.Group>
    </ModalForm>
  );
}
