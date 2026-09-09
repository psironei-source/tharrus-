'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface Score {
  travaKey: string;
  name: string;
  normalized: number;
  band: string;
}

const BAND_COLORS: Record<string, string> = {
  alta: '#ef4444',
  moderada: '#eab308',
  baixa: '#22c55e',
};

export default function BarChartComponent({ scores }: { scores: Score[] }) {
  const data = [...(scores ?? [])]
    .sort((a: Score, b: Score) => (b?.normalized ?? 0) - (a?.normalized ?? 0))
    .map((s: Score) => ({
      name: s?.name ?? '',
      valor: s?.normalized ?? 0,
      band: s?.band ?? 'baixa',
    }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} tickLine={false} width={100} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((entry: any, idx: number) => (
              <Cell key={idx} fill={BAND_COLORS?.[entry?.band] ?? '#22c55e'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
