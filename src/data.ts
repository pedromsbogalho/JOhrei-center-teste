import { Person, Family, Visit, Sector } from './types';

export const INITIAL_SECTORS: Sector[] = [
  {
    id: 'SEC-1',
    nome: 'CENTRO-NORTE',
    amResponsavel: 'PROF DANI',
    bairros: ['Centro', 'Olaria', 'Martim de Sá', 'Cantagalo']
  },
  {
    id: 'SEC-2',
    nome: 'SUL',
    amResponsavel: 'MINISTRO CARLOS',
    bairros: ['Porto Novo', 'Perequê-Mirim', 'Barranco Alto', 'Morro do Algodão']
  },
  {
    id: 'SEC-3',
    nome: 'OESTE',
    amResponsavel: 'COORDENADORA ANNA',
    bairros: ['Tinga', 'Gaivotas', 'Jardim Jaqueira', 'Casa Branca']
  }
];

export const INITIAL_FAMILIES: Family[] = [
  {
    id: 'FAM-444',
    nome: 'Família Onishi',
    endereco: 'AVENIDA PRESTES MAIA, 21 - CENTRO - Caraguatatuba',
    assistenteResponsavel: 'YOKO',
    observacoes: 'Horta caseira muito bonita e ativa. Família dedicada à ministração diária de Johrei no lar.'
  },
  {
    id: 'FAM-101',
    nome: 'Família Silva',
    endereco: 'RUA MINAS GERAIS, 150 - OLARIA - Caraguatatuba',
    assistenteResponsavel: 'ALBERTO',
    observacoes: 'Lar de Luz estabelecido. Buscam orientações regulares sobre o Belo.'
  },
  {
    id: 'FAM-202',
    nome: 'Família Souza',
    endereco: 'AVENIDA PRIMAVERA, 1024 - PORTO NOVO - Caraguatatuba',
    assistenteResponsavel: 'LUCIA',
    observacoes: 'Precisando de apoio devido à recente purificação de saúde do patriarca.'
  },
  {
    id: 'FAM-303',
    nome: 'Família Santos',
    endereco: 'RUA DOS IPÊS, 45 - TINGA - Caraguatatuba',
    assistenteResponsavel: 'RENATO',
    observacoes: 'Frequentadores novos moram neste lar. Muito abertos ao Johrei.'
  },
  {
    id: 'FAM-505',
    nome: 'Família Ferreira',
    endereco: 'AVENIDA ALDIRA, 88 - MARTIM DE SÁ - Caraguatatuba',
    assistenteResponsavel: 'BEATRIZ',
    observacoes: 'Membros afastados, necessitando visitas e acolhimento espiritual.'
  }
];

export const INITIAL_VISITS: Visit[] = [
  {
    id: 'VIS-1',
    data: '2026-06-10',
    visitante: 'ALBERTO',
    recebedor: 'JOÃO SILVA',
    idFamilia: 'FAM-101',
    objetivo: 'Acompanhamento mensal e incentivo à horta caseira',
    johreiMinistrado: true,
    participantes: 3,
    observacoes: 'A horta está crescendo muito bem. Ministramos Johrei na sala para toda a família.'
  },
  {
    id: 'VIS-2',
    data: '2026-05-15',
    visitante: 'YOKO',
    recebedor: 'YOKO ONISHI',
    idFamilia: 'FAM-444',
    objetivo: 'Estudo de Ensinamentos e arranjo de Ikebana (Belo)',
    johreiMinistrado: true,
    participantes: 2,
    observacoes: 'Colocamos uma flor de luz na recepção do lar. Sintonizados com Meishu-Sama.'
  },
  {
    id: 'VIS-3',
    data: '2026-06-20',
    visitante: 'LUCIA',
    recebedor: 'MARCOS SOUZA',
    idFamilia: 'FAM-202',
    objetivo: 'Orientações pós-outorga e ministração de Johrei',
    johreiMinistrado: true,
    participantes: 2,
    observacoes: 'Marcos está animado com o Ohikari, mas precisa de apoio com a escala de aulas.'
  }
];

