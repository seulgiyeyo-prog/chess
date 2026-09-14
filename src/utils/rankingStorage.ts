import { PlayerRanking, MatchHistoryItem, GameMode } from '../types';

const RANKING_STORAGE_KEY = 'math_chess_rankings_v2';
const MATCH_STORAGE_KEY = 'math_chess_matches_v2';

// Clean initial rankings (empty slate for genuine records to accumulate)
export const DEFAULT_RANKINGS: PlayerRanking[] = [];

/**
 * Get current rankings from localStorage.
 * Automatically purges legacy v1 mock seed data if detected.
 */
export function getRankings(): PlayerRanking[] {
  if (typeof window === 'undefined') return [];
  try {
    // Clear legacy v1 mock seeds if present
    if (localStorage.getItem('math_chess_rankings_v1')) {
      localStorage.removeItem('math_chess_rankings_v1');
      localStorage.removeItem('math_chess_matches_v1');
    }

    const raw = localStorage.getItem(RANKING_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter out any legacy dummy seeds if they ever got stored
    const cleaned = parsed.filter((p: PlayerRanking) => !p.id?.startsWith('seed-'));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(cleaned));
    }

    return cleaned.sort((a, b) => b.rating - a.rating);
  } catch {
    return [];
  }
}

export function saveRankings(rankings: PlayerRanking[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify(rankings));
  } catch (err) {
    console.error('Failed to save rankings', err);
  }
}

export function getMatchHistory(): MatchHistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MATCH_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMatchHistory(matches: MatchHistoryItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Keep up to 100 recent games
    localStorage.setItem(MATCH_STORAGE_KEY, JSON.stringify(matches.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save match history', err);
  }
}

/**
 * Standard Elo Rating calculation
 */
function calculateElo(ratingA: number, ratingB: number, actualScoreA: number, kFactor = 32): [number, number] {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;

  const newA = Math.round(ratingA + kFactor * (actualScoreA - expectedA));
  const newB = Math.round(ratingB + kFactor * ((1 - actualScoreA) - expectedB));

  return [Math.max(800, newA), Math.max(800, newB)];
}

/**
 * Records game result and updates leaderboard in real time
 */
export function recordGameResult(params: {
  whiteName: string;
  blackName: string;
  winner: 'w' | 'b' | 'draw';
  winReason: string;
  totalMoves: number;
  durationSeconds: number;
  mode: GameMode;
}): { updatedRankings: PlayerRanking[]; newRatingWhite: number; newRatingBlack: number } {
  const currentRankings = getRankings();
  const whiteClean = params.whiteName.trim() || '백 플레이어';
  const blackClean = params.blackName.trim() || '흑 플레이어';

  let whitePlayer = currentRankings.find(r => r.name.toLowerCase() === whiteClean.toLowerCase());
  let blackPlayer = currentRankings.find(r => r.name.toLowerCase() === blackClean.toLowerCase());

  if (!whitePlayer) {
    whitePlayer = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: whiteClean,
      rating: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winStreak: 0,
      lastPlayed: Date.now(),
    };
    currentRankings.push(whitePlayer);
  }

  if (!blackPlayer) {
    blackPlayer = {
      id: 'p-' + (Date.now() + 1) + '-' + Math.random().toString(36).substring(2, 6),
      name: blackClean,
      rating: 1200,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0,
      winStreak: 0,
      lastPlayed: Date.now(),
    };
    currentRankings.push(blackPlayer);
  }

  // Calculate scores (1 for win, 0.5 for draw, 0 for loss)
  const scoreWhite = params.winner === 'w' ? 1 : params.winner === 'draw' ? 0.5 : 0;
  const [newRatingWhite, newRatingBlack] = calculateElo(whitePlayer.rating, blackPlayer.rating, scoreWhite);

  whitePlayer.rating = newRatingWhite;
  blackPlayer.rating = newRatingBlack;
  whitePlayer.totalGames += 1;
  blackPlayer.totalGames += 1;
  whitePlayer.lastPlayed = Date.now();
  blackPlayer.lastPlayed = Date.now();

  if (params.winner === 'w') {
    whitePlayer.wins += 1;
    whitePlayer.winStreak += 1;
    blackPlayer.losses += 1;
    blackPlayer.winStreak = 0;
  } else if (params.winner === 'b') {
    blackPlayer.wins += 1;
    blackPlayer.winStreak += 1;
    whitePlayer.losses += 1;
    whitePlayer.winStreak = 0;
  } else {
    whitePlayer.draws += 1;
    blackPlayer.draws += 1;
    whitePlayer.winStreak = 0;
    blackPlayer.winStreak = 0;
  }

  const sortedRankings = [...currentRankings].sort((a, b) => b.rating - a.rating);
  saveRankings(sortedRankings);

  // Add match history item
  const matchItem: MatchHistoryItem = {
    id: 'match-' + Date.now(),
    date: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    mode: params.mode,
    whiteName: whiteClean,
    blackName: blackClean,
    winner: params.winner,
    winReason: params.winReason,
    totalMoves: params.totalMoves,
    durationSeconds: params.durationSeconds,
  };

  const matches = getMatchHistory();
  matches.unshift(matchItem);
  saveMatchHistory(matches);

  return {
    updatedRankings: sortedRankings,
    newRatingWhite,
    newRatingBlack,
  };
}

/**
 * Completely resets leaderboard and match history
 */
export function resetLeaderboard(): PlayerRanking[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(RANKING_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(MATCH_STORAGE_KEY);
    localStorage.removeItem('math_chess_rankings_v1');
    localStorage.removeItem('math_chess_matches_v1');
  }
  return [];
}

/**
 * Remove a specific player from the rankings
 */
export function removePlayerFromLeaderboard(playerId: string): PlayerRanking[] {
  const current = getRankings();
  const updated = current.filter(p => p.id !== playerId);
  saveRankings(updated);
  return updated;
}

