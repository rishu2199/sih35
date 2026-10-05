import { Instrument } from './instrument';
import { VerificationSession } from './session';

export interface SyntheticScenario {
  id: string;

  name: string;
  shortDescription: string;

  severity: 'PASS' | 'WARNING' | 'FAIL';

  instrument: Instrument;

  session: VerificationSession;

  demoNarrative: {
    problem: string;
    discovery: string;
    conclusion: string;
  };

  // Compatibility fields
  subtitle?: string;
  expectedVerdict?: 'PASS' | 'FAIL';
  classType?: string;
  description?: string;
  keyHighlight?: string;
}
