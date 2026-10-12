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
const SPEND_DASH = "6 3"; // dashed secondary metric

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
          <h2 className="text-sm font-semibold text-ink">Last 30 days</h2>
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
        <h2 className="text-sm font-semibold text-ink">Last 30 days</h2>
        <Legend />
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-ink" role="img" aria-label="Views and spend over the last 30 days">
        <defs>
          <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* gridlines */}
        <g className="text-ink-faint" stroke="currentColor" strokeOpacity="0.35">
          {[0.25, 0.5, 0.75].map((f) => {
            const y = PAD_T + (H - PAD_T - PAD_B) * f;
            return <line key={f} x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} />;
          })}
        </g>
        {/* views area */}
        <g className="text-ink">
          <path d={viewsArea} fill="url(#viewsFill)" />
          <path d={viewsLine} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </g>
        {/* spend line — dashed faint, secondary metric */}
        <g className="text-ink-faint">
          <path d={spendLine} fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray={SPEND_DASH} strokeLinejoin="round" />
        </g>
        {/* y labels */}
        <g className="text-ink-faint" fill="currentColor" fontSize="10">
          <text x={PAD_L + 2} y={PAD_T - 3} opacity="0.9">
            {formatCompact(maxViews)} views
          </text>
          <text x={W - PAD_R - 2} y={PAD_T - 3} textAnchor="end" opacity="0.9">
            {formatMoney(maxSpend)}
          </text>
        </g>
        {/* x labels */}
        {xLabels.map(({ i, label }) => {
          const n = data.length;
          const x = PAD_L + (n === 1 ? (W - PAD_L - PAD_R) / 2 : (i / (n - 1)) * (W - PAD_L - PAD_R));
          const anchor = i === 0 ? "start" : i === n - 1 ? "end" : "middle";
          return (
            <text key={i} x={x} y={H - 8} fontSize="10" fill="currentColor" className="text-ink-faint" opacity="0.75" textAnchor={anchor}>
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
    <div className="flex items-center gap-4 text-xs text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="h-0.5 w-4 rounded-sm bg-ink" /> Views
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-0 w-4 border-t-2 border-dashed border-ink-faint" /> Spend
      </span>
    </div>
  );
}
