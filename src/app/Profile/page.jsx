"use client";
/* eslint-disable @next/next/no-img-element */
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import '../css/login-logout.css';

function Profile() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/'); // Redirect to the login page after sign-out
    } catch (error) {
      console.error(error.message);
    }
  };

  // If still loading, show a loading message
  if (loading) {
    return (
    <div className='container'>
      <div className='ColumnContainer'>
        <div className='TextContainer'>
          <h1>Loading...</h1>
        </div>
      </div>
    </div>
    );
  }

  // If no user is logged in, redirect to the login page
  if (!user) {
    router.push('/');
    return null; // or any other fallback UI
  }

  return (
    <div>
      <img src="/back.png" alt='back' onClick={() => router.back()}/>
      <div className='container'>
        <div className='ColumnContainer'>
          <div className='TextContainer'>
            <img className='profile-pic' src={user.photoURL} alt='Profile Picture' />
            <h1>Welcome, {user.displayName}</h1>
            <p>Email: {user.email}</p>
          </div>
          <button className='signOut-btn' onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;