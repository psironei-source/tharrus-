'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e'];

export default function SDRBarChart({ sociabilidade, dominancia, receptividade }: { sociabilidade: number; dominancia: number; receptividade: number }) {
  const data = [
    { name: 'Sociabilidade', valor: sociabilidade ?? 0 },
    { name: 'Dominância', valor: dominancia ?? 0 },
    { name: 'Receptividade', valor: receptividade ?? 0 },
  ];

  return (
    <div style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={40}>
            {data.map((_: any, idx: number) => (
              <Cell key={idx} fill={COLORS?.[idx] ?? '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
