import React, { useState, useMemo } from "react";

// ---------- Inline icons (no external package needed) ----------
const Atom = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="9" ry="4" />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" />
  </svg>
);
const Zap = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <polygon points="13 2 3 14 11 14 9 22 21 10 13 10 13 2" strokeLinejoin="round" />
  </svg>
);
const BookOpen = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
    <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ArrowRightLeft = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M8 3 4 7l4 4" />
    <path d="M4 7h16" />
    <path d="M16 21l4-4-4-4" />
    <path d="M20 17H4" />
  </svg>
);
const Info = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// ---------- Data ----------
const ACTIVITY_UNITS = {
  Bq: { label: "Becquerel (Bq)", toBq: (v) => v, fromBq: (v) => v },
  kBq: { label: "Kilobecquerel (kBq)", toBq: (v) => v * 1e3, fromBq: (v) => v / 1e3 },
  MBq: { label: "Megabecquerel (MBq)", toBq: (v) => v * 1e6, fromBq: (v) => v / 1e6 },
  GBq: { label: "Gigabecquerel (GBq)", toBq: (v) => v * 1e9, fromBq: (v) => v / 1e9 },
  Ci: { label: "Curie (Ci)", toBq: (v) => v * 3.7e10, fromBq: (v) => v / 3.7e10 },
  mCi: { label: "Millicurie (mCi)", toBq: (v) => v * 3.7e7, fromBq: (v) => v / 3.7e7 },
  uCi: { label: "Microcurie (µCi)", toBq: (v) => v * 3.7e4, fromBq: (v) => v / 3.7e4 },
};

const ISOTOPES = [
  { sym: "Tc-99m", name: "Technetium-99m", halfLife: "6.02 hours", hlValue: 6.02, hlUnit: "h", mode: "Isomeric transition (IT)", energy: "140 keV gamma", use: "Most widely used nuclear imaging isotope" },
  { sym: "I-131", name: "Iodine-131", halfLife: "8.02 days", hlValue: 8.02, hlUnit: "d", mode: "Beta-minus", energy: "364 keV gamma", use: "Thyroid therapy and imaging" },
  { sym: "I-125", name: "Iodine-125", halfLife: "59.4 days", hlValue: 59.4, hlUnit: "d", mode: "Electron capture (EC)", energy: "27–35 keV", use: "Brachytherapy" },
  { sym: "Co-60", name: "Cobalt-60", halfLife: "5.27 years", hlValue: 5.27, hlUnit: "y", mode: "Beta-minus", energy: "1.17 & 1.33 MeV", use: "External beam teletherapy, industrial sterilization" },
  { sym: "Cs-137", name: "Cesium-137", halfLife: "30.17 years", hlValue: 30.17, hlUnit: "y", mode: "Beta-minus", energy: "662 keV", use: "Calibration sources, brachytherapy" },
  { sym: "F-18", name: "Fluorine-18", halfLife: "109.8 minutes", hlValue: 109.8, hlUnit: "min", mode: "Beta-plus (β⁺)", energy: "511 keV (annihilation)", use: "PET imaging" },
  { sym: "Ir-192", name: "Iridium-192", halfLife: "73.8 days", hlValue: 73.8, hlUnit: "d", mode: "Beta-minus", energy: "~380 keV (avg)", use: "High-dose-rate (HDR) brachytherapy" },
  { sym: "Ra-226", name: "Radium-226", halfLife: "1600 years", hlValue: 1600, hlUnit: "y", mode: "Alpha", energy: "186 keV", use: "Historical brachytherapy source" },
  { sym: "Mo-99", name: "Molybdenum-99", halfLife: "65.9 hours", hlValue: 65.9, hlUnit: "h", mode: "Beta-minus", energy: "740 keV", use: "Parent isotope for Tc-99m generators" },
  { sym: "P-32", name: "Phosphorus-32", halfLife: "14.3 days", hlValue: 14.3, hlUnit: "d", mode: "Pure beta-minus", energy: "No gamma", use: "Internal radiotherapy" },
  { sym: "Sr-90", name: "Strontium-90", halfLife: "28.8 years", hlValue: 28.8, hlUnit: "y", mode: "Beta-minus", energy: "No gamma", use: "Ophthalmic applicators" },
  { sym: "U-238", name: "Uranium-238", halfLife: "4.47 billion years", hlValue: 4.47e9, hlUnit: "y", mode: "Alpha", energy: "Very low", use: "Reference isotope in radiation physics" },
];

const TIME_UNITS = {
  s: { label: "seconds", toSec: 1 },
  min: { label: "minutes", toSec: 60 },
  h: { label: "hours", toSec: 3600 },
  d: { label: "days", toSec: 86400 },
  y: { label: "years", toSec: 31557600 },
};

