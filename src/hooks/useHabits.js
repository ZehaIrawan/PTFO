import { useState, useEffect } from 'react';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  subDays,
  subWeeks,
  subMonths,
  format,
  parseISO
} from 'date-fns';

const STORAGE_KEY = 'ptfo-habits';

export const useHabits = () => {
  const [habits, setHabits] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const addHabit = (name, frequency = 'daily') => {
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      frequency,
      completedDates: [], // Strings in ISO format
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const deleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const toggleHabit = (id, date = new Date()) => {
    // Ensure we work with a date object
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    const targetDateISO = targetDate.toISOString();

    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== id) return habit;

        // Check if completed for the target date's period
        const check = getPeriodCheck(habit.frequency);
        const isCompletedForTarget = habit.completedDates.some((dateStr) =>
            check(parseISO(dateStr), targetDate)
        );

        if (isCompletedForTarget) {
          // Find the completion that satisfies the target period and remove it
          const newCompletedDates = habit.completedDates.filter(
            dateStr => !check(parseISO(dateStr), targetDate)
          );
          return { ...habit, completedDates: newCompletedDates };
        } else {
          // Add target date
          return { ...habit, completedDates: [...habit.completedDates, targetDateISO] };
        }
      })
    );
  };

  // Helper to check if a date matches the period
  const getPeriodCheck = (frequency) => {
    switch (frequency) {
      case 'weekly': return (d1, d2) => isSameWeek(d1, d2, { weekStartsOn: 1 });
      case 'monthly': return isSameMonth;
      case 'daily':
      default: return isSameDay;
    }
  };

  // Check if the habit is completed for the current period
  const isDueCompleted = (habit) => {
    const check = getPeriodCheck(habit.frequency);
    const now = new Date();
    return habit.completedDates.some((dateStr) => check(parseISO(dateStr), now));
  };

  const getStreak = (habit) => {
    const sortedDates = [...habit.completedDates]
      .map(d => parseISO(d))
      .sort((a, b) => b - a); // Descending

    if (sortedDates.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentCheckDate = today;

    // Helper to step back in time
    const stepBack = (date) => {
      switch (habit.frequency) {
        case 'weekly': return subWeeks(date, 1);
        case 'monthly': return subMonths(date, 1);
        case 'daily':
        default: return subDays(date, 1);
      }
    };

    const check = getPeriodCheck(habit.frequency);

    // Check if completed "today" (current period).
    // If NOT completed today, but completed "yesterday", streak is still valid but continues from yesterday.

    const hasCompletionForDate = (targetDate) =>
      sortedDates.some(d => check(d, targetDate));

    // If not completed today, check if streak is broken or just pending for today
    if (!hasCompletionForDate(currentCheckDate)) {
       // If it is NOT done today, we check the previous period.
       const prevDate = stepBack(currentCheckDate);
       if (!hasCompletionForDate(prevDate)) {
         return 0; // Broken streak
       }
       // Determine where to start counting for the streak
       // If done yesterday, streak starts from 1 (yesterday).
       // If not done yesterday (and not today), streak is 0.
       currentCheckDate = prevDate;
    }

    // Iterate backwards
    while (true) {
      if (hasCompletionForDate(currentCheckDate)) {
        streak++;
        currentCheckDate = stepBack(currentCheckDate);
      } else {
        break;
      }
    }

    return streak;
  };

  return {
    habits,
    addHabit,
    deleteHabit,
    toggleHabit,
    getStreak,
    isDueCompleted
  };
};
