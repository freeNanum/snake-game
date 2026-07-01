import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type GameStatus = "IDLE" | "PLAYING" | "PAUSED" | "GAME_OVER";
export type Difficulty = "EASY" | "NORMAL" | "HARD";

export interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;

export const SPEED: Record<Difficulty, number> = {
  EASY: 200,
  NORMAL: 140,
  HARD: 90,
};

export const SCORE_MULTIPLIER: Record<Difficulty, number> = {
  EASY: 1,
  NORMAL: 2,
  HARD: 3,
};

const HIGH_SCORE_KEY = "snake_high_score";

function randomPosition(exclude: Position[]): Position {
  let pos: Position;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
    if (attempts > 200) break;
  } while (exclude.some((p) => p.x === pos.x && p.y === pos.y));
  return pos;
}

function getInitialSnake(): Position[] {
  const mid = Math.floor(GRID_SIZE / 2);
  return [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
}

export function useSnakeGame() {
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficultyState] = useState<Difficulty>("NORMAL");

  const [snake, setSnake] = useState<Position[]>(() => getInitialSnake());
  const [food, setFood] = useState<Position>(() =>
    randomPosition(getInitialSnake())
  );
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>("IDLE");

  // Refs for game loop (avoid stale closures)
  const stateRef = useRef({
    snake: getInitialSnake(),
    food: randomPosition(getInitialSnake()),
    direction: "RIGHT" as Direction,
    score: 0,
    status: "IDLE" as GameStatus,
    difficulty: "NORMAL" as Difficulty,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load high score on mount
  useEffect(() => {
    AsyncStorage.getItem(HIGH_SCORE_KEY).then((val) => {
      if (val) setHighScore(parseInt(val, 10));
    });
  }, []);

  const saveHighScore = useCallback(async (newScore: number) => {
    const stored = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    const current = stored ? parseInt(stored, 10) : 0;
    if (newScore > current) {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, String(newScore));
      setHighScore(newScore);
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const { snake: currentSnake, direction: currentDir, food: currentFood, difficulty: diff } =
      stateRef.current;

    const head = currentSnake[0];
    let newHead: Position;

    switch (currentDir) {
      case "UP":
        newHead = { x: head.x, y: head.y - 1 };
        break;
      case "DOWN":
        newHead = { x: head.x, y: head.y + 1 };
        break;
      case "LEFT":
        newHead = { x: head.x - 1, y: head.y };
        break;
      default: // RIGHT
        newHead = { x: head.x + 1, y: head.y };
        break;
    }

    // Wall collision
    if (
      newHead.x < 0 ||
      newHead.x >= GRID_SIZE ||
      newHead.y < 0 ||
      newHead.y >= GRID_SIZE
    ) {
      stopLoop();
      stateRef.current.status = "GAME_OVER";
      setStatus("GAME_OVER");
      saveHighScore(stateRef.current.score);
      return;
    }

    // Self collision (exclude tail since it will move)
    const bodyToCheck = currentSnake.slice(0, currentSnake.length - 1);
    if (bodyToCheck.some((p) => p.x === newHead.x && p.y === newHead.y)) {
      stopLoop();
      stateRef.current.status = "GAME_OVER";
      setStatus("GAME_OVER");
      saveHighScore(stateRef.current.score);
      return;
    }

    const ateFood =
      newHead.x === currentFood.x && newHead.y === currentFood.y;
    let newSnake: Position[];

    if (ateFood) {
      newSnake = [newHead, ...currentSnake];
      const newFood = randomPosition(newSnake);
      stateRef.current.food = newFood;
      setFood({ ...newFood });
      const addedScore = 10 * SCORE_MULTIPLIER[diff];
      const newScore = stateRef.current.score + addedScore;
      stateRef.current.score = newScore;
      setScore(newScore);
    } else {
      newSnake = [newHead, ...currentSnake.slice(0, currentSnake.length - 1)];
    }

    stateRef.current.snake = newSnake;
    setSnake([...newSnake]);
  }, [stopLoop, saveHighScore]);

  const startLoop = useCallback(
    (diff: Difficulty) => {
      stopLoop();
      intervalRef.current = setInterval(tick, SPEED[diff]);
    },
    [stopLoop, tick]
  );

  const startGame = useCallback(() => {
    stopLoop();
    const newSnake = getInitialSnake();
    const newFood = randomPosition(newSnake);
    const diff = stateRef.current.difficulty;

    stateRef.current = {
      snake: newSnake,
      food: newFood,
      direction: "RIGHT",
      score: 0,
      status: "PLAYING",
      difficulty: diff,
    };

    setSnake([...newSnake]);
    setFood({ ...newFood });
    setDirection("RIGHT");
    setScore(0);
    setStatus("PLAYING");
    startLoop(diff);
  }, [stopLoop, startLoop]);

  const pauseGame = useCallback(() => {
    if (stateRef.current.status !== "PLAYING") return;
    stopLoop();
    stateRef.current.status = "PAUSED";
    setStatus("PAUSED");
  }, [stopLoop]);

  const resumeGame = useCallback(() => {
    if (stateRef.current.status !== "PAUSED") return;
    stateRef.current.status = "PLAYING";
    setStatus("PLAYING");
    startLoop(stateRef.current.difficulty);
  }, [startLoop]);

  const changeDirection = useCallback((newDir: Direction) => {
    const current = stateRef.current.direction;
    if (
      (current === "UP" && newDir === "DOWN") ||
      (current === "DOWN" && newDir === "UP") ||
      (current === "LEFT" && newDir === "RIGHT") ||
      (current === "RIGHT" && newDir === "LEFT")
    ) {
      return;
    }
    stateRef.current.direction = newDir;
    setDirection(newDir);
  }, []);

  const setDifficulty = useCallback((diff: Difficulty) => {
    stateRef.current.difficulty = diff;
    setDifficultyState(diff);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopLoop();
  }, [stopLoop]);

  return {
    snake,
    food,
    direction,
    score,
    highScore,
    status,
    difficulty,
    gridSize: GRID_SIZE,
    setDifficulty,
    startGame,
    pauseGame,
    resumeGame,
    changeDirection,
  };
}
