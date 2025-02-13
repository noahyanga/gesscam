import React, { useState } from "react";

interface CalendarProps {
  selected?: Date; // Selected date
  onSelect?: (date: Date) => void; // Callback for date selection
  className?: string; // Additional classes for styling
}

const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month + 1, 0).getDate();

const getFirstDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 1).getDay();

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className }) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDateClick = (date: number) => {
    if (onSelect) {
      onSelect(new Date(currentYear, currentMonth, date));
    }
  };

  const isSameDate = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className={`calendar ${className}`}>
      <div className="calendar-header flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth}>◀</button>
        <h2>
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "long",
          })}{" "}
          {currentYear}
        </h2>
        <button onClick={goToNextMonth}>▶</button>
      </div>

      <div className="calendar-days grid grid-cols-7 text-center font-semibold">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="calendar-dates grid grid-cols-7 gap-1 mt-2">
        {/* Empty slots for days before the 1st */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} className="empty"></div>
        ))}

        {/* Actual dates */}
        {Array.from({ length: daysInMonth }).map((_, day) => {
          const date = day + 1;
          const isToday = isSameDate(today, new Date(currentYear, currentMonth, date));
          const isSelected = selected && isSameDate(selected, new Date(currentYear, currentMonth, date));

          return (
            <div
              key={date}
              className={`calendar-date p-2 rounded cursor-pointer ${
                isToday ? "bg-blue-500 text-white" : ""
              } ${isSelected ? "bg-green-500 text-white" : ""}`}
              onClick={() => handleDateClick(date)}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
