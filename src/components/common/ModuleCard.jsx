import React, { memo } from 'react';
import Card from './Card';
import Badge from './Badge';
import FeatureItem from './FeatureItem';
import * as FaIcons from 'react-icons/fa';

const ModuleCard = memo(({ module }) => {
  const IconComponent = FaIcons[module.iconName] || FaIcons.FaCubes;

  return (
    <Card className="h-full flex flex-col justify-between group hover:border-primary/40 relative overflow-hidden">
      {module.popular && (
        <div className="absolute top-4 right-4">
          <Badge variant="primary">Popular</Badge>
        </div>
      )}
      <div>
        <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-primary flex items-center justify-center text-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <IconComponent />
        </div>

        <span className="text-sm font-bold uppercase tracking-wider text-primary mb-1 block">
          {module.tagline}
        </span>

        <h3 className="text-xl font-bold text-text-dark mb-3 group-hover:text-primary transition-colors">
          {module.title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {module.description}
        </p>

        <div className="space-y-2 pt-4 border-t border-border-light">
          {module.features.map((feature, idx) => (
            <FeatureItem key={idx} text={feature} className="text-sm" />
          ))}
        </div>
      </div>
    </Card>
  );
});

ModuleCard.displayName = 'ModuleCard';
export default ModuleCard;
