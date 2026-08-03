import React, { memo } from 'react';
import Card from './Card';
import Button from './Button';
import FeatureItem from './FeatureItem';
import { FaApple, FaGooglePlay, FaCheck } from 'react-icons/fa';

const PhoneCard = memo(({ title, category, description, features, accentColor = 'from-orange-500 to-amber-500', activeTab, setActiveTab, id }) => {
  return (
    <Card className="h-full flex flex-col justify-between overflow-hidden bg-white border border-border-light hover:shadow-2xl transition-all duration-300">
      <div>
        <div className={`w-full h-3 rounded-full bg-gradient-to-r ${accentColor} mb-6`} />

        <span className="text-sm font-bold uppercase tracking-wider text-primary mb-2 block">
          {category}
        </span>

        <h3 className="text-2xl font-bold text-text-dark mb-3">
          {title}
        </h3>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {description}
        </p>

        {/* Feature List */}
        <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          {features.map((feat, idx) => (
            <FeatureItem key={idx} text={feat} className="text-sm font-semibold" />
          ))}
        </div>
      </div>

      {/* Interactive Phone Screen Representation */}
      <div className="bg-secondary rounded-2xl p-4 text-white text-center">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-3 border-b border-gray-800 pb-2">
          <span className="font-semibold text-primary">● Live Mockup</span>
          <span>MySocietySuite OS</span>
        </div>

        <div className="bg-dark-card rounded-xl p-4 text-left border border-gray-800 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Passcode Verified</span>
            <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-4/5 rounded-full" />
          </div>
          <p className="text-[11px] text-gray-400">1-Tap Gate Entry Pass active for 1440 mins</p>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <Button variant="dark" size="sm" icon={FaApple}>iOS App</Button>
          <Button variant="dark" size="sm" icon={FaGooglePlay}>Android</Button>
        </div>
      </div>
    </Card>
  );
});

PhoneCard.displayName = 'PhoneCard';
export default PhoneCard;
