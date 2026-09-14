export type GameMode = 'ai' | 'pvp';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type PieceColor = 'w' | 'b';

export type PieceSymbol = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface PlayerInfo {
  name: string;
  color: PieceColor;
  rating: number;
}

export interface PlayerRanking {
  id: string;
  name: string;
  rating: number; // Elo-like points (starting 1200)
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winStreak: number;
  lastPlayed: number;
}

export interface MatchHistoryItem {
  id: string;
  date: string;
  mode: GameMode;
  whiteName: string;
  blackName: string;
  winner: 'w' | 'b' | 'draw' | null;
  winReason: string;
  totalMoves: number;
  durationSeconds: number;
}

export interface MoveHistoryItem {
  from: string;
  to: string;
  san: string;
  piece: PieceSymbol;
  color: PieceColor;
  captured?: PieceSymbol;
  timeTaken?: number;
}

export type BoardTheme = 'walnut' | 'mahogany' | 'oak' | 'tournament' | 'ebony' | 'marble';
