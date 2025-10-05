import React from 'react';
import './AnimatedBackground.css'; 

export default function AnimatedBackground() {
  const ballCount = 7; 
  const balls = [];

  for (let i = 0; i < ballCount; i++) {
    const size = Math.random() * 100 + 40; 
    const duration = Math.random() * 30 + 20; 
    const delay = Math.random() * -30; 
    const startX = Math.random() * 100;
    const endX = (Math.random() - 0.5) * 300;

    balls.push(
      <div
        key={i}
        className="ball"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          left: `${startX}%`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          '--x-end': endX,
        }}
      />
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden">
      {balls}
    </div>
  );
}