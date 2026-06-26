import { useState, useMemo, FormEvent } from 'react';
import { 
  Home, 
  Search, 
  MapPin, 
  User, 
  Calendar, 
  MessageSquare, 
  Footprints, 
  Plus, 
  Check, 
  Activity,
  HeartHandshake,
  X
} from 'lucide-react';
import { Family, Person, Visit, AccessRole } from '../types';

interface FamilyManagerProps {
  families: Family[];
  setFamilies: (families: Family[]) => void;
  people: Person[];
  visits: Visit[];
  setVisits: (visits: Visit[]) => void;
  userRole: AccessRole;
}

export default function FamilyManager({ 
  families, 
  setFamilies, 
  people, 
  visits,
  setVisits,
  userRole 
}: FamilyManagerProps) {
  
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(families[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewFamilyOpen, setIsNewFamilyOpen] = useState(false);
  const [isAddVisitOpen, setIsAddVisitOpen] = useState(false);

  // New Family Form State
  const [familyForm, setFamilyForm] = useState({
    nome: '',
    endereco: '',
    assistenteResponsavel: 'YOKO',
    observacoes: ''
  });

  // New Visit Form State
  const [visitForm, setVisitForm] = useState({
    data: new Date().toISOString().split('T')[0],
    visitante: 'YOKO',
    recebedor: '',
    objetivo: 'Visita de assistência religiosa periódica',
    johreiMinistrado: true,
    participantes: 2,
    observacoes: ''
  });

  // Filter based on RBAC & Search
  const filteredFamilies = useMemo(() => {
    return families.filter(f => {
      // Role filter: If AM, only display families with members belonging to CENTRO-NORTE
      if (userRole === 'AM') {
        const hasMemberInCentroNorte = people.some(p => p.idFamilia === f.id && p.setor === 'CENTRO-NORTE');
        if (!hasMemberInCentroNorte) return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = f.nome.toLowerCase().includes(query);
        const matchesAF = f.assistenteResponsavel.toLowerCase().includes(query);
        const matchesAddress = f.endereco.toLowerCase().includes(query);
        return matchesName || matchesAF || matchesAddress;
      }
      return true;
    });
  }, [families, people, searchQuery, userRole]);

  // Selected Family details
  const family = useMemo(() => {
    return families.find(f => f.id === selectedFamilyId) || filteredFamilies[0] || null;
  }, [families, selectedFamilyId, filteredFamilies]);

  // Family Members count & list
  const familyMembersList = useMemo(() => {
    if (!family) return [];
    return people.filter(p => p.idFamilia === family.id);
  }, [people, family]);

  const stats = useMemo(() => {
    const members = familyMembersList.filter(p => p.subtipoCadastro === 'MEMBRO').length;
    const frequenters = familyMembersList.filter(p => p.subtipoCadastro === 'FREQUENTADOR').length;
    return { members, frequenters };
  }, [familyMembersList]);

  // Visits associated with selected family
  const familyVisits = useMemo(() => {
    if (!family) return [];
    return visits.filter(v => v.idFamilia === family.id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [visits, family]);

  // Handle New Family Submit
  const handleCreateFamily = (e: FormEvent) => {
    e.preventDefault();
    if (!familyForm.nome) return;

    const newFamily: Family = {
      id: `FAM-${Math.floor(100 + Math.random() * 900)}`,
      nome: familyForm.nome,
      endereco: familyForm.endereco,
      assistenteResponsavel: familyForm.assistenteResponsavel.toUpperCase(),
      observacoes: familyForm.observacoes
    };

    setFamilies([newFamily, ...families]);
    setSelectedFamilyId(newFamily.id);
    setIsNewFamilyOpen(false);
    setFamilyForm({ nome: '', endereco: '', assistenteResponsavel: 'YOKO', observacoes: '' });
  };

  // Handle Register Visit Submit
  const handleRegisterVisit = (e: FormEvent) => {
    e.preventDefault();
    if (!family) return;

    const newVisit: Visit = {
      id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
      data: visitForm.data,
      visitante: visitForm.visitante.toUpperCase(),
      recebedor: visitForm.recebedor || (familyMembersList[0]?.nome || family.nome),
      idFamilia: family.id,
      objetivo: visitForm.objetivo,
      johreiMinistrado: visitForm.johreiMinistrado,
      participantes: Number(visitForm.participantes),
      observacoes: visitForm.observacoes
    };

    setVisits([newVisit, ...visits]);
    setIsAddVisitOpen(false);
    setVisitForm({
      data: new Date().toISOString().split('T')[0],
      visitante: family.assistenteResponsavel,
      recebedor: '',
      objetivo: 'Visita de assistência religiosa periódica',
      johreiMinistrado: true,
      participantes: 2,
      observacoes: ''
    });
  };

  return (
    <div className="space-y-6" id="family-manager-container">
      
      {/* Upper action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="family-title">
            Famílias Assistidas (Lares de Luz)
          </h1>
          <p className="text-slate-500 text-sm">
            Mapeamento territorial de lares, visitas domiciliares periódicas e hortas caseiras.
          </p>
        </div>
        <button
          onClick={() => setIsNewFamilyOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-stretch sm:self-auto"
          id="btn-new-family"
        >
          <Plus size={16} />
          <span>Cadastrar Nova Família</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left selector sidebar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col h-[580px]">
          <span className="text-xs font-bold uppercase text-slate-400 mb-3 block">Listagem de Famílias</span>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por sobrenome ou AF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none"
              id="family-search-input"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
            {filteredFamilies.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">Nenhuma família encontrada.</div>
            ) : (
              filteredFamilies.map(f => {
                const isActive = f.id === family?.id;
                const members = people.filter(p => p.idFamilia === f.id).length;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFamilyId(f.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                    id={`btn-family-${f.id}`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-semibold text-slate-800 text-sm truncate">{f.nome}</div>
                      <div className="text-[10px] text-slate-450 font-semibold uppercase">
                        AF: {f.assistenteResponsavel} • {members} Integrantes
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{f.id}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right detailed Family Profile and Visit history (Col-span 2) */}
        {family ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* General Info Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {family.id}
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-slate-800">{family.nome}</h2>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    {family.endereco}
                  </p>
                </div>
                <button
                  onClick={() => setIsAddVisitOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-250 bg-white text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs"
                  id="btn-add-visit"
                >
                  <Footprints size={14} className="text-emerald-600" />
                  <span>Registrar Visita</span>
                </button>
              </div>

              {/* Counts metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Membros</span>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.members}</div>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Frequentadores</span>
                  <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.frequenters}</div>
                </div>
                <div className="bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">AF Responsável</span>
                  <div className="text-sm font-bold text-slate-800 mt-1.5 uppercase">{family.assistenteResponsavel}</div>
                </div>
              </div>

              {/* Map Mockup - Looks incredible and modern! */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Localização Espacial (Mapa)</span>
                <div className="w-full h-40 bg-slate-100 border border-slate-200 rounded-lg relative overflow-hidden flex items-center justify-center">
                  {/* Visual Map Layout vector */}
                  <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <div className="absolute w-3 h-3 bg-emerald-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                    <MapPin size={8} className="text-white" />
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono font-medium text-slate-500 bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-xs border border-slate-200">
                    Bairro ajustado de Caraguatatuba
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Observações do Lar</span>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed italic">
                  {family.observacoes || 'Nenhuma observação cadastrada para esta família.'}
                </p>
              </div>
            </div>

            {/* Módulo 7 & 8 — Family Members & Visitas History lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Family Members list */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <User size={14} className="text-slate-400" />
                  Integrantes do Lar ({familyMembersList.length})
                </h3>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {familyMembersList.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">Nenhum integrante vinculado a esta família.</div>
                  ) : (
                    familyMembersList.map(person => (
                      <div 
                        key={person.codigoCadastro} 
                        className="p-2.5 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block uppercase">{person.nome}</span>
                          <span className="text-[10px] text-slate-400">{person.idade} anos • {person.celularPrincipal || 'Sem telefone'}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          person.subtipoCadastro === 'MEMBRO' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {person.subtipoCadastro}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Visit History list */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Calendar size={14} className="text-slate-400" />
                  Histórico de Visitas ({familyVisits.length})
                </h3>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {familyVisits.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400 italic">Nenhuma visita registrada no lar.</div>
                  ) : (
                    familyVisits.map(visit => (
                      <div key={visit.id} className="p-3 bg-slate-50/50 rounded-lg border border-slate-200/60 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold text-slate-800 block">{visit.objetivo}</span>
                            <span className="text-[10px] text-slate-400">Em {visit.data} por {visit.visitante}</span>
                          </div>
                          {visit.johreiMinistrado && (
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                              <Activity size={10} />
                              Johrei
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed italic">{visit.observacoes}</p>
                        <div className="text-[10px] text-slate-450 font-medium">
                          Participantes: {visit.participantes} pessoas recebidas.
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-12 text-slate-400">
            <p>Selecione uma família à esquerda para visualizar seu perfil.</p>
          </div>
        )}
      </div>

      {/* MODAL 1: Nova Família */}
      {isNewFamilyOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Cadastrar Nova Família</h3>
                <p className="text-slate-500 text-xs">Abra um novo Lar de Luz para assistência domiciliar.</p>
              </div>
              <button onClick={() => setIsNewFamilyOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFamily} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Sobrenome da Família *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Família Onishi, Família Silva"
                  value={familyForm.nome}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Assistente de Família Responsável (AF)</label>
                <input
                  type="text"
                  placeholder="Ex: YOKO, ALBERTO"
                  value={familyForm.assistenteResponsavel}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, assistenteResponsavel: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 150 - Centro"
                  value={familyForm.endereco}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, endereco: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Observações Espirituais / Hortas</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Dedicada à horta caseira..."
                  value={familyForm.observacoes}
                  onChange={(e) => setFamilyForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsNewFamilyOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Registrar Visita */}
      {isAddVisitOpen && family && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Registrar Visita no Lar</h3>
                <p className="text-slate-500 text-xs">Anote os dados da assistência prestada na {family.nome}.</p>
              </div>
              <button onClick={() => setIsAddVisitOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterVisit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Data da Visita</label>
                  <input
                    type="date"
                    required
                    value={visitForm.data}
                    onChange={(e) => setVisitForm(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Visitante Responsável</label>
                  <input
                    type="text"
                    required
                    value={visitForm.visitante}
                    onChange={(e) => setVisitForm(prev => ({ ...prev, visitante: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Quem recebeu a visita (Familiar)</label>
                <select
                  value={visitForm.recebedor}
                  onChange={(e) => setVisitForm(prev => ({ ...prev, recebedor: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none bg-white"
                >
                  <option value="">Selecione o integrante...</option>
                  {familyMembersList.map(m => (
                    <option key={m.codigoCadastro} value={m.nome}>{m.nome}</option>
                  ))}
                  <option value={family.nome}>Toda a Família</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Objetivo da Visita</label>
                <input
                  type="text"
                  required
                  value={visitForm.objetivo}
                  onChange={(e) => setVisitForm(prev => ({ ...prev, objetivo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Participantes Presentes</label>
                  <input
                    type="number"
                    min="1"
                    value={visitForm.participantes}
                    onChange={(e) => setVisitForm(prev => ({ ...prev, participantes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={visitForm.johreiMinistrado}
                      onChange={(e) => setVisitForm(prev => ({ ...prev, johreiMinistrado: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 font-semibold">Ministrou Johrei</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Anotações da Assistência</label>
                <textarea
                  rows={3}
                  placeholder="Relatório espiritual ou pontos observados no lar..."
                  value={visitForm.observacoes}
                  onChange={(e) => setVisitForm(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsAddVisitOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Confirmar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
