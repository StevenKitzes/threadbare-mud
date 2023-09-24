import React from 'react';

function logout() {
  fetch('api/logout')
    .then(() => {
      document.cookie = 'token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/';
      window.location.href='/login';
    })
}

export const LogoutCTA = (): JSX.Element => {
  return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <button
        className='h-10 min-h-[2.5rem] m-2 rounded-lg border-2 text-white bg-violet-400 border-white'
        id='logout-cta-button'
        onClick={logout}
      >
        Log Out
      </button>
    </div>
  );
}

export default LogoutCTA;
