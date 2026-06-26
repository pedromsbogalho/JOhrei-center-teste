import { useState, useMemo, FormEvent } from 'react';
import { 
  Calendar, 
  Search, 
  Plus, 
  Activity, 
  Check, 
  X, 
  FileText, 
  Users, 
  Image as ImageIcon,
  Footprints,
  Clock,
  HeartHandshake
} from 'lucide-react';
import { Visit, Family, AccessRole } from '../types';

interface VisitasListProps {
  visits: Visit[];
  setVisits: (visits: Visit[]) => void;
  families: Family[];
  userRole: AccessRole;
}

export default function VisitasList({ 
  visits, 
  setVisits, 
  families, 
  userRole 
}: VisitasListProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Visit Form State
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    visitante: '',
    recebedor: '',
    idFamilia: families[0]?.id || '',
    objetivo: '',
    johreiMinistrado: true,
    participantes: 1,
    observacoes: ''
  });

  // Filter based on RBAC & Search
  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      // Role filter: AM only sees visits for families they care about (families in Centro-Norte)
      if (userRole === 'AM') {
        // Simple filter matching family id presence or visitor name
        const isCentroNorteVisit = families.some(f => f.id === v.idFamilia && f.assistenteResponsavel === 'YOKO') || v.visitante === 'YOKO' || v.visitante === 'ALBERTO';
        if (!isCentroNorteVisit) return false;
      }

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesVisitor = v.visitante.toLowerCase().includes(query);
        const matchesReceiver = v.recebedor.toLowerCase().includes(query);
        const matchesGoal = v.objetivo.toLowerCase().includes(query);
        const matchesNotes = v.observacoes.toLowerCase().includes(query);
        return matchesVisitor || matchesReceiver || matchesGoal || matchesNotes;
      }

      return true;
    }).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [visits, families, searchQuery, userRole]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.visitante || !formData.recebedor) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newVisit: Visit = {
      id: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
      data: formData.data,
      visitante: formData.visitante.toUpperCase(),
      recebedor: formData.recebedor.toUpperCase(),
      idFamilia: formData.idFamilia,
      objetivo: formData.objetivo || 'Acompanhamento residencial',
      johreiMinistrado: formData.johreiMinistrado,
      participantes: Number(formData.participantes),
      observacoes: formData.observacoes
    };

    setVisits([newVisit, ...visits]);
    setIsModalOpen(false);

    // Reset Form
    setFormData({
      data: new Date().toISOString().split('T')[0],
      visitante: '',
      recebedor: '',
      idFamilia: families[0]?.id || '',
      objetivo: '',
      johreiMinistrado: true,
      participantes: 1,
      observacoes: ''
    });
  };

  return (
    <div className="space-y-6" id="visitas-root">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="visitas-title">
            Registro Diário de Visitas
          </h1>
          <p className="text-slate-500 text-sm">
            Acompanhe o histórico de assistência nos lares e ministre Johrei às famílias.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm self-stretch sm:self-auto"
          id="btn-add-visit-manual"
        >
          <Plus size={16} />
          <span>Registrar Nova Visita</span>
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar visitas por visitante, recebedor ou observações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
              id="visit-search-input"
            />
          </div>
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
            Exibindo {filteredVisits.length} de {visits.length} registros
          </span>
        </div>

        {/* Visitas Timeline Cards */}
        <div className="divide-y divide-slate-100">
          {filteredVisits.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-sm">
              Nenhuma visita encontrada para os critérios de busca.
            </div>
          ) : (
            filteredVisits.map(v => {
              const familyName = families.find(f => f.id === v.idFamilia)?.nome || 'Família Autônoma';
              return (
                <div 
                  key={v.id} 
                  className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-4 justify-between items-start"
                  id={`visit-card-${v.id}`}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-bold text-slate-400 font-mono">#{v.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-150">
                        {v.data}
                      </span>
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        {familyName}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-800 text-sm">{v.objetivo}</h3>
                      <p className="text-xs text-slate-600 bg-slate-100/50 p-3 rounded-lg border border-slate-200/50 leading-relaxed italic">
                        "{v.observacoes || 'Nenhum comentário adicional.'}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                      <span>• Visitante: <strong>{v.visitante}</strong></span>
                      <span>• Recebido por: <strong>{v.recebedor}</strong></span>
                      <span>• Participantes no lar: <strong>{v.participantes}</strong></span>
                    </div>
                  </div>

                  {/* Highlights and photo mockup */}
                  <div className="flex md:flex-col items-end gap-2 self-stretch md:self-auto shrink-0 justify-between md:justify-start">
                    {v.johreiMinistrado && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-bold border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                        <Activity size={12} className="animate-pulse" />
                        Johrei Ministrado
                      </span>
                    )}

                    {/* Photo Mockup attachment */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200/60 font-mono">
                      <ImageIcon size={12} />
                      <span>FOTO_ANEXA.JPG</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal: Register visit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Registrar Nova Visita</h3>
                <p className="text-slate-500 text-xs">Insira os detalhes do acompanhamento espiritual efetuado.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Data da Visita</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Visitante Responsável (AF/AM) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: YOKO, ALBERTO"
                    value={formData.visitante}
                    onChange={(e) => setFormData(prev => ({ ...prev, visitante: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Família Assistida (Lar)</label>
                <select
                  value={formData.idFamilia}
                  onChange={(e) => setFormData(prev => ({ ...prev, idFamilia: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none bg-white"
                >
                  {families.map(f => (
                    <option key={f.id} value={f.id}>{f.nome} ({f.id})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Quem recebeu a visita (Nome do Familiar) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: YOKO ONISHI"
                  value={formData.recebedor}
                  onChange={(e) => setFormData(prev => ({ ...prev, recebedor: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Objetivo da Visita</label>
                <input
                  type="text"
                  placeholder="Ex: Acompanhamento de purificação, horta caseira"
                  value={formData.objetivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, objetivo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Pessoas presentes</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.participantes}
                    onChange={(e) => setFormData(prev => ({ ...prev, participantes: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.johreiMinistrado}
                      onChange={(e) => setFormData(prev => ({ ...prev, johreiMinistrado: e.target.checked }))}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-600 font-semibold">Ministrou Johrei</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Observações Espirituais / Práticas</label>
                <textarea
                  rows={3}
                  placeholder="Anote detalhes sobre horta caseira, flores de luz estabelecidas ou estado de ânimo..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="w-full p-2.5 border border-slate-250 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-5 -mb-5 p-4 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                >
                  Salvar Visita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
