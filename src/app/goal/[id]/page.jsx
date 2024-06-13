"use client"
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useContext } from 'react';
import GlobalContext from '../../GlobalContext';
import { useRouter } from 'next/navigation';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../../css/goalcomponents.css';
import { db, auth } from '@/app/firebase';
import { deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore'; 

function GoalDetail({ params }) {
  const {
    updateScholarshipAmount,
    updateTagChange,
    setCompletedApplications,
    setTotalScholarshipAmount,
  } = useContext(GlobalContext);
  const router = useRouter();
  const id = params.id;

  const [goal, setGoal] = useState(null);
  const [editable, setEditable] = useState(false);
  const [editedGoal, setEditedGoal] = useState(null);
  const user = auth.currentUser; // Get the current user

  useEffect(() => {
    const fetchGoalFromFirestore = async () => {
      try {
        const docRef = doc(db, "users", user.email, 'goals', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const goalData = docSnap.data();
          setGoal(goalData);
          setEditedGoal(goalData);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };

    if (!user) {
      console.error("User is not authenticated.");
      router.push('/'); // Redirect to login page or handle unauthorized access
      return;
    }

    fetchGoalFromFirestore();
  }, [id, router]);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", user.email,'goals', id));
    console.log("Goal ID to delete:", id);

    // Redirect to the home page
    router.push('/Home');
    
    const storedGoals = localStorage.getItem('goals');
    const parsedGoals = storedGoals ? JSON.parse(storedGoals) : [];
    
    // Find the goal with the matching ID
    const deletedGoal = parsedGoals.find((goal) => goal.id === id);

    if (deletedGoal.tag === 'College Application' && deletedGoal.completed) {
      setCompletedApplications((prevCount) => Math.max(0, prevCount - 1));
    } else if (deletedGoal.tag === 'Scholarship' && deletedGoal.completed) {
      setTotalScholarshipAmount((prevAmount) =>
        Math.max(0, prevAmount - parseFloat(deletedGoal.scholarshipAmount || 0))
      );
    }
  };

  const handleEdit = () => {
    setEditable(true);
  };

  const handleSave = async () => {
    // Retrieve goals from local storage
    const storedGoals = localStorage.getItem('goals');
    const parsedGoals = storedGoals ? JSON.parse(storedGoals) : [];

    console.log('Original goals:', parsedGoals);

    // Update the goal with the matching ID
    const updatedGoals = parsedGoals.map((g) =>
      g.id === id ? { ...g, ...editedGoal } : g
    );

    await updateDoc(doc(db, "users", user.email,'goals', id), editedGoal);
    console.log('Document successfully updated!');
  
    // Save the updated goals to local storage
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  
    // Update the state to trigger a re-render
    setGoal({ ...goal, ...editedGoal});
    setEditable(false);

    const tagChanged = goal.tag === 'Scholarship' && editedGoal.tag !== 'Scholarship';
    
    updateTagChange({oldTag: goal.tag, newTag: editedGoal.tag, completed: editedGoal.completed});

    updateScholarshipAmount({oldTag: goal.tag, newTag: editedGoal.tag, completed: editedGoal.completed, oldscholarshipAmount: goal.scholarshipAmount, 
      scholarshipAmount: tagChanged ? 0 : editedGoal.scholarshipAmount});
  };

  const handleCancel = () => {
    // Exit edit mode and reset editedGoal to the original goal
    setEditable(false);
    setEditedGoal(goal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
      // Validate scholarshipAmount to prevent negative values
    if (name === 'scholarshipAmount' && parseFloat(value) < 0) {
      // If the value is negative, set it to 0
      setEditedGoal({ ...editedGoal, [name]: 0 });
    } else {
      setEditedGoal({ ...editedGoal, [name]: value });
    }
  };

  return (
    <div>
      <div className='goal-detail-header'>
        <ul className='goal-header-list'>
          <li onClick={() => router.back()}>
            <img src="/back.png" alt='back' />
          </li>
          {!editable && (
            <>
              <li className='delete-icon' onClick={() => handleDelete(id)}>
                <img src="/trash2.png" alt='delete' />
              </li>
              <li className='edit-icon' onClick={handleEdit}>
                <img src="/edit.png" alt='edit' />
              </li>
            </>
          )}
          {editable && (
            <>
              <li className='save-icon' onClick={handleSave}>
                <img src="/check.png" alt='save' />
              </li>
              <li className='cancel-icon' onClick={handleCancel}>
                <img src="/cancel.png" alt='cancel' />
              </li>
            </>
          )}
        </ul>
      </div>

      {goal ? (
        <div>
          <h1 className='goal-detail-name'>
            {editable ? (
              <input
                type='text'
                name='goalName'
                value={editedGoal.goalName}
                onChange={handleInputChange}
              />
            ) : (
              goal.goalName
            )}
          </h1>
          <div className='goal-info'>
            <div className='each-goal-detail'>
              <img src='/calendar.png' alt='calendar' />
              <div className='goal-info-list'>
                <div className='goal-info-text'>Due date</div>
                <div className='goal-info-value'>
                  {editable ? (
                    <div className='date-editable'>
                      <DatePicker
                      selected={editedGoal.date ? new Date(editedGoal.date) : null}
                      onChange={(date) => {
                        if (date) {
                          // Set the month and day without changing the year
                          const newDate = new Date(editedGoal.date);
                          newDate.setMonth(date.getMonth());
                          newDate.setDate(date.getDate());
                          newDate.setFullYear(date.getFullYear());
                        
                          // Update the state with the new date
                          handleInputChange({ target: { name: 'date', value: newDate.toISOString().slice(0, 10) } });
                        }
                      }}
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      popperPlacement="auto"
                      wrapperClassName="editable-datepicker"
                      minDate={new Date(new Date().getFullYear(), 0, 1)}
                      />
                    </div>                
                  ) : (
                    new Date(goal.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  )}
                </div>
              </div>
            </div>
            <div className='each-goal-detail'>
              <img src='/creator.png' alt='creator' />
              <div className='goal-info-list'>
                <div className='goal-info-text'>Creator</div>
                <div className='goal-info-value'>You</div>
              </div>
            </div>
            <div className='each-goal-detail'>
              <img src='/tag.png' alt='tag' />
              <div className='goal-info-list'>
                <div className='goal-info-text'>Tag</div>
                <div className='goal-info-value'>
                  {editable ? (
                  <select
                    name='tag'
                    value={editedGoal.tag}
                    onChange={handleInputChange}
                  >
                    <option value="None"></option>
                    <option value="College Application">College Application</option>
                    <option value="Campus Visit/Event">Campus Visit/Event</option>
                    <option value="Financial Aid">Financial Aid</option>
                    <option value="Research">Research</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                  ) : (
                    goal.tag
                  )}
                </div>
              </div>
            </div>
          </div>
          {goal.tag === 'Scholarship' && (
              <div className='scholarship-goal-detail'>
                <img src='/moneybag2.png' alt='scholarship' className='scholarship-img' />
                <div className='goal-info-list'>
                  <div className='goal-info-text'>Scholarship Amount</div>
                  <div className='goal-info-value'>
                    {editable ? (
                      <div className='scholarship'>
                        <span className='currency-editable'>$</span>
                        <input
                          type='number'
                          name='scholarshipAmount'
                          value={editedGoal.scholarshipAmount}
                          onChange={handleInputChange}
                        />
                      </div>
                    ) : (
                      `$${goal.scholarshipAmount}`
                    )}
                  </div>
                </div>
              </div>
            )}
          <p className='goal-description-title'>Description</p>
          <div className='goal-description-body'>
            {editable ? (
              <textarea
                name='description'
                value={editedGoal.description}
                onChange={handleInputChange}
              />
            ) : (
              goal.description
            )}
          </div>
        </div>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
}

export default GoalDetail;