/**
 * Tipos específicos para o painel administrativo DECIFRA
 */

export interface AdminUser {
  id: string;
  email: string;
  nome: string;
  is_admin: boolean;
  created_at: string;
}

export interface DashboardStats {
  totalTreinadoras: number;
  totalCodigos: number;
  totalCodigosUsados: number;
  totalClientes: number;
  totalClientesAtivos: number;
  totalClientesCompletos: number;
  codigosAtivos: number;
}

export interface TreinadoraAdmin {
  id: string;
  nome: string;
  email: string;
  creditos: number;
  totalCodigos: number;
  totalClientes: number;
  created_at: string;
}

export interface CodigoAdmin {
  id: string;
  codigo: string;
  treinadora_id: string;
  treinadora_nome: string;
  usado: boolean;
  valido_ate: string;
  cliente_nome?: string;
  cliente_email?: string;
  created_at: string;
}

export interface ClienteAdmin {
  id: string;
  nome: string;
  email: string | null;
  codigo_id: string;
  codigo: string;
  treinadora_id: string;
  treinadora_nome: string;
  status: 'ativo' | 'em_andamento' | 'completo';
  created_at: string;
  updated_at: string;
}
