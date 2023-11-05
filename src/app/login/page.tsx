'use client';

import React, { useEffect, useState } from 'react';

import '../../app/globals.css';

import Login from './login';

const LoginPage = (): JSX.Element => {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [registerSuccess, setRegisterSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('registered')) {
      setRegisterSuccess(true);
    }

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

  let title: string;
  if (loggedIn) title = `Welcome, ${username}!`;
  else if (registerSuccess) title = 'Registration successful!  Log in to continue.';
  else title = 'Please log in to continue.';

  return (
    <div className='page-foundation'>
      <div
        className='page-title'
        data-testid='page-title'
      >
        { title }
      </div>
      <Login
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        setUsername={setUsername}
      />
    </div>
  );
}

export default LoginPage;
