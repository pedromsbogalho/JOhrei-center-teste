import { useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Home, 
  BookOpen, 
  AlertCircle, 
  TrendingUp, 
  Award,
  Clock
} from 'lucide-react';
import { Person, Family, Visit, Sector, AccessRole } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';

interface DashboardProps {
  people: Person[];
  families: Family[];
  visits: Visit[];
  sectors: Sector[];
  userRole: AccessRole;
}

export default function Dashboard({ 
  people, 
  families, 
  visits, 
  sectors,
  userRole 
}: DashboardProps) {
  
  // Filter data based on RBAC
  const filteredPeople = useMemo(() => {
    if (userRole === 'AM') {
      return people.filter(p => p.setor === 'CENTRO-NORTE');
    }
    return people;
  }, [people, userRole]);

  const filteredFamilies = useMemo(() => {
    if (userRole === 'AM') {
      // Find families whose AF is in CENTRO-NORTE or who reside in CENTRO-NORTE bairros
      const cBairros = sectors.find(s => s.nome === 'CENTRO-NORTE')?.bairros || [];
      return families.filter(f => {
        const belongsByBairro = filteredPeople.some(p => p.idFamilia === f.id);
        return belongsByBairro;
      });
    }
    return families;
  }, [families, filteredPeople, sectors, userRole]);

  const filteredVisits = useMemo(() => {
    if (userRole === 'AM') {
      return visits.filter(v => {
        return filteredFamilies.some(f => f.id === v.idFamilia);
      });
    }
    return visits;
  }, [visits, filteredFamilies, userRole]);

  // Core metrics
  const totalMembros = useMemo(() => {
    return filteredPeople.filter(p => p.subtipoCadastro === 'MEMBRO').length;
  }, [filteredPeople]);

  const totalFrequentadores = useMemo(() => {
    return filteredPeople.filter(p => p.subtipoCadastro === 'FREQUENTADOR').length;
  }, [filteredPeople]);

  const novosFrequentadoresMes = useMemo(() => {
    // Simulated count: frequenters registered in last few months, or in 2026
    return filteredPeople.filter(p => 
      p.subtipoCadastro === 'FREQUENTADOR' && 
      p.jornada.primeiroAtendimentoData && 
      p.jornada.primeiroAtendimentoData.startsWith('2026')
    ).length;
  }, [filteredPeople]);

  const conclusaoPosOutorgaCount = useMemo(() => {
    // Outorgas who finished 5/5 classes
    const outorgados = filteredPeople.filter(p => p.tipoCadastro === 'Ohikari');
    const concluidos = outorgados.filter(p => p.jornada.cursoPosOutorga.aulas.every(a => a)).length;
    return {
      concluidos,
      total: outorgados.length,
      percent: outorgados.length > 0 ? Math.round((concluidos / outorgados.length) * 100) : 0
    };
  }, [filteredPeople]);

  const familiasAssistidasCount = useMemo(() => {
    return filteredFamilies.length;
  }, [filteredFamilies]);

  // Families without visits in last 30 days (simulation using visit history dates or lack of visits)
  const familiasSemVisitaRecente = useMemo(() => {
    return filteredFamilies.filter(f => {
      const familyVisits = filteredVisits.filter(v => v.idFamilia === f.id);
      if (familyVisits.length === 0) return true;
      
      // Check if any visit is after 2026-05-25 (within 30 days)
      const hasRecent = familyVisits.some(v => {
        const visitDate = new Date(v.data);
        const cutoff = new Date('2026-05-25');
        return visitDate >= cutoff;
      });
      return !hasRecent;
    }).length;
  }, [filteredFamilies, filteredVisits]);

  // Frequenters without visits
  const frequentadoresSemAcompanhamento = useMemo(() => {
    return filteredPeople.filter(p => {
      if (p.subtipoCadastro !== 'FREQUENTADOR') return false;
      const familyVisits = filteredVisits.filter(v => {
        const personInFamily = filteredPeople.find(person => person.nome === v.recebedor || person.codigoCadastro === p.codigoCadastro);
        return v.recebedor === p.nome;
      });
      return familyVisits.length === 0;
    }).length;
  }, [filteredPeople, filteredVisits]);

  // Chart 1: Members and Frequenters distribution per Sector
  const sectorChartData = useMemo(() => {
    const data: { name: string; Membros: number; Frequentadores: number }[] = [];
    
    // If AM, only display CENTRO-NORTE
    const visibleSectors = userRole === 'AM' 
      ? sectors.filter(s => s.nome === 'CENTRO-NORTE') 
      : sectors;

    visibleSectors.forEach(sec => {
      const secPeople = filteredPeople.filter(p => p.setor === sec.nome);
      const members = secPeople.filter(p => p.subtipoCadastro === 'MEMBRO').length;
      const frequenters = secPeople.filter(p => p.subtipoCadastro === 'FREQUENTADOR').length;
      data.push({
        name: sec.nome,
        Membros: members,
        Frequentadores: frequenters
      });
    });
    
    // Add "Sem Setor" if there are any
    const noSectorPeople = filteredPeople.filter(p => !p.setor);
    if (noSectorPeople.length > 0) {
      data.push({
        name: 'SEM SETOR',
        Membros: noSectorPeople.filter(p => p.subtipoCadastro === 'MEMBRO').length,
        Frequentadores: noSectorPeople.filter(p => p.subtipoCadastro === 'FREQUENTADOR').length,
      });
    }

    return data;
  }, [sectors, filteredPeople, userRole]);

  // Chart 2: Proportion Pie Chart
  const pieChartData = useMemo(() => {
    return [
      { name: 'Membros', value: totalMembros, color: '#0d9488' }, // Teal
      { name: 'Frequentadores', value: totalFrequentadores, color: '#f59e0b' } // Amber
    ];
  }, [totalMembros, totalFrequentadores]);

  // Chart 3: Outorga Year Trend
  const outorgaTrendData = useMemo(() => {
    const yearsMap: { [key: number]: number } = {};
    filteredPeople.forEach(p => {
      if (p.anoOutorga) {
        yearsMap[p.anoOutorga] = (yearsMap[p.anoOutorga] || 0) + 1;
      }
    });

    // Make sure we have a few recent years
    const currentYear = 2026;
    for (let y = currentYear - 5; y <= currentYear; y++) {
      if (!yearsMap[y]) yearsMap[y] = 0;
    }

    return Object.keys(yearsMap)
      .map(y => ({ year: parseInt(y), quantidade: yearsMap[parseInt(y)] }))
      .sort((a, b) => a.year - b.year);
  }, [filteredPeople]);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="dash-title">
            Indicadores da Unidade
          </h1>
          <p className="text-slate-500 text-sm">
            {userRole === 'ADMIN' 
              ? 'Painel geral com consolidação estatística de todos os setores e atividades.' 
              : 'Painel regional: Setor CENTRO-NORTE administrado por PROF DANI.'}
          </p>
        </div>
        <div className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-medium border border-emerald-200 flex items-center gap-1.5 shadow-sm">
          <Clock size={14} />
          <span>Dados atualizados em tempo real</span>
        </div>
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Membros Ativos (Ohikari)</span>
            <h2 className="text-3xl font-bold text-slate-800 font-sans">{totalMembros}</h2>
            <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp size={12} />
              <span>Base consolidada</span>
            </div>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <UserCheck size={24} />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Frequentadores</span>
            <h2 className="text-3xl font-bold text-slate-800 font-sans">{totalFrequentadores}</h2>
            <div className="text-[11px] text-amber-600 font-medium">
              <span>{novosFrequentadoresMes} novos este ano</span>
            </div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Users size={24} />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Famílias Assistidas</span>
            <h2 className="text-3xl font-bold text-slate-800 font-sans">{familiasAssistidasCount}</h2>
            <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
              <span>{familiasSemVisitaRecente} sem visitas há +30 dias</span>
            </div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Home size={24} />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-250 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">Pós-Outorga Concluído</span>
            <h2 className="text-3xl font-bold text-slate-800 font-sans">{conclusaoPosOutorgaCount.percent}%</h2>
            <div className="text-[11px] text-slate-500">
              <span>{conclusaoPosOutorgaCount.concluidos} de {conclusaoPosOutorgaCount.total} membros</span>
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Warning Badges for At-Risk Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {familiasSemVisitaRecente > 0 && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-sm font-semibold text-amber-900">Alerta de Acompanhamento Familiar</span>
              <p className="text-xs text-amber-700 mt-0.5">
                Existem <strong>{familiasSemVisitaRecente} famílias</strong> sem assistência religiosa ou visitas nos últimos 30 dias. Incentive os Assistentes de Família.
              </p>
            </div>
          </div>
        )}
        {frequentadoresSemAcompanhamento > 0 && (
          <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-sm font-semibold text-rose-900">Frequentadores sem Atendimento</span>
              <p className="text-xs text-rose-700 mt-0.5">
                Existem <strong>{frequentadoresSemAcompanhamento} frequentadores</strong> que ainda não receberam visitas ou não têm histórico de Johrei anotado.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Sector Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-1.5">
            <TrendingUp size={16} className="text-emerald-600" />
            Distribuição por Setores e Categorias
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sectorChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} 
                />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Membros" fill="#0d9488" radius={[4, 4, 0, 0]} name="Membros (Ohikari)" />
                <Bar dataKey="Frequentadores" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Frequentadores" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Member Type proportion */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
            Proporção da Unidade
          </h3>
          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{totalMembros + totalFrequentadores}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pessoas</span>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            {pieChartData.map((item, index) => (
              <div key={index} className="flex justify-between items-center px-2 py-1 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{item.value} ({Math.round((item.value / Math.max(1, totalMembros + totalFrequentadores)) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Outorga Year Trends */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-1.5">
          <BookOpen size={16} className="text-teal-600" />
          Histórico de Novas Outorgas de Ohikari (Anual)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={outorgaTrendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: '12px' }} />
              <Area type="monotone" dataKey="quantidade" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorQty)" name="Novas Outorgas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
