import { UserProfile } from '../types/laboratory';

export const USER_DIRECTOR: UserProfile = {
  id: 'usr-dir-01',
  fullName: 'Dr. A. Kumar',
  designation: 'Laboratory Director',
  email: 'a.kumar@legalmetrology.gov.in',
  role: 'DIRECTOR',
  laboratoryId: 'lab-rrsl-blr',
  laboratoryName: 'RRSL Bengaluru',
  name: 'Dr. A. Kumar',
  governmentId: 'LM-DIR-2021-04',
  laboratory: 'RRSL Bengaluru',
};

export const USER_REVIEWER: UserProfile = {
  id: 'usr-rev-01',
  fullName: 'R. Singh',
  designation: 'Technical Reviewer',
  email: 'r.singh@legalmetrology.gov.in',
  role: 'REVIEWER',
  laboratoryId: 'lab-rrsl-blr',
  laboratoryName: 'RRSL Bengaluru',
  name: 'R. Singh',
  governmentId: 'LM-REV-2023-19',
  laboratory: 'RRSL Bengaluru',
};

export const USER_METROLOGIST: UserProfile = {
  id: 'usr-met-01',
  fullName: 'Shashi Shekhar',
  designation: 'Verification Officer',
  email: 'shashi.shekhar@legalmetrology.gov.in',
  role: 'METROLOGIST',
  laboratoryId: 'lab-rrsl-blr',
  laboratoryName: 'RRSL Bengaluru',
  name: 'Shashi Shekhar',
  governmentId: 'LM-VO-2024-88',
  laboratory: 'RRSL Bengaluru',
};

export const USER_AUDITOR: UserProfile = {
  id: 'usr-aud-01',
  fullName: 'P. Das',
  designation: 'Audit Officer',
  email: 'p.das@legalmetrology.gov.in',
  role: 'AUDITOR',
  laboratoryId: 'lab-rrsl-blr',
  laboratoryName: 'RRSL Bengaluru',
  name: 'P. Das',
  governmentId: 'LM-AUD-2022-12',
  laboratory: 'RRSL Bengaluru',
};

export const USER_ADMIN: UserProfile = {
  id: 'usr-adm-01',
  fullName: 'System Administrator',
  designation: 'System Administrator',
  email: 'admin@legalmetrology.gov.in',
  role: 'ADMIN',
  laboratoryId: 'lab-rrsl-blr',
  laboratoryName: 'RRSL Bengaluru',
  name: 'System Administrator',
  governmentId: 'LM-SYS-2020-01',
  laboratory: 'RRSL Bengaluru',
};

export const CANONICAL_USERS: UserProfile[] = [
  USER_DIRECTOR,
  USER_REVIEWER,
  USER_METROLOGIST,
  USER_AUDITOR,
  USER_ADMIN,
];
