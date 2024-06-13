import { useState, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import '../../css/goalcomponents.css';
import 'react-spring-bottom-sheet/dist/style.css';
import '../../css/bottom-sheet.css';
import '../../css/header.css';
import '../../css/login-logout.css';
import GoalList from './GoalList';
import ProgressBar from './ProgressBar'; 
import { db, auth } from '@/app/firebase';
import { addDoc, collection, doc, updateDoc } from "firebase/firestore"; 
import fetchGoalsFromFirestore from '@/app/firebase';

export async function addGoalToFirestore(newGoal) {
  try {
    // Parse the original date string
    const user = auth.currentUser; // Get the current user
    if (!user) {
      console.error("User is not authenticated.");
      return false; // Indicate failure
    }
    
    const originalDate = new Date(newGoal.date);

    // Format the date as "Month Day, Year"
    const formattedDate = originalDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Save the goal to Firestore with the formatted date
    const docRef = await addDoc(collection(db, "users", user.email ,"goals"), {...newGoal, date: formattedDate});
    const id = docRef.id;
    console.log("Document written with ID: ", id);
    return id;
  } catch (error) {
    console.error("Error adding document: ", error);
    return false; // Indicate failure
  }
}

function NewGoal({ updateGoalCount }) {
  const [open, setOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [scholarshipAmount, setScholarshipAmount] = useState('');
  const [isFormFilled, setIsFormFilled] = useState(false);
  const [goals, setGoals] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedGoals = localStorage.getItem('goals');
      return storedGoals ? JSON.parse(storedGoals) : [];
    } else {
      return [];
    }
  });

  async function fetchGoals() {
    const goalsFromFirestore = await fetchGoalsFromFirestore();
    setGoals(goalsFromFirestore);
  }

  useEffect(() => {
    fetchGoals(); // Fetch goals from Firestore when the component mounts
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newGoal = {
      goalName,
      date,
      description,
      tag,
      scholarshipAmount,
      completed: false,
    };

    const id = await addGoalToFirestore(newGoal);

    if (id) {
      // Update local state for UI
      const updatedGoals = [...goals, { id, ...newGoal }];
      setGoals(updatedGoals);
      saveToLocalStorage(updatedGoals);
      // Clear form fields after submission
      setGoalName('');
      setDate('');
      setDescription('');
      setTag('');
      setScholarshipAmount('');
      setOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'scholarshipAmount') {
      // Check if the entered value is negative
      const newValue = value.startsWith('-') ? '' : value;
      setScholarshipAmount(newValue);
    } else {
      setGoalName(e.target.value);
    }
  };

  const saveToLocalStorage = (data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('goals', JSON.stringify(data));
    }
  };

  useEffect(() => {
    const formValues = [goalName, date];
    const isDateSelected = date;
    setIsFormFilled(formValues.every((value) => value !== '' && (value !== null || isDateSelected)));
  }, [goalName, date]);

  const handleCheckboxClick = async (goal) => {
    const user = auth.currentUser;

    const updatedGoals = goals.map((g) =>
      g.id === goal.id ? { ...g, completed: !g.completed } : g
    );

    await updateDoc(doc(db, "users", user.email,"goals", goal.id), {
      completed: !goal.completed
    });

    setGoals(updatedGoals);
    saveToLocalStorage(updatedGoals);
  };

  return (
    <div>
      <ProgressBar goals={goals} onCheckboxClick={handleCheckboxClick} />
      <div className="task-container">
        <h2>GOALS</h2>
      </div>
      <div className="new-goal-section">
        <button className="new-goal-button" onClick={() => setOpen(true)}>
          + NEW GOAL
        </button>
        <BottomSheet open={open} onDismiss={() => setOpen(false)} maxHeight={800}>
          <div className="goal-form-container">
            <form className="goal-form" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="goalName"
                  placeholder="Goal name..."
                  style={{ fontSize: '1.15rem' }}
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                />
              </div>
              <div>
                <div className='date-picker'>
                  <DatePicker
                    selected={date}
                    onChange={(date) => setDate(date)}
                    placeholderText="Select a date..."
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    popperPlacement="auto"
                    wrapperClassName="custom-datepicker"
                    isClearable={true}
                    minDate={new Date(new Date().getFullYear(), 0, 1)}
                    dateFormat={"MMMM d, yyyy"}
                  />
                </div>
              </div>
              <div>
                <input
                  type="text"
                  name="description"
                  placeholder="Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div>
                <select
                  name="tag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                >
                  <option value="" disabled>Select a tag</option>
                  <option value="College Application">College Application</option>
                  <option value="Campus Visit/Event">Campus Visit/Event</option>
                  <option value="Financial Aid">Financial Aid</option>
                  <option value="Research">Research</option>
                  <option value="Scholarship">Scholarship</option>
                </select>
              </div>
              <div>
              {tag === 'Scholarship' && (
                <div className='scholarship'>
                  <span className='currency'>$</span>
                  <input
                    type="number"
                    name="scholarshipAmount"
                    placeholder="Scholarship Amount"
                    value={scholarshipAmount}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              </div>
              <button
                className="create-btn"
                type="submit"
                style={{
                  color: isFormFilled ? '#25CA85' : '#D9D9D9',
                }}
                disabled={!isFormFilled}
              >
                Create
              </button>
            </form>
          </div>
        </BottomSheet>
        <GoalList goals={goals} onCheckboxClick={handleCheckboxClick} onGoalCompletion={updateGoalCount}/>
      </div>
    </div>
  );
}

export default NewGoal;
