import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

interface CalculatorModalProps {
  onClose: () => void;
  onSubmit: (value: number) => void;
  initialValue?: string;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({
  onClose,
  onSubmit,
  initialValue = "",
}) => {
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";

  // Define gradients properly as tuples
  const headerGradient = isDarkMode
    ? (["#2d3748", "#1a202c"] as const)
    : (["#f7fafc", "#edf2f7"] as const);

  const displayGradient = isDarkMode
    ? (["rgba(30, 35, 45, 0.95)", "rgba(20, 25, 35, 0.9)"] as const)
    : (["rgba(245, 247, 250, 0.95)", "rgba(235, 240, 245, 0.9)"] as const);

  const submitGradient = isDarkMode
    ? (["#4c51bf", "#3c366b"] as const)
    : (["#4299e1", "#3182ce"] as const);

  const [displayValue, setDisplayValue] = useState(initialValue);
  const [lastOperation, setLastOperation] = useState<string | null>(null);
  const [storedValue, setStoredValue] = useState<number | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [pressedButton, setPressedButton] = useState<string | null>(null);

  // Animated values for button press effect
  const animatedScale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (initialValue) {
      setDisplayValue(initialValue);
    }
  }, [initialValue]);

  const handleButtonPress = (buttonValue: string) => {
    // Set the pressed button for visual feedback
    setPressedButton(buttonValue);

    // Button press animation
    Animated.sequence([
      Animated.timing(animatedScale, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Clear pressed button after animation
      setTimeout(() => setPressedButton(null), 100);
    });
  };

  const handleNumberPress = (num: string) => {
    handleButtonPress(num);
    if (displayValue === "0" || shouldResetDisplay) {
      setDisplayValue(num);
      setShouldResetDisplay(false);
    } else {
      setDisplayValue(displayValue + num);
    }
  };

  const handleClearPress = () => {
    handleButtonPress("C");
    setDisplayValue("0");
    setStoredValue(null);
    setLastOperation(null);
  };

  const handleDecimalPress = () => {
    handleButtonPress(".");
    if (shouldResetDisplay) {
      setDisplayValue("0.");
      setShouldResetDisplay(false);
      return;
    }

    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  const handleOperationPress = (operation: string) => {
    handleButtonPress(operation);
    const currentValue = parseFloat(displayValue);

    if (storedValue === null) {
      setStoredValue(currentValue);
      setLastOperation(operation);
      setShouldResetDisplay(true);
    } else {
      const result = calculate(storedValue, currentValue, lastOperation!);
      setDisplayValue(String(result));
      setStoredValue(result);
      setLastOperation(operation);
      setShouldResetDisplay(true);
    }
  };

  const handleEqualsPress = () => {
    handleButtonPress("=");
    if (lastOperation && storedValue !== null) {
      const currentValue = parseFloat(displayValue);
      const result = calculate(storedValue, currentValue, lastOperation);
      setDisplayValue(String(result));
      setStoredValue(null);
      setLastOperation(null);
      setShouldResetDisplay(true);
    }
  };

  const handleBackspacePress = () => {
    handleButtonPress("⌫");
    if (displayValue.length > 1) {
      setDisplayValue(displayValue.slice(0, -1));
    } else {
      setDisplayValue("0");
    }
  };

  const handleSubmit = () => {
    const value = parseFloat(displayValue);
    if (!isNaN(value)) {
      onSubmit(value);
    } else {
      onSubmit(0);
    }
  };

  const calculate = (
    first: number,
    second: number,
    operation: string
  ): number => {
    switch (operation) {
      case "+":
        return first + second;
      case "-":
        return first - second;
      case "×":
        return first * second;
      case "÷":
        return second === 0 ? 0 : first / second;
      default:
        return second;
    }
  };

  const getButtonBackgroundColor = (
    type: string
  ): readonly [string, string] => {
    switch (type) {
      case "number":
        return isDarkMode
          ? (["#2a2d37", "#252833"] as const)
          : (["#f7f7f7", "#f0f0f0"] as const);
      case "operation":
        return isDarkMode
          ? (["#3b4768", "#2f3855"] as const)
          : (["#e8f0fe", "#d8e5fd"] as const);
      case "special":
        return isDarkMode
          ? (["#3c3f4a", "#323541"] as const)
          : (["#f0f0f0", "#e5e5e5"] as const);
      case "equals":
        return isDarkMode
          ? (["#3b4768", "#2f3855"] as const)
          : (["#e8f0fe", "#d8e5fd"] as const);
      case "clear":
        return isDarkMode
          ? (["#7c3a3a", "#6e3535"] as const)
          : (["#feeaea", "#fdd5d5"] as const);
      default:
        return isDarkMode
          ? (["#2a2d37", "#252833"] as const)
          : (["#f7f7f7", "#f0f0f0"] as const);
    }
  };

  const getButtonTextColor = (type: string): string => {
    switch (type) {
      case "clear":
        return "#D64541";
      case "operation":
      case "equals":
        return colors.primary;
      default:
        return colors.text;
    }
  };

  const renderButton = (
    text: string,
    onPress: () => void,
    type: "number" | "operation" | "special" | "equals" | "clear",
    buttonStyle?: object
  ) => {
    // Get button colors based on type
    const gradientColors = getButtonBackgroundColor(type);
    const textColor = getButtonTextColor(type);

    // Pressed state styling
    const isPressed = pressedButton === text;

    return (
      <TouchableOpacity
        style={[
          styles.buttonOuter,
          buttonStyle,
          isPressed && { transform: [{ scale: 0.95 }] },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={[gradientColors[0], gradientColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.buttonInner, { borderColor: colors.border }]}
        >
          {typeof text === "string" && text.length <= 1 ? (
            <Text
              style={[
                styles.buttonText,
                { color: textColor },
                type === "operation" && { fontWeight: "600" },
                type === "equals" && { fontWeight: "700" },
              ]}
            >
              {text}
            </Text>
          ) : (
            <MaterialIcons
              name={text === "⌫" ? "backspace" : getOperationIcon(text)}
              size={24}
              color={textColor}
            />
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Get operation icon name
  const getOperationIcon = (
    op: string
  ): keyof typeof MaterialIcons.glyphMap => {
    switch (op) {
      case "+":
        return "add";
      case "-":
        return "remove";
      case "×":
        return "close";
      case "÷":
        return "division" as keyof typeof MaterialIcons.glyphMap;
      case "C":
        return "clear-all" as keyof typeof MaterialIcons.glyphMap;
      case "=":
        return "drag-handle" as keyof typeof MaterialIcons.glyphMap;
      default:
        return "functions";
    }
  };

  return (
    <SafeAreaView
      style={[styles.modalContainer, { backgroundColor: "rgba(0,0,0,0.7)" }]}
    >
      <View
        style={[
          styles.calculatorContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Header */}
        <LinearGradient
          colors={headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerContainer}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Calculator
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Display */}
        <LinearGradient
          colors={displayGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.displayContainer, { borderColor: colors.border }]}
        >
          <Text
            style={[styles.displayText, { color: colors.text }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayValue}
          </Text>

          {lastOperation && (
            <View style={styles.operationIndicator}>
              <MaterialIcons
                name={getOperationIcon(lastOperation)}
                size={16}
                color={colors.primary}
              />
            </View>
          )}
        </LinearGradient>

        {/* Button Grid */}
        <View style={styles.buttonGrid}>
          <View style={styles.buttonRow}>
            {renderButton("C", handleClearPress, "clear")}
            {renderButton("⌫", handleBackspacePress, "special")}
            {renderButton("÷", () => handleOperationPress("÷"), "operation")}
          </View>

          <View style={styles.buttonRow}>
            {renderButton("7", () => handleNumberPress("7"), "number")}
            {renderButton("8", () => handleNumberPress("8"), "number")}
            {renderButton("9", () => handleNumberPress("9"), "number")}
            {renderButton("×", () => handleOperationPress("×"), "operation")}
          </View>

          <View style={styles.buttonRow}>
            {renderButton("4", () => handleNumberPress("4"), "number")}
            {renderButton("5", () => handleNumberPress("5"), "number")}
            {renderButton("6", () => handleNumberPress("6"), "number")}
            {renderButton("-", () => handleOperationPress("-"), "operation")}
          </View>

          <View style={styles.buttonRow}>
            {renderButton("1", () => handleNumberPress("1"), "number")}
            {renderButton("2", () => handleNumberPress("2"), "number")}
            {renderButton("3", () => handleNumberPress("3"), "number")}
            {renderButton("+", () => handleOperationPress("+"), "operation")}
          </View>

          <View style={styles.buttonRow}>
            {renderButton("0", () => handleNumberPress("0"), "number")}
            {renderButton(".", handleDecimalPress, "number")}
            {renderButton("=", handleEqualsPress, "equals")}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButtonContainer]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Apply Value</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  calculatorContainer: {
    width: "90%",
    maxWidth: 350,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  displayContainer: {
    margin: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
    justifyContent: "center",
    position: "relative",
  },
  displayText: {
    fontSize: 36,
    fontWeight: "500",
    textAlign: "right",
  },
  operationIndicator: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  buttonGrid: {
    padding: 10,
    paddingTop: 0,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    height: 60,
  },
  buttonOuter: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  buttonInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 15,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "500",
  },
  submitButtonContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default CalculatorModal;
