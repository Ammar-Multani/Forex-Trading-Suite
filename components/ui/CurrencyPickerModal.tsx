import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  TextInput,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useTheme } from "../../contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  currencies,
  Currency,
  filterCurrencies,
} from "../../constants/currencies";

interface CurrencyPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (currency: Currency) => void;
  selectedCurrency: string;
  title?: string;
}

const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCurrency,
  title = "Select Currency",
}) => {
  const { isDark, theme, colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter currencies based on search query
  const filteredCurrencies = searchQuery
    ? filterCurrencies(searchQuery)
    : currencies;

  // Render each currency item
  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = selectedCurrency === item.code;

    return (
      <TouchableOpacity
        style={[
          styles.currencyItem,
          { backgroundColor: theme.colors.surface },
          isSelected && {
            backgroundColor: isDark
              ? `${colors.primary}20`
              : `${colors.primary}10`,
            borderColor: colors.primary,
            borderWidth: 1,
          },
        ]}
        onPress={() => {
          onSelect(item);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.currencyItemLeft}>
          <Image
            source={{
              uri: `https://flagcdn.com/w160/${item.countryCode.toLowerCase()}.png`,
            }}
            style={styles.flag}
            resizeMode="cover"
          />
          <View style={styles.currencyInfo}>
            <Text style={[styles.currencyCode, { color: theme.colors.text }]}>
              {item.code}
            </Text>
            <Text
              style={[
                styles.currencyName,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.name}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.symbolContainer,
            {
              backgroundColor: isDark ? theme.colors.surfaceVariant : "#f0f0f0",
              borderColor: isDark ? theme.colors.border : "#ccc",
            },
            isSelected && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.symbolText,
              { color: colors.primary },
              isSelected && { color: "#fff" },
            ]}
          >
            {item.symbol}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView
        style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar barStyle={isDark ? "light-content" : "light-content"} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Box */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchBox,
              {
                backgroundColor: theme.colors.surface,
                shadowColor: isDark ? "#000" : "#000",
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.colors.onSurfaceVariant}
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search currencies..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Currency List */}
        <FlatList
          data={filteredCurrencies}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.code}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    height: 90,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
  },
  searchContainer: {
    padding: 18,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  currencyItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  currencyItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  flag: {
    width: 32,
    height: 22,
    borderRadius: 3,
    marginRight: 12,
    borderWidth: 0.3,
    borderColor: "#ccc",
  },
  currencyInfo: {
    flexDirection: "column",
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 14,
  },
  symbolContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.3,
  },
  symbolText: {
    fontSize: 13,
    fontWeight: "600",
  },
  checkContainer: {
    position: "absolute",
    right: 70,
    top: "50%",
    marginTop: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CurrencyPickerModal;
export { Currency };
