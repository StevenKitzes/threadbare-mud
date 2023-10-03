import React from 'react';

export type LogoutCTAProps = {
  username: string;
}

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

export const SideNav = ({ username }: LogoutCTAProps): JSX.Element => {
  return (
    <div className='w-60 pt-4 mr-4 flex flex-col align-middle'>
      <span className="text-base">You are logged in as {username}.</span>
      <button
        className="h-10 min-h-[2.5rem] m-2 rounded-lg border-2 text-slate-500 bg-violet-200 border-violet-500"
        id='game-button'
        onClick={() => {window.location.href='/game'}}
      >
        Enter Threadbare
      </button>
      <button
        className="h-10 min-h-[2.5rem] m-2 rounded-lg border-2 text-slate-500 bg-violet-200 border-violet-500"
        id='character-select-button'
        onClick={() => {window.location.href='/character-select'}}
      >
        Select Character
      </button>
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

export default SideNav;