export const INITIAL_PEOPLE: Person[] = [
  {
    codigoCadastro: '1313278',
    nome: 'YOKO ONISHI',
    tipoCadastro: 'Ohikari',
    subtipoCadastro: 'MEMBRO',
    statusAtual: 'ATIVO',
    nascimento: '1949-04-12',
    idade: 77,
    celularPrincipal: '12997367868',
    telefoneContato: '12997367868',
    email: 'yokosam7@gmail.com',
    ultimoAcessoApp: '2026-06-02 05:08:58',
    endCompleto: 'AVENIDA PRESTES MAIA, 21',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: 'YOKO',
    bairro: 'Centro',
    dataOutorga: '2008-05-12',
    tempoMembro: '18 anos e 1 mês',
    anoOutorga: 2008,
    idFamilia: 'FAM-444',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2008-01-10',
      recebeuJohrei: true,
      cursoIniciacao: {
        data: '2008-03-15',
        instrutor: 'Ministro Silva',
        presenca: true,
        concluido: true
      },
      ingressou: true,
      recebeuOhikari: true,
      cursoPosOutorga: {
        aulas: [true, true, true, true, true]
      },
      membroAtivo: true
    },
    gruposWhatsapp: {
      setor: true,
      geral: true,
      lar: true
    }
  },
  {
    codigoCadastro: '1002003',
    nome: 'JOÃO SILVA',
    tipoCadastro: 'Ohikari',
    subtipoCadastro: 'MEMBRO',
    statusAtual: 'ATIVO',
    nascimento: '1975-08-20',
    idade: 50,
    celularPrincipal: '12991029384',
    telefoneContato: '12991029384',
    email: 'joao.silva@outlook.com',
    ultimoAcessoApp: '2026-06-24 18:30:12',
    endCompleto: 'RUA MINAS GERAIS, 150',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: 'ALBERTO',
    bairro: 'Olaria',
    dataOutorga: '2015-06-18',
    tempoMembro: '11 anos',
    anoOutorga: 2015,
    idFamilia: 'FAM-101',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2015-02-14',
      recebeuJohrei: true,
      cursoIniciacao: {
        data: '2015-04-20',
        instrutor: 'Profª Dani',
        presenca: true,
        concluido: true
      },
      ingressou: true,
      recebeuOhikari: true,
      cursoPosOutorga: {
        aulas: [true, true, true, true, true]
      },
      membroAtivo: true
    },
    gruposWhatsapp: {
      setor: true,
      geral: true,
      lar: true
    }
  },
  {
    codigoCadastro: '1002004',
    nome: 'MARIA SILVA',
    tipoCadastro: 'Ohikari',
    subtipoCadastro: 'MEMBRO',
    statusAtual: 'ATIVO',
    nascimento: '1978-11-05',
    idade: 47,
    celularPrincipal: '12991029385',
    telefoneContato: '12991029385',
    email: 'maria.silva@outlook.com',
    ultimoAcessoApp: '2026-06-25 08:15:00',
    endCompleto: 'RUA MINAS GERAIS, 150',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: 'ALBERTO',
    bairro: 'Olaria',
    dataOutorga: '2018-11-20',
    tempoMembro: '7 anos e 7 meses',
    anoOutorga: 2018,
    idFamilia: 'FAM-101',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2018-07-01',
      recebeuJohrei: true,
      cursoIniciacao: {
        data: '2018-09-10',
        instrutor: 'Profª Dani',
        presenca: true,
        concluido: true
      },
      ingressou: true,
      recebeuOhikari: true,
      cursoPosOutorga: {
        aulas: [true, true, true, true, true]
      },
      membroAtivo: true
    },
    gruposWhatsapp: {
      setor: true,
      geral: true,
      lar: true
    }
  },
  {
    codigoCadastro: '1002005',
    nome: 'PEDRO SILVA',
    tipoCadastro: 'Frequentador',
    subtipoCadastro: 'FREQUENTADOR',
    statusAtual: 'ATIVO',
    nascimento: '2005-03-12',
    idade: 21,
    celularPrincipal: '12991029386',
    telefoneContato: '12991029386',
    email: 'pedro.silva@gmail.com',
    ultimoAcessoApp: '2026-06-23 14:20:00',
    endCompleto: 'RUA MINAS GERAIS, 150',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: 'ALBERTO',
    bairro: 'Olaria',
    idFamilia: 'FAM-101',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2026-04-02',
      recebeuJohrei: true,
      cursoIniciacao: {
        presenca: false,
        concluido: false
      },
      ingressou: false,
      recebeuOhikari: false,
      cursoPosOutorga: {
        aulas: [false, false, false, false, false]
      },
      membroAtivo: false
    },
    gruposWhatsapp: {
      setor: true,
      geral: true,
      lar: false // PENDÊNCIA: Não entrou no grupo do lar
    }
  },
  {
    codigoCadastro: '1548231',
    nome: 'MARCOS SOUZA',
    tipoCadastro: 'Ohikari',
    subtipoCadastro: 'MEMBRO',
    statusAtual: 'ATIVO',
    nascimento: '1992-07-15',
    idade: 33,
    celularPrincipal: '12988112233',
    telefoneContato: '12988112233',
    email: 'marcos.souza@gmail.com',
    ultimoAcessoApp: '2026-06-25 10:11:12',
    endCompleto: 'AVENIDA PRIMAVERA, 1024',
    am: 'MINISTRO CARLOS',
    setor: 'SUL',
    af: 'LUCIA',
    bairro: 'Porto Novo',
    dataOutorga: '2026-01-10',
    tempoMembro: '5 meses',
    anoOutorga: 2026,
    idFamilia: 'FAM-202',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2025-08-15',
      recebeuJohrei: true,
      cursoIniciacao: {
        data: '2025-10-12',
        instrutor: 'Ministro Carlos',
        presenca: true,
        concluido: true
      },
      ingressou: true,
      recebeuOhikari: true,
      cursoPosOutorga: {
        aulas: [true, true, true, false, false] // PENDÊNCIA: Aulas 4 e 5 incompletas
      },
      membroAtivo: false
    },
    gruposWhatsapp: {
      setor: true,
      geral: false, // PENDÊNCIA: Não entrou no grupo geral
      lar: true
    }
  },
  {
    codigoCadastro: '1987541',
    nome: 'ANA SANTOS',
    tipoCadastro: 'Frequentador',
    subtipoCadastro: 'FREQUENTADOR',
    statusAtual: 'ATIVO',
    nascimento: '1989-12-01',
    idade: 36,
    celularPrincipal: '12987875454',
    telefoneContato: '12987875454',
    email: 'ana.santos@outlook.com',
    ultimoAcessoApp: '',
    endCompleto: 'RUA DOS IPÊS, 45',
    am: 'COORDENADORA ANNA',
    setor: 'OESTE',
    af: 'RENATO',
    bairro: 'Tinga',
    idFamilia: 'FAM-303',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2026-05-18',
      recebeuJohrei: true,
      cursoIniciacao: {
        data: '2026-06-15',
        instrutor: 'Anna',
        presenca: true,
        concluido: false // PENDÊNCIA: Curso em andamento
      },
      ingressou: false,
      recebeuOhikari: false,
      cursoPosOutorga: {
        aulas: [false, false, false, false, false]
      },
      membroAtivo: false
    },
    gruposWhatsapp: {
      setor: false, // PENDÊNCIA: Não entrou no setor
      geral: false, // PENDÊNCIA: Não entrou no geral
      lar: false // PENDÊNCIA: Não entrou no lar
    }
  },
  {
    codigoCadastro: '1448921',
    nome: 'GABRIEL FERREIRA',
    tipoCadastro: 'Frequentador',
    subtipoCadastro: 'FREQUENTADOR',
    statusAtual: 'ATIVO',
    nascimento: '1995-02-28',
    idade: 31,
    celularPrincipal: '12996541234',
    telefoneContato: '12996541234',
    email: 'gabriel.ferreira@gmail.com',
    ultimoAcessoApp: '2026-05-01 12:00:00',
    endCompleto: 'AVENIDA ALDIRA, 88',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: 'BEATRIZ',
    bairro: 'Martim de Sá',
    idFamilia: 'FAM-505',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2026-03-10',
      recebeuJohrei: true,
      cursoIniciacao: {
        presenca: false,
        concluido: false
      },
      ingressou: false,
      recebeuOhikari: false,
      cursoPosOutorga: {
        aulas: [false, false, false, false, false]
      },
      membroAtivo: false
    },
    gruposWhatsapp: {
      setor: true,
      geral: true,
      lar: true
    }
  },
  {
    codigoCadastro: '1313279',
    nome: 'LUCAS ONISHI',
    tipoCadastro: 'Ohikari',
    subtipoCadastro: 'MEMBRO',
    statusAtual: 'ATIVO',
    nascimento: '2001-08-14',
    idade: 24,
    celularPrincipal: '12997367869',
    telefoneContato: '12997367869',
    email: 'lucas.onishi@gmail.com',
    ultimoAcessoApp: '2026-06-25 15:44:00',
    endCompleto: 'AVENIDA PRESTES MAIA, 21',
    am: 'PROF DANI',
    setor: 'CENTRO-NORTE',
    af: 'YOKO',
    bairro: 'Centro',
    dataOutorga: '2026-05-20',
    tempoMembro: '1 mês',
    anoOutorga: 2026,
    idFamilia: 'FAM-444',
    jornada: {
      primeiroAtendimento: true,
      primeiroAtendimentoData: '2025-12-01',
      recebeuJohrei: true,
      cursoIniciacao: {
        data: '2026-02-15',
        instrutor: 'Ministro Silva',
        presenca: true,
        concluido: true
      },
      ingressou: true,
      recebeuOhikari: true,
      cursoPosOutorga: {
        aulas: [true, false, false, false, false] // PENDÊNCIA: Apenas aula 1 concluída
      },
      membroAtivo: false
    },
    gruposWhatsapp: {
      setor: true,
      geral: true,
      lar: true
    }
  },
  {
    codigoCadastro: '1999999',
    nome: 'FLAVIA COSTA',
    tipoCadastro: 'Frequentador',
    subtipoCadastro: 'FREQUENTADOR',
    statusAtual: 'PENDENTE',
    nascimento: '1998-10-30',
    idade: 27,
    celularPrincipal: '', // PENDÊNCIA: Sem telefone
    telefoneContato: '',
    email: 'flavia.costa@gmail.com',
    ultimoAcessoApp: '',
    endCompleto: 'RUA DO COMÉRCIO, 400',
    am: '', // PENDÊNCIA: Sem AM/setor
    setor: '', // PENDÊNCIA: Sem setor
    af: '', // PENDÊNCIA: Sem AF
    bairro: 'Centro',
    idFamilia: '', // PENDÊNCIA: Sem família
    jornada: {
      primeiroAtendimento: false, // PENDÊNCIA: Sem primeiro atendimento realizado
      recebeuJohrei: false,
      cursoIniciacao: {
        presenca: false,
        concluido: false
      },
      ingressou: false,
      recebeuOhikari: false,
      cursoPosOutorga: {
        aulas: [false, false, false, false, false]
      },
      membroAtivo: false
    },
    gruposWhatsapp: {
      setor: false,
      geral: false,
      lar: false
    }
  }
];

// LocalStorage helpers
export const loadSectors = (): Sector[] => {
  const data = localStorage.getItem('jc_sectors');
  return data ? JSON.parse(data) : INITIAL_SECTORS;
};

export const saveSectors = (sectors: Sector[]) => {
  localStorage.setItem('jc_sectors', JSON.stringify(sectors));
};

export const loadFamilies = (): Family[] => {
  const data = localStorage.getItem('jc_families');
  return data ? JSON.parse(data) : INITIAL_FAMILIES;
};

export const saveFamilies = (families: Family[]) => {
  localStorage.setItem('jc_families', JSON.stringify(families));
};

export const loadVisits = (): Visit[] => {
  const data = localStorage.getItem('jc_visits');
  return data ? JSON.parse(data) : INITIAL_VISITS;
};

export const saveVisits = (visits: Visit[]) => {
  localStorage.setItem('jc_visits', JSON.stringify(visits));
};

export const loadPeople = (): Person[] => {
  const data = localStorage.getItem('jc_people');
  return data ? JSON.parse(data) : INITIAL_PEOPLE;
};

export const savePeople = (people: Person[]) => {
  localStorage.setItem('jc_people', JSON.stringify(people));
};
