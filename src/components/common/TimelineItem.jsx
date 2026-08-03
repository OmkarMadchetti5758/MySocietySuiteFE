import React, { memo } from 'react';
import Card from './Card';
import Badge from './Badge';
import * as FaIcons from 'react-icons/fa';

const TimelineItem = memo(({ item, isLast }) => {
  const IconComponent = FaIcons[item.iconName] || FaIcons.FaRegCircle;

  return (
    <div className="relative flex flex-col items-center text-center group w-full">
      {/* Circle Icon Badge */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-primary shadow-lg flex items-center justify-center text-primary text-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 mb-6">
        <IconComponent />
        <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-secondary text-white text-sm font-extrabold flex items-center justify-center border-2 border-white">
          {item.step}
        </span>
      </div>

      {/* Content Card */}
      <Card className="w-full h-full p-5 bg-white border border-border-light shadow-sm group-hover:border-primary/50 transition-all">
        <Badge variant="primary" className="mb-2 text-[10px]">
          {item.badge}
        </Badge>
        <h4 className="text-lg font-bold text-text-dark mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h4>
        <p className="text-sm text-gray-600 leading-relaxed">
          {item.description}
        </p>
      </Card>
    </div>
  );
});

TimelineItem.displayName = 'TimelineItem';
export default TimelineItem;
