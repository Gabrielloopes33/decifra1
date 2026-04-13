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
  selectedTextColor?: string;
  defaultTextColor?: string;
  onPress: () => void;
}

export function RespostaButton({
  valor,
  label,
  isSelected,
  themeColor,
  selectedTextColor = COLORS.creamLight,
  defaultTextColor = COLORS.cream,
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
      <Text style={[styles.valor, { color: isSelected ? selectedTextColor : defaultTextColor }]}>
        {valor}
      </Text>
      <Text style={[styles.label, { color: isSelected ? selectedTextColor : 'rgba(245, 240, 230, 0.9)' }]}>
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
    paddingVertical: 14,
    paddingHorizontal: 2,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 88,
  },
  valor: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    fontWeight: '500',
  },
});

export default RespostaButton;
