import { error } from '@/utils/log';
import React, { ReactNode, createContext, useState } from 'react';

export type UserContextType = {
  setUsername: (name: string) => void;
  username: string;
}

const initialUserContext: UserContextType = {
  setUsername: () => { error("UserContext needs implementation."); },
  username: ''
}

export const UserContext = createContext<UserContextType>(initialUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string>('');

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
