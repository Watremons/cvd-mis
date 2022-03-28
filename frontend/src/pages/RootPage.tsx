import React from 'react';
import { Navigate } from 'react-router-dom';
import { judgeToken } from '../utils/utils';

export default function RootPage() {
  if (judgeToken()) {
    return <Navigate to="/home" replace={true} />;
  } else {
    return <Navigate to="/login" replace={true} />;
  }
}