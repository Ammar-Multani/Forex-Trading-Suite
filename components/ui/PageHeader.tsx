import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
  Animated,
  Easing,
  KeyboardAvoidingView,
} from "react-native";
import { Text, IconButton } from "react-native-paper";
import { useTheme } from "../../contexts/ThemeContext";
import BackButton from "./BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  infoContent?: string;
  gradient?: boolean;
}

const PageHeader = ({
  title,
  subtitle,
  showBackButton = true,
  infoContent,
  gradient = false,
}: PageHeaderProps) => {
  const { isDark } = useTheme();
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const scrollViewRef = useRef(null);

  const showInfoModal = () => {
    setInfoModalVisible(true);
  };

  const hideInfoModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setInfoModalVisible(false);
    });
  };

  useEffect(() => {
    if (infoModalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start();
    }
  }, [infoModalVisible]);

  const renderHeader = () => {
    return (
      <>
        <View
          style={[
            styles.pageHeader,
            {
              backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF",
              borderBottomColor: isDark
                ? "rgba(75, 75, 75, 0.3)"
                : "rgba(244, 238, 255, 0.8)",
            },
          ]}
        >
          <LinearGradient
            colors={
              isDark
                ? ["rgba(40, 40, 40, 0.8)", "rgba(30, 30, 30, 0.8)"]
                : ["rgba(255, 255, 255, 1)", "rgba(250, 250, 250, 0.95)"]
            }
            style={styles.headerGradient}
          >
            <View style={styles.headerRow}>
              <View style={styles.leftSection}>
                {showBackButton && <BackButton />}
                <View style={styles.titleContainer}>
                  <Text
                    style={[
                      styles.pageTitle,
                      { color: isDark ? "#ffffff" : "#000000" },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {title}
                  </Text>
                  {subtitle && (
                    <Text
                      style={[
                        styles.pageSubtitle,
                        {
                          color: isDark
                            ? "rgba(255, 255, 255, 0.7)"
                            : "rgba(0, 0, 0, 0.6)",
                        },
                      ]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {subtitle}
                    </Text>
                  )}
                </View>
              </View>

              {infoContent && (
                <TouchableOpacity
                  onPress={showInfoModal}
                  style={[
                    styles.infoButton,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={24}
                    color={isDark ? "#E6E6FA" : "#483D8B"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Info Modal */}
        <Modal
          animationType="none"
          transparent={true}
          visible={infoModalVisible}
          onRequestClose={hideInfoModal}
          statusBarTranslucent={true}
        >
          <View style={styles.centeredModalView}>
            <TouchableWithoutFeedback onPress={hideInfoModal}>
              <BlurView
                intensity={isDark ? 100 : 100}
                tint={isDark ? "dark" : "light"}
                style={styles.modalOverlay}
              />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark ? "#2A2A2A" : "#ffffff",
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.modalHeaderContainer}>
                <LinearGradient
                  colors={
                    isDark
                      ? ["rgba(40, 40, 40, 0.8)", "rgba(30, 30, 30, 0.8)"]
                      : ["rgba(255, 255, 255, 1)", "rgba(250, 250, 250, 0.95)"]
                  }
                  style={styles.modalHeader}
                >
                  <Text
                    style={[
                      styles.modalTitle,
                      { color: isDark ? "#fff" : "#000" },
                    ]}
                    numberOfLines={1}
                  >
                    {title} Guide
                  </Text>
                  <TouchableOpacity
                    onPress={hideInfoModal}
                    style={[
                      styles.closeButton,
                      {
                        backgroundColor: isDark
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="close"
                      size={22}
                      color={isDark ? "#E6E6FA" : "#483D8B"}
                    />
                  </TouchableOpacity>
                </LinearGradient>
              </View>

              <View style={styles.modalScrollContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.modalScrollContent}
                  contentContainerStyle={styles.scrollContentContainer}
                  showsVerticalScrollIndicator={true}
                  scrollEventThrottle={16}
                  bounces={true}
                  nestedScrollEnabled={true}
                  overScrollMode="always"
                  persistentScrollbar={true}
                >
                  <Text
                    style={[
                      styles.modalText,
                      { color: isDark ? "#e0e0e0" : "#333" },
                    ]}
                  >
                    {infoContent}
                  </Text>
                </ScrollView>
              </View>

              <View
                style={[
                  styles.modalFooter,
                  {
                    borderTopColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.1)",
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.doneButton,
                    { backgroundColor: isDark ? "#6200EE" : "#6200EE" },
                  ]}
                  onPress={hideInfoModal}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </>
    );
  };

  return renderHeader();
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  pageHeader: {
    height: Platform.OS === "ios" ? 95 : 95,
    paddingBottom: 16,
    borderBottomWidth: 1,
    elevation: 3,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: "400",
  },
  infoButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderRadius: 19,
  },
  centeredModalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 20,
    padding: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
    overflow: "hidden",
    flexDirection: "column",
  },
  modalHeaderContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.2,
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 17,
  },
  modalScrollContainer: {
    flex: 1,
    minHeight: 300,
    maxHeight: height * 0.65,
  },
  modalScrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContentContainer: {
    paddingVertical: 20,
    paddingBottom: 30,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  modalFooter: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  doneButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 30,
    minWidth: 120,
    alignItems: "center",
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PageHeader;
