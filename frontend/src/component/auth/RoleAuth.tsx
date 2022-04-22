import React, { ReactElement } from 'react';
import NoAuthPage from '../../pages/error/NoAuthPage';
import { getAuthority } from '../../utils/utils';

export default function RoleAuth(props: { children: ReactElement }) {
  const authority = getAuthority();
  if (authority === 1) {
    return props.children;
  } else {
    return <NoAuthPage />;
  }
}
