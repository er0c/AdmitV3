'use client'
import React, { useContext, useEffect } from 'react';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import '../css/login-logout.css';
import GlobalContext from '../GlobalContext';
import HeaderApp from '../components/header/HeaderApp';
import FooterApp from '../components/footer/FooterApp';
import Goal from '../Goal';
import '../index.css';

export default function App() {
  const {
    completedApplications,
    totalScholarshipAmount,
    updateGoalCount
  } = useContext(GlobalContext);

  const [user] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('completedApplications', completedApplications.toString());
    localStorage.setItem('totalScholarshipAmount', totalScholarshipAmount.toString());
  }, [completedApplications, totalScholarshipAmount]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user]);

  return (
    <div className="app">
        <HeaderApp completedApplications={completedApplications} totalScholarshipAmount={totalScholarshipAmount} />
          <div className="content">
            <Goal updateGoalCount={updateGoalCount}/>
          </div>
        <FooterApp />
    </div>
  );
}
