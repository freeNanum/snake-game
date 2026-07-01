import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
  Platform,
  StatusBar,
} from "react-native";
import { useKeepAwake } from "expo-keep-awake";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { GameBoard } from "@/components/game-board";
import { DirectionPad } from "@/components/direction-pad";
import { useSnakeGame, Direction, Difficulty } from "@/hooks/use-snake-game";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Board size: fits within screen width with padding, max 360
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 16, Math.min(SCREEN_HEIGHT * 0.44, 360));

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: "쉬움",
  NORMAL: "보통",
  HARD: "어려움",
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  EASY: "#39D353",
  NORMAL: "#F59E0B",
  HARD: "#FF4757",
};

export default function GameScreen() {
  useKeepAwake();

  const {
    snake,
    food,
    score,
    highScore,
    status,
    difficulty,
    gridSize,
    setDifficulty,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  } = useSnakeGame();

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStart.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: GestureResponderEvent) => {
      if (!touchStart.current || status !== "PLAYING") return;
      const dx = e.nativeEvent.pageX - touchStart.current.x;
      const dy = e.nativeEvent.pageY - touchStart.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      const threshold = 20;

      if (Math.max(absDx, absDy) < threshold) return;

      let dir: Direction;
      if (absDx > absDy) {
        dir = dx > 0 ? "RIGHT" : "LEFT";
      } else {
        dir = dy > 0 ? "DOWN" : "UP";
      }
      changeDirection(dir);
      touchStart.current = null;
    },
    [status, changeDirection]
  );

  const handlePause = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (status === "PLAYING") pauseGame();
    else if (status === "PAUSED") resumeGame();
  }, [status, pauseGame, resumeGame]);

  const handleStart = useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    startGame();
  }, [startGame]);

  const isIdle = status === "IDLE";
  const isPlaying = status === "PLAYING";
  const isPaused = status === "PAUSED";
  const isGameOver = status === "GAME_OVER";
  const showOverlay = isIdle || isPaused || isGameOver;
  const showDifficulty = isIdle || isGameOver;
  const showGameControls = isPlaying || isPaused;

  return (
    <ScreenContainer
      containerClassName="bg-background"
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>점수</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.title}>SNAKE</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>최고</Text>
          <Text style={[styles.scoreValue, styles.highScoreValue]}>
            {highScore}
          </Text>
        </View>
      </View>

      {/* Game Board */}
      <View
        style={[styles.boardWrapper, { width: BOARD_SIZE, height: BOARD_SIZE }]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <GameBoard
          snake={snake}
          food={food}
          gridSize={gridSize}
          boardSize={BOARD_SIZE}
        />

        {/* Overlay */}
        {showOverlay && (
          <View style={[styles.overlay, { width: BOARD_SIZE, height: BOARD_SIZE }]}>
            {isIdle && (
              <View style={styles.overlayContent}>
                <Text style={styles.overlayEmoji}>🐍</Text>
                <Text style={styles.overlayTitle}>SNAKE</Text>
                <Text style={styles.overlayHint}>
                  스와이프 또는 버튼으로 조종하세요
                </Text>
              </View>
            )}
            {isGameOver && (
              <View style={styles.overlayContent}>
                <Text style={styles.overlayEmoji}>💀</Text>
                <Text style={[styles.overlayTitle, { color: "#FF4757" }]}>
                  GAME OVER
                </Text>
                <Text style={styles.overlayScore}>점수: {score}</Text>
                {score > 0 && score >= highScore && (
                  <Text style={styles.newRecord}>🏆 신기록!</Text>
                )}
              </View>
            )}
            {isPaused && (
              <View style={styles.overlayContent}>
                <Text style={styles.overlayEmoji}>⏸️</Text>
                <Text style={styles.overlayTitle}>일시정지</Text>
                <Text style={styles.overlayHint}>탭하여 재개</Text>
              </View>
            )}
          </View>
        )}

        {/* In-game pause button */}
        {isPlaying && (
          <Pressable
            onPress={handlePause}
            style={({ pressed }) => [
              styles.pauseBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.pauseBtnText}>⏸</Text>
          </Pressable>
        )}
      </View>

      {/* Difficulty selector */}
      {showDifficulty && (
        <View style={styles.difficultyRow}>
          {(["EASY", "NORMAL", "HARD"] as Difficulty[]).map((d) => (
            <Pressable
              key={d}
              onPress={() => setDifficulty(d)}
              style={({ pressed }) => [
                styles.diffBtn,
                difficulty === d && {
                  backgroundColor: DIFFICULTY_COLORS[d] + "22",
                  borderColor: DIFFICULTY_COLORS[d],
                },
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.diffBtnText,
                  {
                    color:
                      difficulty === d ? DIFFICULTY_COLORS[d] : "#8B949E",
                  },
                ]}
              >
                {DIFFICULTY_LABELS[d]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Bottom controls */}
      <View style={styles.controls}>
        {showDifficulty && (
          <Pressable
            onPress={handleStart}
            style={({ pressed }) => [
              styles.startBtn,
              pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
            ]}
          >
            <Text style={styles.startBtnText}>
              {isGameOver ? "다시 하기" : "게임 시작"}
            </Text>
          </Pressable>
        )}

        {showGameControls && (
          <View style={styles.gameControls}>
            <Pressable
              onPress={handlePause}
              style={({ pressed }) => [
                styles.controlBtn,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.controlBtnText}>
                {isPaused ? "▶  재개" : "⏸  일시정지"}
              </Text>
            </Pressable>
            <DirectionPad
              onPress={changeDirection}
              disabled={isPaused}
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  scoreBox: {
    alignItems: "center",
    minWidth: 72,
  },
  scoreLabel: {
    fontSize: 11,
    color: "#8B949E",
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  highScoreValue: {
    color: "#F59E0B",
  },
  titleBox: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#39D353",
    letterSpacing: 8,
  },
  boardWrapper: {
    alignSelf: "center",
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(13, 17, 23, 0.88)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  overlayContent: {
    alignItems: "center",
    gap: 10,
  },
  overlayEmoji: {
    fontSize: 52,
  },
  overlayTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#39D353",
    letterSpacing: 4,
  },
  overlayHint: {
    fontSize: 14,
    color: "#8B949E",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  overlayScore: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  newRecord: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F59E0B",
  },
  pauseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    backgroundColor: "rgba(13, 17, 23, 0.75)",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  pauseBtnText: {
    fontSize: 15,
  },
  difficultyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  diffBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#30363D",
    alignItems: "center",
    backgroundColor: "#161B22",
  },
  diffBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  controls: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },
  startBtn: {
    backgroundColor: "#39D353",
    paddingHorizontal: 52,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#39D353",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D1117",
    letterSpacing: 1,
  },
  gameControls: {
    alignItems: "center",
    gap: 14,
    width: "100%",
  },
  controlBtn: {
    backgroundColor: "#21262D",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#30363D",
  },
  controlBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8B949E",
  },
});
