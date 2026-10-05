import {
  LayoutDashboard,
  ClipboardList,
  Scale,
  ClipboardCheck,
  Disc,
  ShieldCheck,
  FileText,
  Settings,
  Layers,
  Eye,
  Maximize2,
  RotateCcw,
  Thermometer,
  FileCheck2,
  Award,
} from 'lucide-react';
import { UserRole } from '../../lib/session/types';

export interface GlobalNavItem {
  key: string;
  label: string;
  icon: any;
  badge?: string | null;
  badgeColor?: string;
  adminOnly?: boolean;
  minRole?: UserRole;
}

export interface GlobalNavSection {
  section: string;
  items: GlobalNavItem[];
}

/**
 * Canonical Global Navigation Configuration (§36)
 * Structured by workflow pillars: WORK, ASSURANCE, OUTPUT, SYSTEM
 */
export const GLOBAL_NAVIGATION: GlobalNavSection[] = [
  {
    section: 'WORK',
    items: [
      { key: 'dashboard', label: 'Home', icon: LayoutDashboard },
      { key: 'sessions', label: 'Sessions', icon: ClipboardList },
      { key: 'instruments', label: 'Instruments', icon: Scale },
    ],
  },
  {
    section: 'ASSURANCE',
    items: [
      { key: 'review', label: 'Review', icon: ClipboardCheck },
      { key: 'standards', label: 'Standards', icon: Disc },
      { key: 'audit', label: 'Audit', icon: ShieldCheck },
    ],
  },
  {
    section: 'OUTPUT',
    items: [
      { key: 'reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    section: 'SYSTEM',
    items: [
      { key: 'settings', label: 'Settings', icon: Settings, adminOnly: true },
      { key: 'design_system', label: 'Design System', icon: Layers },
    ],
  },
];

export interface SessionNavItem {
  key: string;
  label: string;
  icon: any;
  stepState?: 'completed' | 'current' | 'upcoming' | 'blocked' | 'locked';
}

export interface SessionNavSection {
  group: string;
  items: SessionNavItem[];
}

/**
 * Canonical Session Navigation Configuration (§37)
 * Structured for the 7-step OIML verification lifecycle:
 * SESSION CONTEXT -> TEST PROCEDURES -> ASSURANCE & CLOSING
 */
export const SESSION_NAVIGATION: SessionNavSection[] = [
  {
    group: 'SESSION CONTEXT',
    items: [
      { key: 'session_detail', label: 'Overview', icon: ClipboardList },
      { key: 'readiness', label: 'Readiness', icon: ShieldCheck },
      { key: 'test_plan', label: 'Test Plan', icon: FileText },
    ],
  },
  {
    group: 'TEST PROCEDURES',
    items: [
      { key: 'physical_inspection', label: 'Physical Inspection', icon: Eye },
      { key: 'weighing_linearity', label: 'Weighing', icon: Scale },
      { key: 'eccentricity_workspace', label: 'Eccentricity', icon: Maximize2 },
      { key: 'repeatability_workspace', label: 'Repeatability', icon: RotateCcw },
      { key: 'environmental_workspace', label: 'Environment', icon: Thermometer },
    ],
  },
  {
    group: 'ASSURANCE',
    items: [
      { key: 'review_workspace', label: 'Review / Sign', icon: FileCheck2 },
      { key: 'certificates', label: 'Certificate', icon: Award },
    ],
  },
];
