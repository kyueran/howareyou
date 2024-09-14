import { useState } from 'react';

const useUser = () => {
  const [user, setUser] = useState<API.UserInfo>();
  return {
    user,
    setUser,
  };
};

export default useUser;
