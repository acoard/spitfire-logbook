import React, { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
  /** The text to animate */
  text: string;
  /** Speed in milliseconds per character (lower = faster) */
  speed?: number;
  /** Delay before starting animation in ms */
  startDelay?: number;
  /** Whether to start animation immediately or wait for trigger */
  autoStart?: boolean;
  /** Whether to show cursor */
  showCursor?: boolean;
  /** Cursor character */
  cursor?: string;
  /** Whether cursor should blink after typing completes */
  cursorBlinkAfter?: boolean;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** CSS class for the container */
  className?: string;
  /** CSS class for the cursor */
  cursorClassName?: string;
  /** Whether animation should trigger when element enters viewport */
  triggerOnView?: boolean;
  /** Viewport threshold (0-1) for triggering */
  viewThreshold?: number;
  /** Whether to use variable speed (more natural typing) */
  variableSpeed?: boolean;
  /** Sound effect on each keystroke (optional) */
  playSound?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  startDelay = 0,
  autoStart = true,
  showCursor = true,
  cursor = '▌',
  cursorBlinkAfter = true,
  onComplete,
  className = '',
  cursorClassName = '',
  triggerOnView = false,
  viewThreshold = 0.5,
  variableSpeed = true,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);

  // Calculate variable speed for more natural typing
  const getTypeDelay = (char: string): number => {
    if (!variableSpeed) return speed;
    
    // Punctuation = longer pause
    if (['.', '!', '?'].includes(char)) return speed * 4;
    if ([',', ';', ':'].includes(char)) return speed * 2;
    if (char === '—') return speed * 3;
    
    // Random variation for natural feel
    const variation = 0.5 + Math.random();
    return Math.floor(speed * variation);
  };

  // Intersection Observer for triggerOnView
  useEffect(() => {
    if (!triggerOnView || hasStarted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          }
        });
      },
      { threshold: viewThreshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [triggerOnView, viewThreshold, hasStarted]);

  // Start animation
  useEffect(() => {
    if (!autoStart && !hasStarted) return;
    if (triggerOnView && !hasStarted) return;

    const startTimer = setTimeout(() => {
      setIsTyping(true);
      indexRef.current = 0;
      setDisplayedText('');
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [autoStart, startDelay, hasStarted, triggerOnView]);

  // Typing animation
  useEffect(() => {
    if (!isTyping) return;

    if (indexRef.current >= text.length) {
      setIsTyping(false);
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const currentChar = text[indexRef.current];
    const delay = getTypeDelay(currentChar);

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, indexRef.current + 1));
      indexRef.current += 1;
    }, delay);

    return () => clearTimeout(timer);
  }, [isTyping, displayedText, text, speed, onComplete, variableSpeed]);

  // Method to manually trigger animation
  const startTyping = () => {
    setHasStarted(true);
    setIsComplete(false);
    indexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);
  };

  // Method to reset
  const reset = () => {
    setHasStarted(false);
    setIsComplete(false);
    setIsTyping(false);
    indexRef.current = 0;
    setDisplayedText('');
  };

  return (
    <span ref={containerRef} className={`inline ${className}`}>
      {displayedText}
      {showCursor && (isTyping || (cursorBlinkAfter && isComplete)) && (
        <span 
          className={`
            ${isTyping ? '' : 'animate-pulse'}
            ${cursorClassName}
          `}
          style={{ 
            opacity: isTyping ? 1 : undefined,
            animation: !isTyping && cursorBlinkAfter ? 'cursor-blink 1s step-end infinite' : undefined
          }}
        >
          {cursor}
        </span>
      )}
      {/* Hidden full text for SEO/accessibility */}
      <span className="sr-only">{text}</span>
    </span>
  );
};

// Variant for quotes with quotation marks
export const TypewriterQuote: React.FC<Omit<TypewriterTextProps, 'text'> & { 
  quote: string;
  attribution?: string;
  quoteClassName?: string;
  attributionClassName?: string;
}> = ({ 
  quote, 
  attribution,
  quoteClassName = '',
  attributionClassName = '',
  ...props 
}) => {
  const [quoteComplete, setQuoteComplete] = useState(false);

  return (
    <div>
      <span className={quoteClassName}>
        "
        <TypewriterText 
          text={quote} 
          onComplete={() => setQuoteComplete(true)}
          {...props} 
        />
        "
      </span>
      {attribution && quoteComplete && (
        <span className={`block mt-1 ${attributionClassName}`}>
          <TypewriterText 
            text={`— ${attribution}`}
            speed={(props.speed || 50) * 0.7}
            startDelay={200}
            showCursor={false}
          />
        </span>
      )}
    </div>
  );
};

// Hook version for more control
export const useTypewriter = (text: string, options: Partial<TypewriterTextProps> = {}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  const { speed = 50, variableSpeed = true } = options;

  const getTypeDelay = (char: string): number => {
    if (!variableSpeed) return speed;
    if (['.', '!', '?'].includes(char)) return speed * 4;
    if ([',', ';', ':'].includes(char)) return speed * 2;
    if (char === '—') return speed * 3;
    const variation = 0.5 + Math.random();
    return Math.floor(speed * variation);
  };

  const start = () => {
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(true);
  };

  const reset = () => {
    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);
    setIsTyping(false);
  };

  useEffect(() => {
    if (!isTyping) return;

    if (indexRef.current >= text.length) {
      setIsTyping(false);
      setIsComplete(true);
      return;
    }

    const currentChar = text[indexRef.current];
    const delay = getTypeDelay(currentChar);

    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, indexRef.current + 1));
      indexRef.current += 1;
    }, delay);

    return () => clearTimeout(timer);
  }, [isTyping, displayedText, text]);

  return { displayedText, isTyping, isComplete, start, reset };
};

export default TypewriterText;

