import { useState } from 'react';
import { useHabits } from '../hooks/useHabits';
import './HabitTracker.css';

const HabitTracker = () => {
  const { habits, addHabit, toggleHabit, deleteHabit, getStreak, isDueCompleted } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  const [frequency, setFrequency] = useState('daily');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName, frequency);
    setNewHabitName('');
  };

  return (
    <div className="habit-tracker">
      <h2>Habit Tracker</h2>

      <form onSubmit={handleSubmit} className="add-habit-form">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder="New habit..."
          className="habit-input"
        />
        <select
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          className="frequency-select"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button type="submit" className="add-btn">Add</button>
      </form>

      <div className="habits-list">
        {habits.length === 0 ? (
           <p className="empty-state">No habits yet. Start by adding one!</p>
        ) : (
          habits.map((habit) => {
            const isCompleted = isDueCompleted(habit);
            const streak = getStreak(habit);

            return (
              <div key={habit.id} className={`habit-card ${isCompleted ? 'completed' : ''}`}>
                <div className="habit-info">
                  <span className="habit-name">{habit.name}</span>
                  <span className="habit-meta">
                    <span className="frequency-badge">{habit.frequency}</span>
                    <span className="streak-badge">🔥 {streak}</span>
                  </span>
                </div>
                <div className="habit-actions">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className={`check-btn ${isCompleted ? 'checked' : ''}`}
                    aria-label={`Mark ${habit.name} as done`}
                  >
                    {isCompleted ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="delete-btn"
                    aria-label="Delete habit"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
