import React from 'react';

export const LoginCTA = (): JSX.Element => {
  return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <button
        className='h-10 min-h-[2.5rem] m-2 rounded-lg border-2 text-white bg-violet-400 border-white'
        id='login-cta-button'
        onClick={() => {window.location.href='/login'}}
      >
        Login
      </button>
    </div>
  );
}

export default LoginCTA;
