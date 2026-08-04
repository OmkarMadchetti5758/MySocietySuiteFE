import React, { memo, useState, useEffect, useRef } from 'react';
import * as FaIcons from 'react-icons/fa';

const StatCard = memo(({ stat }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef(null);

  const IconComponent = FaIcons[stat.iconName] || FaIcons.FaChartLine;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    let start = 0;
    const end = stat.value;
    const duration = 1500;
    const steps = 40;
    const increment = end / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [hasAnimated, stat.value]);

  const formattedCount = Number.isInteger(stat.value)
    ? Math.floor(count).toLocaleString()
    : count.toFixed(1);

  return (
    <div ref={cardRef} className="flex items-center gap-4 p-4 rounded-xl">
      <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF6B00] flex items-center justify-center text-lg shrink-0">
        <IconComponent />
      </div>

      <div>
        <div className="text-xl sm:text-xl font-extrabold text-[#FF6B00] tracking-tight">
          {formattedCount}{stat.suffix}
        </div>
        <div className="text-base font-semibold text-gray-200">{stat.label}</div>
        <div className="text-[13px] text-gray-400">{stat.sublabel}</div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
export default StatCard;
