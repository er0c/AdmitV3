import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../css/goalcomponents.css';

function GoalList({ goals, onCheckboxClick, onGoalCompletion }) {
  const [activeGoals, setActiveGoals] = useState(goals.filter((goal) => !goal.completed));
  const [doneGoals, setDoneGoals] = useState(goals.filter((goal) => goal.completed));

  useEffect(() => {
    setActiveGoals(goals.filter((goal) => !goal.completed));
    setDoneGoals(goals.filter((goal) => goal.completed));
  }, [goals]);

  const handleCheckboxClick = (e, goal) => {
    e.stopPropagation();
    onCheckboxClick(goal);

    const updatedGoals = goals.map((g) =>
      g.id === goal.id ? { ...g, completed: !g.completed } : g
    );

    setActiveGoals(updatedGoals.filter((goal) => !goal.completed));
    setDoneGoals(updatedGoals.filter((goal) => goal.completed));

    onGoalCompletion(goal);
  };

  function groupByMonth(goals) {
    const grouped = [];
    const sortedGoals = goals.slice().sort((a, b) => new Date(a.date) - new Date(b.date));

    let currentYearMonth = null;

    sortedGoals.forEach((goal) => {
      const goalYearMonth = new Date(goal.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });

      if (currentYearMonth === null || currentYearMonth !== goalYearMonth) {
        grouped.push([goal]);
        currentYearMonth = goalYearMonth;
      } else {
        grouped[grouped.length - 1].push(goal);
      }
    });

    return grouped;
  }

  const groupedActiveGoals = groupByMonth(activeGoals);
  const groupedDoneGoals = groupByMonth(doneGoals);

  const renderHeader = (text) => (
    <div className="month-text">
      {text.replace(/\b(\d{2})\b/g, "'$1")}
    </div>
  );

  const renderGoal = (goal) => (
    <li key={goal.id} className="goal-item">
      <Link
        href={{ pathname: `/goal/${goal.id}`, state: { goal: goal } }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <label>
          <input
            type="checkbox"
            checked={goal.completed}
            onClick={(e) => handleCheckboxClick(e, goal)}
            onChange={(e) => e.preventDefault()}
          />
          <span className="goal-name">{goal.goalName}</span>
          <span className="goal-date">
            {new Date(goal.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </label>
      </Link>
    </li>
  );

  return (
    <div className="goal-list-container">
      <ul className="goal-list">
        {groupedActiveGoals.map((group) => (
          <React.Fragment key={group[0].id}>
            {renderHeader(new Date(group[0].date).toLocaleDateString('en-US', { month: 'long', year: '2-digit' }))}
            {group.map((goal) => renderGoal(goal))}
          </React.Fragment>
        ))}
      </ul>

      {doneGoals.length > 0 && (
        <div className="done-section">
          {renderHeader('DONE')}
          <ul className="done-list">
            {groupedDoneGoals.map((group) => (
              <React.Fragment key={group[0].id}>
                {group.map((goal) => renderGoal(goal, true))}
              </React.Fragment>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GoalList;
