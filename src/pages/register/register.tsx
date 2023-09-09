import React from 'react';

const spanClassName = 'ml-2';
const noteClassName = 'm-2 text-slate-500 text-2 text-justify leading-5';
const inputClassName = 'text-white bg-slate-700 m-2 p-2 rounded-lg border-2 border-slate-300';
const buttonBase = 'h-10 min-h-[2.5rem] m-2 rounded-lg border-2';
const buttonMainClassName = `${buttonBase} text-white bg-violet-400 border-white`;
const linkClassName = 'text-violet-300 m-2 my-0.5 hover:underline';

const Login = (): JSX.Element => {
  return (
    // container level
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <span className={spanClassName}>New User Name: *</span>
      <input className={inputClassName} id='username-input' />
      <span className={spanClassName}>New Password: *</span>
      <input className={inputClassName} id='password-input' />
      <span className={spanClassName}>Repeat New Password: *</span>
      <input className={inputClassName} id='repeat-password-input' />
      <span className={spanClassName}>Email Address:</span>
      <input className={inputClassName} id='email-address' />
      <button className={buttonMainClassName} id='login-button'>
        Submit
      </button>
      <a className={linkClassName} href="http://localhost:3000/login">Login instead?</a>
      <span className={noteClassName}>Note: email is optional, but without it you'll never be able to recover a lost account.</span>
    </div>
  );
};

export default Login;
