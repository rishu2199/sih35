import React, { useState, useMemo } from 'react';
import {
  Grid3X3,
  CheckCircle2,
  ArrowRight,
  Scale,
  Camera,
  Crosshair,
  Repeat,
  ThermometerSnowflake,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { AccuracyClass } from '../../types';

interface TestScopeMatrixProps {
  onNavigateToTest: (testType: 'weighing' | 'eccentricity' | 'repeatability' | 'vision_audit' | 'tare_temp') => void;
}

interface TestRule {
  id: string;
  formNumber: string;
  name: string;
  subtitle: string;
  clause: string;
  category: 'PHYSICAL' | 'METROLOGICAL' | 'ENVIRONMENTAL';
  icon: React.ComponentType<{ className?: string }>;
  route: 'weighing' | 'eccentricity' | 'repeatability' | 'vision_audit' | 'tare_temp';
  classes: Record<AccuracyClass, { applicable: boolean; points: string; criteria: string; note?: string }>;
}

const STATUTORY_RULES: TestRule[] = [
  {
    id: 'physical_audit',
    formNumber: 'FORM 01',
    name: 'Visual & Optical Inspection',
    subtitle: 'Physical Integrity, Spirit Level Bubble & Sealing Hole Audit',
    clause: 'Cl. 3.9, 4.1 & Sec. 24',
    category: 'PHYSICAL',
    icon: Camera,
    route: 'vision_audit',
    classes: {
      CLASS_I: { applicable: true, points: 'Level bubble, Draft shield, Lead wire seal', criteria: 'Tilt ≤ 0.5°' },
      CLASS_II: { applicable: true, points: 'Level bubble, Pan surface, Lead seal hole', criteria: 'Tilt ≤ 0.5°' },
      CLASS_III: { applicable: true, points: 'Level bubble, Pan cleanliness, Sealing hole', criteria: 'Tilt ≤ 0.5°' },
      CLASS_IIII: { applicable: true, points: 'Mechanical integrity, Nameplate OCR, Seal', criteria: 'Visual OK' },
    },
  },
  {
    id: 'weighing_error',
    formNumber: 'FORM 02',
    name: 'Error of Indication',
    subtitle: 'Ascending & Descending Intrinsic Hysteresis & Linearity Verification',
    clause: 'Clause A.4.4 & Table 6',
    category: 'METROLOGICAL',
    icon: Scale,
    route: 'weighing',
    classes: {
      CLASS_I: { applicable: true, points: '10 ascending + 10 descending points (0 to Max)', criteria: '±0.5e / ±1.0e / ±1.5e' },
      CLASS_II: { applicable: true, points: '10 ascending + 10 descending points (0 to Max)', criteria: '±0.5e / ±1.0e / ±1.5e' },
      CLASS_III: { applicable: true, points: '10 ascending + 10 descending points (0 to Max)', criteria: '±0.5e / ±1.0e / ±1.5e' },
      CLASS_IIII: { applicable: true, points: '6 ascending + 6 descending points (0 to Max)', criteria: '±0.5e / ±1.0e / ±1.5e' },
    },
  },
  {
    id: 'eccentricity',
    formNumber: 'FORM 03',
    name: 'Eccentricity Corner Loading',
    subtitle: 'Off-Center Geometric Load Distribution at 1/3 Max Capacity',
    clause: 'Clause A.4.7',
    category: 'METROLOGICAL',
    icon: Crosshair,
    route: 'eccentricity',
    classes: {
      CLASS_I: { applicable: true, points: '4 off-center quadrant positions at 1/3 Max', criteria: '|E| ≤ MPE(L)' },
      CLASS_II: { applicable: true, points: '4 off-center quadrant positions at 1/3 Max', criteria: '|E| ≤ MPE(L)' },
      CLASS_III: { applicable: true, points: '4 off-center quadrant positions at 1/3 Max', criteria: '|E| ≤ MPE(L)' },
      CLASS_IIII: { applicable: true, points: 'Supports / cantilever loading at 1/3 Max', criteria: '|E| ≤ MPE(L)' },
    },
  },
  {
    id: 'repeatability',
    formNumber: 'FORM 04',
    name: 'Repeatability & Sensitivity',
    subtitle: 'Successive Load Series Dispersion & Discrimination Threshold (1.4d)',
    clause: 'Clause A.4.8 / A.4.10',
    category: 'METROLOGICAL',
    icon: Repeat,
    route: 'repeatability',
    classes: {
      CLASS_I: { applicable: true, points: '10 series at 50% & 100% Max + 1.4d extra load', criteria: 'Spread ≤ |MPE|' },
      CLASS_II: { applicable: true, points: '10 series at 50% & 100% Max + 1.4d extra load', criteria: 'Spread ≤ |MPE|' },
      CLASS_III: { applicable: true, points: '10 series at 50% & 100% Max + 1.4d extra load', criteria: 'Spread ≤ |MPE|' },
      CLASS_IIII: { applicable: true, points: '6 series at 50% & 100% Max + 1.4d extra load', criteria: 'Spread ≤ |MPE|' },
    },
  },
  {
    id: 'drift',
    formNumber: 'FORM 05',
    name: 'Environmental Span Drift',
    subtitle: 'Static Temperature Stability & Operational Ambient Span Drift',
    clause: 'Clause A.5.3',
    category: 'ENVIRONMENTAL',
    icon: ThermometerSnowflake,
    route: 'tare_temp',
    classes: {
      CLASS_I: { applicable: true, points: 'Controlled chamber 15°C – 25°C thermal span', criteria: 'ΔSpan ≤ 1e / 5°C' },
      CLASS_II: { applicable: true, points: 'Controlled chamber 10°C – 30°C thermal span', criteria: 'ΔSpan ≤ 1e / 5°C' },
      CLASS_III: { applicable: true, points: 'Operational ambient temp monitoring (-10°C to +40°C)', criteria: 'ΔSpan ≤ 1e / 5°C' },
      CLASS_IIII: { applicable: false, points: 'Not mandated for standard industrial class under Table 3', criteria: 'Statutory Exempt' },
    },
  },
];

const CLASS_META: Record<AccuracyClass, {
  label: string;
  description: string;
  range: string;
  typical: string;
  badge: string;
  mpeTiers: string;
}> = {
  CLASS_I: {
    label: 'Class I',
    description: 'Special Accuracy',
    range: 'e ≤ 1 mg · n ≥ 50,000',
    typical: 'Micro-balances, analytical laboratory balances',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    mpeTiers: '0 ≤ m ≤ 50,000e: ±0.5e · 50,000e < m ≤ 200,000e: ±1.0e · >200,000e: ±1.5e',
  },
  CLASS_II: {
    label: 'Class II',
    description: 'High Accuracy',
    range: '1 mg ≤ e ≤ 0.05 g · 100 ≤ n ≤ 100,000',
    typical: 'Precision balances, pharmaceutical compounding scales',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
    mpeTiers: '0 ≤ m ≤ 5,000e: ±0.5e · 5,000e < m ≤ 20,000e: ±1.0e · >20,000e: ±1.5e',
  },
  CLASS_III: {
    label: 'Class III',
    description: 'Medium Accuracy',
    range: '0.1 g ≤ e ≤ 2 g · 500 ≤ n ≤ 10,000',
    typical: 'Commercial retail counter scales, industrial platform scales',
    badge: 'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/25',
    mpeTiers: '0 ≤ m ≤ 500e: ±0.5e · 500e < m ≤ 2,000e: ±1.0e · >2,000e: ±1.5e',
  },
  CLASS_IIII: {
    label: 'Class IIII',
    description: 'Ordinary Accuracy',
    range: 'e ≥ 5 g · 100 ≤ n ≤ 1,000',
    typical: 'Heavy crane scales, vehicle weighbridges, bulk hoppers',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25',
    mpeTiers: '0 ≤ m ≤ 50e: ±0.5e · 50e < m ≤ 200e: ±1.0e · >200e: ±1.5e',
  },
};

const CATEGORY_STYLES: Record<string, { badge: string; iconBg: string; iconColor: string }> = {
  PHYSICAL: {
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25',
    iconBg: 'bg-sky-50 dark:bg-sky-950/50',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  METROLOGICAL: {
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  ENVIRONMENTAL: {
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
};

export const TestScopeMatrix: React.FC<TestScopeMatrixProps> = ({ onNavigateToTest }) => {
  const [selectedClass, setSelectedClass] = useState<AccuracyClass>('CLASS_III');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'METROLOGICAL' | 'PHYSICAL' | 'ENVIRONMENTAL'>('ALL');

  const meta = CLASS_META[selectedClass];
  const mandatoryCount = STATUTORY_RULES.filter((r) => r.classes[selectedClass].applicable).length;

  const filteredRules = useMemo(() => {
    if (categoryFilter === 'ALL') return STATUTORY_RULES;
    return STATUTORY_RULES.filter((r) => r.category === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className="space-y-6 pb-12">

      {/* Page Header */}
      <div className="border-b border-slate-200/90 pb-5 dark:border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/25 font-semibold">
                OIML R 76-1:2006 (E) TABLE 3
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-white/[0.08]">
                STATUTORY VERIFICATION SCOPE
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Grid3X3 className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              OIML R 76-1 Test Scope Matrix
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Statutory verification scope and test battery allocation governed by OIML R 76-1:2006 Table 3 & Legal Metrology Rules.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              NABL ISO/IEC 17025 Scope
            </span>
          </div>
        </div>
      </div>

      {/* Class Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIII'] as AccuracyClass[]).map((cls) => {
          const isSelected = selectedClass === cls;
          const m = CLASS_META[cls];
          return (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`p-3.5 rounded-xl text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'border-brand-500 bg-white dark:bg-[#121927] ring-2 ring-brand-500/20 shadow-xs'
                  : 'border-slate-200/90 dark:border-white/[0.08] bg-slate-50/70 dark:bg-[#121c2d]/70 hover:bg-white dark:hover:bg-[#162238]'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{m.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${m.badge}`}>
                  {cls.replace('CLASS_', '')}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1">{m.description}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{m.range}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Class Statutory Info Strip */}
      <div className="p-4 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#121927] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {meta.label} — {meta.description}
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${meta.badge}`}>
              OIML R 76-1 Table 3 Tier
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{meta.typical}</p>
          <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 pt-0.5">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Initial Verification MPE:</span> {meta.mpeTiers}
          </div>
        </div>
        <div className="px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-[#162032] border border-slate-200/80 dark:border-white/[0.06] text-right shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Resolution Limits</span>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">{meta.range}</span>
        </div>
      </div>

      {/* Test Modules Table */}
      <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs overflow-hidden">
        {/* Table Header with Category Filter Tabs */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Prescribed Verification Test Suite</h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20 font-semibold">
                {mandatoryCount} of {STATUTORY_RULES.length} modules required
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Mandatory test forms required for statutory type approval & initial verification under DoCA
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-[#141e33] border border-slate-200/80 dark:border-white/[0.06] self-start sm:self-auto">
            {(
              [
                { id: 'ALL', label: 'All Modules' },
                { id: 'METROLOGICAL', label: 'Metrological' },
                { id: 'PHYSICAL', label: 'Physical' },
                { id: 'ENVIRONMENTAL', label: 'Environmental' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setCategoryFilter(filter.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  categoryFilter === filter.id
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modules List */}
        <div className="divide-y divide-slate-100 dark:divide-white/[0.06]">
          {filteredRules.map((rule) => {
            const ruleClass = rule.classes[selectedClass];
            const Icon = rule.icon;
            const isApplicable = ruleClass.applicable;
            const catStyle = CATEGORY_STYLES[rule.category] || CATEGORY_STYLES.METROLOGICAL;

            return (
              <div
                key={rule.id}
                className={`px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isApplicable
                    ? 'hover:bg-slate-50/70 dark:hover:bg-[#141e33]/50'
                    : 'opacity-50 bg-slate-50/30 dark:bg-slate-900/20'
                }`}
              >
                {/* Left: icon + content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 border border-slate-200/60 dark:border-white/[0.08] shadow-2xs ${
                    isApplicable
                      ? `${catStyle.iconBg} ${catStyle.iconColor}`
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                        {rule.formNumber}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {rule.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100/80 dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.06]">
                        {rule.clause}
                      </span>
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${catStyle.badge}`}>
                        {rule.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {rule.subtitle}
                    </p>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-[11px] text-slate-400">Scope:</span> {ruleClass.points}
                    </div>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[11px] text-slate-400 font-mono">Acceptance Criteria:</span>
                      <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#162032] border border-slate-200 dark:border-white/[0.08]">
                        {ruleClass.criteria}
                      </span>
                      {isApplicable && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Mandatory for Initial Verification
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: action */}
                <div className="shrink-0 self-start md:self-center flex items-center gap-2">
                  {isApplicable ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigateToTest(rule.route)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="shadow-2xs font-semibold cursor-pointer border-slate-300 dark:border-slate-700 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      Open Module
                    </Button>
                  ) : (
                    <span className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/[0.06]">
                      Statutory Exemption · Cl. 3.1
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statutory Verification Protocol Guidelines Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121927] shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
            <div className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-mono font-bold text-xs border border-brand-500/20">
              1
            </div>
            Strict Procedural Sequence
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Per OIML R 76-1 Clause 3.9, Form 01 (Visual Examination) must be signed and approved prior to applying test loads to ensure seal integrity.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121927] shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono font-bold text-xs border border-emerald-500/20">
              2
            </div>
            Table 6 MPE Tier Enforcement
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Maximum Permissible Errors step rigorously at 500e, 2,000e, and &gt;2,000e boundaries with real-time rounding trap delta correction (<span className="font-mono">ΔL</span>).
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#121927] shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
            <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-mono font-bold text-xs border border-sky-500/20">
              3
            </div>
            Legal Metrology Act, 2009
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            All observation records are cryptographically timestamped and locked under Section 24, traceable directly to NPLI national primary standards.
          </p>
        </div>
      </div>

    </div>
  );
};

