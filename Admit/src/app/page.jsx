"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect } from 'react';
import { provider, auth } from './firebase';
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from 'next/navigation';
import '././css/login-logout.css';

const Home = () => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/Home');
    }
  }, [user]);

  if(loading){
    return <div className='ColumnContainer'>
    <div className='TextContainer'>
        <h1>Loading...</h1>
    </div>
    </div>
  }

  const handleSignInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="container">
      <div className="ColumnContainer">
        <img
            src="/collegepic.png"
            alt="Profile"
            className="profileImage"
        />
        <div className='TextContainer'>
            <h1>Admit</h1>
            <p>A College Coach In Your Pocket</p>
        </div>
        <button className='signIn-btn' onClick={handleSignInWithGoogle}>Sign In</button>
      </div>
    </div>
  );
};

export default Home;
