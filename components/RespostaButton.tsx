/**
 * Botão de Resposta - Versão Simplificada (sem Reanimated)
 * 
 * Botão de resposta para o teste IPIP
 * Usa TouchableOpacity nativo
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/colors';

interface RespostaButtonProps {
  valor: number;
  label: string;
  isSelected: boolean;
  themeColor: string;
  onPress: () => void;
}

export function RespostaButton({
  valor,
  label,
  isSelected,
  themeColor,
  onPress,
}: RespostaButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? themeColor : 'rgba(45, 21, 24, 0.5)',
          borderColor: isSelected ? themeColor : 'rgba(245, 240, 230, 0.15)',
          transform: [{ scale: isSelected ? 1.05 : 1 }],
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[styles.valor, { color: isSelected ? COLORS.creamLight : COLORS.cream }]}>
        {valor}
      </Text>
      <Text style={[styles.label, { color: isSelected ? COLORS.creamLight : 'rgba(245, 240, 230, 0.7)' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 70,
  },
  valor: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '500',
  },
});

export default RespostaButton;
