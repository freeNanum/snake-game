import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import type { Direction } from "@/hooks/use-snake-game";
import * as Haptics from "expo-haptics";

interface DirectionPadProps {
  onPress: (direction: Direction) => void;
  disabled?: boolean;
}

export function DirectionPad({ onPress, disabled }: DirectionPadProps) {
  const handlePress = (dir: Direction) => {
    if (disabled) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(dir);
  };

  return (
    <View style={styles.container}>
      {/* Up */}
      <View style={styles.row}>
        <DPadButton
          direction="UP"
          onPress={handlePress}
          disabled={disabled}
          icon="chevron.up"
        />
      </View>
      {/* Middle row */}
      <View style={styles.row}>
        <DPadButton
          direction="LEFT"
          onPress={handlePress}
          disabled={disabled}
          icon="chevron.left"
        />
        <View style={styles.center} />
        <DPadButton
          direction="RIGHT"
          onPress={handlePress}
          disabled={disabled}
          icon="chevron.right"
        />
      </View>
      {/* Down */}
      <View style={styles.row}>
        <DPadButton
          direction="DOWN"
          onPress={handlePress}
          disabled={disabled}
          icon="chevron.down"
        />
      </View>
    </View>
  );
}

interface DPadButtonProps {
  direction: Direction;
  onPress: (dir: Direction) => void;
  disabled?: boolean;
  icon: string;
}

function DPadButton({ direction, onPress, disabled, icon }: DPadButtonProps) {
  return (
    <Pressable
      onPress={() => onPress(direction)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
    >
      <IconSymbol
        name={icon as any}
        size={28}
        color={disabled ? "#30363D" : "#39D353"}
      />
    </Pressable>
  );
}

const BUTTON_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    backgroundColor: "#21262D",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#30363D",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: "#2D333B",
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  center: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
});
