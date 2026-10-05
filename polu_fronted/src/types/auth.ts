export type UserRole = 'METROLOGIST' | 'REVIEWER' | 'DIRECTOR' | 'AUDITOR' | 'ADMIN'

export type LaboratoryId = 'rrsl-bengaluru' | 'rrsl-ahmedabad' | 'rrsl-delhi' | 'gatc-central'

export interface Laboratory {
  id: LaboratoryId
  code: string
  name: string
  city: string
  state: string
  labType: 'RRSL' | 'GATC'
  nablAccreditationNo: string
}

export interface DemoOfficer {
  id: string
  fullName: string
  designation: string
  email: string
  password: string
  role: UserRole
  laboratoryId: LaboratoryId
}

export interface UserProfile {
  id: string
  fullName: string
  designation: string
  email: string
  role: UserRole
  laboratoryId: LaboratoryId
  laboratoryName: string
}

export const ROLE_META: Record<
  UserRole,
  { label: string; pillClass: string; dotClass: string; powers: string }
> = {
  METROLOGIST: {
    label: 'Metrologist',
    pillClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    powers: 'Registers instruments, enters test readings, submits sessions',
  },
  REVIEWER: {
    label: 'Reviewer',
    pillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    dotClass: 'bg-amber-400',
    powers: 'Audits sessions, flags rows, approves or remands',
  },
  DIRECTOR: {
    label: 'Director',
    pillClass: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    dotClass: 'bg-purple-400',
    powers: 'Signs certificates, applies statutory seal, locks sessions',
  },
  AUDITOR: {
    label: 'Auditor',
    pillClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    dotClass: 'bg-sky-400',
    powers: 'Read-only inspection of records and audit trail',
  },
  ADMIN: {
    label: 'Admin',
    pillClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    dotClass: 'bg-slate-400',
    powers: 'System settings and weight-set calibration dates',
  },
}
