export const getToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  console.log('token', token);
  if (token) {
    return token;
  } else {
    return false;
  }
};
