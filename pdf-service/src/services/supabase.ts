// ============================================
// Serviço Supabase
// ============================================

import { createClient } from '@supabase/supabase-js';
import type {
  ResultadoData,
  ClienteData,
  TreinadoraData,
  Protocolo,
  ProtocoloRecomendado
} from '../types/index.js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY devem ser configurados');
}

// Client com service role (acesso total ao banco)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export class SupabaseService {
  
  /**
   * Busca resultado completo por ID
   */
  static async getResultado(resultadoId: string): Promise<ResultadoData | null> {
    const { data, error } = await supabase
      .from('resultados')
      .select('*')
      .eq('id', resultadoId)
      .single();

    if (error) {
      console.error('Erro ao buscar resultado:', error);
      return null;
    }

    return data as ResultadoData;
  }

  /**
   * Busca dados do cliente
   */
  static async getCliente(clienteId: string): Promise<ClienteData | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return null;
    }

    return data as ClienteData;
  }

  /**
   * Busca dados da treinadora
   */
  static async getTreinadora(treinadoraId: string): Promise<TreinadoraData | null> {
    const { data, error } = await supabase
      .from('treinadoras')
      .select('*')
      .eq('id', treinadoraId)
      .single();

    if (error) {
      console.error('Erro ao buscar treinadora:', error);
      return null;
    }

    return data as TreinadoraData;
  }

  /**
   * Busca protocolos recomendados para um resultado
   */
  static async getProtocolosRecomendados(resultadoId: string): Promise<ProtocoloRecomendado[]> {
    const { data, error } = await supabase
      .from('protocolos_recomendados')
      .select(`
        prioridade,
        protocolo:protocolo_id (
          id,
          faceta,
          tipo,
          titulo,
          descricao,
          exercicios
        )
      `)
      .eq('resultado_id', resultadoId)
      .order('prioridade', { ascending: true });

    if (error) {
      console.error('Erro ao buscar protocolos:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      protocolo: item.protocolo as Protocolo,
      prioridade: item.prioridade
    }));
  }

  /**
   * Busca todos os protocolos disponíveis
   */
  static async getAllProtocolos(): Promise<Protocolo[]> {
    const { data, error } = await supabase
      .from('protocolos')
      .select('*');

    if (error) {
      console.error('Erro ao buscar protocolos:', error);
      return [];
    }

    return (data || []) as Protocolo[];
  }

  /**
   * Faz upload do PDF para o Supabase Storage
   */
  static async uploadPDF(
    filename: string,
    pdfBuffer: Buffer,
    clienteId: string
  ): Promise<string | null> {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'pdfs';
    
    const { error } = await supabase
      .storage
      .from(bucket)
      .upload(`${clienteId}/${filename}`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error('Erro ao fazer upload do PDF:', error);
      return null;
    }

    // Gerar URL pública
    const { data: { publicUrl } } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(`${clienteId}/${filename}`);

    return publicUrl;
  }

  /**
   * Verifica se o usuário tem acesso ao resultado
   */
  static async verificarAcesso(
    userId: string,
    resultadoId: string
  ): Promise<{ temAcesso: boolean; clienteId?: string }> {
    // Buscar resultado
    const resultado = await this.getResultado(resultadoId);
    if (!resultado) {
      return { temAcesso: false };
    }

    // Buscar cliente
    const cliente = await this.getCliente(resultado.cliente_id);
    if (!cliente) {
      return { temAcesso: false };
    }

    // Verificar se o usuário é a treinadora do cliente
    const { data: treinadora } = await supabase
      .from('treinadoras')
      .select('id')
      .eq('auth_user_id', userId)
      .eq('id', cliente.treinadora_id)
      .single();

    if (treinadora) {
      return { temAcesso: true, clienteId: cliente.id };
    }

    // Verificar se o usuário é o próprio cliente
    const { data: clienteAuth } = await supabase
      .from('clientes')
      .select('id')
      .eq('id', resultado.cliente_id)
      // Aqui você precisaria de uma forma de linkar cliente ao auth.users
      // Isso depende da sua implementação específica
      .single();

    return { 
      temAcesso: !!clienteAuth, 
      clienteId: clienteAuth ? resultado.cliente_id : undefined 
    };
  }
}
