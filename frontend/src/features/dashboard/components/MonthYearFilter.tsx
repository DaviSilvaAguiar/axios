"use client";

interface Props {
  ano: number;
  mes: number;
  onChange: (ano: number, mes: number) => void;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function MonthYearFilter({ ano, mes, onChange }: Props) {
  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2];

  const selectClass =
    "appearance-none bg-app-surface border border-app-border rounded-xl px-3 py-1.5 text-caption text-app-text font-semibold cursor-pointer hover:bg-app-surface-raised/40 focus:outline-none focus:ring-2 focus:ring-brand/30 transition-colors";

  return (
    <div className="flex items-center gap-2">
      <select
        className={selectClass}
        value={mes}
        onChange={(e) => onChange(ano, Number(e.target.value))}
        aria-label="Mês"
      >
        {MESES.map((nome, i) => (
          <option key={i + 1} value={i + 1}>
            {nome}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={ano}
        onChange={(e) => onChange(Number(e.target.value), mes)}
        aria-label="Ano"
      >
        {anos.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
