'use client';

import React, { useEffect } from 'react';

export const Page = (): JSX.Element => {
  useEffect(() => {
    window.location.href = "/login";
  }, []);

  return (
    <div data-testid='page-title'>Welcome to Threadbare.  Loading . . .</div>
  );
}

export default Page;
