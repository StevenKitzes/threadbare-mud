import React from 'react';

const buttonBase = 'h-10 min-h-[2.5rem] m-2 rounded-lg border-2';
const buttonMainClassName = `${buttonBase} text-white bg-violet-400 border-white`;

function logout() {
  fetch('api/logout')
    .then(() => {
      document.cookie = 'token=; expires=Fri, 1 Jan 2000 0:00:00 UTC; path=/';
      window.location.href='/login';
    })
    .catch(err => {
      console.error("Unable to log out for some reason.", err.toString());
    })
}

export const SideNav = (): JSX.Element => {
  return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <button
        className={buttonMainClassName}
        id='logout-button'
        onClick={logout}
      >
        Log Out
      </button>
    </div>
  );
}