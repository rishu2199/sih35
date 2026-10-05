import React from 'react';
import { InstrumentsPage } from '../instruments/InstrumentsPage';
import { VerificationSession } from '../../types/session';

interface InstrumentsViewProps {
  onRegisterNew: () => void;
  onOpenSession: (session: VerificationSession) => void;
  userRole?: string;
}

export const InstrumentsView: React.FC<InstrumentsViewProps> = ({
  onRegisterNew,
  onOpenSession,
  userRole = 'Metrologist',
}) => {
  return (
    <InstrumentsPage
      onRegisterNew={onRegisterNew}
      onOpenSession={onOpenSession}
    />
  );
};
