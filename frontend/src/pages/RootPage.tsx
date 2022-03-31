import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../utils/utils';

export default function RootPage() {
  if (getToken()) {
    return <Navigate to="/home" replace={true} />;
  } else {
    return <Navigate to="/login" replace={true} />;
  }
}
