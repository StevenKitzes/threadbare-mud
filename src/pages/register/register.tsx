import React, { ReactNode, useEffect, useRef, useState } from 'react';

import { ApiResponse, RegistrationPayload } from '@/types';
import postData from '@/utils/postData';

const spanClassName = 'ml-2';
const noteClassName = 'm-2 text-slate-500 text-2 text-justify leading-5';
const inputClassName = 'text-white bg-slate-700 m-2 p-2 rounded-lg border-2 border-slate-300';
const buttonBase = 'h-10 min-h-[2.5rem] m-2 rounded-lg border-2';
const buttonMainClassName = `${buttonBase} text-white bg-violet-400 border-white`;
const linkClassName = 'text-violet-300 m-2 my-0.5 hover:underline';

const usernameRegex: RegExp = new RegExp(/(^[a-zA-Z][a-zA-Z0-9]*$)|(^$)/);
const passwordRegex: RegExp = new RegExp(/^.{8,}$/);
const emailRegex: RegExp = new RegExp(/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/);

const Login = (): JSX.Element => {
  const [newUser, setNewUser] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [newPassAgain, setNewPassAgain] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errorElements, setErrorElements] = useState<ReactNode[]>([]);

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameRef?.current?.focus();
  }, []);

  const submit = (): void => {
    const errors = [];
    if (!usernameRegex.test(newUser) || newUser.length < 5) {
      errors.push(<span className={spanClassName + ' text-red-500'} key="name">
        User name must begin with a letter, contain only letters and numbers, and have at least 5 characters.
      </span>);
    }
    if (!passwordRegex.test(newPass)) {
      errors.push(<span className={spanClassName + ' text-red-500'} key="pass">
        Password must be at least 8 characters long.
      </span>);
    }
    if (newPass !== newPassAgain) {
      errors.push(<span className={spanClassName + ' text-red-500'} key="pass-match">
        Password and repeated password must match.
      </span>);
    }
    if (!emailRegex.test(email)) {
      errors.push(<span className={spanClassName + ' text-red-500'} key="pass-match">
        Please use a valid email address.
      </span>)
    }
    setErrorElements(errors);
    if (errors.length < 1) {
      // submit may proceed!
      const registrationPayload: RegistrationPayload = {
        user: newUser,
        pass: newPass,
        email
      };
      postData('api/register', registrationPayload)
        .then((res: ApiResponse) => {
          alert(`status ${res.status}: ${res.message}`);
        });
    }
  }

  return (
    // container level
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <span className={spanClassName}>New User Name: *</span>
      <input
        className={inputClassName}
        id='username-input'
        onChange={(evt) => {
          const newVal = evt.target.value;
          if (!usernameRegex.test(newVal)) return;
          setNewUser(newVal)
        }}
        onKeyUp={(e) => { if (e.key === 'Enter') submit() }}
        ref={usernameRef}
        value={newUser}
      />

      <span className={spanClassName}>New Password: *</span>
      <input
        className={inputClassName}
        id='password-input'
        onChange={(evt) => {
          const newVal = evt.target.value;
          setNewPass(newVal);
        }}
        onKeyUp={(e) => { if (e.key === 'Enter') submit() }}
        type="password"
        value={newPass}
      />

      <span className={spanClassName}>Repeat New Password: *</span>
      <input
        className={inputClassName}
        id='repeat-password-input'
        onChange={(evt) => {
          const newVal = evt.target.value;
          setNewPassAgain(newVal);
        }}
        onKeyUp={(e) => { if (e.key === 'Enter') submit() }}
        type="password"
        value={newPassAgain}
      />

      <span className={spanClassName}>Email Address:</span>
      <input
        className={inputClassName}
        id='email-address'
        onChange={(evt) => {
          const newVal = evt.target.value;
          setEmail(newVal);
        }}
        onKeyUp={(e) => { if (e.key === 'Enter') submit() }}
        value={email}
      />
      
      {errorElements}
      <button
        className={buttonMainClassName}
        id='login-button'
        onClick={submit}
      >
        Submit
      </button>
      <a className={linkClassName} href="http://localhost:3000/login">Login instead?</a>
      <span className={noteClassName}>Note: email is optional, but without it you'll never be able to recover a lost account.</span>
    </div>
  );
};

export default Login;
