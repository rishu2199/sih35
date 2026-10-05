import { UserRole } from './instrument';
export type { UserRole };

export interface Laboratory {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  labType: 'RRSL' | 'GATC';
  nablAccreditationNo: string;
}

export interface UserProfile {
  id: string;

  fullName: string;
  designation: string;
  email: string;

  role: UserRole;

  laboratoryId: string;
  laboratoryName: string;

  // Compatibility
  name?: string;
  governmentId?: string;
  laboratory?: string;
}
