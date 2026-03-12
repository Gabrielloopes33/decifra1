/**
 * Tela de Protocolos - DECIFRA
 * 
 * Exibe os protocolos recomendados para o cliente
 * com base nos resultados do teste
 */

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ProtocoloCard } from '@/components/ProtocoloCard';
import { PROTOCOLOS, type Protocolo } from '@/constants/protocolos';
import { supabase } from '@/lib/supabase/client';
import { COLORS } from '@/constants/colors';
import { GRADIENTS, COLORS_ARTIO } from '@/constants/colors-artio';

interface ProtocoloRecomendado {
  protocolo: Protocolo;
  prioridade: 'alta' | 'media' | 'baixa';
}

export default function ClienteProtocolosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { clienteId, resultadoId } = params;
  const [protocolos, setProtocolos] = useState<ProtocoloRecomendado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarProtocolos();
  }, []);

  const carregarProtocolos = async () => {
    try {
      // Buscar protocolos recomendados do banco
      const { data: recomendadosData, error: recomendadosError } = await supabase
        .from('protocolos_recomendados')
        .select('*')
        .eq('resultado_id', resultadoId)
        .order('prioridade', { ascending: true });

      if (recomendadosError) {
        console.error('Erro ao buscar recomendações:', recomendadosError);
        // Usar protocolos de exemplo
        usarProtocolosExemplo();
        return;
      }

      if (recomendadosData && recomendadosData.length > 0) {
        const protocolosFormatados = recomendadosData
          .map((rec: any) => {
            const protocolo = PROTOCOLOS[rec.protocolo_id];
            if (!protocolo) return null;
            
            return {
              protocolo,
              prioridade: rec.prioridade === 1 ? 'alta' : rec.prioridade === 2 ? 'media' : 'baixa',
            };
          })
          .filter((p): p is ProtocoloRecomendado => p !== null);
        
        setProtocolos(protocolosFormatados);
      } else {
        usarProtocolosExemplo();
      }
    } catch (error) {
      console.error('Erro:', error);
      usarProtocolosExemplo();
    } finally {
      setLoading(false);
    }
  };

  const usarProtocolosExemplo = () => {
    // Protocolos de exemplo para teste
    setProtocolos([
      { protocolo: PROTOCOLOS['N1-A'], prioridade: 'alta' },
      { protocolo: PROTOCOLOS['N6-A'], prioridade: 'alta' },
      { protocolo: PROTOCOLOS['E1-A'], prioridade: 'media' },
    ]);
  };

  const handleVerResultadoCompleto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/cliente/resultado',
      params: { clienteId: clienteId as string, resultadoId: resultadoId as string },
    });
  };

  const handleVoltar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (loading) {
    return (
      <LinearGradient colors={GRADIENTS.splash} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Carregando protocolos...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={GRADIENTS.splash} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleVoltar} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Seus Protocolos</Text>
          <Text style={styles.subtitle}>
            Recomendações personalizadas baseadas no seu perfil
          </Text>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentPadding}
        >
          {/* Info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📋</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Como usar seus protocolos</Text>
              <Text style={styles.infoText}>
                Cada protocolo contém exercícios práticos para desenvolver áreas específicas. 
                Toque em um card para ver os detalhes.
              </Text>
            </View>
          </View>

          {/* Lista de protocolos */}
          <View style={styles.protocolosList}>
            <Text style={styles.sectionTitle}>
              {protocolos.length} Protocolos Recomendados
            </Text>
            
            {protocolos.map((item, index) => (
              <ProtocoloCard
                key={item.protocolo.codigo}
                protocolo={item.protocolo}
                index={index}
                prioridade={item.prioridade}
              />
            ))}
          </View>

          {/* Botão para resultado completo */}
          <TouchableOpacity
            style={styles.buttonResultado}
            onPress={handleVerResultadoCompleto}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[...GRADIENTS.button]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>Ver Resultado Completo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.espacoFinal} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.cream,
    opacity: 0.8,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    color: COLORS.cream,
    opacity: 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.creamLight,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.cream,
    opacity: 0.8,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(196, 167, 125, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(196, 167, 125, 0.3)',
  },
  infoIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS_ARTIO.ocre,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.cream,
    opacity: 0.8,
    lineHeight: 20,
  },
  protocolosList: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.cream,
    opacity: 0.7,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  buttonResultado: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: COLORS_ARTIO.terracota,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.creamLight,
  },
  espacoFinal: {
    height: 40,
  },
});
