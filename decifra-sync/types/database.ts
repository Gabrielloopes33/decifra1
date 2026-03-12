export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

  export interface Database {
    public: {
      Tables: {
        treinadoras: {
          Row: {
            id: string
            email: string
            nome: string
            creditos: number
            created_at: string
            updated_at: string
          }
          Insert: {
            id: string
            email: string
            nome: string
            creditos?: number
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            email?: string
            nome?: string
            creditos?: number
            updated_at?: string
          }
        }
        codigos: {
          Row: {
            id: string
            codigo: string
            treinadora_id: string
            valido_ate: string
            usado: boolean
            cliente_id: string | null
            created_at: string
          }
          Insert: {
            id?: string
            codigo: string
            treinadora_id: string
            valido_ate: string
            usado?: boolean
            cliente_id?: string | null
            created_at?: string
          }
          Update: {
            usado?: boolean
            cliente_id?: string | null
          }
        }
        clientes: {
          Row: {
            id: string
            nome: string
            email: string | null
            codigo_id: string
            treinadora_id: string
            status: 'ativo' | 'em_andamento' | 'completo'
            created_at: string
            updated_at: string
          }
          Insert: {
            id?: string
            nome: string
            email?: string | null
            codigo_id: string
            treinadora_id: string
            status?: 'ativo' | 'em_andamento' | 'completo'
            created_at?: string
            updated_at?: string
          }
          Update: {
            nome?: string
            email?: string | null
            status?: 'ativo' | 'em_andamento' | 'completo'
            updated_at?: string
          }
        }
        respostas: {
          Row: {
            id: string
            cliente_id: string
            questao_id: number
            resposta: number
            created_at: string
          }
          Insert: {
            id?: string
            cliente_id: string
            questao_id: number
            resposta: number
            created_at?: string
          }
          Update: {
            resposta?: number
          }
        }
        resultados: {
          Row: {
            id: string
            cliente_id: string
            scores_facetas: Json
            scores_fatores: Json
            percentis: Json
            classificacoes: Json
            created_at: string
          }
          Insert: {
            id?: string
            cliente_id: string
            scores_facetas: Json
            scores_fatores: Json
            percentis: Json
            classificacoes: Json
            created_at?: string
          }
          Update: {
            scores_facetas?: Json
            scores_fatores?: Json
            percentis?: Json
            classificacoes?: Json
          }
        }
        protocolos: {
          Row: {
            id: string
            faceta: string
            tipo: 'baixo' | 'medio' | 'alto'
            titulo: string
            descricao: string
            exercicios: Json
            created_at: string
          }
          Insert: {
            id?: string
            faceta: string
            tipo: 'baixo' | 'medio' | 'alto'
            titulo: string
            descricao: string
            exercicios: Json
            created_at?: string
          }
          Update: {
            titulo?: string
            descricao?: string
            exercicios?: Json
          }
        }
        protocolos_recomendados: {
          Row: {
            id: string
            resultado_id: string
            protocolo_id: string
            prioridade: number
            created_at: string
          }
          Insert: {
            id?: string
            resultado_id: string
            protocolo_id: string
            prioridade: number
            created_at?: string
          }
          Update: {
            prioridade?: number
          }
        }
      }
      Views: {
        [_ in never]: never
      }
      Functions: {
        [_ in never]: never
      }
      Enums: {
        [_ in never]: never
      }
    }
  }
  