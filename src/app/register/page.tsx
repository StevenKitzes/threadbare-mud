import React from 'react';

import '../../app/globals.css';

import Register from './register';

const RegisterPage = (): JSX.Element => {
  return (
    <div className='page-foundation'>
      <div className='page-title'>
        Register a new account.
      </div>
      <Register />
    </div>
  );
}

export default RegisterPage;
