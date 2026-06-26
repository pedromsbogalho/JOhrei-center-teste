import { useMemo } from 'react';
import { 
  AlertTriangle, 
  User, 
  Home, 
  Phone, 
  MessageSquare, 
  BookOpen, 
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Person, Family, Visit, AccessRole } from '../types';

interface PendenciesProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  families: Family[];
  visits: Visit[];
  userRole: AccessRole;
  onSelectPerson: (person: Person) => void;
  setCurrentTab: (tab: string) => void;
}

interface Issue {
  id: string;
  type: 'PERSON' | 'FAMILY';
  title: string;
  description: string;
  category: 'POS_OUTORGA' | 'WHATSAPP' | 'VISIT_OUTDATED' | 'MISSING_DATA' | 'NO_SECTOR';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  targetName: string;
  targetId: string;
  actionLabel: string;
  onAction: () => void;
}

export default function Pendencies({ 
  people, 
  setPeople, 
  families, 
  visits, 
  userRole,
  onSelectPerson,
  setCurrentTab
}: PendenciesProps) {

  // Auto-calculate smart issues
  const smartIssues = useMemo(() => {
    const issues: Issue[] = [];

    // Filter people based on RBAC
    const filteredPeople = userRole === 'AM' ? people.filter(p => p.setor === 'CENTRO-NORTE') : people;

    filteredPeople.forEach(p => {
      // Issue 1: Recebeu Ohikari mas não concluiu Pós-Outorga (has Ohikari but pos progress < 100%)
      const isMembro = p.subtipoCadastro === 'MEMBRO';
      const posProgress = p.jornada.cursoPosOutorga.aulas.filter(Boolean).length * 20;
      if (isMembro && posProgress < 100) {
        issues.push({
          id: `iss-pos-${p.codigoCadastro}`,
          type: 'PERSON',
          title: 'Pós-Outorga Incompleto',
          description: `Membro outorgado mas concluiu apenas ${posProgress}% das aulas obrigatórias (${p.jornada.cursoPosOutorga.aulas.filter(Boolean).length}/5 aulas).`,
          category: 'POS_OUTORGA',
          severity: 'HIGH',
          targetName: p.nome,
          targetId: p.codigoCadastro,
          actionLabel: 'Acompanhar Cursos',
          onAction: () => {
            onSelectPerson(p);
            setCurrentTab('journey');
          }
        });
      }

      // Issue 2: Ingressou / Membro mas pendente de grupo Whatsapp
      const missingWA = !p.gruposWhatsapp.setor || !p.gruposWhatsapp.geral || !p.gruposWhatsapp.lar;
      if (p.statusAtual === 'ATIVO' && missingWA) {
        const missingList = [];
        if (!p.gruposWhatsapp.setor) missingList.push('Setor');
        if (!p.gruposWhatsapp.geral) missingList.push('Geral');
        if (!p.gruposWhatsapp.lar) missingList.push('Lar');
        
        issues.push({
          id: `iss-wa-${p.codigoCadastro}`,
          type: 'PERSON',
          title: 'Fora do Grupo do WhatsApp',
          description: `Ainda não ingressou nos seguintes canais: ${missingList.join(', ')}.`,
          category: 'WHATSAPP',
          severity: 'MEDIUM',
          targetName: p.nome,
          targetId: p.codigoCadastro,
          actionLabel: 'Ver Detalhes',
          onAction: () => {
            onSelectPerson(p);
          }
        });
      }

      // Issue 3: Pessoa cadastrada sem setor ou sem Assistente de Família (AF)
      if (!p.setor || !p.af || p.af === 'NENHUM' || p.idFamilia === '') {
        issues.push({
          id: `iss-sector-${p.codigoCadastro}`,
          type: 'PERSON',
          title: 'Sem Vínculo Territorial (Sem Setor / AF)',
          description: 'Esta pessoa está cadastrada na unidade mas não possui Assistente de Família, Setor ou ID Família configurados.',
          category: 'NO_SECTOR',
          severity: 'HIGH',
          targetName: p.nome,
          targetId: p.codigoCadastro,
          actionLabel: 'Vincular Agora',
          onAction: () => {
            onSelectPerson(p);
          }
        });
      }

      // Issue 4: Pessoa cadastrada sem telefone principal
      if (!p.celularPrincipal && !p.telefoneContato) {
        issues.push({
          id: `iss-phone-${p.codigoCadastro}`,
          type: 'PERSON',
          title: 'Cadastro sem Telefone',
          description: 'A pessoa não possui nenhum celular ou telefone de contato registrado, dificultando o acompanhamento.',
          category: 'MISSING_DATA',
          severity: 'MEDIUM',
          targetName: p.nome,
          targetId: p.codigoCadastro,
          actionLabel: 'Corrigir Cadastro',
          onAction: () => {
            onSelectPerson(p);
          }
        });
      }

      // Issue 5: Frequentador sem visita cadastrada há mais de 30 dias (ou nunca)
      if (p.subtipoCadastro === 'FREQUENTADOR') {
        const personVisits = visits.filter(v => v.recebedor === p.nome);
        const hasRecentVisit = personVisits.some(v => {
          const vDate = new Date(v.data);
          const limit = new Date('2026-05-25'); // simulation date threshold
          return vDate >= limit;
        });

        if (!hasRecentVisit) {
          issues.push({
            id: `iss-freqvisit-${p.codigoCadastro}`,
            type: 'PERSON',
            title: 'Frequentador sem Assistência há +30 dias',
            description: personVisits.length === 0 
              ? 'Este frequentador nunca recebeu uma visita registrada na sua ficha.' 
              : `Última visita registrada em ${personVisits[0]?.data}. Necessita de acompanhamento.`,
            category: 'VISIT_OUTDATED',
            severity: 'HIGH',
            targetName: p.nome,
            targetId: p.codigoCadastro,
            actionLabel: 'Agendar Visita',
            onAction: () => {
              setCurrentTab('families');
            }
          });
        }
      }
    });

    // Issue 6: Famílias sem assistência há muito tempo
    const filteredFamilies = userRole === 'AM' 
      ? families.filter(f => people.some(p => p.idFamilia === f.id && p.setor === 'CENTRO-NORTE'))
      : families;

    filteredFamilies.forEach(f => {
      const familyVisits = visits.filter(v => v.idFamilia === f.id);
      const hasRecent = familyVisits.some(v => {
        const vDate = new Date(v.data);
        const limit = new Date('2026-05-25');
        return vDate >= limit;
      });

      if (!hasRecent) {
        issues.push({
          id: `iss-famvisit-${f.id}`,
          type: 'FAMILY',
          title: 'Lar sem Assistência Periódica',
          description: familyVisits.length === 0
            ? 'Esta família nunca recebeu uma visita de assistência registrada.'
            : `Sem visitas desde ${familyVisits[0]?.data}. Risco de afastamento espiritual.`,
          category: 'VISIT_OUTDATED',
          severity: 'HIGH',
          targetName: f.nome,
          targetId: f.id,
          actionLabel: 'Registrar Visita',
          onAction: () => {
            setCurrentTab('families');
          }
        });
      }
    });

    return issues;
  }, [people, families, visits, userRole, onSelectPerson, setCurrentTab]);

  return (
    <div className="space-y-6" id="pendencies-root">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="pendencies-title">
          Pendências Inteligentes (Smart Audit)
        </h1>
        <p className="text-slate-500 text-sm">
          Auditoria automatizada em tempo real para garantir o correto acolhimento e a integração dos membros.
        </p>
      </div>

      {/* Grid of severity counts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-rose-800 uppercase">Prioridade Alta</span>
            <div className="text-2xl font-bold text-rose-950">
              {smartIssues.filter(i => i.severity === 'HIGH').length}
            </div>
          </div>
          <AlertTriangle className="text-rose-600" size={24} />
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-amber-800 uppercase">Prioridade Média</span>
            <div className="text-2xl font-bold text-amber-950">
              {smartIssues.filter(i => i.severity === 'MEDIUM').length}
            </div>
          </div>
          <AlertTriangle className="text-amber-500" size={24} />
        </div>

        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total de Pendências</span>
            <div className="text-2xl font-bold text-slate-800">
              {smartIssues.length}
            </div>
          </div>
          <Zap className="text-slate-400 animate-pulse" size={24} />
        </div>
      </div>

      {/* Warning List */}
      <div className="space-y-3">
        {smartIssues.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-250 rounded-xl p-8 text-center text-emerald-800">
            <h3 className="font-bold text-sm">Parabéns! Nenhuma pendência identificada</h3>
            <p className="text-xs text-emerald-600 mt-1">Todos os lares de luz estão assistidos, e os novos membros estão sintonizados com os estudos.</p>
          </div>
        ) : (
          smartIssues.map(issue => {
            return (
              <div 
                key={issue.id} 
                className={`p-4 bg-white border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-xs ${
                  issue.severity === 'HIGH' ? 'border-rose-250/80 hover:border-rose-400' : 'border-slate-250 hover:border-slate-350'
                }`}
                id={`issue-${issue.id}`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                    issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {issue.category === 'POS_OUTORGA' && <BookOpen size={16} />}
                    {issue.category === 'WHATSAPP' && <MessageSquare size={16} />}
                    {issue.category === 'VISIT_OUTDATED' && <Calendar size={16} />}
                    {issue.category === 'MISSING_DATA' && <Phone size={16} />}
                    {issue.category === 'NO_SECTOR' && <AlertTriangle size={16} />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm uppercase">{issue.targetName}</span>
                      <span className="text-[10px] font-mono text-slate-400">({issue.targetId})</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        issue.severity === 'HIGH' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {issue.title}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed max-w-2xl">{issue.description}</p>
                  </div>
                </div>

                <button
                  onClick={issue.onAction}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors shadow-xs w-full sm:w-auto shrink-0 justify-center sm:justify-start"
                  id={`action-issue-${issue.id}`}
                >
                  <span>{issue.actionLabel}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
