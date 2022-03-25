export const judgeToken = () => {
  const token = localStorage.getItem('token');
  console.log('token', token);
  if (token) {
    return true;
  } else {
    return false;
  }
};
