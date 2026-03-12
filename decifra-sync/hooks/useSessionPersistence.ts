/**
 * Session Persistence Hook - DECIFRA
 * 
 * Mantém a sessão do cliente ativa por 7 dias
 * Persiste dados de autenticação e progresso do teste
 */

import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SessionData {
  clienteId: string;
  codigoId: string;
  treinadoraId: string;
  timestamp: number;
  estacaoAtual: number;
  respostasParciais: Record<string, number>;
}

const SESSION_KEY = '@decifra_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function useSessionPersistence() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
      
      if (sessionJson) {
        const parsedSession: SessionData = JSON.parse(sessionJson);
        const now = Date.now();
        const sessionAge = now - parsedSession.timestamp;
        
        if (sessionAge < SESSION_DURATION) {
          setSession(parsedSession);
        } else {
          await clearSession();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = useCallback(async (data: Omit<SessionData, 'timestamp'>) => {
    try {
      const sessionData: SessionData = {
        ...data,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      setSession(sessionData);
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return false;
    }
  }, []);

  const updateSession = useCallback(async (updates: Partial<SessionData>) => {
    try {
      if (!session) return false;
      
      const updatedSession = {
        ...session,
        ...updates,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      setSession(updatedSession);
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      return false;
    }
  }, [session]);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      setSession(null);
      return true;
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
      return false;
    }
  }, []);

  const isSessionValid = useCallback(() => {
    if (!session) return false;
    
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    
    return sessionAge < SESSION_DURATION;
  }, [session]);

  const getSessionTimeRemaining = useCallback(() => {
    if (!session) return 0;
    
    const now = Date.now();
    const sessionAge = now - session.timestamp;
    const remaining = SESSION_DURATION - sessionAge;
    
    return Math.max(0, remaining);
  }, [session]);

  const saveTestProgress = useCallback(async (estacao: number, respostas: Record<number, number>) => {
    try {
      const progressKey = `@decifra_progress_${estacao}`;
      await AsyncStorage.setItem(progressKey, JSON.stringify({
        respostas,
        timestamp: Date.now(),
      }));
      
      if (session) {
        await updateSession({
          estacaoAtual: estacao,
          respostasParciais: {
            ...session.respostasParciais,
            [estacao]: Object.keys(respostas).length,
          },
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      return false;
    }
  }, [session, updateSession]);

  const loadTestProgress = useCallback(async (estacao: number) => {
    try {
      const progressKey = `@decifra_progress_${estacao}`;
      const progressJson = await AsyncStorage.getItem(progressKey);
      
      if (progressJson) {
        const progress = JSON.parse(progressJson);
        const now = Date.now();
        const progressAge = now - progress.timestamp;
        
        if (progressAge < SESSION_DURATION) {
          return progress.respostas as Record<number, number>;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      return null;
    }
  }, []);

  const clearTestProgress = useCallback(async (estacao: number) => {
    try {
      const progressKey = `@decifra_progress_${estacao}`;
      await AsyncStorage.removeItem(progressKey);
      return true;
    } catch (error) {
      console.error('Erro ao limpar progresso:', error);
      return false;
    }
  }, []);

  return {
    session,
    loading,
    saveSession,
    updateSession,
    clearSession,
    isSessionValid,
    getSessionTimeRemaining,
    saveTestProgress,
    loadTestProgress,
    clearTestProgress,
  };
}

export default useSessionPersistence;
