import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import all calculator components
import CompoundingCalculator from '../../components/calculators/CompoundingCalculator';
import FibonacciCalculator from '../../components/calculators/FibonacciCalculator';
import PipDifferenceCalculator from '../../components/calculators/PipDifferenceCalculator';
import PipCalculator from '../../components/calculators/PipCalculator';
import PivotPointsCalculator from '../../components/calculators/PivotPointsCalculator';
import PositionSizeCalculator from '../../components/calculators/PositionSizeCalculator';
import ProfitLossCalculator from '../../components/calculators/ProfitLossCalculator';
import MarginCalculator from '../../components/calculators/MarginCalculator';
import StopLossTakeProfitCalculator from '../../components/calculators/StopLossTakeProfitCalculator';
import { theme } from '../../utils/theme';

export default function CalculatorScreen() {
  const { id } = useLocalSearchParams();
  const calculatorId = Array.isArray(id) ? id[0] : id;

  // Render the appropriate calculator based on the ID
  const renderCalculator = () => {
    switch (calculatorId) {
      case 'compounding':
        return <CompoundingCalculator />;
      case 'fibonacci':
        return <FibonacciCalculator />;
      case 'pip-difference':
        return <PipDifferenceCalculator />;
      case 'pip-value':
        return <PipCalculator />;
      case 'pivot-points':
        return <PivotPointsCalculator />;
      case 'position-size':
        return <PositionSizeCalculator />;
      case 'profit-loss':
        return <ProfitLossCalculator />;
      case 'margin':
        return <MarginCalculator />;
      case 'stop-loss':
        return <StopLossTakeProfitCalculator />;
      default:
        return (
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Calculator not found</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {renderCalculator()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  notFoundText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text,
    textAlign: 'center',
  },
});