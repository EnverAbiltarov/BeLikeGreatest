"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

type ChartType = "bar" | "line" | "pie" | "area" | "donut";

export interface ChartDatum {
  name: string;
  value: number;
}

export interface ChartBlockValue {
  title: string;
  chartType: ChartType;
  showLegend: boolean;
  colors: string[];
  data: ChartDatum[];
}

interface DocumentChartProps {
  value: ChartBlockValue;
  onChange: (value: ChartBlockValue) => void;
  editable: boolean;
}

const DEFAULT_COLORS = [
  "#4F46E5",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
];

export const CHART_TEMPLATES: Array<{ label: string; value: ChartBlockValue }> = [
  {
    label: "Распределение задач по статусам",
    value: {
      title: "Распределение задач по статусам",
      chartType: "pie",
      showLegend: true,
      colors: DEFAULT_COLORS,
      data: [
        { name: "В работе", value: 8 },
        { name: "Готово", value: 13 },
        { name: "На ревью", value: 5 },
        { name: "Бэклог", value: 10 },
      ],
    },
  },
  {
    label: "Бюджет проекта",
    value: {
      title: "Бюджет проекта",
      chartType: "bar",
      showLegend: true,
      colors: DEFAULT_COLORS,
      data: [
        { name: "Дизайн", value: 2500 },
        { name: "Frontend", value: 4200 },
        { name: "Backend", value: 3900 },
        { name: "Маркетинг", value: 1800 },
      ],
    },
  },
  {
    label: "Прогресс по неделям",
    value: {
      title: "Прогресс по неделям",
      chartType: "line",
      showLegend: false,
      colors: DEFAULT_COLORS,
      data: [
        { name: "Нед 1", value: 12 },
        { name: "Нед 2", value: 27 },
        { name: "Нед 3", value: 46 },
        { name: "Нед 4", value: 65 },
      ],
    },
  },
];

export const defaultChartValue: ChartBlockValue = {
  title: "Новая диаграмма",
  chartType: "bar",
  showLegend: true,
  colors: DEFAULT_COLORS,
  data: [
    { name: "A", value: 20 },
    { name: "B", value: 45 },
    { name: "C", value: 30 },
  ],
};

export function parseTableInput(source: string): ChartDatum[] {
  const normalized = source
    .trim()
    .replace(/\r/g, "")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.replace(/^\||\|$/g, "").trim());

  if (normalized.length < 2) {
    return [];
  }

  const rows = normalized
    .map((line) =>
      line
        .split(/[,\t|;]/)
        .map((cell) => cell.trim())
        .filter(Boolean)
    )
    .filter((row) => row.length >= 2);

  const body = rows.filter((row, index) => {
    if (index === 0) return true;
    return !row.every((cell) => /^[-:]+$/.test(cell));
  });

  const result = body
    .slice(1)
    .map((row) => ({
      name: row[0],
      value: Number(row[1].replace(",", ".")),
    }))
    .filter((item) => item.name && Number.isFinite(item.value));

  return result;
}

export function DocumentChart({ value, onChange, editable }: DocumentChartProps) {
  const colors = value.colors.length > 0 ? value.colors : DEFAULT_COLORS;

  const chart = useMemo(() => {
    const base = (
      <ResponsiveContainer width="100%" height={280}>
        {value.chartType === "bar" ? (
          <BarChart data={value.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {value.showLegend && <Legend />}
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {value.data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : null}

        {value.chartType === "line" ? (
          <LineChart data={value.data}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {value.showLegend && <Legend />}
            <Line
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={3}
              activeDot={{ r: 7 }}
              dot={{ r: 5 }}
            />
          </LineChart>
        ) : null}

        {value.chartType === "area" ? (
          <AreaChart data={value.data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.6} />
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {value.showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fillOpacity={1}
              fill="url(#colorValue)"
            />
          </AreaChart>
        ) : null}

        {value.chartType === "pie" || value.chartType === "donut" ? (
          <PieChart>
            <Tooltip />
            {value.showLegend && <Legend />}
            <Pie
              data={value.data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={value.chartType === "donut" ? 52 : 0}
              label
            >
              {value.data.map((entry, index) => (
                <Cell key={`${entry.name}-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        ) : null}
      </ResponsiveContainer>
    );

    return base;
  }, [colors, value.chartType, value.data, value.showLegend]);

  const updateDatum = (index: number, patch: Partial<ChartDatum>) => {
    const next = [...value.data];
    next[index] = { ...next[index], ...patch };
    onChange({ ...value, data: next });
  };

  const addRow = () => {
    onChange({
      ...value,
      data: [...value.data, { name: `Пункт ${value.data.length + 1}`, value: 0 }],
    });
  };

  const removeRow = (index: number) => {
    onChange({
      ...value,
      data: value.data.filter((_, rowIndex) => rowIndex !== index),
    });
  };

  return (
    <div className="rounded-xl border bg-background/95 p-4 shadow-sm transition-all hover:shadow-md space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{value.title || "Диаграмма"}</h3>
      <div className="w-full h-[300px]">{chart}</div>

      {editable && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              className="h-10 rounded-md border px-3 text-sm bg-background"
              value={value.title}
              onChange={(event) => onChange({ ...value, title: event.target.value })}
              placeholder="Заголовок диаграммы"
            />
            <select
              className="h-10 rounded-md border px-3 text-sm bg-background"
              value={value.chartType}
              onChange={(event) =>
                onChange({ ...value, chartType: event.target.value as ChartType })
              }
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="area">Area Chart</option>
              <option value="donut">Donut Chart</option>
            </select>
            <label className="h-10 rounded-md border px-3 text-sm bg-background flex items-center gap-2">
              <input
                type="checkbox"
                checked={value.showLegend}
                onChange={(event) => onChange({ ...value, showLegend: event.target.checked })}
              />
              Показать легенду
            </label>
          </div>
          <input
            className="h-10 rounded-md border px-3 text-sm bg-background"
            value={value.colors.join(", ")}
            onChange={(event) =>
              onChange({
                ...value,
                colors: event.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="#4F46E5, #06B6D4, #22C55E"
          />

          <div className="flex flex-wrap gap-2">
            {CHART_TEMPLATES.map((template) => (
              <button
                key={template.label}
                type="button"
                className="h-8 px-3 rounded-full border text-xs hover:bg-secondary transition"
                onClick={() => onChange(template.value)}
              >
                {template.label}
              </button>
            ))}
          </div>

          <div className="rounded-lg border overflow-hidden">
            <div className="grid grid-cols-[1fr_140px_50px] bg-muted/40 px-3 py-2 text-xs font-medium">
              <span>Название</span>
              <span>Значение</span>
              <span />
            </div>
            {value.data.map((row, index) => (
              <div
                key={`${row.name}-${index}`}
                className="grid grid-cols-[1fr_140px_50px] gap-2 px-3 py-2 border-t"
              >
                <input
                  className="h-9 rounded-md border px-2 text-sm bg-background"
                  value={row.name}
                  onChange={(event) => updateDatum(index, { name: event.target.value })}
                />
                <input
                  className="h-9 rounded-md border px-2 text-sm bg-background"
                  type="number"
                  value={row.value}
                  onChange={(event) =>
                    updateDatum(index, { value: Number(event.target.value) || 0 })
                  }
                />
                <button
                  type="button"
                  className="h-9 rounded-md border text-sm hover:bg-secondary"
                  onClick={() => removeRow(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
            onClick={addRow}
          >
            Добавить строку
          </button>
        </div>
      )}
    </div>
  );
}
