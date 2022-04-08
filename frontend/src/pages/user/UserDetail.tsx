import React, { useEffect, useState } from 'react';
import { Drawer, Divider, message, Empty, Descriptions, Button } from 'antd';

import { fetchUser } from '../../utils/api/api';
import { defaultUser } from './constant';
import AuthorityTag from '../../component/AuthorityTag';

interface IUserDetailProps {
  onClose: () => void;
  visible: boolean;
  uid: number;
}

export default function UserDetail(props: IUserDetailProps) {
  const { onClose, visible, uid } = props;
  const [showUser, setShowUser] = useState<Entity.User>(defaultUser);
  useEffect(() => {
    if (uid > 0) {
      try {
        fetchUser({ uid: uid })
          .then(msg => {
            if (msg.status) {
              setShowUser(msg.data);
            }
          })
          .catch(err => {
            message.error(`获取uid为 ${uid} 的用户信息失败`);
            console.log(`Get user info with uid ${uid} error`, err);
          });
      } catch (error) {
        message.error(`获取uid为 ${uid} 的用户信息失败`);
      }
    }
  }, [uid]);

  return (
    <Drawer width={640} placement="right" title="用户详情" onClose={onClose} visible={visible}>
      {uid === 0 ? (
        <Empty />
      ) : (
        <>
          <Descriptions title={`用户信息<uid: ${uid}>`} column={2} extra={<Button>Edit</Button>}>
            <Descriptions.Item label="用户名">{showUser.userName}</Descriptions.Item>
            <Descriptions.Item label="用户权限">
              <AuthorityTag authority={showUser.authority} />
            </Descriptions.Item>
            <Descriptions.Item label="项目数量" span={1}>
              {showUser.userProjectNum}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间" span={1}>
              {showUser.createDate}
            </Descriptions.Item>
            <Descriptions.Item label="个人简介" span={2}>
              {showUser.userDes}
            </Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>
              {showUser.description}
            </Descriptions.Item>
          </Descriptions>
          <Divider />
        </>
      )}
    </Drawer>
  );
}
