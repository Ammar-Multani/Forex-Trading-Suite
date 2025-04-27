<TextInput
label="Risk"
value={riskInputType === "percentage" ? riskPercentage : riskAmount}
onChangeText={riskInputType === "percentage" ? setRiskPercentage : setRiskAmount}
keyboardType="numeric"
style={styles.textInput}
mode="outlined"
outlineColor={isDark ? "#444" : "#ddd"}
activeOutlineColor="#6200ee"
textColor={isDark ? "#fff" : "#000"}
theme={{
  colors: {
    background: isDark ? "#2A2A2A" : "#f5f5f5",
    onSurfaceVariant: isDark ? "#aaa" : "#666",
  },
}}
right={
  <TextInput.Affix
    text={
      <TouchableOpacity
        onPress={() => setStopLossTypeModalVisible(true)}
        style={styles.selectorButton}
      >
        <View style={styles.selectorButtonContent}>
          <Text style={styles.selectorText}>
            {riskInputType === "percentage" ? "%" : accountCurrency}
          </Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={isDark ? "#aaa" : "#666"}
            style={{ marginLeft: 4 }}
          />
        </View>
      </TouchableOpacity>
    }
  />
}
/>