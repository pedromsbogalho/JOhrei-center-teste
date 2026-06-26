import { useState, useMemo } from 'react';
import { 
  Route, 
  Search, 
  User, 
  CheckCircle, 
  BookOpen, 
  Award, 
  Calendar, 
  Clock, 
  Sliders,
  ChevronRight,
  Info,
  Check
} from 'lucide-react';
import { Person, AccessRole } from '../types';

interface JornadaProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  userRole: AccessRole;
  selectedPersonFromMain?: Person | null;
  setSelectedPersonFromMain?: (person: Person | null) => void;
}

const STEPS = [
  { key: 'primeiroAtendimento', label: 'Primeiro Atendimento', desc: 'Acolhimento na unidade e preenchimento de ficha de primeiro contato.' },
  { key: 'recebeuJohrei', label: 'Recebe Johrei', desc: 'Experimentou e recebe a Luz Divina regularmente.' },
  { key: 'cursoIniciacao', label: 'Curso de Iniciação', desc: 'Estudou os princípios básicos messiânicos fundamentais.' },
  { key: 'ingressou', label: 'Ingressa', desc: 'Tornou-se frequentador regular com compromisso de horta e visitas.' },
  { key: 'recebeuOhikari', label: 'Recebe Ohikari', desc: 'Recebeu a medalha de luz divina e se outorgou membro.' },
  { key: 'cursoPosOutorga', label: 'Curso Pós-Outorga', desc: 'Acompanhamento das 5 aulas práticas fundamentais.' },
  { key: 'concluiuPosOutorga', label: 'Concluiu Pós-Outorga', desc: 'Conclusão das 5 aulas pós outorga para consolidar a fé.' },
  { key: 'membroAtivo', label: 'Membro Ativo', desc: 'Missionário integrado atuando ativamente na salvação.' }
];

