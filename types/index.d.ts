import { StackNavigationProp } from "@react-navigation/stack";

// Navigation
export type RootStackParamList = {
  Home: undefined;
  PipCalculator: undefined;
  MarginCalculator: undefined;
  FibonacciCalculator: undefined;
  ProfitLossCalculator: undefined;
  PivotPointsCalculator: undefined;
  PositionSizeCalculator: undefined;
  PipDifferenceCalculator: undefined;
  History: undefined;
  Settings: undefined;
};

export type CalculatorScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;

// Extend modules
declare module "*.svg" {
  import React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
