import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { LotSize } from "../../constants/lotSizes";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface LotSizeEditorModalProps {
  lotSizes: Record<string, LotSize>;
  onSave: (newLotSizes: Record<string, LotSize>) => void;
  onClose: () => void;
}

const LotSizeEditorModal: React.FC<LotSizeEditorModalProps> = ({
  lotSizes,
  onSave,
  onClose,
}) => {
  const { colors, theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [editedLotSizes, setEditedLotSizes] = useState<Record<string, LotSize>>(
    {}
  );

  // Initialize with the current lot sizes
  useEffect(() => {
    setEditedLotSizes({ ...lotSizes });
  }, [lotSizes]);

  // Update a lot size
  const handleUpdateLotSize = (type: string, value: string) => {
    const numValue = parseInt(value.replace(/[^0-9]/g, ""));
    if (!isNaN(numValue)) {
      setEditedLotSizes((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          value: numValue,
        },
      }));
    }
  };

  // Handle save
  const handleSave = () => {
    // Check if any lot size is zero
    const hasZeroSize = Object.values(editedLotSizes).some(
      (size) => size.value === 0
    );
    if (hasZeroSize) {
      Alert.alert(
        "Invalid Lot Size",
        "Lot sizes cannot be zero. Please enter valid values.",
        [{ text: "OK" }]
      );
      return;
    }

    onSave(editedLotSizes);
    onClose();
  };

  // Get gradient colors based on theme (fix the tuple type issue)
  const gradientColors = isDarkMode
    ? ([colors.card, colors.background] as const)
    : (["#6c8cf2", "#6c8cf2"] as const);

  // Render a lot size item for FlatList
  const renderLotSizeItem = ({ item }: { item: string }) => {
    return (
      <View
        style={[
          styles.lotSizeItem,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              },
              android: {
                elevation: 2,
              },
            }),
          },
        ]}
      >
        <Text style={[styles.lotSizeLabel, { color: colors.text }]}>
          {item}
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={
              editedLotSizes[item] ? editedLotSizes[item].value.toString() : "0"
            }
            onChangeText={(text) => handleUpdateLotSize(item, text)}
            keyboardType="numeric"
            placeholder="Units"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={[styles.unitLabel, { color: colors.subtext }]}>
            units
          </Text>
        </View>
      </View>
    );
  };

  // Extract lot size types for FlatList data
  const lotSizeTypes = Object.keys(editedLotSizes);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header]}
      >
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons
            name="close"
            size={24}
            color={isDarkMode ? colors.text : "#fff"}
          />
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: isDarkMode ? colors.text : "#fff" }]}
        >
          Edit Lot Sizes
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <MaterialIcons
            name="check"
            size={24}
            color={isDarkMode ? colors.text : "#fff"}
          />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={lotSizeTypes}
        keyExtractor={(item) => item}
        renderItem={renderLotSizeItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Text style={[styles.description, { color: colors.subtext }]}>
            Customize the number of units for each lot size type below:
          </Text>
        }
        ListFooterComponent={
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  closeButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  lotSizeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  lotSizeLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    width: 100,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: "center",
  },
  unitLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default LotSizeEditorModal;
