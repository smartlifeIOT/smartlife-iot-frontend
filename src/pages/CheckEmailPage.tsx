import React from 'react';
import { CheckEmailForm } from '../features/auth/components/CheckEmailForm.tsx';

export const CheckEmailPage: React.FC = () => {

  return (
     <div className="w-full  flex justify-center items-center h-screen  bg-[url('@assets/images/bg-auth-2.png')] bg-cover bg-center  ">
      <CheckEmailForm />
      </div>
  );
};

