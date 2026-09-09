import Link from 'next/link';
import { BarChart3, Compass, BookOpen, Target, MessageCircle, Calendar, SunMedium, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MODULES = [
  {
    key: 'sdr',
    name: 'Escala SDR',
    desc: 'Mapeie sua Sociabilidade, Dominância e Receptividade nas relações interpessoais.',
    icon: BarChart3,
    href: '/sdr',
    available: true,
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    key: 'bussola',
    name: 'Bússola de Ação',
    desc: 'Organize seu plano de ação estratégico com as 8 colunas do método.',
    icon: Compass,
    href: '/bussola',
    available: true,
    color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
  {
    key: 'valores',
    name: 'Clareza dos Valores Essenciais',
    desc: 'Descubra seus valores mais profundos com o exercício da "ilha deserta".',
    icon: BookOpen,
    href: '/valores',
    available: true,
    color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    key: 'crencas',
    name: 'Mapeamento Cruzado de Crenças',
    desc: 'Identifique a origem e o custo de uma crença limitante e crie seu manifesto de substituição.',
    icon: Layers,
    href: '/manifesto',
    available: true,
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    key: 'dialogo',
    name: 'Diálogo Interior',
    desc: 'Mapeie a cadeia Palavra → Significado → Sentimento → Comportamento → Resultado.',
    icon: MessageCircle,
    href: '/dialogo-interior',
    available: true,
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  },
  {
    key: '1041',
    name: 'Sistema 10-4-1',
    desc: 'Funil de realização progressiva: 10 objetivos → 4 prioridades → 1 meta.',
    icon: Target,
    href: '/sistema1041',
    available: true,
    color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
  {
    key: 'ritual',
    name: 'Ritual de Ativação e Crescimento',
    desc: 'Checklist diário com as 4 perguntas cruciais para manhã e noite.',
    icon: SunMedium,
    href: '/ritual',
    available: true,
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  },
  {
    key: 'ciclo',
    name: 'Ciclo de Pensar e Sentir',
    desc: 'Reflexão guiada sobre pensamentos automáticos do dia a dia.',
    icon: Calendar,
    href: '/ciclo',
    available: true,
    color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  },
];

export default function ModulosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Módulos Complementares</h1>
        <p className="text-muted-foreground mt-1">Aprofunde seu autoconhecimento com ferramentas extras baseadas em Neuromentoring.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {MODULES.map((mod: any) => (
          <Card key={mod.key} className={`transition-shadow ${mod.available ? 'hover:shadow-md' : 'opacity-70'}`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${mod.color}`}>
                  <mod.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{mod.name}</h3>
                    {!mod.available && <Badge variant="outline" className="text-[10px]">Em breve</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{mod.desc}</p>
                  {mod.available && (
                    <Link href={mod.href} className="inline-block mt-3">
                      <Button size="sm" variant="secondary">Acessar</Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
