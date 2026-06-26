import { X, Check, Calendar, Activity, MessageSquare, BookOpen, User, MapPin } from 'lucide-react';
import { Person, Family, Sector } from '../types';

interface PersonDetailDrawerProps {
  person: Person | null;
  onClose: () => void;
  families: Family[];
  sectors: Sector[];
  onUpdatePerson: (updated: Person) => void;
}

export default function PersonDetailDrawer({
  person,
  onClose,
  families,
  sectors,
  onUpdatePerson
}: PersonDetailDrawerProps) {
  if (!person) return null;

  const handleCheckboxChange = (group: 'setor' | 'geral' | 'lar', checked: boolean) => {
    const updated = {
      ...person,
      gruposWhatsapp: {
        ...person.gruposWhatsapp,
        [group]: checked
      }
    };
    onUpdatePerson(updated);
  };

  const handleFieldChange = (field: string, value: any) => {
    const updated = {
      ...person,
      [field]: value
    };
    onUpdatePerson(updated);
  };

  const handleNestedFieldChange = (parentField: 'jornada', childField: string, value: any) => {
    const updated = {
      ...person,
      [parentField]: {
        ...person[parentField],
        [childField]: value
      }
    };
    onUpdatePerson(updated);
  };

  const handleClassChange = (classIndex: number, checked: boolean) => {
    const newAulas = [...person.jornada.cursoPosOutorga.aulas];
    newAulas[classIndex] = checked;
    
    const updated = {
      ...person,
      jornada: {
        ...person.jornada,
        cursoPosOutorga: {
          aulas: newAulas
        },
        // Automatically check membroAtivo if all true
        membroAtivo: newAulas.every(a => a)
      }
    };
    onUpdatePerson(updated);
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-50 select-none" id="detail-drawer">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-2">
              <User size={18} className="text-slate-400" />
              <span className="text-xs font-mono text-slate-500 font-semibold uppercase">Ficha Cadastral CRM</span>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200"
              id="btn-close-drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
            
            {/* Main Header visual */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  person.subtipoCadastro === 'MEMBRO' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {person.tipoCadastro || person.subtipoCadastro}
                </span>
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">#{person.codigoCadastro}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">{person.nome}</h2>
              <p className="text-slate-450 text-[11px] font-medium">{person.idade} anos • {person.email || 'Sem email cadastrado'}</p>
            </div>

            {/* Section 1: Contato */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">Dados de Contato</span>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Celular Principal</label>
                  <input
                    type="text"
                    value={person.celularPrincipal || ''}
                    onChange={(e) => handleFieldChange('celularPrincipal', e.target.value)}
                    placeholder="Sem telefone"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">E-mail</label>
                  <input
                    type="text"
                    value={person.email || ''}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="Sem email"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 font-semibold mb-0.5">Endereço Completo</label>
                <input
                  type="text"
                  value={person.endCompleto || ''}
                  onChange={(e) => handleFieldChange('endCompleto', e.target.value)}
                  placeholder="Sem endereço"
                  className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Section 2: Vínculo Missionário */}
            <div className="space-y-2 bg-slate-50/50 p-3 rounded-lg border border-slate-150">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block pb-1 border-b border-slate-100">Estrutura e Vínculo</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Setor (AM)</label>
                  <select
                    value={person.setor}
                    onChange={(e) => {
                      const sec = sectors.find(s => s.nome === e.target.value);
                      handleFieldChange('setor', e.target.value);
                      if (sec) handleFieldChange('am', sec.amResponsavel);
                    }}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                  >
                    <option value="">Sem Setor</option>
                    {sectors.map(s => (
                      <option key={s.id} value={s.nome}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Assistente Família (AF)</label>
                  <input
                    type="text"
                    value={person.af || ''}
                    onChange={(e) => handleFieldChange('af', e.target.value.toUpperCase())}
                    placeholder="Ex: YOKO, ALBERTO"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">Bairro Ajustado</label>
                  <input
                    type="text"
                    value={person.bairro || ''}
                    onChange={(e) => handleFieldChange('bairro', e.target.value)}
                    placeholder="Ex: Centro"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-0.5">ID Família</label>
                  <select
                    value={person.idFamilia || ''}
                    onChange={(e) => handleFieldChange('idFamilia', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs bg-white"
                  >
                    <option value="">Nenhuma Família</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id}>{f.nome} ({f.id})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: WhatsApp groups (Módulo 6) */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">Módulo 6: Grupos de WhatsApp</span>
              <div className="space-y-1.5 pt-1">
                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">Entrou no grupo do setor?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={person.gruposWhatsapp.setor}
                    onChange={(e) => handleCheckboxChange('setor', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">Entrou no grupo geral da IMMB?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={person.gruposWhatsapp.geral}
                    onChange={(e) => handleCheckboxChange('geral', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200/80 cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-700">Entrou no grupo do lar (visitas)?</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={person.gruposWhatsapp.lar}
                    onChange={(e) => handleCheckboxChange('lar', e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* Section 4: Curso Pós-Outorga (Módulo 4) */}
            {person.subtipoCadastro === 'MEMBRO' && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">Módulo 4: Aulas Pós-Outorga (Ohikari)</span>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[0, 1, 2, 3, 4].map(idx => {
                    const isDone = person.jornada.cursoPosOutorga.aulas[idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => handleClassChange(idx, !isDone)}
                        className={`py-2 px-1 text-center font-bold border rounded flex flex-col items-center justify-center gap-0.5 ${
                          isDone 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold' 
                            : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                        }`}
                        title={`Marcar Aula ${idx + 1}`}
                      >
                        <span className="text-[9px]">Aula</span>
                        <span className="text-sm font-sans">{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 5: Chronological Spiritual Timeline (Módulo 12) */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">Módulo 12: Linha do Tempo Espiritual</span>
              
              <div className="relative pl-5 space-y-3 mt-2 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-[1px] before:bg-slate-200">
                {person.jornada.primeiroAtendimentoData && (
                  <div className="relative flex gap-2">
                    <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                    <div>
                      <span className="font-semibold text-slate-800">Primeiro Contato</span>
                      <span className="text-[9px] text-slate-400 block">{person.jornada.primeiroAtendimentoData}</span>
                    </div>
                  </div>
                )}

                {person.jornada.recebeuJohrei && (
                  <div className="relative flex gap-2">
                    <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white" />
                    <div>
                      <span className="font-semibold text-slate-800">Prática do Johrei (Sede)</span>
                      <span className="text-[9px] text-slate-400 block">Ministração contínua e auxílio espiritual</span>
                    </div>
                  </div>
                )}

                {person.jornada.cursoIniciacao.concluido && (
                  <div className="relative flex gap-2">
                    <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 border border-white" />
                    <div>
                      <span className="font-semibold text-slate-800">Curso de Iniciação Messiânica</span>
                      <span className="text-[9px] text-slate-400 block">Em {person.jornada.cursoIniciacao.data || '2026'} por {person.jornada.cursoIniciacao.instrutor}</span>
                    </div>
                  </div>
                )}

                {person.jornada.recebeuOhikari && (
                  <div className="relative flex gap-2">
                    <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-white" />
                    <div>
                      <span className="font-semibold text-slate-800">Outorga do Ohikari (Membro)</span>
                      <span className="text-[9px] text-slate-400 block">Data outorga: {person.dataOutorga || 'Recente'}</span>
                    </div>
                  </div>
                )}

                {person.subtipoCadastro === 'MEMBRO' && (
                  <div className="relative flex gap-2">
                    <div className="absolute -left-[16px] top-1 w-2.5 h-2.5 rounded-full bg-teal-500 border border-white" />
                    <div>
                      <span className="font-semibold text-slate-800">Curso Pós-Outorga</span>
                      <span className="text-[9px] text-slate-400 block">
                        Completou {person.jornada.cursoPosOutorga.aulas.filter(Boolean).length} de 5 aulas práticas.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Sticky save indicators */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
            >
              Concluído & Fechar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
