import React from 'react';

const spanClassName = 'ml-2';
const inputClassName = 'text-white bg-slate-700 m-2 p-2 rounded-lg border-2 border-slate-300';
const buttonBase = 'h-10 min-h-[2.5rem] m-2 rounded-lg border-2';
const buttonMainClassName = `${buttonBase} text-white bg-violet-400 border-white`;
const buttonAltClassName = `${buttonBase} text-slate-500 bg-violet-200 border-violet-500`;
const linkClassName = 'text-violet-300 m-2 my-0.5 hover:underline';

const Login = (): JSX.Element => {
  return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <span className={spanClassName}>User Name:</span>
      <input className={inputClassName} id='username-input' />
      <span className={spanClassName}>Password:</span>
      <input className={inputClassName} id='password-input' />
      <button
        className={buttonMainClassName}
        id='login-button'
      >
        Submit
      </button>
      <button
        className={buttonAltClassName}
        id='register-button'
        onClick={() => {window.location.href='/register'}}
      >
        Register
      </button>
      <a className={linkClassName} href="http://localhost:3000">Forgot user name?</a>
      <a className={linkClassName} href="http://localhost:3000">Forgot password?</a>
    </div>
  );
};

export default Login;
