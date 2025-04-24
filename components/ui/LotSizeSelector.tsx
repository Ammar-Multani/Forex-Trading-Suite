import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
  FlatList,
  Animated,
  Dimensions,
  LayoutChangeEvent,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import {
  LotSize,
  LotType,
  formatLotSize,
  calculateTotalUnits,
} from "../../constants/lotSizes";
import { MaterialIcons } from "@expo/vector-icons";
import CalculatorModal from "./CalculatorModal";

interface LotSizeSelectorProps {
  label: string;
  lotType: LotType;
  lotCount: number;
  customUnits: number;
  lotSizes: Record<string, LotSize>;
  onLotTypeChange: (type: LotType) => void;
  onLotCountChange: (count: number) => void;
  onCustomUnitsChange: (units: number) => void;
  onEditPress: () => void;
}

const LotSizeSelector: React.FC<LotSizeSelectorProps> = ({
  label,
  lotType,
  lotCount,
  customUnits,
  lotSizes,
  onLotTypeChange,
  onLotCountChange,
  onCustomUnitsChange,
  onEditPress,
}) => {
  
  const { colors, isDark } = useTheme();
  const lotTypes = Object.keys(lotSizes);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [calculatorVisible, setCalculatorVisible] = useState(false);
  const [calculatorTarget, setCalculatorTarget] = useState<
    "lotCount" | "customUnits"
  >("lotCount");
  const animatedValue = useRef(new Animated.Value(0)).current;
  const dropdownButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Calculate total units
  const totalUnits = calculateTotalUnits(
    lotType,
    lotCount,
    customUnits,
    lotSizes
  );

  // Measure dropdown button position
  const measureDropdownButton = () => {
    if (dropdownButtonRef.current) {
      dropdownButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          top: pageY + height,
          left: pageX,
          width: width,
        });
      });
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      measureDropdownButton();
      setIsDropdownOpen(true);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsDropdownOpen(false);
      });
    }
  };

  const closeDropdown = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsDropdownOpen(false);
    });
  };

  const selectLotType = (type: LotType) => {
    onLotTypeChange(type);
    closeDropdown();
  };

  const handleCalculatorSubmit = (calculatedValue: number) => {
    if (calculatorTarget === "lotCount") {
      onLotCountChange(Math.max(0, Math.round(calculatedValue)));
    } else {
      onCustomUnitsChange(Math.max(0, Math.round(calculatedValue)));
    }
    setCalculatorVisible(false);
  };

  const openCalculator = (target: "lotCount" | "customUnits") => {
    setCalculatorTarget(target);
    setCalculatorVisible(true);
  };

  // Animations
  const dropdownOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const dropdownScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.95, 1],
  });

  const dropdownTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  // Render dropdown item
  const renderDropdownItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        item === lotType && {
          backgroundColor: colors.primary + "15",
        },
      ]}
      onPress={() => selectLotType(item as LotType)}
    >
      <Text
        style={[
          styles.dropdownItemText,
          { color: colors.text },
          item === lotType && {
            color: colors.primary,
            fontWeight: "bold",
          },
        ]}
      >
        {item}
      </Text>
      {item === lotType && (
        <MaterialIcons name="check" color={colors.primary} size={18} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.selectorRow}>
        <Text style={[styles.sectionLabel, { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" }]}>
          Lot Type:
        </Text>
        <View style={styles.dropdownContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.dropdownButton,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={toggleDropdown}
            ref={dropdownButtonRef}
          >
            <Text style={[styles.dropdownButtonText, { color: colors.text }]}>
              {lotType}
            </Text>
            <MaterialIcons
              name={
                isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"
              }
              color={colors.primary}
              size={24}
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <Modal
              visible={isDropdownOpen}
              transparent={true}
              animationType="none"
              statusBarTranslucent={true}
              onRequestClose={closeDropdown}
            >
              <TouchableOpacity
                style={styles.dropdownOverlay}
                activeOpacity={1}
                onPress={closeDropdown}
              >
                <Animated.View
                  style={[
                    styles.dropdownListContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                      opacity: dropdownOpacity,
                      transform: [
                        { scale: dropdownScale },
                        { translateY: dropdownTranslateY },
                      ],
                    },
                  ]}
                >
                  <FlatList
                    data={lotTypes}
                    renderItem={renderDropdownItem}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.dropdownList}
                  />
                </Animated.View>
              </TouchableOpacity>
            </Modal>
          )}
        </View>
      </View>

      <View style={styles.selectorRow}>
        <Text style={[styles.sectionLabel, { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" }]}>
          {lotType === "Custom" ? "Units:" : "Count:"}
        </Text>
        <View style={styles.countContainer}>
          {lotType === "Custom" ? (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                    paddingRight: 45, // Make room for calculator icon
                  },
                ]}
                value={customUnits.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                  onCustomUnitsChange(value);
                }}
                keyboardType="numeric"
                placeholder="Units"
                placeholderTextColor={colors.placeholder}
                textAlign="center"
                returnKeyType="done"
                maxLength={10}
              />
              <TouchableOpacity
                style={[
                  styles.calculatorButton,
                  { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => openCalculator("customUnits")}
              >
                <MaterialIcons
                  name="calculate"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inputWrapper}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                    paddingRight: 45, // Make room for calculator icon
                  },
                ]}
                value={lotCount.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text.replace(/[^0-9]/g, "")) || 0;
                  onLotCountChange(value);
                }}
                keyboardType="numeric"
                placeholder="Count"
                placeholderTextColor={colors.placeholder}
                textAlign="center"
                returnKeyType="done"
                maxLength={10}
              />
              <TouchableOpacity
                style={[
                  styles.calculatorButton,
                  { backgroundColor: colors.primary + "15" },
                ]}
                onPress={() => openCalculator("lotCount")}
              >
                <MaterialIcons
                  name="calculate"
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={onEditPress}
        >
          <MaterialIcons name="edit" size={16} color="#fff" />
          <Text style={styles.editButtonText}>Edit Lot Values</Text>
        </TouchableOpacity>

        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)" }]}>
            Total Units:
          </Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>
            {totalUnits.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Calculator Modal */}
      <Modal
        visible={calculatorVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCalculatorVisible(false)}
        statusBarTranslucent={true}
      >
        <CalculatorModal
          onClose={() => setCalculatorVisible(false)}
          onSubmit={handleCalculatorSubmit}
          initialValue={
            calculatorTarget === "lotCount"
              ? lotCount.toString()
              : customUnits.toString()
          }
        />
      </Modal>
    </View>
  );
};

const { width: windowWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    paddingBottom: 4,
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  sectionLabel: {
    fontSize: 14,
    width: 80,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  dropdownListContainer: {
    position: "absolute",
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 200,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dropdownList: {
    padding: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  countContainer: {
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
    textAlign: "center",
    fontWeight: "500",
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
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 4,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 10,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LotSizeSelector;