function fmt(n) {
  if (!isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e6)) return n.toExponential(4);
  return parseFloat(n.toPrecision(6)).toString();
}

// ---------- Converter Tab ----------
function ConverterTab() {
  const unitKeys = Object.keys(ACTIVITY_UNITS);
  const [from, setFrom] = useState(unitKeys[0]);
  const [to, setTo] = useState(unitKeys[4]);
  const [value, setValue] = useState("1");

  const result = useMemo(() => {
    const v = parseFloat(value);
    if (isNaN(v)) return null;
    const base = ACTIVITY_UNITS[from].toBq(v);
    return ACTIVITY_UNITS[to].fromBq(base);
  }, [value, from, to]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gray-900/70 border border-gray-800 p-4">
        <div className="text-sm text-gray-300 font-medium mb-3">Activity Converter</div>

        <label className="text-xs uppercase tracking-wider text-gray-400">Value</label>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full bg-transparent text-3xl font-mono text-teal-300 outline-none border-b border-gray-700 focus:border-amber-400 pb-2"
        />

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div>
            <label className="text-xs text-gray-400">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100"
            >
              {unitKeys.map((k) => (
                <option key={k} value={k}>{ACTIVITY_UNITS[k].label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setFrom(to); setTo(from); }}
            className="mb-1 rounded-full p-2 bg-gray-800 border border-gray-700 text-amber-400"
            aria-label="Swap units"
          >
            <ArrowRightLeft size={16} />
          </button>
          <div>
            <label className="text-xs text-gray-400">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100"
            >
              {unitKeys.map((k) => (
                <option key={k} value={k}>{ACTIVITY_UNITS[k].label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-black/40 border border-teal-900/60 p-4 text-center">
          <div className="text-xs text-gray-400 mb-1">Result</div>
          <div className="font-mono text-2xl text-amber-300 tracking-wide">
            {result === null ? "—" : fmt(result)} <span className="text-gray-400 text-base">{to}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Decay / Half-life Tab ----------
function DecayTab() {
  const [halfLife, setHalfLife] = useState("8.02");
  const [unit, setUnit] = useState("d");
  const [time, setTime] = useState("10");
  const [initial, setInitial] = useState("100");
  const [isotope, setIsotope] = useState("");

  const handleIsotopePick = (sym) => {
    setIsotope(sym);
    const iso = ISOTOPES.find((i) => i.sym === sym);
    if (iso) {
      setHalfLife(String(iso.hlValue));
      setUnit(iso.hlUnit);
    }
  };

  const lambda = useMemo(() => {
    const T = parseFloat(halfLife);
    if (!T || T <= 0) return null;
    return Math.LN2 / T;
  }, [halfLife]);

  const remaining = useMemo(() => {
    const A0v = parseFloat(initial);
    const tv = parseFloat(time);
    if (lambda === null || isNaN(A0v) || isNaN(tv)) return null;
    return A0v * Math.exp(-lambda * tv);
  }, [lambda, initial, time]);

  const fractionRemaining = useMemo(() => {
    if (remaining === null || !parseFloat(initial)) return null;
    return remaining / parseFloat(initial);
  }, [remaining, initial]);

  const meanLife = useMemo(() => (lambda ? 1 / lambda : null), [lambda]);
  const numHalfLives = useMemo(() => {
    const T = parseFloat(halfLife);
    const tv = parseFloat(time);
    if (!T || isNaN(tv)) return null;
    return tv / T;
  }, [halfLife, time]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gray-900/70 border border-gray-800 p-4 space-y-4">
        <div className="text-sm text-gray-300 font-medium">Decay & Half-Life Calculator</div>
        <div className="text-xs text-gray-500 font-mono">A = A₀ · e^(−λt) &nbsp;&nbsp; λ = ln2 / T½</div>

        <div>
          <label className="text-xs text-gray-400">Quick-fill from isotope library</label>
          <select
            value={isotope}
            onChange={(e) => handleIsotopePick(e.target.value)}
            className="w-full mt-1 bg-gray-800 border border-amber-400/40 rounded-lg px-2 py-2 text-sm text-amber-300"
          >
            <option value="">— Select isotope (optional) —</option>
            {ISOTOPES.map((i) => (
              <option key={i.sym} value={i.sym}>{i.sym} — {i.name} ({i.halfLife})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Initial activity A₀</label>
            <input
              type="number" inputMode="decimal" value={initial}
              onChange={(e) => setInitial(e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-teal-300 font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Time unit (T½ and t)</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-gray-100"
            >
              {Object.entries(TIME_UNITS).map(([k, u]) => (
                <option key={k} value={k}>{u.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">Half-life T½ ({TIME_UNITS[unit].label})</label>
            <input
              type="number" inputMode="decimal" value={halfLife}
              onChange={(e) => { setHalfLife(e.target.value); setIsotope(""); }}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-teal-300 font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Elapsed time t ({TIME_UNITS[unit].label})</label>
            <input
              type="number" inputMode="decimal" value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-teal-300 font-mono"
            />
          </div>
        </div>

        <div className="rounded-xl bg-black/40 border border-teal-900/60 p-4 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-400">Remaining activity A</div>
            <div className="font-mono text-xl text-amber-300">{remaining === null ? "—" : fmt(remaining)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Fraction remaining</div>
            <div className="font-mono text-xl text-amber-300">{fractionRemaining === null ? "—" : `${fmt(fractionRemaining * 100)}%`}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Decay constant λ</div>
            <div className="font-mono text-xl text-teal-300">{lambda === null ? "—" : fmt(lambda)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Mean lifetime τ</div>
            <div className="font-mono text-xl text-teal-300">{meanLife === null ? "—" : fmt(meanLife)}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-400">Number of half-lives elapsed</div>
            <div className="font-mono text-lg text-gray-200">{numHalfLives === null ? "—" : fmt(numHalfLives)}</div>
          </div>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          T½ and t both use the time unit selected above. Picking an isotope auto-fills T½ and switches the unit to match it.
        </p>
      </div>
    </div>
  );
}

// ---------- Isotope Library Tab ----------
function LibraryTab() {
  const [q, setQ] = useState("");
  const filtered = ISOTOPES.filter(
    (i) => i.sym.toLowerCase().includes(q.toLowerCase()) || i.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search isotope (e.g. Co-60 or Cobalt)"
        className="w-full bg-gray-900/70 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-amber-400"
      />
      <div className="space-y-2.5">
        {filtered.map((iso) => (
          <div key={iso.sym} className="rounded-xl bg-gray-900/70 border border-gray-800 p-3.5">
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-lg text-amber-300">{iso.sym}</span>
              <span className="text-sm text-gray-300">{iso.name}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-y-1.5 text-xs">
              <div className="text-gray-500">Half-life</div>
              <div className="text-teal-300 font-mono text-right">{iso.halfLife}</div>
              <div className="text-gray-500">Decay mode</div>
              <div className="text-gray-200 text-right">{iso.mode}</div>
              <div className="text-gray-500">Energy</div>
              <div className="text-gray-200 text-right">{iso.energy}</div>
              <div className="text-gray-500">Use</div>
              <div className="text-gray-200 text-right">{iso.use}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">No results</div>
        )}
      </div>
    </div>
  );
}

// ---------- About Tab ----------
function AboutTab() {
  return (
    <div className="flex flex-col items-center text-center pt-10 space-y-6">
      <div className="rounded-full bg-amber-400/15 p-5 border border-amber-400/30">
        <Atom size={36} className="text-amber-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-100">RadCalc</h2>
        <p className="text-sm text-gray-500 mt-1">Version 0.1 Beta</p>
      </div>
      <div className="rounded-2xl bg-gray-900/70 border border-gray-800 px-6 py-5 space-y-3">
        <div>
          <p className="text-sm text-gray-300">Developed by</p>
          <p className="text-teal-300 font-medium mt-0.5">Reem K. Al-Bogami</p>
          <p className="text-xs text-gray-500 mt-0.5">Medical Physics</p>
        </div>
        <div className="pt-2 border-t border-gray-800">
          <p className="text-xs text-gray-500">© 2026 Raynix</p>
          <p className="text-xs text-gray-500">All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

// ---------- App Shell ----------
export default function RadCalcApp() {
  const [tab, setTab] = useState("converter");

  const tabs = [
    { id: "converter", label: "Convert", icon: ArrowRightLeft },
    { id: "decay", label: "Decay", icon: Zap },
    { id: "library", label: "Library", icon: BookOpen },
    { id: "about", label: "About", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="px-4 pt-6 pb-3 border-b border-gray-800 bg-gradient-to-b from-gray-900 to-gray-900">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-amber-400/15 p-2 border border-amber-400/30">
            <Atom size={20} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-100 leading-tight">RadCalc</h1>
            <p className="text-xs text-gray-500">Activity · Decay · Isotopes · by Raynix</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 pb-24 max-w-md w-full mx-auto">
        {tab === "converter" && <ConverterTab />}
        {tab === "decay" && <DecayTab />}
        {tab === "library" && <LibraryTab />}
        {tab === "about" && <AboutTab />}
      </div>

      <div className="fixed bottom-0 inset-x-0 border-t border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="max-w-md mx-auto grid grid-cols-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                tab === id ? "text-amber-400" : "text-gray-500"
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
import { render } from "react-dom";
render(<RadCalcApp />, document.getElementById("root"));