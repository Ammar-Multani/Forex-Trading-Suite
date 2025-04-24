import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";

interface PipInputProps {
  value: string;
  onChange: (text: string) => void;
  onCalculatorPress?: () => void;
  pipDecimalPlaces?: number;
  onPipDecimalPlacesChange?: (decimalPlaces: number) => void;
}

const PipInput: React.FC<PipInputProps> = ({
  value,
  onChange,
  onCalculatorPress,
  pipDecimalPlaces = 4,
  onPipDecimalPlacesChange,
}) => {
  const { colors, isDark } = useTheme();
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const handleDecimalPlaceSelect = (places: number) => {
    if (onPipDecimalPlacesChange) {
      onPipDecimalPlacesChange(places);
    }
  };

  // Get the denominator suffix (st, nd, rd, th)
  const getDenominator = (places: number): string => {
    if (places === 0) return "";
    if (places === 1) return "st";
    if (places === 2) return "nd";
    if (places === 3) return "rd";
    return "th";
  };

  // Generate example for the current decimal place selection
  const getDecimalPlaceExample = (places: number): string => {
    if (places === 0) return "1";
    return `0.${"0".repeat(places - 1)}1`;
  };

  // Array of available decimal places
  const decimalPlaceOptions = Array.from({ length: 11 }, (_, i) => i); // 0 to 10

  // Render each decimal place option
  const renderDecimalPlaceOption = ({ item }: { item: number }) => (
    <TouchableOpacity
      key={item}
      style={[
        styles.decimalPlaceOption,
        {
          backgroundColor:
            pipDecimalPlaces === item ? colors.primary : colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleDecimalPlaceSelect(item)}
    >
      <Text
        style={[
          styles.decimalPlaceText,
          {
            color: pipDecimalPlaces === item ? "white" : colors.text,
          },
        ]}
      >
        {item}
        {getDenominator(item)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <Text style={[styles.sectionLabel, { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" }]}>
          Pips:
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                  paddingRight: onCalculatorPress ? 45 : 12,
                },
              ]}
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              placeholder="Enter pip count (e.g., 10)"
              placeholderTextColor={colors.placeholder}
            />
            {onCalculatorPress && (
              <TouchableOpacity
                style={[
                  styles.calculatorButton,
                  { backgroundColor: colors.primary + "15" },
                ]}
                onPress={onCalculatorPress}
              >
                <MaterialIcons
                  name="calculate"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Advanced Options Button */}
      <TouchableOpacity
        style={styles.advancedOptionsButton}
        onPress={() => setShowAdvancedOptions(!showAdvancedOptions)}
      >
        <Text style={[styles.advancedOptionsText, { color: colors.primary }]}>
          {showAdvancedOptions
            ? "Hide Advanced Options"
            : "Show Advanced Options"}
        </Text>
        <MaterialIcons
          name={showAdvancedOptions ? "expand-less" : "expand-more"}
          size={20}
          color={colors.primary}
        />
      </TouchableOpacity>

      {/* Advanced Options Section */}
      {showAdvancedOptions && (
        <View style={styles.advancedOptionsContainer}>
          <Text style={[styles.advancedOptionLabel, { color: colors.subtext }]}>
            Pip Decimal Places:
          </Text>

          <FlatList
            data={decimalPlaceOptions}
            renderItem={renderDecimalPlaceOption}
            keyExtractor={(item) => item.toString()}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.decimalPlacesScrollContainer}
          />

          <View style={styles.decimalPlaceExampleContainer}>
            <Text
              style={[
                styles.decimalPlaceDescription,
                { color: colors.subtext },
              ]}
            >
              {pipDecimalPlaces === 0
                ? "1 pip = 1 (whole unit)"
                : `1 pip = ${getDecimalPlaceExample(
                    pipDecimalPlaces
                  )} (${pipDecimalPlaces}${getDenominator(
                    pipDecimalPlaces
                  )} decimal place)`}
            </Text>
          </View>
        </View>
      )}

      <View
        style={[
          styles.infoContainer,
          { backgroundColor: colors.primary + "10" },
        ]}
      >
        <MaterialIcons name="info-outline" size={16} color={colors.primary} />
        <Text style={[styles.pipInfo, { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" }]}>
          Enter the number of pips for your calculation
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    width: 80,
  },
  inputContainer: {
    flex: 1,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  calculatorButton: {
    position: "absolute",
    right: 5,
    top: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  pipInfo: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  advancedOptionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  advancedOptionsText: {
    fontSize: 14,
    marginRight: 5,
    fontWeight: "500",
  },
  advancedOptionsContainer: {
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  advancedOptionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  decimalPlacesScrollContainer: {
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  decimalPlaceOption: {
    width: 45,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  decimalPlaceText: {
    fontSize: 16,
    fontWeight: "500",
  },
  decimalPlaceExampleContainer: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 6,
    alignItems: "center",
  },
  decimalPlaceDescription: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default PipInput;
