"use client";

/**
 * Reusable, pre-styled recharts wrappers for the analytics dashboard.
 * Each takes already-aggregated data and renders a dark-themed chart at a
 * fixed 260px height, with a graceful empty state.
 */
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import {
  CHART,
  AXIS_PROPS,
  SLICE_PALETTE,
  ChartTooltip,
  ChartEmpty,
  type ChartDatum,
} from "./primitives";

const HEIGHT = 260;

function isEmpty(data: ChartDatum[]) {
  return data.length === 0 || data.every((d) => !d.value);
}

/* ---- Area: trend over time ---- */
export function TrendArea({
  data,
  emptyLabel,
  color = CHART.gold,
  format,
}: {
  data: ChartDatum[];
  emptyLabel: string;
  color?: string;
  format?: (v: number) => string;
}) {
  if (isEmpty(data)) return <ChartEmpty message={emptyLabel} />;
  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.34} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} />
        <YAxis {...AXIS_PROPS} allowDecimals={false} width={36} />
        <RTooltip
          cursor={{ stroke: CHART.grid }}
          content={<ChartTooltip format={format} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          name=""
          stroke={color}
          strokeWidth={2}
          fill="url(#trendFill)"
          dot={false}
          activeDot={{ r: 4, fill: color, stroke: "#14161d", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ---- Vertical bars: count/value per category ---- */
export function CategoryBars({
  data,
  emptyLabel,
  color = CHART.gold,
  /** Use each datum's own `color` instead of a single bar color. */
  perBarColor = false,
  format,
}: {
  data: ChartDatum[];
  emptyLabel: string;
  color?: string;
  perBarColor?: boolean;
  format?: (v: number) => string;
}) {
  if (isEmpty(data)) return <ChartEmpty message={emptyLabel} />;
  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis dataKey="label" {...AXIS_PROPS} interval={0} />
        <YAxis {...AXIS_PROPS} allowDecimals={false} width={36} />
        <RTooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={<ChartTooltip format={format} />}
        />
        <Bar dataKey="value" name="" radius={[6, 6, 0, 0]} maxBarSize={46}>
          {data.map((d, i) => (
            <Cell key={i} fill={perBarColor ? d.color ?? color : color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---- Horizontal bars: good for ranked lists (e.g. top valuers) ---- */
export function RankedBars({
  data,
  emptyLabel,
  color = CHART.steel,
  format,
}: {
  data: ChartDatum[];
  emptyLabel: string;
  color?: string;
  format?: (v: number) => string;
}) {
  if (isEmpty(data)) return <ChartEmpty message={emptyLabel} />;
  return (
    <ResponsiveContainer width="100%" height={HEIGHT}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid stroke={CHART.grid} horizontal={false} />
        <XAxis type="number" {...AXIS_PROPS} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          {...AXIS_PROPS}
          width={108}
          interval={0}
        />
        <RTooltip
          cursor={{ fill: "rgba(255,255,255,0.03)" }}
          content={<ChartTooltip format={format} />}
        />
        <Bar dataKey="value" name="" radius={[0, 6, 6, 0]} maxBarSize={26}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---- Donut: distribution with a center label + legend ---- */
export function DonutChart({
  data,
  emptyLabel,
  centerLabel,
  centerValue,
  format,
}: {
  data: ChartDatum[];
  emptyLabel: string;
  centerLabel?: string;
  centerValue?: string;
  format?: (v: number) => string;
}) {
  if (isEmpty(data)) return <ChartEmpty message={emptyLabel} />;
  const colored = data.map((d, i) => ({
    ...d,
    color: d.color ?? SLICE_PALETTE[i % SLICE_PALETTE.length],
  }));
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full sm:w-1/2" style={{ height: HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <RTooltip content={<ChartTooltip format={format} />} />
            <Pie
              data={colored}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="#14161d"
              strokeWidth={2}
            >
              {colored.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerValue || centerLabel) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerValue && (
              <span className="nums text-2xl font-semibold text-cream-50">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-ink-500">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      {/* Legend */}
      <ul className="grid w-full grid-cols-1 gap-1.5 sm:w-1/2">
        {colored.map((d) => (
          <li
            key={d.label}
            className="flex items-center gap-2 text-sm text-cream-100/85"
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate">{d.label}</span>
            <span className="nums ms-auto font-semibold text-cream-50">
              {format ? format(d.value) : d.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
