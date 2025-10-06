import React from 'react';
import './AnimatedBackground.css';

export default function AnimatedBackground() {
  const ballCount = 7;
  const balls = [];

  for (let i = 0; i < ballCount; i++) {
    const size = Math.random() * 100 + 40;
    const height = size;
    const width = size * 0.8;

    const duration = Math.random() * 30 + 20;
    const delay = Math.random() * -30;
    const startX = Math.random() * 100;
    const endX = (Math.random() - 0.5) * 300;

    const stringHeight = height * 0.4; 

    balls.push(
      <div
        key={i}
        className="ball"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          left: `${startX}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          '--x-end': endX,
        }}
      >
        <svg 
          width="10"
          height={stringHeight}
          viewBox={`0 0 10 ${stringHeight}`}
          className="absolute top-full left-1/2 -translate-x-1/2"
          style={{ overflow: 'visible' }}
        >
          <path 
            d={`M 5 0 Q 0 5, 5 10 T 5 20 ${stringHeight > 25 ? 'T 5 30' : ''} ${stringHeight > 35 ? 'T 5 40' : ''}`}
            stroke="#DAA520" 
            fill="none" 
            strokeWidth="1.5"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
      {balls}
    </div>
  );
}