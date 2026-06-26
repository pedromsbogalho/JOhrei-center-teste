import { useState, useMemo, useRef, ChangeEvent, FormEvent } from 'react';
import { 
  Search, 
  UserPlus, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  X, 
  Check, 
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Filter,
  CheckCircle,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Person, Family, Sector, AccessRole } from '../types';

interface PeopleListProps {
  people: Person[];
  setPeople: (people: Person[]) => void;
  families: Family[];
  sectors: Sector[];
  userRole: AccessRole;
  onSelectPerson: (person: Person) => void;
}

export default function PeopleList({ 
  people, 
  setPeople, 
  families, 
  sectors,
  userRole,
  onSelectPerson
}: PeopleListProps) {
  
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, MEMBRO, FREQUENTADOR
  const [filterSector, setFilterSector] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  
  // Paste CSV raw content state
  const [pastedCSV, setPastedCSV] = useState('');
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // New Person Form State
  const [formData, setFormData] = useState({
    codigoCadastro: '',
    nome: '',
    tipoCadastro: 'Ohikari',
    subtipoCadastro: 'MEMBRO',
    statusAtual: 'ATIVO',
    nascimento: '',
    idade: '',
    celularPrincipal: '',
    telefoneContato: '',
    email: '',
    endCompleto: '',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: '',
    bairro: '',
    dataOutorga: '',
    idFamilia: '',
    gpSetor: false,
    gpGeral: false,
    gpLar: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter based on Search and Role and dropdown Filters
  const filteredPeople = useMemo(() => {
    return people.filter(p => {
      // 1. Role filter (AM can only see CENTRO-NORTE)
      if (userRole === 'AM' && p.setor !== 'CENTRO-NORTE') {
        return false;
      }

      // 2. Tab Filter
      if (filterType === 'MEMBRO' && p.subtipoCadastro !== 'MEMBRO') return false;
      if (filterType === 'FREQUENTADOR' && p.subtipoCadastro !== 'FREQUENTADOR') return false;

      // 3. Sector Dropdown Filter
      if (filterSector !== 'ALL' && p.setor !== filterSector) return false;

      // 4. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = p.nome.toLowerCase().includes(query);
        const matchesBairro = p.bairro.toLowerCase().includes(query);
        const matchesPhone = p.celularPrincipal.includes(query) || p.telefoneContato.includes(query);
        const matchesAF = p.af.toLowerCase().includes(query);
        const matchesAM = p.am.toLowerCase().includes(query);
        const matchesCode = p.codigoCadastro.includes(query);
        return matchesName || matchesBairro || matchesPhone || matchesAF || matchesAM || matchesCode;
      }

      return true;
    });
  }, [people, userRole, filterType, filterSector, searchQuery]);

  // Unique Sectors for filter dropdown (except when AM)
  const availableSectors = useMemo(() => {
    return sectors.map(s => s.nome);
  }, [sectors]);

  // Handle Form Change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form Submit (Manual Create)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.codigoCadastro) {
      alert('Nome e Código de Cadastro são obrigatórios.');
      return;
    }

    const calculatedIdade = formData.nascimento 
      ? new Date().getFullYear() - new Date(formData.nascimento).getFullYear()
      : parseInt(formData.idade) || 0;

    const newPerson: Person = {
      codigoCadastro: formData.codigoCadastro,
      nome: formData.nome.toUpperCase(),
      tipoCadastro: formData.tipoCadastro,
      subtipoCadastro: formData.subtipoCadastro as 'MEMBRO' | 'FREQUENTADOR',
      statusAtual: formData.statusAtual as 'ATIVO' | 'AFASTADO' | 'PENDENTE',
      nascimento: formData.nascimento || '1990-01-01',
      idade: calculatedIdade,
      celularPrincipal: formData.celularPrincipal,
      telefoneContato: formData.telefoneContato || formData.celularPrincipal,
      email: formData.email,
      ultimoAcessoApp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      endCompleto: formData.endCompleto,
      am: formData.am,
      setor: formData.setor,
      af: formData.af || 'NENHUM',
      bairro: formData.bairro || 'Centro',
      dataOutorga: formData.subtipoCadastro === 'MEMBRO' ? (formData.dataOutorga || new Date().toISOString().split('T')[0]) : undefined,
      anoOutorga: formData.subtipoCadastro === 'MEMBRO' ? parseInt(formData.dataOutorga?.split('-')[0] || '2026') : undefined,
      tempoMembro: formData.subtipoCadastro === 'MEMBRO' ? 'Recém outorgado' : undefined,
      idFamilia: formData.idFamilia || `FAM-${Math.floor(100 + Math.random() * 900)}`,
      jornada: {
        primeiroAtendimento: true,
        primeiroAtendimentoData: new Date().toISOString().split('T')[0],
        recebeuJohrei: true,
        cursoIniciacao: {
          presenca: formData.subtipoCadastro === 'MEMBRO',
          concluido: formData.subtipoCadastro === 'MEMBRO'
        },
        ingressou: formData.subtipoCadastro === 'MEMBRO',
        recebeuOhikari: formData.subtipoCadastro === 'MEMBRO',
        cursoPosOutorga: {
          aulas: formData.subtipoCadastro === 'MEMBRO' ? [false, false, false, false, false] : [false, false, false, false, false]
        },
        membroAtivo: formData.subtipoCadastro === 'MEMBRO'
      },
      gruposWhatsapp: {
        setor: formData.gpSetor,
        geral: formData.gpGeral,
        lar: formData.gpLar
      }
    };

    setPeople([newPerson, ...people]);
    setIsModalOpen(false);
    
    // Reset Form
    setFormData({
      codigoCadastro: '',
      nome: '',
      tipoCadastro: 'Ohikari',
      subtipoCadastro: 'MEMBRO',
      statusAtual: 'ATIVO',
      nascimento: '',
      idade: '',
      celularPrincipal: '',
      telefoneContato: '',
      email: '',
      endCompleto: '',
      am: 'PROF DANI',
      setor: 'CENTRO-NORTE',
      af: '',
      bairro: '',
      dataOutorga: '',
      idFamilia: '',
      gpSetor: false,
      gpGeral: false,
      gpLar: false
    });
  };

  // Delete Person
  const handleDelete = (codigoCadastro: string) => {
    if (confirm('Tem certeza que deseja excluir esta pessoa do cadastro?')) {
      setPeople(people.filter(p => p.codigoCadastro !== codigoCadastro));
    }
  };

  // CSV text parsing logic
  const parseAndAddCSV = (csvText: string) => {
    try {
      if (!csvText || csvText.trim() === '') {
        throw new Error('Conteúdo do arquivo ou texto colado está vazio.');
      }

      // Detect separator
      const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) {
        throw new Error('O CSV deve conter pelo menos uma linha de cabeçalho e uma linha de dados.');
      }

      const headerLine = lines[0];
      let sep = ',';
      if (headerLine.includes(';')) sep = ';';
      else if (headerLine.includes('\t')) sep = '\t';

      // Split header
      const headers = headerLine.split(sep).map(h => h.trim().replace(/^"|"$/g, ''));

      // Helper function to find column index (handling capitalization/accents)
      const findHeaderIndex = (variations: string[]) => {
        return headers.findIndex(h => {
          const cleanH = h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          return variations.some(v => {
            const cleanV = v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return cleanH === cleanV || cleanH.includes(cleanV);
          });
        });
      };

      // Find indices of important columns
      const idxCodigo = findHeaderIndex(['codigo', 'cadastro', 'id']);
      const idxNome = findHeaderIndex(['nome', 'name']);
      const idxTipo = findHeaderIndex(['tipo cadastro', 'tipo']);
      const idxSubtipo = findHeaderIndex(['subtipo cadastro', 'subtipo']);
      const idxStatus = findHeaderIndex(['status atual', 'status']);
      const idxIdade = findHeaderIndex(['idade', 'age']);
      const idxCelular = findHeaderIndex(['celular', 'sms', 'principal']);
      const idxTelefone = findHeaderIndex(['telefone contato', 'fone', 'tel']);
      const idxEmail = findHeaderIndex(['email', 'e-mail']);
      const idxEnd = findHeaderIndex(['end completo', 'endereco']);
      const idxAM = findHeaderIndex(['am', 'ministro']);
      const idxSetor = findHeaderIndex(['setor2', 'setor']);
      const idxAF = findHeaderIndex(['af2', 'af']);
      const idxBairro = findHeaderIndex(['bairro', 'bairro ajustado']);
      const idxDataOutorga = findHeaderIndex(['data outorga', 'outorga']);
      const idxIdFamilia = findHeaderIndex(['id familia', 'familia']);

      if (idxNome === -1) {
        throw new Error('Coluna de "Nome" não foi identificada no cabeçalho. Certifique-se de que a planilha possui as colunas obrigatórias.');
      }

      const importedPeople: Person[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Match columns respecting quotes
        let cols: string[] = [];
        let insideQuote = false;
        let entry = '';
        for (let char of line) {
          if (char === '"') {
            insideQuote = !insideQuote;
          } else if (char === sep && !insideQuote) {
            cols.push(entry.trim());
            entry = '';
          } else {
            entry += char;
          }
        }
        cols.push(entry.trim());

        if (cols.length < 2) continue; // skip blank-looking rows

        // Retrieve values securely
        const getVal = (index: number, fallback: string = '') => {
          if (index !== -1 && index < cols.length) {
            return cols[index].replace(/^"|"$/g, '').trim() || fallback;
          }
          return fallback;
        };

        const nome = getVal(idxNome).toUpperCase();
        if (!nome) continue; // skip row if name empty

        const rawCodigo = getVal(idxCodigo, String(Math.floor(1000000 + Math.random() * 9000000)));
        const tipoCadastro = getVal(idxTipo, 'Ohikari');
        const subtipo = getVal(idxSubtipo, 'MEMBRO').toUpperCase();
        const subtipoCadastro = (subtipo.includes('MEMBRO') || subtipo === 'OHIKARI') ? 'MEMBRO' : 'FREQUENTADOR';
        const statusAtual = getVal(idxStatus, 'ATIVO').toUpperCase() as 'ATIVO' | 'AFASTADO' | 'PENDENTE';
        const idade = parseInt(getVal(idxIdade, '40')) || 40;
        const celularPrincipal = getVal(idxCelular, '');
        const telefoneContato = getVal(idxTelefone, celularPrincipal);
        const email = getVal(idxEmail, '');
        const endCompleto = getVal(idxEnd, '');
        const am = getVal(idxAM, 'PROF DANI').toUpperCase();
        const setor = getVal(idxSetor, 'CENTRO-NORTE').toUpperCase();
        const af = getVal(idxAF, 'YOKO').toUpperCase();
        const bairro = getVal(idxBairro, 'Centro');
        const dataOutorga = getVal(idxDataOutorga);
        const idFamilia = getVal(idxIdFamilia, `FAM-${Math.floor(100 + Math.random() * 900)}`);

        // Build simulated journey tracker
        const hasOutorga = subtipoCadastro === 'MEMBRO';
        const isCompletedPos = hasOutorga && Math.random() > 0.3; // 70% chance of being complete for older members

        const newPerson: Person = {
          codigoCadastro: rawCodigo,
          nome,
          tipoCadastro,
          subtipoCadastro,
          statusAtual,
          nascimento: '1980-01-01', // default fallback
          idade,
          celularPrincipal,
          telefoneContato,
          email,
          ultimoAcessoApp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          endCompleto,
          am,
          setor,
          af,
          bairro,
          dataOutorga: dataOutorga || undefined,
          anoOutorga: dataOutorga ? parseInt(dataOutorga.split('-')[0]) : undefined,
          tempoMembro: hasOutorga ? 'Tempo importado' : undefined,
          idFamilia,
          jornada: {
            primeiroAtendimento: true,
            primeiroAtendimentoData: '2025-01-01',
            recebeuJohrei: true,
            cursoIniciacao: {
              presenca: true,
              concluido: true
            },
            ingressou: hasOutorga,
            recebeuOhikari: hasOutorga,
            cursoPosOutorga: {
              aulas: isCompletedPos ? [true, true, true, true, true] : [true, true, false, false, false]
            },
            membroAtivo: isCompletedPos
          },
          gruposWhatsapp: {
            setor: Math.random() > 0.2, // 80% entered
            geral: Math.random() > 0.3,
            lar: Math.random() > 0.25
          }
        };

        importedPeople.push(newPerson);
      }

      if (importedPeople.length === 0) {
        throw new Error('Nenhuma pessoa válida pôde ser importada da planilha.');
      }

      // Add to state, preventing duplicates by code
      const existingCodes = new Set(people.map(p => p.codigoCadastro));
      const filteredImports = importedPeople.filter(p => !existingCodes.has(p.codigoCadastro));
      const duplicateCount = importedPeople.length - filteredImports.length;

      setPeople([...filteredImports, ...people]);
      setImportFeedback({
        success: true,
        message: `${filteredImports.length} novas pessoas importadas com sucesso! ${duplicateCount > 0 ? `(${duplicateCount} registros duplicados ignorados)` : ''}`
      });
      setPastedCSV('');
    } catch (err: any) {
      setImportFeedback({
        success: false,
        message: `Erro ao processar planilha: ${err.message}`
      });
    }
  };

  // File upload reader
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      parseAndAddCSV(text);
    };
    reader.readAsText(file);
  };

  // Export current people database as CSV
  const exportToCSV = () => {
    const csvRows = [];
    // Header
    csvRows.push([
      'Código Cadastro', 'Nome', 'Tipo Cadastro', 'Subtipo Cadastro', 'Status atual',
      'Idade', 'Celular Principal SMS', 'Telefone Contato', 'Email', 'End completo',
      'AM', 'SETOR2', 'AF2', 'Bairro Ajustado', 'Data Outorga', 'ID Familia'
    ].join(';'));

    people.forEach(p => {
      csvRows.push([
        `"${p.codigoCadastro}"`,
        `"${p.nome}"`,
        `"${p.tipoCadastro}"`,
        `"${p.subtipoCadastro}"`,
        `"${p.statusAtual}"`,
        p.idade,
        `"${p.celularPrincipal}"`,
        `"${p.telefoneContato}"`,
        `"${p.email}"`,
        `"${p.endCompleto}"`,
        `"${p.am}"`,
        `"${p.setor}"`,
        `"${p.af}"`,
        `"${p.bairro}"`,
        `"${p.dataOutorga || ''}"`,
        `"${p.idFamilia}"`
      ].join(';'));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'johrei_center_membros_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="people-list-root">
      
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" id="people-title">
            Membros & Frequentadores
          </h1>
          <p className="text-slate-500 text-sm">
            Central de cadastro, filtros territoriais e importador inteligente de planilhas.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 border border-slate-250 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
            id="btn-open-import"
          >
            <Upload size={16} />
            <span>Importar Planilha</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm font-semibold"
            id="btn-open-create-modal"
          >
            <UserPlus size={16} />
            <span>Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* Tabs and Global Search bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="table-container">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
          
          {/* Filtering tabs */}
          <div className="flex bg-slate-200/60 p-1 rounded-lg w-full md:w-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterType === 'ALL' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-all-people"
            >
              Todos ({userRole === 'AM' ? people.filter(p => p.setor === 'CENTRO-NORTE').length : people.length})
            </button>
            <button
              onClick={() => setFilterType('MEMBRO')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterType === 'MEMBRO' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-members"
            >
              Membros ({userRole === 'AM' ? people.filter(p => p.setor === 'CENTRO-NORTE' && p.subtipoCadastro === 'MEMBRO').length : people.filter(p => p.subtipoCadastro === 'MEMBRO').length})
            </button>
            <button
              onClick={() => setFilterType('FREQUENTADOR')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filterType === 'FREQUENTADOR' 
                  ? 'bg-white text-slate-800 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="tab-frequenters"
            >
              Frequentadores ({userRole === 'AM' ? people.filter(p => p.setor === 'CENTRO-NORTE' && p.subtipoCadastro === 'FREQUENTADOR').length : people.filter(p => p.subtipoCadastro === 'FREQUENTADOR').length})
            </button>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:flex-1 md:justify-end">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Busca inteligente (nome, bairro, AF, AM...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                id="people-search-input"
              />
            </div>

            {userRole === 'ADMIN' && (
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="filter-sector-select"
              >
                <option value="ALL">Todos os Setores</option>
                {availableSectors.map(sec => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
                <option value="">Sem Setor</option>
              </select>
            )}

            <button
              onClick={exportToCSV}
              className="px-3 py-2 border border-slate-250 hover:bg-slate-50 text-slate-600 rounded-lg text-sm flex items-center justify-center gap-1.5 shadow-sm bg-white"
              title="Exportar base em formato CSV"
              id="btn-export-csv"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Results table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="people-table">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-xs font-semibold bg-slate-50/50 uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Código</th>
                <th className="py-3.5 px-4 font-semibold">Nome</th>
                <th className="py-3.5 px-4 font-semibold">Categoria</th>
                <th className="py-3.5 px-4 font-semibold">Família (AF)</th>
                <th className="py-3.5 px-4 font-semibold">Setor (AM)</th>
                <th className="py-3.5 px-4 font-semibold">Bairro</th>
                <th className="py-3.5 px-4 font-semibold">WhatsApp</th>
                <th className="py-3.5 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredPeople.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <HelpCircle size={32} className="mx-auto text-slate-350 mb-2" />
                    <p className="font-medium text-slate-600">Nenhum registro encontrado</p>
                    <p className="text-xs text-slate-400 mt-1">Experimente alterar os filtros ou importar uma planilha acima.</p>
                  </td>
                </tr>
              ) : (
                filteredPeople.map((person) => {
                  // Calculate WhatsApp status count
                  const waCount = [
                    person.gruposWhatsapp.setor,
                    person.gruposWhatsapp.geral,
                    person.gruposWhatsapp.lar
                  ].filter(Boolean).length;

                  return (
                    <tr 
                      key={person.codigoCadastro}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => onSelectPerson(person)}
                      id={`row-person-${person.codigoCadastro}`}
                    >
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">
                        {person.codigoCadastro}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{person.nome}</div>
                        <div className="text-xs text-slate-400">{person.idade} anos • {person.celularPrincipal || 'Sem celular'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          person.subtipoCadastro === 'MEMBRO' 
                            ? 'bg-teal-50 text-teal-700 border border-teal-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {person.tipoCadastro || person.subtipoCadastro}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{person.idFamilia || 'Sem Família'}</div>
                        <div className="text-xs text-slate-400">AF: {person.af || 'Nenhum'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{person.setor || 'NENHUM'}</div>
                        <div className="text-xs text-slate-400">AM: {person.am || 'Nenhum'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {person.bairro}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${
                            waCount === 3 ? 'bg-emerald-500' : waCount > 0 ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          <span className="text-xs font-medium text-slate-600" title="Grupos: Setor, Geral, Lar">
                            {waCount}/3 grupos
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => onSelectPerson(person)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded-md hover:bg-slate-100 transition-colors"
                            title="Ver detalhes / Jornada espiritual"
                          >
                            <ChevronRight size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(person.codigoCadastro)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-100 transition-colors"
                            title="Remover cadastro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Novo Cadastro Manual */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Novo Cadastro Manual</h3>
                <p className="text-slate-500 text-xs mt-0.5">Adicione um novo membro ou frequentador ao Johrei Center.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Código Cadastro *</label>
                  <input
                    type="text"
                    name="codigoCadastro"
                    required
                    value={formData.codigoCadastro}
                    onChange={handleInputChange}
                    placeholder="Ex: 1313278"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    name="nome"
                    required
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome em letras maiúsculas"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Categoria de Cadastro</label>
                  <select
                    name="subtipoCadastro"
                    value={formData.subtipoCadastro}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="MEMBRO">Membro (Possui Ohikari)</option>
                    <option value="FREQUENTADOR">Frequentador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Ohikari (se Membro)</label>
                  <input
                    type="text"
                    name="tipoCadastro"
                    value={formData.tipoCadastro}
                    onChange={handleInputChange}
                    placeholder="Ex: Ohikari, Shokari"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    disabled={formData.subtipoCadastro !== 'MEMBRO'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Data Nascimento</label>
                  <input
                    type="date"
                    name="nascimento"
                    value={formData.nascimento}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Celular Principal (SMS / WA)</label>
                  <input
                    type="text"
                    name="celularPrincipal"
                    value={formData.celularPrincipal}
                    onChange={handleInputChange}
                    placeholder="Ex: 12997367868"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ex: nome@email.com"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleInputChange}
                    placeholder="Ex: Centro, Tinga"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Setor (Auto-configurável)</label>
                  <select
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {sectors.map(s => (
                      <option key={s.id} value={s.nome}>{s.nome} (AM: {s.amResponsavel})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assistente de Família (AF)</label>
                  <input
                    type="text"
                    name="af"
                    value={formData.af}
                    onChange={handleInputChange}
                    placeholder="Ex: YOKO, ALBERTO"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">ID Família (Opcional)</label>
                  <input
                    type="text"
                    name="idFamilia"
                    value={formData.idFamilia}
                    onChange={handleInputChange}
                    placeholder="Ex: FAM-444"
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Data Outorga (Membros)</label>
                  <input
                    type="date"
                    name="dataOutorga"
                    value={formData.dataOutorga}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    disabled={formData.subtipoCadastro !== 'MEMBRO'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Endereço Completo</label>
                <input
                  type="text"
                  name="endCompleto"
                  value={formData.endCompleto}
                  onChange={handleInputChange}
                  placeholder="Ex: AVENIDA PRESTES MAIA, 21 - Caraguatatuba"
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Whatsapp integration checks */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Grupos do WhatsApp</span>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="gpSetor"
                      checked={formData.gpSetor}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Grupo do Setor</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="gpGeral"
                      checked={formData.gpGeral}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Grupo Geral</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="gpLar"
                      checked={formData.gpLar}
                      onChange={handleInputChange}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Grupo do Lar</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Importador Inteligente de Planilha */}
      {isImportOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Importar Planilha (.csv / .txt)</h3>
                <p className="text-slate-500 text-xs mt-0.5">Envie seu arquivo exportado do Excel ou Looker Studio.</p>
              </div>
              <button 
                onClick={() => {
                  setIsImportOpen(false);
                  setImportFeedback(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Guidelines / columns info */}
              <div className="bg-emerald-50/50 border border-emerald-150 rounded-lg p-4 space-y-2 text-xs text-emerald-955">
                <p className="font-semibold text-emerald-900">Como funciona o mapeamento?</p>
                <p>O importador lê automaticamente as colunas do seu cabeçalho. Garanta que a sua planilha possua colunas parecidas com:</p>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] bg-white/70 p-2 rounded-md border border-emerald-100">
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">Código Cadastro</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">Nome</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">Tipo Cadastro</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">Subtipo Cadastro</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">Idade</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">Bairro Ajustado</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">AM</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">SETOR2</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">AF2</span>
                  <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-semibold">ID Familia</span>
                </div>
              </div>

              {/* Upload Drag & Drop Box */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-white transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  ref={fileInputRef}
                />
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-700 block">Arraste sua planilha ou clique para buscar</span>
                <span className="text-xs text-slate-400 block mt-1">Suporta arquivos formatados em .csv ou .txt (delimitado por ponto e vírgula ou vírgula)</span>
              </div>

              <div className="text-center font-medium text-slate-450 text-xs">— OU COLE OS DADOS MANUALMENTE —</div>

              {/* Alternative Text box */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-600">Copie e Cole as Linhas da Planilha</label>
                <textarea
                  rows={4}
                  value={pastedCSV}
                  onChange={(e) => setPastedCSV(e.target.value)}
                  placeholder={`Código Cadastro;Nome;Tipo Cadastro;Subtipo Cadastro;Status atual;Idade;Celular Principal SMS;AM;SETOR2;AF2;Bairro Ajustado;ID Familia&#10;1313278;YOKO ONISHI;Ohikari;MEMBRO;ATIVO;77;12997367868;PROF DANI;CENTRO-NORTE;YOKO;Centro;FAM-444`}
                  className="w-full p-2.5 border border-slate-250 rounded-lg text-xs font-mono focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-slate-50"
                />
              </div>

              {/* Feedback messages */}
              {importFeedback && (
                <div className={`p-4 rounded-lg flex items-start gap-2 text-xs ${
                  importFeedback.success 
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}>
                  {importFeedback.success ? <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600" />}
                  <p>{importFeedback.message}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportFeedback(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Fechar
                </button>
                {pastedCSV.trim() !== '' && (
                  <button
                    type="button"
                    onClick={() => parseAndAddCSV(pastedCSV)}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Processar Texto Copiado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
