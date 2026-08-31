import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Check, Plus, Trash2, AlertTriangle, Search, X } from 'lucide-react';
import { getItem, setItem } from './storage';

/* ---------------------------------------------------------------
   CA Final Nov 2026 tracker
   Sections: constants/seed data -> helpers -> small components
   -> tab views (Dashboard / Today / Paper / Mocks) -> main app
--------------------------------------------------------------- */

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.cft-root { --bg:#EDF2E7; --rule:#C7D6BE; --surface:#FBFCF8; --ink:#1E2620; --ink-soft:#5B6656; --navy:#1F3452; --brick:#A23E2E; --brick-soft:#F3DCD5; --green:#3F6B4A; --green-soft:#DCEADF; --amber:#D18B00; --gold:#93701F; --gold-soft:#F1E6C8; background:var(--bg); color:var(--ink); font-family:'IBM Plex Sans',sans-serif; }
.cft-root *, .cft-root *::before, .cft-root *::after { box-sizing:border-box; }
.cft-serif { font-family:'IBM Plex Serif',serif; }
.cft-mono { font-family:'IBM Plex Mono',monospace; }
.cft-card { background:var(--surface); border:1px solid var(--rule); border-radius:12px; overflow:hidden; }
.cft-root input[type=checkbox] { width:16px; height:16px; accent-color:#1F3452; flex-shrink:0; }
.cft-root button { font-family:inherit; cursor:pointer; }
.cft-root ::-webkit-scrollbar { height:6px; width:6px; }
`;

const SEED = {
  FR: [
    'Intro to Ind AS & Schedule III','Ind AS 16','Ind AS 38','Ind AS 40','Ind AS 36','Ind AS 41','Ind AS 105',
    'Ind AS 2','Ind AS 12','Financial Instruments — Ind AS 32 & 109','Financial Instruments — Ind AS 32 & 109',
    'Ind AS 102','Ind AS 20','Ind AS 1','Ind AS 103','Ind AS 110','Ind AS 111','Ind AS 28',
    'Buffer to Practice Big Questions on Business Combination & CFS','Ind AS 116','Ind AS 108','Ind AS 115',
    'Ind AS 34','Ind AS 19','Ind AS 23','Ind AS 8','Ind AS 24','Ind AS 33','Ind AS 10','Ind AS 37','Ind AS 113',
    'Ind AS 7','Ind AS 21','Ind AS 101','Common Pool','Analysis of FS','Ethics & Technology',
    'Conceptual Framework','Quick Overview & Mock Test',
  ],
  AFM: [
    'Portfolio Management','Mutual Fund','Derivative','Interest Rate Risk Management','Foreign Exchange Exposure',
    'Risk Management','Security Analysis','Financial Policy and Corporate Strategy',
    'Securitisation, Start-up Finance','Security Evaluation','Advanced Capital Budgeting',
    'International Financial Management','Business Valuation','Mergers and Acquisition',
  ],
  AUDIT: [
    'SA 700, 701, 705, 706, 710 & 720','SQC 1 & SA 220','SA 240, 250, 260, 299 & 402',
    'SA 300, 450, 520, 540, 600, 610 & 620','SA 560, 570 & 580','SA 500, 501, 505, 510, 530 & 550',
    'SAE 3400, 3402 & 3420','SRS 4400 & 4410','SA 800, 805 & 810','SRE 2400 & 2410',
    'Chapter 19 — Professional Ethics','Chapter 12 — Digital Audit','Chapter 18 — ESG & SDG',
    'Chapter 14 Unit 1 — Bank Audit','Chapter 14 Unit 2 — NBFC Audit','Chapter 7 — CARO 2020 & Section 143',
    'Chapter 4 — Materiality, Risk Assessment & Internal Control','Chapter 16 — Internal Audit',
    'Chapter 17 — Due Diligence, Investigation & Forensic Audit','Chapter 13 — Group Audit',
    'Chapter 15 — PSU Audit',
  ],
  DT: [
    'Basics, Tax Rates AY 26-27 & Alternate Taxation Regime','Income from Capital Gains',
    'Income from Other Sources','Taxation of Dividend & Deemed Dividend',
    'Taxation in Case of Liquidation & Buy Back','Taxation in Case of Amalgamation & Demergers',
    'Profits & Gains of Business or Profession & ICDS and also Alternate Taxation Regime',
    'Taxation of Political Parties & Electoral Trust','Taxation in Case of Firm/LLP, AOP/BOI',
    'Business Trust, Investment Fund and Securitisation Trust','Minimum Alternate Tax',
    'AMT & Deduction u/s 10AA (SEZ)','Deduction u/c VI-A','Clubbing of Income','Set-Off & C/F of Losses',
    'Advance Tax, TDS & TCS','Assessment Procedure','Appeals & Revisions','Dispute Resolution',
    'Miscellaneous Provisions','Penalties & Prosecutions','Black Money Act, 2015','GAAR','Taxation of VDA',
    'Exempt Income','Tonnage Taxation','Taxation of Trust & Institution','Tax Audit & Ethical Compliance',
    'Transfer Pricing','Non-Resident & NRI Taxation','Double Taxation Relief (DTAA)','Advance Ruling (BOAR)',
    'Application & Interpretation of Tax Treaties','Model Tax Conventions (MTC)',
    'Base Erosion & Profit Shifting (BEPS)','Questions Based on Significant Select Cases',
  ],
  IDT_GST: [
    'Introduction','Supply','Charge of GST','Registration','Tax Invoice','Time of Supply','Value of Supply',
    'Place of Supply','Exemption','Input Tax Credit and Input Service Distributor','Payment of Tax','TDS',
    'E-Commerce Transaction and TCS','Accounts and Records','E-Way Bill','Returns under GST','Job Work',
    'Assessment and Audit','Inspection, Search, Seizure and Arrest','Demand and Recovery',
    'Liability to Pay in Certain Cases','Offences and Penalties','Appeals and Revision','Advance Ruling',
    'Imports under GST','Exports under GST','Refund under GST','Miscellaneous Provisions plus Ethical Aspects under GST',
  ],
  IDT_CUSTOMS: [
    'Levy and Exemption','Importation and Exportation of Goods','Transit and Transhipment',
    'Classification of Goods','Types of Duty','Valuation under Customs Act, 1962','Post and Articles and Stores',
    'Baggage','Warehouse','Refund','Foreign Trade Policy',
  ],
  IBS: [],
};

const PAPERS = [
  { key: 'FR', label: 'FR', name: 'Financial Reporting', faculty: 'CA Aakash Kandoi' },
  { key: 'AFM', label: 'AFM', name: 'Advanced Financial Management', faculty: 'CA Pavan Karmale' },
  { key: 'AUDIT', label: 'Audit', name: 'Advanced Auditing, Assurance & Professional Ethics', faculty: 'CA Rishabh Jain' },
  { key: 'DT', label: 'DT', name: 'Direct Tax Laws & International Taxation', faculty: 'CA Bhanwar Borana' },
  { key: 'IDT', label: 'IDT', name: 'Indirect Tax Laws — GST & Customs', faculty: 'CA Ritti Bhagmar' },
  { key: 'IBS', label: 'IBS', name: 'Integrated Business Solutions', faculty: null },
];

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'today', label: 'Today' },
  ...PAPERS.map((p) => ({ key: p.key, label: p.label })),
  { key: 'mocks', label: 'Mocks' },
];

const DEFAULT_MOCKS = [
  { id: 'mtp-s1', name: 'MTP Series I (all papers)', dateLabel: 'Sep 9–21, 2026', notes: '', done: false },
  { id: 'mtp-s2', name: 'MTP Series II (all papers)', dateLabel: 'Sep 23–Oct 5, 2026', notes: '', done: false },
];

const DEFAULT_SETTINGS = {
  userName: 'Saurav Ghule',
  attemptLabel: 'November 2026 Attempt',
  group1Date: '2026-11-02',
  group2Date: '2026-11-09',
  overdueDays: 15,
};

function parseDateIST(dateStr) {
  if (!dateStr) return new Date(NaN);
  return new Date(dateStr + 'T00:00:00+05:30');
}

function fmtShortDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ---------------- helpers ---------------- */

function pad(n) { return n < 10 ? '0' + n : '' + n; }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fmtDateLabel(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function emptyChapterState() {
  return {
    importance: 'medium',
    rev1: { done: false, date: null },
    rev2: { done: false, date: null },
    rev3: { done: false, date: null },
    remarks: '', doubts: '', doubtQs: '', impQs: '', concepts: '',
  };
}

function getOverdueStage(state, overdueDays) {
  if (!state) return null;
  const dayMs = 86400000;
  const now = Date.now();
  if (state.rev1?.done && !state.rev2?.done) {
    if (!state.rev1.date) return null;
    const days = Math.floor((now - new Date(state.rev1.date + 'T00:00:00').getTime()) / dayMs);
    return days > overdueDays ? 'rev2' : null;
  }
  if (state.rev2?.done && !state.rev3?.done) {
    if (!state.rev2.date) return null;
    const days = Math.floor((now - new Date(state.rev2.date + 'T00:00:00').getTime()) / dayMs);
    return days > overdueDays ? 'rev3' : null;
  }
  return null;
}

function getChapterGroups(paperKey, customChapters) {
  const custom = customChapters[paperKey] || [];
  if (paperKey === 'IDT') {
    const gstSeed = SEED.IDT_GST.map((name, i) => ({ id: `IDT-GST-${i + 1}`, number: i + 1, name }));
    const customsSeed = SEED.IDT_CUSTOMS.map((name, i) => ({ id: `IDT-CUSTOMS-${i + 1}`, number: i + 1, name }));
    const gstCustom = custom.filter((c) => c.section !== 'Customs')
      .map((c, i) => ({ id: c.id, number: gstSeed.length + i + 1, name: c.name, isCustom: true }));
    const customsCustom = custom.filter((c) => c.section === 'Customs')
      .map((c, i) => ({ id: c.id, number: customsSeed.length + i + 1, name: c.name, isCustom: true }));
    return [
      { section: 'GST', items: [...gstSeed, ...gstCustom] },
      { section: 'Customs', items: [...customsSeed, ...customsCustom] },
    ];
  }
  const seed = (SEED[paperKey] || []).map((name, i) => ({ id: `${paperKey}-${i + 1}`, number: i + 1, name }));
  const cust = custom.map((c, i) => ({ id: c.id, number: seed.length + i + 1, name: c.name, isCustom: true }));
  return [{ section: null, items: [...seed, ...cust] }];
}

function getAllItemsFlat(customChapters) {
  const out = [];
  PAPERS.forEach((p) => {
    getChapterGroups(p.key, customChapters).forEach((g) => {
      g.items.forEach((it) => out.push({ ...it, paper: p.key }));
    });
  });
  return out;
}

function computeStats(items, chapters, overdueDays) {
  let r1 = 0, r2 = 0, r3 = 0, overdue = 0;
  items.forEach((it) => {
    const st = chapters[it.id];
    if (st?.rev1?.done) r1++;
    if (st?.rev2?.done) r2++;
    if (st?.rev3?.done) r3++;
    if (getOverdueStage(st, overdueDays)) overdue++;
  });
  return { total: items.length, r1, r2, r3, overdue };
}

/* ---------------- tiny presentational pieces ---------------- */

function Dot({ done }) {
  return <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: done ? 'var(--green)' : 'var(--rule)' }} />;
}

function ProgressBar({ pct, color }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: 6, background: 'var(--rule)' }}>
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
    </div>
  );
}

function StatRow({ label, done, total, color }) {
  return (
    <div>
      <div className="flex justify-between mb-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
        <span>{label}</span>
        <span className="cft-mono">{done}/{total}</span>
      </div>
      <ProgressBar pct={total ? (done / total) * 100 : 0} color={color} />
    </div>
  );
}

function LabeledInput({ label, value, onChange, onBlur, placeholder }) {
  return (
    <div className="mb-2">
      <div className="font-medium mb-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</div>
      <input
        className="w-full rounded-md border p-2"
        style={{ borderColor: 'var(--rule)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 16 }}
        value={value || ''}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}

function LabeledTextArea({ label, value, onChange, onBlur, placeholder, rows }) {
  return (
    <div className="mb-2">
      <div className="font-medium mb-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</div>
      <textarea
        className="w-full rounded-md border p-2 resize-none"
        style={{ borderColor: 'var(--rule)', background: 'var(--surface)', color: 'var(--ink)', fontSize: 16 }}
        rows={rows || 2}
        value={value || ''}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
      />
    </div>
  );
}

function RevisionButton({ label, done, date, overdue, onToggle, onDateChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-1 px-2 py-1 rounded-full font-semibold border"
        style={{
          fontSize: 12,
          borderColor: done ? 'var(--green)' : overdue ? 'var(--brick)' : 'var(--rule)',
          background: done ? 'var(--green-soft)' : overdue ? 'var(--brick-soft)' : 'var(--surface)',
          color: done ? 'var(--green)' : overdue ? 'var(--brick)' : 'var(--ink-soft)',
        }}
      >
        {done ? <Check size={12} /> : null}
        {label}
      </button>
      {done && (
        <input
          type="date"
          value={date || ''}
          onChange={(e) => onDateChange(e.target.value)}
          className="border rounded px-1 py-0.5"
          style={{ borderColor: 'var(--rule)', color: 'var(--ink-soft)', fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, width: 118 }}
        />
      )}
    </div>
  );
}

function ChapterRow({ item, state, overdueDays, isOpen, onToggleOpen, onUpdate, onDelete }) {
  const st = state || emptyChapterState();
  const overdueStage = getOverdueStage(st, overdueDays);

  function toggleRev(key) {
    const cur = st[key] || { done: false, date: null };
    const newDone = !cur.done;
    onUpdate({ [key]: { done: newDone, date: newDone ? todayISO() : (cur.date || null) } }, true);
  }
  function setRevDate(key, d) {
    const cur = st[key] || { done: false, date: null };
    onUpdate({ [key]: { ...cur, date: d } }, true);
  }

  return (
    <div className="border-b" style={{ borderColor: 'var(--rule)' }}>
      <button onClick={onToggleOpen} className="w-full flex items-center gap-2 py-2.5 px-3 text-left">
        {overdueStage && <AlertTriangle size={14} style={{ color: 'var(--brick)', flexShrink: 0 }} />}
        <span className="cft-mono flex-shrink-0" style={{ fontSize: 12, width: 24, color: 'var(--ink-soft)' }}>{item.number}</span>
        <span className="flex-1 min-w-0">
          <span className="block truncate" style={{ fontSize: 14, color: 'var(--ink)' }}>{item.name}</span>
          {st.remarks && <span className="block truncate italic" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{st.remarks}</span>}
        </span>
<span
  className="flex items-center gap-1.5 flex-shrink-0"
  onClick={(e) => e.stopPropagation()}
>
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    const order = ['high', 'medium', 'low'];
    const current = st.importance || 'medium';
    const next = order[(order.indexOf(current) + 1) % order.length];
    onUpdate({ importance: next });
  }}
  title={`Importance: ${(st.importance || 'medium').toUpperCase()}`}
  className="flex items-center justify-center rounded-full border flex-shrink-0"
  style={{
    width: 28,
    height: 28,
    fontSize: 10,
    fontWeight: 800,
    borderColor:
      (st.importance || 'medium') === 'high'
        ? 'var(--brick)'
        : (st.importance || 'medium') === 'medium'
        ? 'var(--amber)'
        : 'var(--green)',
    color: '#fff',
    background:
      (st.importance || 'medium') === 'high'
        ? 'var(--brick)'
        : (st.importance || 'medium') === 'medium'
        ? 'var(--amber)'
        : 'var(--green)',
  }}
>
  {(st.importance || 'medium') === 'high'
    ? 'H'
    : (st.importance || 'medium') === 'medium'
    ? 'M'
    : 'L'}
</button>
  {[
    { key: 'rev1', label: 'R1' },
    { key: 'rev2', label: 'R2' },
    { key: 'rev3', label: 'R3' },
  ].map(({ key, label }) => {
    const done = st[key]?.done;

    return (
      <button
        key={key}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleRev(key);
        }}
        className="flex flex-col items-center justify-center rounded-full border"
        style={{
          width: 34,
          height: 34,
          fontSize: 10,
          fontWeight: 700,
          borderColor: done ? 'var(--green)' : 'var(--rule)',
          background: done ? 'var(--green)' : 'var(--surface)',
          color: done ? '#fff' : 'var(--ink-soft)',
        }}
        title={`${label} ${done ? 'completed' : 'not completed'}`}
      >
        {done ? <Check size={14} /> : label}
      </button>
    );
  })}
</span>
        <ChevronDown size={16} style={{ color: 'var(--ink-soft)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }} />
      </button>
      {isOpen && (
        <div className="pb-3 pl-9 pr-3">
          <div className="flex flex-wrap gap-2 mb-3">
            <RevisionButton label="R1" done={st.rev1?.done} date={st.rev1?.date} overdue={overdueStage === 'rev1'}
              onToggle={() => toggleRev('rev1')} onDateChange={(d) => setRevDate('rev1', d)} />
            <RevisionButton label="R2" done={st.rev2?.done} date={st.rev2?.date} overdue={overdueStage === 'rev2'}
              onToggle={() => toggleRev('rev2')} onDateChange={(d) => setRevDate('rev2', d)} />
            <RevisionButton label="R3" done={st.rev3?.done} date={st.rev3?.date} overdue={overdueStage === 'rev3'}
              onToggle={() => toggleRev('rev3')} onDateChange={(d) => setRevDate('rev3', d)} />
          </div>
          <LabeledInput label="Status / remarks" value={st.remarks} placeholder="e.g. Weak in ITC, redo before exam"
            onChange={(e) => onUpdate({ remarks: e.target.value }, false)} onBlur={() => onUpdate({}, true)} />
          <LabeledInput label="Doubtful question no." value={st.doubtQs} placeholder="e.g. RTP Q3, MTP-1 Q6"
            onChange={(e) => onUpdate({ doubtQs: e.target.value }, false)} onBlur={() => onUpdate({}, true)} />
          <LabeledInput label="Important question no." value={st.impQs} placeholder="e.g. Q4, Q9"
            onChange={(e) => onUpdate({ impQs: e.target.value }, false)} onBlur={() => onUpdate({}, true)} />
          <LabeledTextArea label="Doubts" value={st.doubts} placeholder="Write down anything you're unsure about"
            onChange={(e) => onUpdate({ doubts: e.target.value }, false)} onBlur={() => onUpdate({}, true)} />
          <LabeledTextArea label="Key concepts to revise before exam" value={st.concepts} placeholder="Main points to nail down"
            onChange={(e) => onUpdate({ concepts: e.target.value }, false)} onBlur={() => onUpdate({}, true)} />
          {item.isCustom && (
            <button onClick={onDelete} className="flex items-center gap-1 mt-1" style={{ fontSize: 12, color: 'var(--brick)' }}>
              <Trash2 size={12} /> Remove chapter
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- views ---------------- */

function DashboardView({ chapters, customChapters, settings, onSettingsChange, onJump, onReset }) {
  const allFlat = useMemo(() => getAllItemsFlat(customChapters), [customChapters]);
  const overall = useMemo(() => computeStats(allFlat, chapters, settings.overdueDays), [allFlat, chapters, settings.overdueDays]);
  const overdueList = useMemo(() => allFlat.filter((it) => getOverdueStage(chapters[it.id], settings.overdueDays)), [allFlat, chapters, settings.overdueDays]);
  const [confirmingReset, setConfirmingReset] = useState(false);

  return (
    <div className="px-4 py-3">
      <div className="cft-card p-4 mb-4">
        <div className="font-semibold mb-2" style={{ fontSize: 14, color: 'var(--navy)' }}>Overall progress · {overall.total} chapters</div>
        <div className="space-y-2">
          <StatRow label="Revision 1" done={overall.r1} total={overall.total} color="var(--green)" />
          <StatRow label="Revision 2" done={overall.r2} total={overall.total} color="var(--navy)" />
          <StatRow label="Revision 3" done={overall.r3} total={overall.total} color="var(--gold)" />
        </div>
        {overall.overdue > 0 && (
          <div className="mt-2 flex items-center gap-1" style={{ fontSize: 12, color: 'var(--brick)' }}>
            <AlertTriangle size={13} /> {overall.overdue} chapter{overall.overdue === 1 ? '' : 's'} overdue for revision
          </div>
        )}
      </div>

      <div className="font-semibold mb-2" style={{ fontSize: 14, color: 'var(--navy)' }}>By paper</div>
      <div className="cft-card p-3 mb-4 space-y-3">
        {PAPERS.map((p) => {
          const items = getChapterGroups(p.key, customChapters).flatMap((g) => g.items);
          const s = computeStats(items, chapters, settings.overdueDays);
          return (
            <button key={p.key} onClick={() => onJump(p.key, null)} className="w-full text-left block">
              <div className="flex justify-between mb-1" style={{ fontSize: 12 }}>
                <span style={{ color: 'var(--ink)' }}>{p.label}</span>
                <span className="cft-mono" style={{ color: 'var(--ink-soft)' }}>{s.r1}/{s.total} R1</span>
              </div>
              <ProgressBar pct={s.total ? (s.r1 / s.total) * 100 : 0} color="var(--green)" />
            </button>
          );
        })}
      </div>

      {overdueList.length > 0 && (
        <>
          <div className="font-semibold mb-2" style={{ fontSize: 14, color: 'var(--brick)' }}>Overdue for revision</div>
          <div className="cft-card mb-4">
            {overdueList.map((it) => (
              <button key={it.id} onClick={() => onJump(it.paper, it.id)} className="w-full flex items-center gap-2 px-3 py-2 border-b text-left" style={{ borderColor: 'var(--rule)' }}>
                <AlertTriangle size={13} style={{ color: 'var(--brick)', flexShrink: 0 }} />
                <span className="flex-1 truncate" style={{ fontSize: 14 }}>{it.name}</span>
                <span className="cft-mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{it.paper}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="font-semibold mb-2" style={{ fontSize: 14, color: 'var(--navy)' }}>Settings</div>
      <div className="cft-card p-3 mb-4">
        <LabeledInput label="Name (shown top right)" value={settings.userName} placeholder="Your name"
          onChange={(e) => onSettingsChange({ userName: e.target.value })} />
        <LabeledInput label="Attempt label" value={settings.attemptLabel} placeholder="e.g. May 2027 Attempt"
          onChange={(e) => onSettingsChange({ attemptLabel: e.target.value })} />
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="font-medium mb-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Group I date</div>
            <input type="date" value={settings.group1Date}
              onChange={(e) => onSettingsChange({ group1Date: e.target.value })}
              className="w-full rounded-md border p-2" style={{ borderColor: 'var(--rule)', fontSize: 16 }} />
          </div>
          <div>
            <div className="font-medium mb-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Group II date</div>
            <input type="date" value={settings.group2Date}
              onChange={(e) => onSettingsChange({ group2Date: e.target.value })}
              className="w-full rounded-md border p-2" style={{ borderColor: 'var(--rule)', fontSize: 16 }} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-1" style={{ fontSize: 14 }}>
          <span>Flag revision overdue after</span>
          <div className="flex items-center gap-1">
            <input type="number" min="1" value={settings.overdueDays}
              onChange={(e) => onSettingsChange({ overdueDays: Number(e.target.value) || 1 })}
              className="rounded-md border p-1 text-center" style={{ width: 56, borderColor: 'var(--rule)', fontSize: 16 }} />
            <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>days</span>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Counted from your last completed revision on a chapter.</div>
      </div>

      <div className="mb-6">
        {confirmingReset ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 12, color: 'var(--brick)' }}>Erase all tracker data?</span>
            <button onClick={() => { onReset(); setConfirmingReset(false); }} className="px-2 py-1 rounded-md" style={{ fontSize: 12, background: 'var(--brick)', color: '#fff' }}>Yes, reset</button>
            <button onClick={() => setConfirmingReset(false)} style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmingReset(true)} style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Reset all tracker data</button>
        )}
      </div>
    </div>
  );
}

function PaperView({ paperKey, chapters, customChapters, overdueDays, openIds, onToggleOpen, onUpdateChapter, onAddCustom, onDeleteCustom }) {
  const meta = PAPERS.find((p) => p.key === paperKey);
  const groups = useMemo(() => getChapterGroups(paperKey, customChapters), [paperKey, customChapters]);
  const allItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const stats = useMemo(() => computeStats(allItems, chapters, overdueDays), [allItems, chapters, overdueDays]);
  const [query, setQuery] = useState('');
  const [addingSection, setAddingSection] = useState(null);
  const [newName, setNewName] = useState('');

  function submitAdd(section) {
    if (!newName.trim()) return;
    onAddCustom(paperKey, newName.trim(), section);
    setNewName('');
    setAddingSection(null);
  }

  return (
    <div className="px-4 py-3">
      <div className="mb-3">
        <div className="cft-serif font-semibold" style={{ fontSize: 18, color: 'var(--navy)' }}>{meta.name}</div>
        {meta.faculty && <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{meta.faculty}</div>}
      </div>
      <div className="flex items-center gap-3 mb-3 cft-mono flex-wrap" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
        <span>{stats.r1}/{stats.total} R1</span>
        <span>{stats.r2}/{stats.total} R2</span>
        <span>{stats.r3}/{stats.total} R3</span>
        {stats.overdue > 0 && <span style={{ color: 'var(--brick)' }}>{stats.overdue} overdue</span>}
      </div>
      {allItems.length > 4 && (
        <div className="relative mb-3">
          <Search size={14} style={{ position: 'absolute', left: 8, top: 11, color: 'var(--ink-soft)' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search chapters"
            className="w-full rounded-md border py-2 pr-2" style={{ paddingLeft: 28, borderColor: 'var(--rule)', background: 'var(--surface)', fontSize: 16 }} />
        </div>
      )}
      {groups.map((g) => {
        const filtered = g.items.filter((it) => it.name.toLowerCase().includes(query.toLowerCase()));
        if (query && filtered.length === 0) return null;
        const sectionKey = g.section || 'main';
        return (
          <div key={sectionKey} className="mb-4">
            {g.section && (
              <div className="cft-serif font-semibold uppercase tracking-wide mt-1 mb-1.5" style={{ fontSize: 13, color: 'var(--navy)' }}>{g.section}</div>
            )}
            <div className="cft-card">
              {filtered.length === 0 && !query && (
                <div className="p-4 text-center" style={{ fontSize: 14, color: 'var(--ink-soft)' }}>No chapters yet — add them below as you get the list.</div>
              )}
              {filtered.map((it) => (
                <ChapterRow key={it.id} item={it} state={chapters[it.id]} overdueDays={overdueDays}
                  isOpen={openIds.has(it.id)} onToggleOpen={() => onToggleOpen(it.id)}
                  onUpdate={(patch, immediate) => onUpdateChapter(it.id, patch, immediate)}
                  onDelete={() => onDeleteCustom(paperKey, it.id)} />
              ))}
              <div className="px-3">
                {addingSection === sectionKey ? (
                  <div className="flex gap-2 py-2 flex-wrap">
                    <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitAdd(g.section)}
                      placeholder="Chapter name" className="flex-1 rounded-md border p-1.5" style={{ borderColor: 'var(--rule)', fontSize: 16, minWidth: 140 }} />
                    <button onClick={() => submitAdd(g.section)} className="px-3 rounded-md" style={{ fontSize: 12, background: 'var(--navy)', color: '#fff' }}>Add</button>
                    <button onClick={() => { setAddingSection(null); setNewName(''); }} style={{ color: 'var(--ink-soft)' }}><X size={16} /></button>
                  </div>
                ) : (
                  <button onClick={() => setAddingSection(sectionKey)} className="flex items-center gap-1 py-2" style={{ fontSize: 13, color: 'var(--navy)' }}>
                    <Plus size={13} /> Add chapter{g.section ? ` to ${g.section}` : ''}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TodayView({ dailyLogs, onSaveLog, allItemsFlat }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const log = dailyLogs[selectedDate] || { target: '', chapterIds: [], completed: '', leftover: '' };
  const [query, setQuery] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  function update(patch, immediate) {
    onSaveLog(selectedDate, { ...log, ...patch }, immediate);
  }
  function toggleChapter(id) {
    const set = new Set(log.chapterIds || []);
    if (set.has(id)) set.delete(id); else set.add(id);
    update({ chapterIds: Array.from(set) }, true);
  }

  const pastDates = Object.keys(dailyLogs).filter((d) => d !== selectedDate).sort((a, b) => b.localeCompare(a));
  const filteredChapters = query ? allItemsFlat.filter((it) => it.name.toLowerCase().includes(query.toLowerCase())) : allItemsFlat;
  const pickedNames = (log.chapterIds || []).map((id) => allItemsFlat.find((x) => x.id === id)?.name).filter(Boolean);

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="cft-serif font-semibold" style={{ fontSize: 17, color: 'var(--navy)' }}>{fmtDateLabel(selectedDate)}</div>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="cft-mono rounded-md border p-1" style={{ fontSize: 14, borderColor: 'var(--rule)' }} />
      </div>

      <div className="cft-card p-3 mb-4">
        <LabeledTextArea label="Today's target" value={log.target} placeholder="What's the plan for today?"
          onChange={(e) => update({ target: e.target.value }, false)} onBlur={() => update({}, true)} />

        <div className="mb-2">
          <div className="font-medium mb-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Chapters worked on ({(log.chapterIds || []).length})</div>
          <button onClick={() => setShowPicker((s) => !s)} className="px-2 py-1 rounded-md border" style={{ fontSize: 12, borderColor: 'var(--rule)', color: 'var(--navy)' }}>
            {showPicker ? 'Hide list' : 'Pick chapters'}
          </button>
          {showPicker && (
            <div className="mt-2 border rounded-md p-2" style={{ borderColor: 'var(--rule)', maxHeight: 224, overflowY: 'auto' }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search"
                className="w-full rounded-md border p-1.5 mb-2" style={{ borderColor: 'var(--rule)', fontSize: 16 }} />
              {filteredChapters.map((it) => (
                <label key={it.id} className="flex items-center gap-2 py-1">
                  <input type="checkbox" checked={(log.chapterIds || []).includes(it.id)} onChange={() => toggleChapter(it.id)} />
                  <span className="flex-1 truncate" style={{ fontSize: 14 }}>{it.name}</span>
                  <span className="cft-mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{it.paper}</span>
                </label>
              ))}
            </div>
          )}
          {!showPicker && pickedNames.length > 0 && (
            <div className="mt-1" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{pickedNames.join(', ')}</div>
          )}
        </div>

        <LabeledTextArea label="Covered / completed" value={log.completed} placeholder="What actually got done"
          onChange={(e) => update({ completed: e.target.value }, false)} onBlur={() => update({}, true)} />
        <LabeledTextArea label="Left over / carry forward" value={log.leftover} placeholder="What's left for tomorrow"
          onChange={(e) => update({ leftover: e.target.value }, false)} onBlur={() => update({}, true)} />
      </div>

      {pastDates.length > 0 && (
        <>
          <div className="font-semibold mb-2" style={{ fontSize: 14, color: 'var(--navy)' }}>History</div>
          <div className="cft-card mb-6">
            {pastDates.map((d) => (
              <button key={d} onClick={() => setSelectedDate(d)} className="w-full text-left px-3 py-2 border-b block" style={{ borderColor: 'var(--rule)' }}>
                <div className="cft-mono" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{fmtDateLabel(d)}</div>
                {dailyLogs[d].target && <div className="truncate" style={{ fontSize: 14 }}>{dailyLogs[d].target}</div>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function MocksView({ mockTests, onChange, group1Date, group2Date }) {
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [adding, setAdding] = useState(false);

  function updateMock(id, patch) { onChange(mockTests.map((m) => (m.id === id ? { ...m, ...patch } : m))); }
  function deleteMock(id) { onChange(mockTests.filter((m) => m.id !== id)); }
  function addMock() {
    if (!newName.trim()) return;
    onChange([...mockTests, { id: `mock-${Date.now()}`, name: newName.trim(), dateLabel: newDate.trim(), notes: '', done: false }]);
    setNewName(''); setNewDate(''); setAdding(false);
  }

  return (
    <div className="px-4 py-3">
      <div className="cft-serif font-semibold mb-3" style={{ fontSize: 18, color: 'var(--navy)' }}>Mock tests & exam schedule</div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="cft-card p-3">
          <div className="uppercase tracking-wide mb-1" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Group I</div>
          <div className="cft-mono" style={{ fontSize: 14 }}>{fmtShortDate(group1Date) || '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Papers 1–3</div>
        </div>
        <div className="cft-card p-3">
          <div className="uppercase tracking-wide mb-1" style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Group II</div>
          <div className="cft-mono" style={{ fontSize: 14 }}>{fmtShortDate(group2Date) || '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-soft)' }}>Papers 4–6</div>
        </div>
      </div>

      <div className="cft-card mb-3">
        {mockTests.map((m) => (
          <div key={m.id} className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--rule)' }}>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={!!m.done} onChange={(e) => updateMock(m.id, { done: e.target.checked })} />
              <span className="flex-1" style={{ fontSize: 14, fontWeight: 500, color: m.done ? 'var(--ink-soft)' : 'var(--ink)', textDecoration: m.done ? 'line-through' : 'none' }}>{m.name}</span>
              <span className="cft-mono" style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{m.dateLabel}</span>
              <button onClick={() => deleteMock(m.id)} style={{ color: 'var(--brick)' }}><Trash2 size={13} /></button>
            </div>
            <input value={m.notes} onChange={(e) => updateMock(m.id, { notes: e.target.value })}
              placeholder="Notes (score, weak areas...)" className="w-full rounded-md border p-1.5 mt-1.5"
              style={{ borderColor: 'var(--rule)', fontSize: 14 }} />
          </div>
        ))}
      </div>

      {adding ? (
        <div className="cft-card p-3 flex flex-col gap-2">
          <input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name (e.g. RTP, personal mock)"
            className="rounded-md border p-1.5" style={{ borderColor: 'var(--rule)', fontSize: 16 }} />
          <input value={newDate} onChange={(e) => setNewDate(e.target.value)} placeholder="Date or window (e.g. Oct 12)"
            className="rounded-md border p-1.5" style={{ borderColor: 'var(--rule)', fontSize: 16 }} />
          <div className="flex gap-2">
            <button onClick={addMock} className="px-3 py-1.5 rounded-md" style={{ fontSize: 13, background: 'var(--navy)', color: '#fff' }}>Add</button>
            <button onClick={() => setAdding(false)} className="px-3 py-1.5" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="flex items-center gap-1" style={{ fontSize: 14, color: 'var(--navy)' }}>
          <Plus size={14} /> Add RTP / mock
        </button>
      )}
    </div>
  );
}

/* ---------------- main app ---------------- */

export default function CAFinalTracker() {
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chapters, setChapters] = useState({});
  const [customChapters, setCustomChapters] = useState({});
  const [dailyLogs, setDailyLogs] = useState({});
  const [mockTests, setMockTests] = useState(DEFAULT_MOCKS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [openIds, setOpenIds] = useState(new Set());
  const [now, setNow] = useState(Date.now());

  const chaptersPendingRef = useRef(null);
  const chaptersSaveTimer = useRef(null);
  const logsPendingRef = useRef(null);
  const logsSaveTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function safeGet(key) {
      try {
        return await getItem(key);
      } catch (e) { return null; }
    }
    (async () => {
      const [c, cc, dl, mt, s] = await Promise.all([
        safeGet('chapters-v1'), safeGet('custom-chapters-v1'), safeGet('daily-logs-v1'),
        safeGet('mock-tests-v1'), safeGet('settings-v1'),
      ]);
      if (cancelled) return;
      setChapters(c ? JSON.parse(c) : {});
      setCustomChapters(cc ? JSON.parse(cc) : {});
      setDailyLogs(dl ? JSON.parse(dl) : {});
      if (mt) {
        setMockTests(JSON.parse(mt));
      } else {
        setMockTests(DEFAULT_MOCKS);
        persist('mock-tests-v1', DEFAULT_MOCKS);
      }
      setSettings(s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  async function persist(key, value) {
    try { await setItem(key, JSON.stringify(value)); }
    catch (e) { console.error('save failed', key, e); }
  }

  function handleUpdateChapter(id, patch, immediate) {
    setChapters((prev) => {
      const merged = { ...emptyChapterState(), ...prev[id], ...patch };
      const next = { ...prev, [id]: merged };
      chaptersPendingRef.current = next;
      clearTimeout(chaptersSaveTimer.current);
      if (immediate) persist('chapters-v1', next);
      else chaptersSaveTimer.current = setTimeout(() => persist('chapters-v1', chaptersPendingRef.current), 600);
      return next;
    });
  }

  function handleAddCustom(paperKey, name, section) {
    setCustomChapters((prev) => {
      const list = prev[paperKey] || [];
      const id = `${paperKey}-custom-${Date.now()}`;
      const next = { ...prev, [paperKey]: [...list, { id, name, section: section || undefined }] };
      persist('custom-chapters-v1', next);
      return next;
    });
  }

  function handleDeleteCustom(paperKey, id) {
    setCustomChapters((prev) => {
      const next = { ...prev, [paperKey]: (prev[paperKey] || []).filter((c) => c.id !== id) };
      persist('custom-chapters-v1', next);
      return next;
    });
    setChapters((prev) => {
      const next = { ...prev };
      delete next[id];
      persist('chapters-v1', next);
      return next;
    });
  }

  function handleSaveLog(date, data, immediate) {
    setDailyLogs((prev) => {
      const next = { ...prev, [date]: data };
      logsPendingRef.current = next;
      clearTimeout(logsSaveTimer.current);
      if (immediate) persist('daily-logs-v1', next);
      else logsSaveTimer.current = setTimeout(() => persist('daily-logs-v1', logsPendingRef.current), 600);
      return next;
    });
  }

  function handleMockChange(next) { setMockTests(next); persist('mock-tests-v1', next); }
  function handleSettingsChange(patch) {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persist('settings-v1', next);
      return next;
    });
  }
  function handleJump(paperKey, chapterId) {
    setActiveTab(paperKey);
    if (chapterId) setOpenIds((prev) => new Set(prev).add(chapterId));
  }
  function handleToggleOpen(id) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  async function handleReset() {
    setChapters({}); setCustomChapters({}); setDailyLogs({}); setMockTests(DEFAULT_MOCKS); setSettings(DEFAULT_SETTINGS);
    await Promise.all([
      persist('chapters-v1', {}), persist('custom-chapters-v1', {}), persist('daily-logs-v1', {}),
      persist('mock-tests-v1', DEFAULT_MOCKS), persist('settings-v1', DEFAULT_SETTINGS),
    ]);
  }

  const examTime = parseDateIST(settings.group1Date).getTime();
  const daysLeft = Number.isNaN(examTime) ? null : Math.ceil((examTime - now) / 86400000);
  const allItemsFlat = useMemo(() => getAllItemsFlat(customChapters), [customChapters]);

  if (!loaded) {
    return (
      <div className="cft-root" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONT_CSS}</style>
        <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>Loading your tracker…</div>
      </div>
    );
  }

  return (
    <div className="cft-root" style={{ minHeight: '100vh', paddingBottom: 32 }}>
      <style>{FONT_CSS}</style>
      <div className="px-4 pt-5 pb-4" style={{ background: 'var(--navy)' }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="uppercase tracking-widest mb-0.5" style={{ fontSize: 11, color: '#AFC0D2' }}>CA Final</div>
            <div className="cft-serif font-semibold" style={{ fontSize: 18, color: '#F6F3EA' }}>{settings.attemptLabel}</div>
          </div>
          {settings.userName && (
            <div className="cft-serif text-right" style={{ fontSize: 14, color: '#F6F3EA', paddingTop: 2, flexShrink: 0 }}>{settings.userName}</div>
          )}
        </div>
        <div className="flex items-end gap-4">
          <div className="cft-mono text-center px-4 py-2 rounded-md" style={{ border: '2px double #F6F3EA' }}>
            <div className="font-semibold leading-none" style={{ fontSize: 30, color: '#F6F3EA' }}>{daysLeft === null ? '—' : Math.max(daysLeft, 0)}</div>
            <div className="uppercase tracking-wide mt-1" style={{ fontSize: 9, color: '#AFC0D2' }}>{daysLeft === 1 ? 'day' : 'days'} to Group I</div>
          </div>
          <div className="cft-mono leading-relaxed" style={{ fontSize: 12, color: '#AFC0D2' }}>
            <div>Group I&nbsp; {fmtShortDate(settings.group1Date)}</div>
            <div>Group II&nbsp; {fmtShortDate(settings.group2Date)}</div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 overflow-x-auto border-b" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
        <div className="flex px-2" style={{ width: 'max-content' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-3 py-2.5 font-medium whitespace-nowrap"
              style={{ fontSize: 14, color: activeTab === t.key ? 'var(--navy)' : 'var(--ink-soft)', borderBottom: activeTab === t.key ? '2px solid var(--navy)' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <DashboardView chapters={chapters} customChapters={customChapters} settings={settings}
          onSettingsChange={handleSettingsChange} onJump={handleJump} onReset={handleReset} />
      )}
      {activeTab === 'today' && (
        <TodayView dailyLogs={dailyLogs} onSaveLog={handleSaveLog} allItemsFlat={allItemsFlat} />
      )}
      {activeTab === 'mocks' && (
        <MocksView mockTests={mockTests} onChange={handleMockChange} group1Date={settings.group1Date} group2Date={settings.group2Date} />
      )}
      {PAPERS.some((p) => p.key === activeTab) && (
        <PaperView key={activeTab} paperKey={activeTab} chapters={chapters} customChapters={customChapters} overdueDays={settings.overdueDays}
          openIds={openIds} onToggleOpen={handleToggleOpen} onUpdateChapter={handleUpdateChapter}
          onAddCustom={handleAddCustom} onDeleteCustom={handleDeleteCustom} />
      )}
    </div>
  );
}
