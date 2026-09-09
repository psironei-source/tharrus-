'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TRAVA_META, TRAVA_KEYS } from '@/lib/questions';

const COLORS = ['#3b9b8f', '#3b82f6', '#ef4444', '#eab308', '#8b5cf6', '#f97316', '#22c55e', '#ec4899'];

interface HistoryEntry {
  id: string;
  completedAt: string;
  scores: { travaKey: string; normalized: number; band: string }[];
}

export default function EvolutionChart({ history }: { history: HistoryEntry[] }) {
  const sorted = [...(history ?? [])].sort((a: HistoryEntry, b: HistoryEntry) =>
    new Date(a?.completedAt ?? 0).getTime() - new Date(b?.completedAt ?? 0).getTime()
  );

  const data = sorted.map((entry: HistoryEntry, idx: number) => {
    const point: Record<string, any> = {
      name: entry?.completedAt
        ? new Date(entry.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : `#${idx + 1}`,
    };
    for (const score of (entry?.scores ?? [])) {
      const meta = TRAVA_META?.[score?.travaKey];
      if (meta) {
        point[meta.shortName] = score?.normalized ?? 0;
      }
    }
    return point;
  });

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          {TRAVA_KEYS.map((key: string, idx: number) => {
            const meta = TRAVA_META?.[key];
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={meta?.shortName ?? key}
                stroke={COLORS?.[idx] ?? '#888'}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
