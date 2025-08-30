import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface StreamingContentProps {
  title: string;
  hook: string;
  script: string;
  stage: 'analyzing' | 'generating' | 'optimizing' | 'saving' | 'completed' | null;
  progress: number;
  message: string;
  error?: string;
}

const TypewriterText: React.FC<{ 
  text: string; 
  onComplete?: () => void;
  speed?: 'slow' | 'normal' | 'fast';
  instant?: boolean;
}> = ({ text, onComplete, speed = 'normal', instant = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedRef = useRef(false);

  // Dynamic speed based on setting
  const getTypingSpeed = useCallback(() => {
    if (instant) return 0;
    
    const speeds = {
      slow: 30,
      normal: 15,
      fast: 5
    };
    
    return speeds[speed];
  }, [speed, instant]);

  useEffect(() => {
    if (instant) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
      if (onComplete && !completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
      return;
    }

    if (currentIndex < text.length) {
      const typingSpeed = getTypingSpeed();
      
      intervalRef.current = setTimeout(() => {
        // Type multiple characters at once for faster rendering
        const charsToAdd = speed === 'fast' ? 3 : 1;
        const nextIndex = Math.min(currentIndex + charsToAdd, text.length);
        setDisplayedText(text.substring(0, nextIndex));
        setCurrentIndex(nextIndex);
      }, typingSpeed);

      return () => {
        if (intervalRef.current) clearTimeout(intervalRef.current);
      };
    } else if (currentIndex === text.length && onComplete && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [text, currentIndex, getTypingSpeed, onComplete, speed, instant]);

  // Only reset if text completely changes (not just appending)
  useEffect(() => {
    if (!text.startsWith(displayedText.substring(0, Math.min(displayedText.length, text.length)))) {
      setDisplayedText('');
      setCurrentIndex(0);
      completedRef.current = false;
      if (intervalRef.current) clearTimeout(intervalRef.current);
    }
  }, [text]);

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap leading-relaxed text-foreground">
        {displayedText}
        {currentIndex < text.length && !instant && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block w-[3px] h-5 bg-primary ml-0.5 align-middle"
          />
        )}
      </div>
    </div>
  );
};

export const StreamingContent: React.FC<StreamingContentProps> = ({
  title,
  hook,
  script,
  stage,
  progress,
  message,
  error
}) => {
  const [titleComplete, setTitleComplete] = useState(false);
  const [hookComplete, setHookComplete] = useState(false);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 mb-2">Generation Failed</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Show progress indicator during initial stages
  if (!title && !hook && !script && stage && stage !== 'completed') {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-primary/30" />
          </motion.div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-foreground">{message || 'AI is crafting your content...'}</p>
          {progress > 0 && (
            <div className="w-48 mx-auto">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show placeholder if no content yet
  if (!title && !hook && !script) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium text-foreground mb-2">Ready to create viral content?</h3>
          <p className="text-muted-foreground">Fill out the form and click "Generate Content" to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      {title && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">TITLE</h3>
          <div className="text-2xl font-bold">
            <TypewriterText 
              text={title} 
              speed="fast"
              onComplete={() => setTitleComplete(true)}
            />
          </div>
        </motion.div>
      )}

      {/* Hook Section */}
      {hook && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: title ? 0.2 : 0 }}
          className="space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">HOOK</h3>
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border-l-4 border-blue-500">
            <TypewriterText 
              text={hook} 
              speed={titleComplete ? "normal" : "fast"}
              instant={!titleComplete}
              onComplete={() => setHookComplete(true)}
            />
          </div>
        </motion.div>
      )}

      {/* Full Script Section */}
      {script && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hook ? 0.3 : 0 }}
          className="space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">FULL SCRIPT</h3>
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border-l-4 border-purple-500">
            <TypewriterText 
              text={script} 
              speed={hookComplete ? "normal" : "fast"}
              instant={!hookComplete && !titleComplete}
            />
          </div>
        </motion.div>
      )}

      {/* Completion indicator */}
      {stage === 'completed' && script && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
        >
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-green-500 font-medium">Content ready!</span>
        </motion.div>
      )}
    </div>
  );
};

export default StreamingContent;