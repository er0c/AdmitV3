"use client"
import { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const initialCompletedApplications = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem('completedApplications')) || 0 : 0;

  const initialTotalScholarshipAmount = typeof window !== 'undefined'
    ? parseFloat(localStorage.getItem('totalScholarshipAmount')) || 0 : 0;

  const [completedApplications, setCompletedApplications] = useState(initialCompletedApplications);
  const [totalScholarshipAmount, setTotalScholarshipAmount] = useState(initialTotalScholarshipAmount);

  const updateGoalCount = (goal) => {
    if (goal.tag === 'College Application' && !goal.completed) {
      setCompletedApplications((prevCount) => prevCount + 1);
    } else if (goal.tag === 'Scholarship' && !goal.completed) {
      setTotalScholarshipAmount((prevAmount) => prevAmount + parseFloat(goal.scholarshipAmount || 0));
    } else if (goal.tag === 'College Application' && goal.completed) {
      setCompletedApplications((prevCount) => prevCount - 1);
    } else if (goal.tag === 'Scholarship' && goal.completed) {
      setTotalScholarshipAmount((prevAmount) =>
        Math.max(0, prevAmount - parseFloat(goal.scholarshipAmount || 0))
      );
    }
  };
  
  const updateScholarshipAmount = (goal) => {
    if (goal.completed && parseFloat(goal.scholarshipAmount || 0) !== parseFloat(goal.oldscholarshipAmount || 0)) {
      if (parseFloat(goal.scholarshipAmount || 0) > parseFloat(goal.oldscholarshipAmount || 0)) {
        // If new amount is greater than old amount, add the difference
        const scholarshipChange = parseFloat(goal.scholarshipAmount || 0) - parseFloat(goal.oldscholarshipAmount || 0);
        setTotalScholarshipAmount((prevAmount) => prevAmount + scholarshipChange);
      } else if (parseFloat(goal.scholarshipAmount || 0) < parseFloat(goal.oldscholarshipAmount || 0)) {
        // If new amount is less than old amount, subtract the difference
        const scholarshipChange = parseFloat(goal.oldscholarshipAmount || 0) - parseFloat(goal.scholarshipAmount || 0);
        setTotalScholarshipAmount((prevAmount) => Math.max(0, prevAmount - scholarshipChange));
      }
    } 
    if (goal.oldTag !== goal.newTag){
      if(goal.completed && goal.oldTag === 'Scholarship') {
        setTotalScholarshipAmount((prevAmount) =>
          Math.max(0, prevAmount - parseFloat(goal.scholarshipAmount || 0))
        );
      } else if (goal.completed && goal.newTag === 'Scholarship') {
        setTotalScholarshipAmount((prevAmount) => prevAmount + parseFloat(goal.scholarshipAmount || 0)
        );
      }
    }
    };

    const updateTagChange = (goal) => {
        if (goal.oldTag !== goal.newTag) {
          if (goal.completed && goal.oldTag === 'College Application') {
            setCompletedApplications((prevCount) => Math.max(0, prevCount - 1));
          } else if(goal.completed && goal.newTag === 'College Application') {
            setCompletedApplications((prevCount) => prevCount + 1);
          } 
        }
    };

  const updateLocalStorage = () => {
    localStorage.setItem('completedApplications', completedApplications.toString());
    localStorage.setItem('totalScholarshipAmount', totalScholarshipAmount.toString());
  };

  return (
    <GlobalContext.Provider
      value={{
        completedApplications,
        setCompletedApplications,
        totalScholarshipAmount,
        setTotalScholarshipAmount,
        updateGoalCount,
        updateScholarshipAmount,
        updateTagChange,
        updateLocalStorage,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};


export default GlobalContext;