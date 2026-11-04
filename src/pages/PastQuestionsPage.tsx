import React from 'react';
import { ResourcesPage } from './ResourcesPage';

interface PastQuestionsPageProps {
  onOpenSubmit: () => void;
}

export const PastQuestionsPage: React.FC<PastQuestionsPageProps> = ({ onOpenSubmit }) => {
  return (
    <ResourcesPage
      initialType="Past Question"
      title="Past Examination Questions"
      subtitle="Access verified examination papers across 100L through 400L and Postgraduate sessions for the Department of Statistics."
      onOpenSubmit={onOpenSubmit}
    />
  );
};

