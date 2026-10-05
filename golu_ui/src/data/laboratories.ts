import { Laboratory } from '../types/laboratory';

export const LAB_RRSL_BENGALURU: Laboratory = {
  id: 'lab-rrsl-blr',
  code: 'RRSL-BLR',
  name: 'Regional Reference Standards Laboratory',
  city: 'Bengaluru',
  state: 'Karnataka',
  labType: 'RRSL',
  nablAccreditationNo: 'DEMO-NABL-0001',
};

export const LAB_RRSL_AHMEDABAD: Laboratory = {
  id: 'lab-rrsl-ahd',
  code: 'RRSL-AHD',
  name: 'Regional Reference Standards Laboratory',
  city: 'Ahmedabad',
  state: 'Gujarat',
  labType: 'RRSL',
  nablAccreditationNo: 'DEMO-NABL-0002',
};

export const LAB_GATC_NEW_DELHI: Laboratory = {
  id: 'lab-gatc-del',
  code: 'GATC-DEL',
  name: 'Government Analytical Testing Centre',
  city: 'New Delhi',
  state: 'Delhi',
  labType: 'GATC',
  nablAccreditationNo: 'DEMO-NABL-0003',
};

export const ALL_LABORATORIES: Laboratory[] = [
  LAB_RRSL_BENGALURU,
  LAB_RRSL_AHMEDABAD,
  LAB_GATC_NEW_DELHI,
];
