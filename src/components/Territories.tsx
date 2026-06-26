import { useState, useMemo } from 'react';
import { 
  Folder, 
  MapPin, 
  Users, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Home, 
  ShieldAlert, 
  LayoutList,
  Building
} from 'lucide-react';
import { Person, Family, Sector, AccessRole } from '../types';

interface TerritoriesProps {
  people: Person[];
  families: Family[];
  sectors: Sector[];
  userRole: AccessRole;
  onSelectPerson: (person: Person) => void;
}

export default function Territories({ 
  people, 
  families, 
  sectors,
  userRole,
  onSelectPerson
}: TerritoriesProps) {
  
  // State for expanded nodes in the tree
  // Storing expanded node keys as strings (e.g., 'sector-SEC-1', 'bairro-Centro', 'family-FAM-444')
  const [expandedNodes, setExpandedNodes] = useState<{ [key: string]: boolean }>({
    'root': true,
    'sector-SEC-1': true,
    'bairro-Centro': true
  });

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Filter sectors and data based on RBAC
  const visibleSectors = useMemo(() => {
    if (userRole === 'AM') {
      return sectors.filter(s => s.nome === 'CENTRO-NORTE');
    }
    return sectors;
  }, [sectors, userRole]);

  // Build a map of bairros -> families -> people
  const structureData = useMemo(() => {
    return visibleSectors.map(sec => {
      // Find bairros
      const bairrosList = sec.bairros.map(bairroName => {
        
        // Find people in this sector & barrio
        const peopleInBairro = people.filter(p => p.setor === sec.nome && p.bairro === bairroName);
        
        // Find families that have members in this barrio
        const familyIds = Array.from(new Set(peopleInBairro.map(p => p.idFamilia).filter(Boolean)));
        
        const familiesInBairro = familyIds.map(fId => {
          const family = families.find(f => f.id === fId);
          const familyPeople = peopleInBairro.filter(p => p.idFamilia === fId);
          
          return {
            id: fId,
            nome: family?.nome || `Família ${fId}`,
            af: family?.assistenteResponsavel || 'Não definido',
            people: familyPeople,
            endereco: family?.endereco || ''
          };
        });

        // People in this barrio who are NOT assigned to any family
        const independentPeople = peopleInBairro.filter(p => !p.idFamilia);

        return {
          nome: bairroName,
          families: familiesInBairro,
          independentPeople
        };
      });

      return {
        ...sec,
        bairros: bairrosList
      };
    });
  }, [visibleSectors, people, families]);

  return (
    <div className="space-y-6" id="territories-root">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="territories-title">
          Organização Territorial
        </h1>
        <p className="text-slate-500 text-sm">
          Visualização hierárquica em árvore: Setores ➔ Bairros ➔ Famílias ➔ Pessoas.
        </p>
      </div>

      {/* Main Grid: Tree View + Summary sidecards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hierarchical Tree (Col-span 2) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Árvore Litúrgica-Mocional</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded font-medium">
              Filtro ativo: {userRole === 'ADMIN' ? 'Unidade Completa' : 'Apenas Setor Centro-Norte'}
            </span>
          </div>

          {/* Root Level: Johrei Center */}
          <div className="select-none font-sans text-sm">
            <div 
              onClick={() => toggleNode('root')}
              className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer text-slate-800 font-semibold transition-all"
              id="tree-root-node"
            >
              {expandedNodes['root'] ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
              <Building size={18} className="text-emerald-600 shrink-0" />
              <span>Sede de Caraguatatuba</span>
              <span className="text-xs text-slate-400 font-normal">({people.length} Pessoas registradas)</span>
            </div>

            {/* Sectors Level */}
            {expandedNodes['root'] && (
              <div className="pl-6 border-l border-slate-200 ml-4 mt-1 space-y-2">
                {structureData.map(sec => {
                  const secNodeId = `sector-${sec.id}`;
                  const isSecExpanded = expandedNodes[secNodeId];
                  const totalSecPeople = people.filter(p => p.setor === sec.nome).length;

                  return (
                    <div key={sec.id} className="space-y-1">
                      {/* Sector Line Item */}
                      <div 
                        onClick={() => toggleNode(secNodeId)}
                        className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-md cursor-pointer text-slate-700 font-medium transition-colors"
                        id={`tree-node-${sec.id}`}
                      >
                        {isSecExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                        <Folder size={16} className="text-indigo-500 shrink-0" />
                        <span className="font-semibold text-slate-850">{sec.nome}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          (AM: {sec.amResponsavel} • {totalSecPeople} Pessoas)
                        </span>
                      </div>

                      {/* Bairros Level */}
                      {isSecExpanded && (
                        <div className="pl-6 border-l border-slate-200 ml-3.5 space-y-1 mt-1">
                          {sec.bairros.map(bairro => {
                            const bairroNodeId = `bairro-${bairro.nome}`;
                            const isBairroExpanded = expandedNodes[bairroNodeId];
                            const totalBairroPeople = bairro.families.reduce((acc, curr) => acc + curr.people.length, 0) + bairro.independentPeople.length;

                            return (
                              <div key={bairro.nome} className="space-y-1">
                                {/* Bairro Line Item */}
                                <div
                                  onClick={() => toggleNode(bairroNodeId)}
                                  className="flex items-center gap-2 p-1 hover:bg-slate-50/80 rounded cursor-pointer text-slate-650 font-medium"
                                  id={`tree-node-bairro-${bairro.nome}`}
                                >
                                  {isBairroExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                                  <MapPin size={14} className="text-sky-500 shrink-0" />
                                  <span className="text-slate-800 font-medium">{bairro.nome}</span>
                                  <span className="text-xs text-slate-400 font-normal">
                                    ({totalBairroPeople} Pessoas)
                                  </span>
                                </div>

                                {/* Families and independent people level */}
                                {isBairroExpanded && (
                                  <div className="pl-6 border-l border-slate-200 ml-2.5 space-y-1 mt-1">
                                    
                                    {/* Families */}
                                    {bairro.families.map(fam => {
                                      const famNodeId = `family-${fam.id}`;
                                      const isFamExpanded = expandedNodes[famNodeId];

                                      return (
                                        <div key={fam.id} className="space-y-0.5">
                                          {/* Family Line Item */}
                                          <div
                                            onClick={() => toggleNode(famNodeId)}
                                            className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded text-slate-600 font-medium cursor-pointer"
                                            id={`tree-node-family-${fam.id}`}
                                          >
                                            {isFamExpanded ? <ChevronDown size={12} className="text-slate-450" /> : <ChevronRight size={12} className="text-slate-450" />}
                                            <Home size={14} className="text-teal-600 shrink-0" />
                                            <span className="text-slate-700 font-semibold">{fam.nome}</span>
                                            <span className="text-xs text-slate-400">
                                              (AF: {fam.af} • {fam.people.length} Pessoas)
                                            </span>
                                          </div>

                                          {/* Family Members / Frequenters list */}
                                          {isFamExpanded && (
                                            <div className="pl-6 border-l border-slate-150 ml-2.5 space-y-0.5 mt-0.5">
                                              {fam.people.map(person => (
                                                <div
                                                  key={person.codigoCadastro}
                                                  onClick={() => onSelectPerson(person)}
                                                  className="flex items-center justify-between p-1 hover:bg-slate-100 rounded text-xs text-slate-600 cursor-pointer"
                                                  title="Clique para abrir jornada"
                                                  id={`tree-node-person-${person.codigoCadastro}`}
                                                >
                                                  <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                                    <User size={12} className={person.subtipoCadastro === 'MEMBRO' ? 'text-teal-600' : 'text-amber-500'} />
                                                    <span>{person.nome}</span>
                                                    <span className={`text-[10px] px-1 rounded-sm ${
                                                      person.subtipoCadastro === 'MEMBRO' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                                                    }`}>
                                                      {person.subtipoCadastro}
                                                    </span>
                                                  </div>
                                                  <span className="text-[10px] font-mono text-slate-400">{person.codigoCadastro}</span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}

                                    {/* Independent People (no family) */}
                                    {bairro.independentPeople.map(person => (
                                      <div
                                        key={person.codigoCadastro}
                                        onClick={() => onSelectPerson(person)}
                                        className="flex items-center justify-between p-1 hover:bg-slate-100 rounded text-xs text-slate-600 cursor-pointer ml-5"
                                        title="Clique para abrir jornada"
                                      >
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                          <User size={12} className="text-rose-400" />
                                          <span>{person.nome}</span>
                                          <span className="text-[9px] bg-rose-50 text-rose-600 px-1 rounded">Sem Família</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{person.codigoCadastro}</span>
                                      </div>
                                    ))}

                                    {bairro.families.length === 0 && bairro.independentPeople.length === 0 && (
                                      <div className="p-1 text-slate-400 text-xs italic ml-5">Nenhum membro cadastrado neste bairro</div>
                                    )}

                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legend and Overview card (Col-span 1) */}
        <div className="space-y-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Entenda a Hierarquia</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              A Igreja Messiânica Mundial segue o princípio divino da <strong>Lei da Ordem</strong>, comparando a estrutura missionária a uma árvore:
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0 mt-0.5 font-mono text-[10px] font-bold">1</div>
                <div>
                  <span className="font-semibold text-slate-800 block">Responsável da Unidade (Sede)</span>
                  <p className="text-slate-500">Qual sacerdote que dá vida espiritual à unidade, descobrindo as virtudes das pessoas.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 font-mono text-[10px] font-bold">2</div>
                <div>
                  <span className="font-semibold text-slate-800 block">Assistente de Ministro (AM)</span>
                  <p className="text-slate-500">Responsável por coordenar as equipes dos setores externos e expandir bairros geográficos.</p>
                </div>
              </div>

              <div className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center text-white shrink-0 mt-0.5 font-mono text-[10px] font-bold">3</div>
                <div>
                  <span className="font-semibold text-slate-800 block">Assistente de Família (AF)</span>
                  <p className="text-slate-500">Zela pelas hortas caseiras, beleza estética, flores de luz e ministra Johrei diretamente nos lares.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats of Sectors */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <LayoutList size={16} className="text-slate-400" />
              Resumo Operacional
            </h3>
            
            <div className="space-y-2 text-xs">
              {sectors.map(sec => {
                const totalM = people.filter(p => p.setor === sec.nome && p.subtipoCadastro === 'MEMBRO').length;
                const totalF = people.filter(p => p.setor === sec.nome && p.subtipoCadastro === 'FREQUENTADOR').length;
                return (
                  <div key={sec.id} className="flex justify-between items-center p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-850 block">{sec.nome}</span>
                      <span className="text-[10px] text-slate-400">AM: {sec.amResponsavel}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-800">{totalM + totalF} total</span>
                      <div className="text-[9px] text-slate-400">{totalM} memb. / {totalF} freq.</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
