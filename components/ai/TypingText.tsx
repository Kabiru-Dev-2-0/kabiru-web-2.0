'use client';
import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number; // ms per word
  onComplete?: () => void;
}

export default function TypingText({ text, speed = 30, onComplete }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');

    if (!text) return;

    // Split by words (preserving spaces and HTML tags)
    const words = text.split(/(\s+)/);
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(words.slice(0, currentIndex + 1).join(''));
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span dangerouslySetInnerHTML={{ __html: displayedText }} />
  );
}

