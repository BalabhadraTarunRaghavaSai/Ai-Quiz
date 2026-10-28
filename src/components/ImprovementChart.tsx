import React, { useState } from 'react';
import { TrendDataPoint } from '../utils/quizAnalytics';

interface ImprovementChartProps {
  data: TrendDataPoint[];
  targetAccuracy: number;
}

export const ImprovementChart: React.FC<ImprovementChartProps> = ({
  data,
  targetAccuracy,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="py-12 text-center border border-dashed border-slate-200 rounded-lg">
        <p className="text-sm text-slate-600">
          Complete your first quiz to visualize your accuracy trajectory over time.
        </p>
      </div>
    );
  }

  const activeIdx =
    selectedIndex !== null && selectedIndex < data.length
      ? selectedIndex
      : data.length - 1;
  const activePoint = data[activeIdx];

  const width = 720;
  const height = 240;
  const padLeft = 42;
  const padRight = 68;
  const padTop = 20;
  const padBottom = 34;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getX = (index: number) => {
    if (data.length === 1) return padLeft + plotWidth / 2;
    return padLeft + (index / (data.length - 1)) * plotWidth;
  };

  const getY = (score: number) => {
    const clamped = Math.max(0, Math.min(100, score));
    return padTop + plotHeight - (clamped / 100) * plotHeight;
  };

  const scorePoints = data.map((d, idx) => ({
    x: getX(idx),
    y: getY(d.scorePercentage),
  }));

  const rollingPoints = data.map((d, idx) => ({
    x: getX(idx),
    y: getY(d.rollingAverage),
  }));

  const linePath = scorePoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const rollingPath = rollingPoints
    .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    scorePoints.length > 1
      ? `${linePath} L ${scorePoints[scorePoints.length - 1].x.toFixed(1)} ${(
          padTop + plotHeight
        ).toFixed(1)} L ${scorePoints[0].x.toFixed(1)} ${(
          padTop + plotHeight
        ).toFixed(1)} Z`
      : '';

  const targetY = getY(targetAccuracy);
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div>
      {/* Selected Point Inspection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-200/80 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span className="font-semibold text-slate-900">
            {activePoint.quizTitle}
          </span>
          <span aria-hidden="true">·</span>
          <span>{activePoint.subject}</span>
          <span aria-hidden="true">·</span>
          <span>{activePoint.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{activePoint.dateLabel}</span>
        </div>
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <span className="text-slate-700">
            Score:{' '}
            <strong className="text-sky-700 font-semibold">
              {activePoint.scorePercentage}%
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            |
          </span>
          <span className="text-slate-600">
            3-Quiz Avg:{' '}
            <strong className="text-slate-900 font-semibold">
              {activePoint.rollingAverage}%
            </strong>
          </span>
          <span aria-hidden="true" className="text-slate-300">
            |
          </span>
          <span className="text-emerald-700">
            Target: <strong>{targetAccuracy}%</strong>
          </span>
        </div>
      </div>

      {/* SVG Trajectory Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label={`Quiz score improvement chart showing ${data.length} attempts`}
        >
          <defs>
            <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Y-axis grid lines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray={tick === 0 ? undefined : '3 3'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {/* Target Accuracy Goal Line */}
          <line
            x1={padLeft}
            y1={targetY}
            x2={width - padRight}
            y2={targetY}
            stroke="#059669"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <text
            x={width - padRight + 6}
            y={targetY + 3}
            textAnchor="start"
            className="fill-emerald-700 text-[10px] font-mono font-semibold"
          >
            Goal {targetAccuracy}%
          </text>

          {/* Area Fill under primary score line */}
          {areaPath && <path d={areaPath} fill="url(#scoreAreaGrad)" />}

          {/* Rolling 3-attempt Average Line */}
          {data.length > 1 && (
            <path
              d={rollingPath}
              fill="none"
              stroke="#64748B"
              strokeWidth="1.75"
              strokeDasharray="4 4"
            />
          )}

          {/* Primary Score Trajectory Line */}
          {data.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Attempt Nodes */}
          {scorePoints.map((pt, idx) => {
            const item = data[idx];
            const isSelected = idx === activeIdx;
            const metGoal = item.scorePercentage >= targetAccuracy;
            return (
              <g
                key={item.attemptId}
                className="cursor-pointer"
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                {/* Invisible larger hit target for accessibility */}
                <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />

                {isSelected && (
                  <line
                    x1={pt.x}
                    y1={padTop}
                    x2={pt.x}
                    y2={padTop + plotHeight}
                    stroke="#CBD5E1"
                    strokeWidth="1"
                  />
                )}

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSelected ? 6 : 4.5}
                  fill={metGoal ? '#059669' : '#0284C7'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />

                {/* X-axis label */}
                <text
                  x={pt.x}
                  y={height - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-mono ${
                    isSelected
                      ? 'fill-slate-900 font-semibold'
                      : 'fill-slate-500'
                  }`}
                >
                  {item.dateLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-6">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sky-600 inline-block" />
            <span>Quiz Score (%)</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-500 inline-block" />
            <span>3-Attempt Rolling Avg</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 border-b-2 border-dashed border-emerald-600 inline-block" />
            <span>Target Accuracy ({targetAccuracy}%)</span>
          </span>
        </div>
        <span>Click or hover any attempt node to inspect details</span>
      </div>
    </div>
  );
};
