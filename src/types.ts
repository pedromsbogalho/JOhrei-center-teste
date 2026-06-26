export interface CursoIniciacao {
  data?: string;
  instrutor?: string;
  presenca: boolean;
  concluido: boolean;
}

export interface CursoPosOutorga {
  aulas: boolean[]; // 5 classes, true if completed
}

export interface GruposWhatsapp {
  setor: boolean;
  geral: boolean;
  lar: boolean;
}

export interface JornadaFrequentador {
  primeiroAtendimento: boolean;
  primeiroAtendimentoData?: string;
  recebeuJohrei: boolean;
  cursoIniciacao: CursoIniciacao;
  ingressou: boolean;
  recebeuOhikari: boolean;
  cursoPosOutorga: CursoPosOutorga;
  membroAtivo: boolean;
}

export interface Person {
  codigoCadastro: string;
  nome: string;
  tipoCadastro: string; // 'Ohikari', 'Frequentador', etc.
  subtipoCadastro: 'MEMBRO' | 'FREQUENTADOR' | 'STAFF';
  statusAtual: 'ATIVO' | 'AFASTADO' | 'PENDENTE';
  nascimento: string;
  idade: number;
  celularPrincipal: string;
  telefoneContato: string;
  email: string;
  ultimoAcessoApp: string;
  endCompleto: string;
  am: string; // Assistente de Ministro
  setor: string; // Setor Name
  af: string; // Assistente de Família
  bairro: string;
  dataOutorga?: string;
  tempoMembro?: string;
  anoOutorga?: number;
  idFamilia: string;
  
  // Custom tracking fields
  jornada: JornadaFrequentador;
  gruposWhatsapp: GruposWhatsapp;
}

export interface Family {
  id: string;
  nome: string;
  endereco: string;
  assistenteResponsavel: string; // AF name
  observacoes: string;
}

export interface Visit {
  id: string;
  data: string;
  visitante: string; // Name of visitor
  recebedor: string; // Name of person who received
  idFamilia: string;
  objetivo: string;
  johreiMinistrado: boolean;
  participantes: number;
  observacoes: string;
}

export interface Sector {
  id: string;
  nome: string;
  amResponsavel: string; // Assistente de Ministro name
  bairros: string[];
}

export type AccessRole = 'ADMIN' | 'AM';
