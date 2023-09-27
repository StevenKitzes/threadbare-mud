'use client';

import React, { ReactNode, useEffect, useState } from 'react';

import { LoginPayload } from '@/types';
import postData from '@/utils/postData';

const spanClassName = 'ml-2';
const inputClassName = 'text-white bg-slate-700 m-2 p-2 rounded-lg border-2 border-slate-300';
const buttonBase = 'h-10 min-h-[2.5rem] m-2 rounded-lg border-2';
const buttonMainClassName = `${buttonBase} text-white bg-violet-400 border-white`;
const buttonAltClassName = `${buttonBase} text-slate-500 bg-violet-200 border-violet-500`;
const linkClassName = 'text-violet-300 m-2 my-0.5 hover:underline';

const Login = (): JSX.Element => {
  const [usernameValue, setUsernameValue] = useState<string>('');
  const [passwordValue, setPasswordValue] = useState<string>('');
  const [errorElements, setErrorElements] = useState<ReactNode[]>([]);

  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    fetch('api/check-session', { method: "POST" })
      .then((res) => {
        if (res.status === 200) {
          setLoggedIn(true);
          res.json()
            .then((json) => {
              setUsername(json.username);
            })
        }
      })
  }, []);

  function submit() {
    const errors = [];
    if (!usernameValue || !usernameValue.trim()) {
      errors.push(<span className={spanClassName + ' text-red-500'} key="name">
        User name required.
      </span>);
    }
    if (!passwordValue) {
      errors.push(<span className={spanClassName + ' text-red-500'} key="pass">
        Password required.
      </span>);
    }
    setErrorElements(errors);
    if (errors.length < 1) {
      // submit may proceed!
      const loginPayload: LoginPayload = {
        user: usernameValue,
        pass: passwordValue
      };
      postData('api/login', loginPayload)
        .then((res) => {
          if (res.status === 200) {
            setLoggedIn(true);
            setUsernameValue('');
            setPasswordValue('');
            setUsername(res.username);
          } else {
            setErrorElements([
              <span className={spanClassName + ' text-red-500'} key="pass">
                Unable to log you in with those credentials.  Try again?
              </span>
            ]);
          }
        });
    }
  }

  function logout() {
    fetch('api/logout')
      .then(() => {
        document.cookie = 'token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/';
        setLoggedIn(false);
      })
      .catch(err => {
        setErrorElements([
          <span className={spanClassName + ' text-red-500'} key="pass">
            There was a problem logging you out.  You can try again if you want?
          </span>
        ]);
      })
  }

  if (loggedIn) return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <span className={spanClassName}>Hello, {username}.</span>
      <button
        className={buttonAltClassName}
        id='character-select-button'
        onClick={() => {window.location.href='/character-select'}}
      >
        Character Select
      </button>
      <button
        className={buttonMainClassName}
        id='logout-button'
        onClick={() => logout()}
      >
        Log Out
      </button>
    </div>
  );
  return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <span className={spanClassName}>User Name:</span>
      <input
        className={inputClassName}
        id='username-input'
        onChange={(evt) => setUsernameValue(evt.target.value)}
        onKeyUp={(e) => { if (e.key === 'Enter') submit() }}
        value={usernameValue}
      />
      <span className={spanClassName}>Password:</span>
      <input
        className={inputClassName}
        id='password-input'
        onChange={(evt) => setPasswordValue(evt.target.value)}
        onKeyUp={(e) => { if (e.key === 'Enter') submit() }}
        type="password"
        value={passwordValue}
      />
      <button
        className={buttonMainClassName}
        id='login-button'
        onClick={() => submit()}
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
      {errorElements}
    </div>
  );
};

export default Login;