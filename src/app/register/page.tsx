import React from 'react';

import '../../app/globals.css';

import Register from './register';

const RegisterPage = (): JSX.Element => {
  return (
    <div className='page-foundation'>
      <div
        className='page-title'
        data-testid='page-title'
      >
        Register a new account.
      </div>
      <Register />
    </div>
  );
}

export default RegisterPage;
