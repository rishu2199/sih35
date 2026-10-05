import type { DemoOfficer, Laboratory } from '../types/auth'

export const LABORATORIES: Laboratory[] = [
  {
    id: 'rrsl-bengaluru',
    code: 'RRSL-BLR',
    name: 'Regional Reference Standards Laboratory',
    city: 'Bengaluru',
    state: 'Karnataka',
    labType: 'RRSL',
    nablAccreditationNo: 'NABL/M-2241',
  },
  {
    id: 'rrsl-ahmedabad',
    code: 'RRSL-AMD',
    name: 'Regional Reference Standards Laboratory',
    city: 'Ahmedabad',
    state: 'Gujarat',
    labType: 'RRSL',
    nablAccreditationNo: 'NABL/M-1987',
  },
  {
    id: 'rrsl-delhi',
    code: 'RRSL-DEL',
    name: 'Regional Reference Standards Laboratory',
    city: 'New Delhi',
    state: 'Delhi',
    labType: 'RRSL',
    nablAccreditationNo: 'NABL/M-1560',
  },
  {
    id: 'gatc-central',
    code: 'GATC-DEL',
    name: 'Government Approved Test Centre',
    city: 'New Delhi',
    state: 'Delhi',
    labType: 'GATC',
    nablAccreditationNo: 'NABL/M-3022',
  },
]

export const DEMO_OFFICERS: DemoOfficer[] = [
  {
    id: 'usr-001',
    fullName: 'Dr. Anand Raman',
    designation: 'Testing Officer, Grade I',
    email: 'anand.raman@rrsl.gov.in',
    password: 'metro123',
    role: 'METROLOGIST',
    laboratoryId: 'rrsl-bengaluru',
  },
  {
    id: 'usr-002',
    fullName: 'Smt. Preeti Deshmukh',
    designation: 'Principal Scientific Officer',
    email: 'preeti.deshmukh@rrsl.gov.in',
    password: 'review123',
    role: 'REVIEWER',
    laboratoryId: 'rrsl-bengaluru',
  },
  {
    id: 'usr-003',
    fullName: 'Dr. Rajeshwari Sen',
    designation: 'Director & Controller of Legal Metrology',
    email: 'rajeshwari.sen@rrsl.gov.in',
    password: 'director123',
    role: 'DIRECTOR',
    laboratoryId: 'rrsl-bengaluru',
  },
  {
    id: 'usr-004',
    fullName: 'Shri Alok Verma',
    designation: 'Senior Regulatory Inspector',
    email: 'alok.verma@doca.gov.in',
    password: 'audit123',
    role: 'AUDITOR',
    laboratoryId: 'rrsl-delhi',
  },
]

export const DEMO_PIN = '7620'
