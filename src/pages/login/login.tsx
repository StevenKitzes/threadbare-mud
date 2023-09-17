'use client';

import React, { ReactNode, createContext, useContext, useState } from 'react';

type UserContextType = {
  name: string;
  setName: (name: string) => void;
}

const initialState: UserContextType = {
  name: '',
  setName: (name: string) => { console.log("needs implementation") }
}

const UserContext = createContext<UserContextType>(initialState);

import { ApiResponse, LoginPayload } from '@/types';
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

  const [username, setUsername] = useState<string>('');
  const { name, setName } = useContext(UserContext);

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
        .then((res: ApiResponse) => {
          alert(`status ${res.status}: ${res.message}`);
          setName(usernameValue);
        });
    }
  }

  return (
    <UserContext.Provider value={{name: username, setName: setUsername}}>
      <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
        <div>context name {name}</div>
        <span className={spanClassName}>User Name:</span>
        <input
          className={inputClassName}
          id='username-input'
          onChange={(evt) => setUsernameValue(evt.target.value)}
          value={usernameValue}
        />
        <span className={spanClassName}>Password:</span>
        <input
          className={inputClassName}
          id='password-input'
          onChange={(evt) => setPasswordValue(evt.target.value)}
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
    </UserContext.Provider>
  );
};

export default Login;
