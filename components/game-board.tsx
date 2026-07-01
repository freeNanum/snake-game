import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import type { Position } from "@/hooks/use-snake-game";

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  boardSize: number;
}

const SNAKE_HEAD_COLOR = "#56E86A";
const SNAKE_BODY_COLOR = "#39D353";
const SNAKE_BORDER_COLOR = "#2AB344";
const FOOD_COLOR = "#FF4757";
const FOOD_BORDER_COLOR = "#CC2F3F";
const BOARD_BG = "#161B22";
const GRID_LINE_COLOR = "#1E2530";

export const GameBoard = memo(function GameBoard({
  snake,
  food,
  gridSize,
  boardSize,
}: GameBoardProps) {
  const cellSize = boardSize / gridSize;

  const snakeSet = new Set(snake.map((p) => `${p.x},${p.y}`));

  return (
    <View
      style={[
        styles.board,
        { width: boardSize, height: boardSize, backgroundColor: BOARD_BG },
      ]}
    >
      {/* Grid lines */}
      {Array.from({ length: gridSize - 1 }).map((_, i) => (
        <React.Fragment key={`grid-${i}`}>
          <View
            style={[
              styles.gridLineH,
              {
                top: (i + 1) * cellSize,
                width: boardSize,
                backgroundColor: GRID_LINE_COLOR,
              },
            ]}
          />
          <View
            style={[
              styles.gridLineV,
              {
                left: (i + 1) * cellSize,
                height: boardSize,
                backgroundColor: GRID_LINE_COLOR,
              },
            ]}
          />
        </React.Fragment>
      ))}

      {/* Food */}
      <View
        style={[
          styles.cell,
          {
            left: food.x * cellSize + 1,
            top: food.y * cellSize + 1,
            width: cellSize - 2,
            height: cellSize - 2,
            backgroundColor: FOOD_COLOR,
            borderColor: FOOD_BORDER_COLOR,
            borderRadius: (cellSize - 2) / 2,
          },
        ]}
      />

      {/* Snake */}
      {snake.map((pos, index) => {
        const isHead = index === 0;
        return (
          <View
            key={`snake-${index}`}
            style={[
              styles.cell,
              {
                left: pos.x * cellSize + 1,
                top: pos.y * cellSize + 1,
                width: cellSize - 2,
                height: cellSize - 2,
                backgroundColor: isHead ? SNAKE_HEAD_COLOR : SNAKE_BODY_COLOR,
                borderColor: SNAKE_BORDER_COLOR,
                borderRadius: isHead ? (cellSize - 2) / 4 : (cellSize - 2) / 6,
                borderWidth: 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  board: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#30363D",
    zIndex: 1,
  },
  cell: {
    position: "absolute",
  },
  gridLineH: {
    position: "absolute",
    height: 1,
    left: 0,
  },
  gridLineV: {
    position: "absolute",
    width: 1,
    top: 0,
  },
});
