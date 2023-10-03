'use client';

import React, { useEffect, useState } from 'react';

import '../../app/globals.css';

import Login from './login';

const LoginPage = (): JSX.Element => {
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

  return (
    <div className='page-foundation'>
      <div className='page-title'>
        { loggedIn ? `Welcome, ${username}!` : "Please log in to continue." }
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
