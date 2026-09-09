export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { TRAVA_META } from '@/lib/questions';

// POST: gera HTML do relatório de evolução em 2 versões
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'professional') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { clientId, version = 'technical' } = await request.json();
  if (!clientId) return NextResponse.json({ error: 'clientId obrigatório.' }, { status: 400 });

  // Verificar vínculo
  const link = await prisma.clientLink.findFirst({ where: { professionalId: session.user.id, clientId, status: 'active' } });
  if (!link) return NextResponse.json({ error: 'Cliente não vinculado.' }, { status: 403 });

  const client = await prisma.user.findUnique({ where: { id: clientId }, select: { name: true, email: true } });
  const assessments = await prisma.assessment.findMany({
    where: { userId: clientId },
    orderBy: { completedAt: 'asc' },
    include: { scores: true },
  });

  const goals = await prisma.therapeuticGoal.findMany({ where: { clientId, professionalId: session.user.id } });
  const homework = await prisma.homeworkTask.findMany({ where: { clientId, professionalId: session.user.id } });
  const sessions = await prisma.clientSession.findMany({ where: { clientId, professionalId: session.user.id, status: 'completed' } });

  const clientName = client?.name || client?.email || 'Cliente';
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  const completedHw = homework.filter(h => h.status === 'completed').length;
  const adherenceRate = homework.length > 0 ? Math.round((completedHw / homework.length) * 100) : 0;
  const achievedGoals = goals.filter(g => g.status === 'achieved').length;

  const generateTravaRows = () => {
    if (assessments.length === 0) return '<tr><td colspan="4">Sem dados</td></tr>';
    const first = assessments[0];
    const last = assessments[assessments.length - 1];
    const travas = Object.keys(TRAVA_META);
    return travas.map(key => {
      const meta = (TRAVA_META as any)[key];
      const firstScore = first.scores.find(s => s.travaKey === key);
      const lastScore = last.scores.find(s => s.travaKey === key);
      const change = firstScore && lastScore ? Math.round(lastScore.normalized - firstScore.normalized) : 0;
      const changeColor = change < 0 ? '#059669' : change > 0 ? '#dc2626' : '#6b7280';
      const changeSign = change > 0 ? '+' : '';
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:500;">${meta?.name ?? key}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${firstScore ? Math.round(firstScore.normalized) + '%' : '-'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${lastScore ? Math.round(lastScore.normalized) + '%' : '-'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;color:${changeColor};font-weight:600;">${changeSign}${change}%</td>
      </tr>`;
    }).join('');
  };

  let html = '';

  if (version === 'motivational') {
    // Versão motivacional (para o cliente)
    const improvements = assessments.length >= 2
      ? Object.keys(TRAVA_META).filter(key => {
          const first = assessments[0].scores.find(s => s.travaKey === key);
          const last = assessments[assessments.length - 1].scores.find(s => s.travaKey === key);
          return first && last && last.normalized < first.normalized;
        }).map(key => (TRAVA_META as any)[key]?.name ?? key)
      : [];

    html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<style>
body { font-family: 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 30px; color: #1a1a2e; }
h1 { color: #3b9b8f; font-size: 24px; margin-bottom: 4px; }
.subtitle { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
.card { background: #f0fdf4; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.card h2 { color: #3b9b8f; font-size: 18px; margin-bottom: 12px; }
.stat { display: inline-block; text-align: center; padding: 15px 25px; background: white; border-radius: 10px; margin: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.stat .number { font-size: 28px; font-weight: 700; color: #3b9b8f; }
.stat .label { font-size: 11px; color: #6b7280; margin-top: 2px; }
.quote { font-style: italic; color: #3b9b8f; border-left: 3px solid #3b9b8f; padding-left: 15px; margin: 20px 0; }
.footer { text-align: center; color: #9ca3af; font-size: 11px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
</style></head><body>
<h1>🌟 Relatório de Evolução</h1>
<p class="subtitle">${clientName} — ${today}</p>

<div class="card">
<h2>🎉 Suas Conquistas</h2>
<div style="display:flex;flex-wrap:wrap;gap:5px;">
<div class="stat"><div class="number">${assessments.length}</div><div class="label">Avaliações</div></div>
<div class="stat"><div class="number">${sessions.length}</div><div class="label">Sessões</div></div>
<div class="stat"><div class="number">${adherenceRate}%</div><div class="label">Adesão Tarefas</div></div>
<div class="stat"><div class="number">${achievedGoals}</div><div class="label">Metas Alcançadas</div></div>
</div>
</div>

${improvements.length > 0 ? `<div class="card">
<h2>📈 Áreas com Melhora Real</h2>
<ul style="line-height:1.8;">${improvements.map(i => `<li><strong>${i}</strong> — você evoluiu nesta área!</li>`).join('')}</ul>
</div>` : ''}

<div class="quote">
“Cada passo no caminho do autoconhecimento é uma conquista. Continue! Seu progresso é real e mensurável.”
</div>

<div class="footer">
Tharrus — Relatório de Evolução Motivacional<br>
Gerado em ${today}. Esta ferramenta é de autoconhecimento e mentoring, não substitui acompanhamento profissional.
</div>
</body></html>`;
  } else {
    // Versão técnica (para o profissional)
    html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<style>
body { font-family: 'Segoe UI', sans-serif; max-width: 750px; margin: 0 auto; padding: 30px; color: #1a1a2e; font-size: 13px; }
h1 { font-size: 20px; margin-bottom: 2px; }
.subtitle { color: #6b7280; font-size: 12px; margin-bottom: 25px; }
h2 { font-size: 15px; color: #3b9b8f; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
th { text-align: left; padding: 8px; border-bottom: 2px solid #3b9b8f; font-size: 12px; color: #6b7280; }
.kpi { display: inline-block; text-align: center; padding: 10px 18px; background: #f3f4f6; border-radius: 8px; margin: 3px; }
.kpi .val { font-size: 20px; font-weight: 700; }
.kpi .lbl { font-size: 10px; color: #6b7280; }
.note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 10px; margin: 10px 0; font-size: 12px; }
.footer { text-align: center; color: #9ca3af; font-size: 10px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
</style></head><body>
<h1>Relatório Técnico de Evolução</h1>
<p class="subtitle">${clientName} — Profissional: ${session.user.name || session.user.email} — ${today}</p>

<h2>Indicadores Gerais</h2>
<div style="display:flex;flex-wrap:wrap;gap:3px;">
<div class="kpi"><div class="val">${assessments.length}</div><div class="lbl">Avaliações</div></div>
<div class="kpi"><div class="val">${sessions.length}</div><div class="lbl">Sessões</div></div>
<div class="kpi"><div class="val">${adherenceRate}%</div><div class="lbl">Adesão</div></div>
<div class="kpi"><div class="val">${achievedGoals}/${goals.length}</div><div class="lbl">Metas</div></div>
<div class="kpi"><div class="val">${completedHw}/${homework.length}</div><div class="lbl">Tarefas</div></div>
</div>

<h2>Evolução por Trava</h2>
<table>
<thead><tr><th>Trava</th><th style="text-align:center;">Inicial</th><th style="text-align:center;">Última</th><th style="text-align:center;">Variação</th></tr></thead>
<tbody>${generateTravaRows()}</tbody>
</table>

${goals.length > 0 ? `<h2>Metas Terapêuticas</h2>
<table>
<thead><tr><th>Meta</th><th>Trava</th><th style="text-align:center;">Status</th></tr></thead>
<tbody>${goals.map(g => {
  const meta = (TRAVA_META as any)[g.travaKey];
  const statusLabel = g.status === 'achieved' ? '✅ Alcançada' : g.status === 'abandoned' ? '❌ Abandonada' : '🟡 Ativa';
  return `<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;">${g.title}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;">${meta?.name ?? g.travaKey}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:center;">${statusLabel}</td></tr>`;
}).join('')}</tbody>
</table>` : ''}

<div class="note">
⚠️ Este relatório é para uso do profissional. Tharrus é uma ferramenta de organização e mensuração do processo. Não substitui formação clínica, supervisão ou julgamento profissional.
</div>

<div class="footer">
Tharrus — Relatório Técnico de Evolução<br>
Gerado em ${today}. Documento confidencial.
</div>
</body></html>`;
  }

  return NextResponse.json({ html, version, clientName });
}
