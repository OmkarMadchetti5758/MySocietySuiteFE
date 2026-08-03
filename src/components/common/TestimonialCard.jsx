import React, { memo } from 'react';
import Card from './Card';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const TestimonialCard = memo(({ testimonial }) => {
  return (
    <Card className="h-full flex flex-col justify-between relative bg-white border border-border-light shadow-sm hover:shadow-xl transition-all duration-300">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 text-amber-400">
            {[...Array(testimonial.rating)].map((_, i) => (
              <FaStar key={i} className="text-base" />
            ))}
          </div>
          <FaQuoteLeft className="text-3xl text-orange-200" />
        </div>

        <p className="text-gray-700 italic text-sm sm:text-base leading-relaxed mb-6">
          "{testimonial.quote}"
        </p>

        {testimonial.highlight && (
          <div className="inline-block px-3 py-1 bg-orange-50 text-primary text-sm font-semibold rounded-lg mb-6 border border-orange-100">
            ✓ {testimonial.highlight}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border-light">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
          loading="lazy"
        />
        <div>
          <h4 className="font-bold text-text-dark text-sm">{testimonial.name}</h4>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
          <p className="text-[11px] text-primary font-medium">{testimonial.location}</p>
        </div>
      </div>
    </Card>
  );
});

TestimonialCard.displayName = 'TestimonialCard';
export default TestimonialCard;
