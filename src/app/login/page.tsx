import React from 'react';

import '../../app/globals.css';

import Login from './login';

const LoginPage = (): JSX.Element => {
  return (
    <div className='page-foundation'>
      <div className='page-title'>
        Please log in to continue.
      </div>
      <Login />
    </div>
  );
}

export default LoginPage;
