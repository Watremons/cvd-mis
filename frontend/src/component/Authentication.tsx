import React, { ReactElement } from 'react';
import { Navigate } from 'react-router';

export default function Authentication(props: { children: ReactElement }) {
  const token = localStorage.getItem('token');
  console.log('token', token);
  if (token) {
    return props.children;
  } else {
    return <Navigate to="/login" replace={true} />;
  }
}