export default function Jornada({ 
  people, 
  setPeople, 
  userRole,
  selectedPersonFromMain,
  setSelectedPersonFromMain
}: JornadaProps) {
  
  const [selectedPersonId, setSelectedPersonId] = useState<string>(selectedPersonFromMain?.codigoCadastro || people[0]?.codigoCadastro || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle syncing from main screen click
  useMemo(() => {
    if (selectedPersonFromMain) {
      setSelectedPersonId(selectedPersonFromMain.codigoCadastro);
    }
  }, [selectedPersonFromMain]);

  // Filter list of people for the selector panel
  const filteredPeopleList = useMemo(() => {
    return people.filter(p => {
      if (userRole === 'AM' && p.setor !== 'CENTRO-NORTE') return false;
      if (searchQuery.trim() !== '') {
        return p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || p.codigoCadastro.includes(searchQuery);
      }
      return true;
    });
  }, [people, searchQuery, userRole]);

  // Currently selected person object
  const person = useMemo(() => {
    return people.find(p => p.codigoCadastro === selectedPersonId) || filteredPeopleList[0] || null;
  }, [people, selectedPersonId, filteredPeopleList]);

  // Update a person's journey/course detail
  const updatePersonJornada = (updatedPerson: Person) => {
    setPeople(people.map(p => p.codigoCadastro === updatedPerson.codigoCadastro ? updatedPerson : p));
  };

  // Helper: toggle a step in the journey
  const toggleStep = (stepKey: string) => {
    if (!person) return;
    
    const updated = { ...person };
    
    if (stepKey === 'primeiroAtendimento') {
      updated.jornada.primeiroAtendimento = !updated.jornada.primeiroAtendimento;
      updated.jornada.primeiroAtendimentoData = updated.jornada.primeiroAtendimento ? new Date().toISOString().split('T')[0] : undefined;
    } else if (stepKey === 'recebeuJohrei') {
      updated.jornada.recebeuJohrei = !updated.jornada.recebeuJohrei;
    } else if (stepKey === 'cursoIniciacao') {
      updated.jornada.cursoIniciacao.concluido = !updated.jornada.cursoIniciacao.concluido;
      updated.jornada.cursoIniciacao.presenca = updated.jornada.cursoIniciacao.concluido;
      if (updated.jornada.cursoIniciacao.concluido && !updated.jornada.cursoIniciacao.data) {
        updated.jornada.cursoIniciacao.data = new Date().toISOString().split('T')[0];
        updated.jornada.cursoIniciacao.instrutor = 'Instrutor do Centro';
      }
    } else if (stepKey === 'ingressou') {
      updated.jornada.ingressou = !updated.jornada.ingressou;
    } else if (stepKey === 'recebeuOhikari') {
      updated.jornada.recebeuOhikari = !updated.jornada.recebeuOhikari;
      if (updated.jornada.recebeuOhikari) {
        updated.subtipoCadastro = 'MEMBRO';
        updated.tipoCadastro = 'Ohikari';
        updated.dataOutorga = updated.dataOutorga || new Date().toISOString().split('T')[0];
        updated.anoOutorga = updated.anoOutorga || parseInt(updated.dataOutorga.split('-')[0]);
      } else {
        updated.subtipoCadastro = 'FREQUENTADOR';
        updated.tipoCadastro = 'Frequentador';
      }
    } else if (stepKey === 'cursoPosOutorga') {
      // Toggle all classes to true or false
      const allDone = updated.jornada.cursoPosOutorga.aulas.every(a => a);
      updated.jornada.cursoPosOutorga.aulas = allDone ? [false, false, false, false, false] : [true, true, true, true, true];
    } else if (stepKey === 'concluiuPosOutorga') {
      const allDone = updated.jornada.cursoPosOutorga.aulas.every(a => a);
      if (!allDone) {
        updated.jornada.cursoPosOutorga.aulas = [true, true, true, true, true];
      } else {
        updated.jornada.cursoPosOutorga.aulas = [false, false, false, false, false];
      }
    } else if (stepKey === 'membroAtivo') {
      updated.jornada.membroAtivo = !updated.jornada.membroAtivo;
    }

    updatePersonJornada(updated);
  };

  // Helper: toggle a single class in the Post-Outorga list (1 to 5)
  const toggleClass = (index: number) => {
    if (!person) return;
    const updated = { ...person };
    const newAulas = [...updated.jornada.cursoPosOutorga.aulas];
    newAulas[index] = !newAulas[index];
    updated.jornada.cursoPosOutorga.aulas = newAulas;
    
    // Automatically flag "membroAtivo" or "conclusao" if all true
    const allDone = newAulas.every(a => a);
    if (allDone) {
      updated.jornada.membroAtivo = true;
    }
    
    updatePersonJornada(updated);
  };

  // Handle Iniciacao Course Details Save
  const handleSaveIniciacao = (data: string, instrutor: string, presenca: boolean, concluido: boolean) => {
    if (!person) return;
    const updated = { ...person };
    updated.jornada.cursoIniciacao = {
      data,
      instrutor,
      presenca,
      concluido
    };
    // If completed initiation, check course step
    if (concluido) {
      updated.jornada.recebeuJohrei = true;
    }
    updatePersonJornada(updated);
  };

  // Calculate metrics for chosen person
  const posProgress = useMemo(() => {
    if (!person) return 0;
    const doneCount = person.jornada.cursoPosOutorga.aulas.filter(Boolean).length;
    return doneCount * 20; // 5 classes = 20% each
  }, [person]);

  const posStatus = useMemo(() => {
    if (!person) return 'Não iniciou';
    const doneCount = person.jornada.cursoPosOutorga.aulas.filter(Boolean).length;
    if (doneCount === 5) return 'Concluído';
    if (doneCount > 0) return 'Em andamento';
    return 'Não iniciou';
  }, [person]);

  return (
    <div className="space-y-6" id="jornada-container">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="jornada-title">
            Jornada do Frequentador & Cursos
          </h1>
          <p className="text-slate-500 text-sm">
            Mapeie a trilha de aprendizado espiritual, controle presenças de iniciação e as 5 aulas pós-outorga.
          </p>
        </div>
        {selectedPersonFromMain && (
          <button
            onClick={() => setSelectedPersonFromMain?.(null)}
            className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            id="btn-back-to-all"
          >
            Limpar Filtro de Pessoa
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side Selector list */}
        <div className="bg-white rounded-xl border border-slate-250 shadow-sm p-4 flex flex-col h-[600px]">
          <span className="text-xs font-bold uppercase text-slate-400 mb-3 block">Selecionar Pessoa</span>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="jornada-search-input"
            />
          </div>

          <div className="overflow-y-auto flex-1 space-y-1.5 pr-1">
            {filteredPeopleList.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">Nenhuma pessoa encontrada.</div>
            ) : (
              filteredPeopleList.map(p => {
                const isActive = p.codigoCadastro === person?.codigoCadastro;
                return (
                  <button
                    key={p.codigoCadastro}
                    onClick={() => {
                      setSelectedPersonId(p.codigoCadastro);
                      setSelectedPersonFromMain?.(null); // clean main selection state to reflect local
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isActive 
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                    id={`btn-select-person-${p.codigoCadastro}`}
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="font-semibold text-slate-800 text-xs truncate uppercase">{p.nome}</div>
                      <div className="text-[10px] text-slate-450 font-medium flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${p.subtipoCadastro === 'MEMBRO' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                        <span>{p.subtipoCadastro} • Bairro: {p.bairro}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={isActive ? 'text-emerald-600' : 'text-slate-400'} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Detailed Journey and Course Panel (Col-span 2) */}
        {person ? (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Person General Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 rounded-xl text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <User size={18} />
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                    {person.codigoCadastro}
                  </span>
                </div>
                <h2 className="text-xl font-bold tracking-tight uppercase">{person.nome}</h2>
                <p className="text-emerald-100 text-xs">
                  Afiliação: AM {person.am || 'Sem Setor'} • AF {person.af || 'Sem AF'} • Bairro: {person.bairro}
                </p>
              </div>
              <div className="bg-white/10 px-4 py-2.5 rounded-lg border border-white/15 text-right shrink-0">
                <span className="text-[10px] text-emerald-100 block font-semibold uppercase tracking-wider">Status Atual</span>
                <span className="font-bold text-sm block">{person.tipoCadastro} ({person.statusAtual})</span>
              </div>
            </div>

            {/* Módulo 3 — Timeline of spiritual path */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Route size={16} className="text-emerald-600" />
                  Módulo 3: Timeline da Jornada Espiritual
                </h3>
                <span className="text-xs text-slate-400 font-medium italic">Clique nas etapas para avançar</span>
              </div>

              {/* Vertical timeline stepper */}
              <div className="relative pl-6 space-y-6 mt-4 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                {STEPS.map((step) => {
                  
                  // Compute if this step is active or checked
                  let isChecked = false;
                  if (step.key === 'primeiroAtendimento') isChecked = person.jornada.primeiroAtendimento;
                  else if (step.key === 'recebeuJohrei') isChecked = person.jornada.recebeuJohrei;
                  else if (step.key === 'cursoIniciacao') isChecked = person.jornada.cursoIniciacao.concluido;
                  else if (step.key === 'ingressou') isChecked = person.jornada.ingressou;
                  else if (step.key === 'recebeuOhikari') isChecked = person.jornada.recebeuOhikari;
                  else if (step.key === 'cursoPosOutorga') isChecked = person.jornada.cursoPosOutorga.aulas.filter(Boolean).length > 0;
                  else if (step.key === 'concluiuPosOutorga') isChecked = person.jornada.cursoPosOutorga.aulas.every(a => a);
                  else if (step.key === 'membroAtivo') isChecked = person.jornada.membroAtivo;

                  return (
                    <div 
                      key={step.key} 
                      onClick={() => toggleStep(step.key)}
                      className="relative flex gap-4 cursor-pointer group select-none items-start"
                      id={`journey-step-${step.key}`}
                    >
                      {/* Check dot overlay */}
                      <div className={`absolute -left-[21px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' 
                          : 'bg-white border-slate-300 text-transparent group-hover:border-slate-400'
                      }`}>
                        <Check size={12} strokeWidth={3} className={isChecked ? 'block' : 'hidden'} />
                      </div>

                      {/* Step Text details */}
                      <div className="space-y-0.5">
                        <span className={`text-sm font-semibold transition-colors ${
                          isChecked ? 'text-slate-950 font-bold' : 'text-slate-500'
                        }`}>
                          {step.label}
                        </span>
                        <p className="text-slate-450 text-xs leading-relaxed max-w-xl">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Grid for Course Trackings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Módulo 5 — Curso Iniciação Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <BookOpen size={14} className="text-indigo-500" />
                  Módulo 5: Curso de Iniciação
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="font-medium text-slate-600">Status de Conclusão:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      person.jornada.cursoIniciacao.concluido 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {person.jornada.cursoIniciacao.concluido ? 'CONCLUÍDO' : 'PENDENTE'}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Instrutor Responsável</label>
                      <input
                        type="text"
                        defaultValue={person.jornada.cursoIniciacao.instrutor || 'Não definido'}
                        onBlur={(e) => handleSaveIniciacao(
                          person.jornada.cursoIniciacao.data || '', 
                          e.target.value, 
                          person.jornada.cursoIniciacao.presenca, 
                          person.jornada.cursoIniciacao.concluido
                        )}
                        placeholder="Ex: Prof. Dani"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        id="iniciacao-instructor-input"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Data de Realização</label>
                      <input
                        type="date"
                        defaultValue={person.jornada.cursoIniciacao.data || ''}
                        onBlur={(e) => handleSaveIniciacao(
                          e.target.value, 
                          person.jornada.cursoIniciacao.instrutor || '', 
                          person.jornada.cursoIniciacao.presenca, 
                          person.jornada.cursoIniciacao.concluido
                        )}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        id="iniciacao-date-input"
                      />
                    </div>

                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={person.jornada.cursoIniciacao.presenca}
                          onChange={(e) => handleSaveIniciacao(
                            person.jornada.cursoIniciacao.data || '', 
                            person.jornada.cursoIniciacao.instrutor || '', 
                            e.target.checked, 
                            person.jornada.cursoIniciacao.concluido
                          )}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          id="cb-iniciacao-presenca"
                        />
                        <span className="text-slate-600 font-semibold">Presença confirmada</span>
                      </label>
                      
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={person.jornada.cursoIniciacao.concluido}
                          onChange={(e) => handleSaveIniciacao(
                            person.jornada.cursoIniciacao.data || '', 
                            person.jornada.cursoIniciacao.instrutor || '', 
                            person.jornada.cursoIniciacao.presenca, 
                            e.target.checked
                          )}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          id="cb-iniciacao-concluido"
                        />
                        <span className="text-slate-600 font-semibold">Concluído</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Módulo 4 — Curso Pós-Outorga Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award size={14} className="text-teal-600" />
                    Módulo 4: Curso Pós-Outorga
                  </h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    posStatus === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : posStatus === 'Em andamento' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {posStatus.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500">
                      <span>Progresso geral</span>
                      <span>{posProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-600 h-full transition-all duration-300"
                        style={{ width: `${posProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* 5 Aulas checkbox tracker */}
                  <div className="space-y-2 pt-1.5">
                    {[0, 1, 2, 3, 4].map((index) => {
                      const isClassDone = person.jornada.cursoPosOutorga.aulas[index];
                      return (
                        <div 
                          key={index} 
                          onClick={() => toggleClass(index)}
                          className={`flex items-center justify-between p-2 rounded border cursor-pointer select-none transition-colors ${
                            isClassDone 
                              ? 'bg-teal-50/50 border-teal-200 text-teal-800' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                          id={`pos-class-checkbox-${index}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                              isClassDone ? 'bg-teal-600 border-teal-600 text-white' : 'bg-white border-slate-300'
                            }`}>
                              {isClassDone && <Check size={10} strokeWidth={3} />}
                            </div>
                            <span className="font-medium text-slate-700 text-xs">Aula {index + 1}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {isClassDone ? 'Concluido' : 'Pendente'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Quick guide on Pós Outorga significance */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
              <Info className="text-slate-500 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-slate-600 leading-relaxed">
                <strong>Importante:</strong> As 5 aulas do Curso Pós-Outorga são de responsabilidade do Assistente de Ministro (AM). Elas garantem que o recém outorgado de Ohikari compreenda a prática diária de Johrei, a leitura constante de ensinamentos, a montagem da flor de luz e a conservação do seu Ohikari sintonizado com o Messias Meishu-Sama.
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center p-12 text-slate-400">
            <p>Selecione uma pessoa à esquerda para visualizar e gerenciar sua jornada.</p>
          </div>
        )}
      </div>

    </div>
  );
}
