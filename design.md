# Snake Game - Design Plan

## App Concept
클래식 Snake 게임의 모바일 버전. 뱀을 조종해 음식을 먹고 점수를 올리는 아케이드 게임.

## Color Palette
- **Background**: `#0D1117` (딥 다크 그린-블랙)
- **Game Board**: `#161B22` (다크 그린 보드)
- **Snake Body**: `#39D353` (네온 그린)
- **Snake Head**: `#56E86A` (밝은 네온 그린)
- **Food**: `#FF4757` (빨간 사과 느낌)
- **Score Text**: `#FFFFFF`
- **Primary Accent**: `#39D353`
- **Surface**: `#21262D`
- **Border**: `#30363D`

## Screen List

### 1. Home Screen (시작 화면)
- 앱 로고 및 타이틀 "SNAKE"
- 최고 점수 표시
- "PLAY" 버튼 (크고 눈에 띄는 네온 그린)
- "HOW TO PLAY" 버튼
- 난이도 선택 (Easy / Normal / Hard)

### 2. Game Screen (게임 화면)
- 상단: 현재 점수, 최고 점수
- 중앙: 게임 보드 (그리드 기반)
  - 뱀 (머리 + 몸통)
  - 음식 아이템
  - 그리드 라인 (희미하게)
- 하단: 방향 조작 버튼 (상/하/좌/우 D-pad)
- 일시정지 버튼 (우측 상단)
- 스와이프 제스처 지원

### 3. Pause Screen (일시정지 오버레이)
- 반투명 오버레이
- "PAUSED" 텍스트
- "RESUME" 버튼
- "RESTART" 버튼
- "HOME" 버튼

### 4. Game Over Screen (게임 오버 오버레이)
- "GAME OVER" 텍스트 (애니메이션)
- 최종 점수
- 최고 점수 (신기록 시 강조)
- "PLAY AGAIN" 버튼
- "HOME" 버튼

## Key User Flows

### 메인 게임 플로우
1. 홈 화면 → 난이도 선택 → "PLAY" 탭
2. 게임 화면 → 스와이프/버튼으로 뱀 조종
3. 음식 먹기 → 점수 증가 + 뱀 길이 증가
4. 벽 또는 자신과 충돌 → 게임 오버 화면
5. "PLAY AGAIN" → 새 게임 시작

### 일시정지 플로우
1. 게임 중 → 일시정지 버튼 탭
2. 일시정지 오버레이 표시
3. "RESUME" → 게임 재개

## Game Mechanics

### 그리드 시스템
- 20x20 그리드
- 각 셀 크기: 화면 너비 / 20

### 뱀 이동
- 일정 간격(ms)으로 자동 이동
- Easy: 200ms, Normal: 150ms, Hard: 100ms

### 점수 시스템
- 음식 1개 먹을 때마다 +10점
- 난이도 배수: Easy x1, Normal x1.5, Hard x2

### 충돌 감지
- 벽 충돌 (경계 밖)
- 자기 자신과 충돌

## Layout (Mobile Portrait 9:16)
- 상단 헤더: 점수 영역 (약 15% 높이)
- 게임 보드: 정사각형 (약 55% 높이)
- 하단 컨트롤: D-pad (약 30% 높이)
