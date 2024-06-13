import React, { useEffect, useState } from 'react';
import '../../css/goalcomponents.css';

function ProgressBar({ goals }) {
  const [currentMonth, setCurrentMonth] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const today = new Date();
    const yearMonth = today.toLocaleDateString('en-US', {year: 'numeric', month: 'long' });
    setCurrentMonth(yearMonth);
  }, []);

  useEffect(() => {
    const currentMonthGoals = goals.filter(
      (goal) => new Date(goal.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long' }) === currentMonth
    );

    const totalGoals = currentMonthGoals.length;
    const completedGoals = currentMonthGoals.filter((goal) => goal.completed).length;
    const calculatedProgress = totalGoals === 0 ? 100 : (completedGoals / totalGoals) * 100;

    setProgress(calculatedProgress);
  }, [goals, currentMonth]);

  useEffect(() => {
    const handleCheckboxChange = () => {
      const currentMonthGoals = goals.filter(
        (goal) => new Date(goal.date).toLocaleDateString('en-US', {year: 'numeric', month: 'long' }) === currentMonth
      );

      const totalGoals = currentMonthGoals.length;
      const completedGoals = currentMonthGoals.filter((goal) => goal.completed).length;
      const calculatedProgress = totalGoals === 0 ? 100 : (completedGoals / totalGoals) * 100;

      setProgress(calculatedProgress);
    };

    document.addEventListener('checkboxChange', handleCheckboxChange);

    return () => {
      document.removeEventListener('checkboxChange', handleCheckboxChange);
    };
  }, [goals, currentMonth]);

  return (
    <div className="progress-bar-container">
      <div className="progress-txt">
        <h3 style={{ fontWeight: 'lighter' }}>{currentMonth}</h3>
        <h2 style={{ fontWeight: 'bolder' }}>Progress</h2>
      </div>
      <div className="progress-bar">
        <div className="inner-bar" style={{ width: `${progress}%` }}>
          <div className="inner-text">{`${Math.round(progress)}%`}</div>
        </div>
      </div>
      <p>% of monthly goals completed</p>
    </div>
  );
}

export default ProgressBar;
