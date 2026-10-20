import React from 'react';
import { LessonPlanGenerator } from '../../../Lesson Plan/LessonPlanGenerator';

interface LessonPlanGeneratorHubProps {
  onNavigate?: (tab: 'home' | 'converter' | 'generator' | 'library' | 'question_bank' | 'reb_library' | 'guide' | 'faq' | 'privacy') => void;
  initialQuestion?: any;
}

export const LessonPlanGeneratorHub: React.FC<LessonPlanGeneratorHubProps> = ({ 
  onNavigate, 
  initialQuestion 
}) => {
  return (
    <LessonPlanGenerator 
      onNavigate={onNavigate} 
      initialQuestion={initialQuestion} 
    />
  );
};
