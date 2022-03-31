import React, { ReactElement } from 'react';
import { Navigate } from 'react-router';
import { getToken } from '../utils/utils';

export default function Authentication(props: { children: ReactElement }) {
  const token = getToken();
  if (token) {
    return props.children;
  } else {
    return <Navigate to="/login" replace={true} />;
  }
}
