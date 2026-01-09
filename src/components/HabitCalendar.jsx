import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { useHabits } from '../hooks/useHabits';
import './HabitCalendar.css';

const HabitCalendar = () => {
  const { habits, isDueCompleted, getStreak } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState(habits.length > 0 ? habits[0].id : '');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const selectedHabit = habits.find(h => h.id === selectedHabitId);

  // If habits exist but none selected (or selected one deleted), select first
  if (!selectedHabit && habits.length > 0 && selectedHabitId !== habits[0].id) {
     setSelectedHabitId(habits[0].id);
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const renderCalendar = () => {
    if (!selectedHabit) return <div className="no-habit-msg">Select a habit to view streak</div>;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Check helper
    const checkIsCompleted = (d) => {
        // Use the habit's completedDates array directly for the calendar view
        // to show exactly which days were marked.
        // Note: For weekly/monthly habits, this visualizes the specific date clicked.
        return selectedHabit.completedDates.some(dateStr =>
            isSameDay(parseISO(dateStr), d)
        );
    };

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        const isCompleted = checkIsCompleted(cloneDay);

        days.push(
          <div
            className={`col cell ${
              !isSameMonth(day, monthStart)
                ? "disabled"
                : isSameDay(day, selectedHabit?._dummy ? new Date() : day)
                ? "selected"
                : ""
            } ${isToday(day) ? "today" : ""} ${isCompleted ? "completed" : ""}`}
            key={day}
          >
            <span className="number">{formattedDate}</span>
          </div>
        );
        day = new Date(day.setDate(day.getDate() + 1)); // Advance day
        // Correction for loop issue if any; date-fns/addDays is safer but this standard JS works too with new Date
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }

    return (
        <div className="calendar-grid">
            <div className="days row">
                {weekDays.map(d => <div className="col col-center" key={d}>{d}</div>)}
            </div>
            {rows}
        </div>
    );
  };

  return (
    <div className="habit-calendar">
      <h2>Habit Calendar</h2>

      <div className="calendar-controls">
        <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="habit-select"
        >
            {habits.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
            ))}
        </select>

        {selectedHabit && (
          <div className="calendar-streak">
             <span>Current Streak: </span>
             <span className="streak-count">🔥 {getStreak(selectedHabit)}</span>
          </div>
        )}

        <div className="month-nav">
            <button onClick={handlePrevMonth}>&lt;</button>
            <span>{format(currentMonth, "MMMM yyyy")}</span>
            <button onClick={handleNextMonth}>&gt;</button>
        </div>
      </div>

      {habits.length === 0 ? (
          <p className="empty-state">No habits found. Add some in the Tracker!</p>
      ) : (
          renderCalendar()
      )}
    </div>
  );
};

export default HabitCalendar;
