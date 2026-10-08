"use client";

import { Card, EmptyState } from "@/components/ui";
import { formatCompact, formatMoney } from "@/lib/format";
import type { DayPoint } from "@/lib/brand-db";

const W = 640;
const H = 200;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 24;
const VIEWS_COLOR = "#5eead4"; // teal
const SPEND_COLOR = "#fbbf24"; // amber

function shortDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(m)}/${Number(d)}`;
}

function pathFor(values: number[], max: number): string {
  const iw = W - PAD_L - PAD_R;
  const ih = H - PAD_T - PAD_B;
  const n = values.length;
  const pts = values.map((v, i) => {
    const x = PAD_L + (n === 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = PAD_T + ih - (max > 0 ? (v / max) * ih : 0);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return `M${pts.join(" L")}`;
}

/** Hand-rolled 30-day dual-metric SVG chart: views (area) + spend (line). */
export default function ViewsChart({ data }: { data: DayPoint[] }) {
  const hasData = data.some((d) => d.views > 0 || d.spend > 0);
  const maxViews = Math.max(1, ...data.map((d) => d.views));
  const maxSpend = Math.max(0.01, ...data.map((d) => d.spend));

  if (!hasData) {
    return (
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Last 30 days</h2>
          <Legend />
        </div>
        <EmptyState
          title="No views yet"
          body="Verified view snapshots will appear here once clips start tracking."
        />
      </Card>
    );
  }

  const views = data.map((d) => d.views);
  const spend = data.map((d) => d.spend);
  const viewsLine = pathFor(views, maxViews);
  const spendLine = pathFor(spend, maxSpend);
  const baseline = H - PAD_B;
  const viewsArea = `${viewsLine} L${(W - PAD_R).toFixed(1)},${baseline} L${PAD_L.toFixed(1)},${baseline} Z`;

  const mid = Math.floor((data.length - 1) / 2);
  const xLabels = [
    { i: 0, label: shortDate(data[0].date) },
    { i: mid, label: shortDate(data[mid].date) },
    { i: data.length - 1, label: shortDate(data[data.length - 1].date) },
  ];

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Last 30 days</h2>
        <Legend />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Views and spend over the last 30 days">
        <defs>
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={VIEWS_COLOR} stopOpacity="0.35" />
            <stop offset="100%" stopColor={VIEWS_COLOR} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        {[0.25, 0.5, 0.75].map((f) => {
          const y = PAD_T + (H - PAD_T - PAD_B) * f;
          return (
            <line key={f} x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="#ffffff" strokeOpacity="0.06" />
          );
        })}
        {/* views area */}
        <path d={viewsArea} fill="url(#viewsFill)" />
        <path d={viewsLine} fill="none" stroke={VIEWS_COLOR} strokeWidth="2" strokeLinejoin="round" />
        {/* spend line */}
        <path d={spendLine} fill="none" stroke={SPEND_COLOR} strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" />
        {/* y labels */}
        <text x={PAD_L + 2} y={PAD_T - 3} fontSize="10" fill="#ffffff" opacity="0.55">
          {formatCompact(maxViews)} views
        </text>
        <text x={W - PAD_R - 2} y={PAD_T - 3} fontSize="10" fill={SPEND_COLOR} opacity="0.8" textAnchor="end">
          {formatMoney(maxSpend)}
        </text>
        {/* x labels */}
        {xLabels.map(({ i, label }) => {
          const n = data.length;
          const x = PAD_L + (n === 1 ? (W - PAD_L - PAD_R) / 2 : (i / (n - 1)) * (W - PAD_L - PAD_R));
          const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
          return (
            <text key={i} x={x} y={H - 8} fontSize="10" fill="#ffffff" opacity="0.45" textAnchor={anchor}>
              {label}
            </text>
          );
        })}
      </svg>
    </Card>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-white/60">
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-4 rounded-sm" style={{ background: VIEWS_COLOR }} /> Views
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-4 rounded-sm" style={{ background: SPEND_COLOR }} /> Spend
      </span>
    </div>
  );
}
