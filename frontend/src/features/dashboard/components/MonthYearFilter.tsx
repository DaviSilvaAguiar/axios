"use client";

interface Props {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthYearFilter({ year, month, onChange }: Props) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const selectClass =
    "appearance-none bg-app-surface border border-app-border rounded-xl px-3 py-1.5 text-caption text-app-text font-semibold cursor-pointer hover:bg-app-surface-raised/40 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-colors";

  return (
    <div className="flex items-center gap-2">
      <select
        className={selectClass}
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        aria-label="Month"
      >
        {MONTHS.map((name, i) => (
          <option key={i + 1} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={year}
        onChange={(e) => onChange(Number(e.target.value), month)}
        aria-label="Year"
      >
        {years.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
