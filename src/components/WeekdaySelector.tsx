'use client';

import React, { useEffect, useRef, useState } from 'react';

interface WeekdaySelectorProps {
  onWeekdayChange: (weekday: string) => void;
}

const WeekdaySelector: React.FC<WeekdaySelectorProps> = ({ onWeekdayChange }) => {
  const [selectedWeekday, setSelectedWeekday] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const weekdays = [
    { label: '周一', value: 'monday', en: 'Mon' },
    { label: '周二', value: 'tuesday', en: 'Tue' },
    { label: '周三', value: 'wednesday', en: 'Wed' },
    { label: '周四', value: 'thursday', en: 'Thu' },
    { label: '周五', value: 'friday', en: 'Fri' },
    { label: '周六', value: 'saturday', en: 'Sat' },
    { label: '周日', value: 'sunday', en: 'Sun' },
  ];

  const updateIndicatorPosition = (activeIndex: number) => {
    if (activeIndex >= 0 && buttonRefs.current[activeIndex] && containerRef.current) {
      const timeoutId = setTimeout(() => {
        const button = buttonRefs.current[activeIndex];
        const container = containerRef.current;
        if (button && container) {
          const buttonRect = button.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          if (buttonRect.width > 0) {
            setIndicatorStyle({
              left: buttonRect.left - containerRect.left,
              width: buttonRect.width,
            });
          }
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    const activeIndex = 0;
    updateIndicatorPosition(activeIndex);
  }, []);

  useEffect(() => {
    const activeIndex = weekdays.findIndex((day) => day.value === selectedWeekday);
    if (activeIndex >= 0) {
      const cleanup = updateIndicatorPosition(activeIndex);
      return cleanup;
    }
  }, [selectedWeekday]);

  const handleWeekdayClick = (weekday: typeof weekdays[0]) => {
    setSelectedWeekday(weekday.value);
    onWeekdayChange(weekday.en);
  };

  return (
    <div
      ref={containerRef}
      className='relative inline-flex bg-gray-200/60 rounded-full p-0.5 sm:p-1 dark:bg-gray-700/60 backdrop-blur-sm'
    >
      {indicatorStyle.width > 0 && (
        <div
          className='absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 bg-white dark:bg-gray-500 rounded-full shadow-sm transition-all duration-300 ease-out'
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
          }}
        />
      )}

      {weekdays.map((weekday, index) => (
        <button
          key={weekday.value}
          ref={(el) => {
            buttonRefs.current[index] = el;
          }}
          onClick={() => handleWeekdayClick(weekday)}
          className={`relative z-10 px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
            selectedWeekday === weekday.value
              ? 'text-gray-900 dark:text-gray-100 cursor-default'
              : 'text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 cursor-pointer'
          }`}
        >
          {weekday.label}
        </button>
      ))}
    </div>
  );
};

export default WeekdaySelector;
