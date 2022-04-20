import React from 'react';
import { Button, message, SelectProps } from 'antd';
import ProForm, { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { EditOutlined } from '@ant-design/icons';

import AuthorityTag from '../../component/AuthorityTag';
import { updateUser } from '../../utils/api/api';
import { authorityEnum } from './constant';

interface IUserEditProps {
  initRecord: Entity.User;
  onCreateFinish: () => void;
}

export default function UserEdit(props: IUserEditProps) {
  const { initRecord, onCreateFinish } = props;
  return (
    <ModalForm<{
      userName: string;
      userDes?: string;
      authority: number;
      description?: string;
    }>
      title={`编辑用户信息<uid:${initRecord.uid}>`}
      trigger={<Button size="middle" type="primary" shape="circle" icon={<EditOutlined />}></Button>}
      autoFocusFirstInput
      modalProps={{
        onCancel: () => console.log('关闭对话框')
      }}
      onFinish={async values => {
        try {
          message.success('提交成功');
          const updateUserRes = await updateUser({ uid: initRecord.uid, ...values });
          console.log('updateUserRes', updateUserRes);
          if (updateUserRes.status === 200) {
            message.success('修改用户信息成功');
            return true;
          }
        } catch (error) {
          message.error('修改用户信息失败，请重试！');
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
          initialValue={initRecord.userName}
          fieldProps={{ showCount: true, maxLength: 20, allowClear: true }}
          rules={[
            { required: true, message: '未输入用户名' },
            { type: 'string', min: 6, max: 20, pattern: /(^[A-Za-z0-9]{6,20}$)/, message: '用户名为6-20字符的英文字符或数字' }
          ]}
        />
        <ProFormSelect
          width="xs"
          options={authorityEnum}
          name="authority"
          label="用户权限"
          initialValue={initRecord.authority}
          fieldProps={{
            optionItemRender: (item: SelectProps): React.ReactNode => <AuthorityTag authority={item.value} />
          }}
          rules={[
            { required: true, message: '未选择用户权限' },
            { type: 'number', enum: [0, 1], message: '选择的用户权限不存在' }
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
          initialValue={initRecord.userDes}
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
          initialValue={initRecord.description}
          fieldProps={{ showCount: true, maxLength: 50, allowClear: true }}
        />
      </ProForm.Group>
    </ModalForm>
  );
}
