import React from 'react';
import { LessonPlanGenerator } from '../../../Lesson Plan/LessonPlanGenerator';

interface LessonPlanGeneratorHubProps {
  onNavigate?: (tab: 'home' | 'converter' | 'generator' | 'library' | 'guide' | 'faq' | 'privacy') => void;
}

export const LessonPlanGeneratorHub: React.FC<LessonPlanGeneratorHubProps> = ({ onNavigate }) => {
  return <LessonPlanGenerator onNavigate={onNavigate} />;
};
