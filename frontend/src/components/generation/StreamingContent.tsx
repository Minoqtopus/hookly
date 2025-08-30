import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface StreamingContentProps {
  title: string;
  hook: string;
  script: string;
  stage: 'analyzing' | 'generating' | 'optimizing' | 'saving' | 'completed' | null;
  progress: number;
  message: string;
  error?: string;
}

const formatScriptContent = (text: string): string => {
  return text
    // Clean up multiple newlines
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Remove leading/trailing whitespace
    .replace(/^\s+|\s+$/g, '')
    // Split into paragraphs and clean up
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(paragraph => paragraph.length > 0)
    .join('\n\n')
    .trim();
};

const TypewriterText: React.FC<{ 
  text: string; 
  delay?: number; 
  className?: string;
  onComplete?: () => void;
  isScript?: boolean;
}> = ({ text, delay = 30, className = '', onComplete, isScript = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const processedText = isScript ? formatScriptContent(text) : text;

  useEffect(() => {
    if (currentIndex < processedText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + processedText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    } else if (currentIndex === processedText.length && onComplete) {
      onComplete();
    }
  }, [processedText, currentIndex, delay, onComplete]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [processedText]);

  return (
    <div className={className}>
      <div className="whitespace-pre-line leading-relaxed">
        {displayedText}
        {currentIndex < processedText.length && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block w-0.5 h-4 bg-blue-500 ml-0.5"
          />
        )}
      </div>
    </div>
  );
};

const StageIndicator: React.FC<{ 
  stage: string | null; 
  message: string; 
  progress: number;
  error?: string;
}> = ({ stage, message, progress, error }) => {
  const getStageIcon = () => {
    if (error) return <AlertCircle className="w-5 h-5 text-red-500" />;
    if (stage === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
  };

  const getStageColor = () => {
    if (error) return 'text-red-600';
    if (stage === 'completed') return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-6">
      {getStageIcon()}
      <div className="flex-1">
        <div className={`font-medium ${getStageColor()}`}>
          {error ? 'Generation Failed' : message}
        </div>
        {error && (
          <div className="text-sm text-red-500 mt-1">{error}</div>
        )}
        {!error && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
          </div>
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
  const [showTitle, setShowTitle] = useState(false);
  const [showHook, setShowHook] = useState(false);
  const [showScript, setShowScript] = useState(false);

  // Show sections based on progress and content availability
  useEffect(() => {
    if (title && !showTitle) {
      setShowTitle(true);
    }
  }, [title, showTitle]);

  useEffect(() => {
    if (hook && !showHook) {
      setShowHook(true);
    }
  }, [hook, showHook]);

  useEffect(() => {
    if (script && !showScript) {
      setShowScript(true);
    }
  }, [script, showScript]);

  return (
    <div className="space-y-6">
      {/* Stage Indicator */}
      <StageIndicator 
        stage={stage} 
        message={message} 
        progress={progress} 
        error={error}
      />

      {/* Content Sections */}
      <div className="space-y-8">
        {/* Title Section */}
        <AnimatePresence>
          {showTitle && title && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Title
              </h3>
              <TypewriterText
                text={title}
                delay={50}
                className="text-xl font-bold text-gray-800 leading-relaxed"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hook Section */}
        <AnimatePresence>
          {showHook && hook && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Hook
              </h3>
              <TypewriterText
                text={hook}
                delay={40}
                className="text-lg text-gray-700 leading-relaxed"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Script Section */}
        <AnimatePresence>
          {showScript && script && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                Script
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
                <TypewriterText
                  text={script}
                  delay={25}
                  isScript={true}
                  className="text-base text-gray-800 leading-relaxed space-y-3"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {stage === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-green-50 border border-green-200 p-4 rounded-lg text-center"
          >
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-800">
              Content Generated Successfully!
            </h3>
            <p className="text-green-600 mt-1">
              Your viral content is ready to use and share.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreamingContent;