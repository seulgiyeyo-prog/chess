import React, { useState } from 'react';
import { PlayerRanking, MatchHistoryItem } from '../types';
import { Trophy, Medal, Flame, RotateCcw, Search, UserPlus, History, Clock, Trash2, UserCheck } from 'lucide-react';

interface LeaderboardProps {
  rankings: PlayerRanking[];
  matches: MatchHistoryItem[];
  onReset: () => void;
  onAddPlayer: (name: string) => void;
  onDeletePlayer?: (id: string) => void;
  activeWhiteName: string;
  activeBlackName: string;
  onSelectPlayerForGame?: (name: string, slot: 'white' | 'black') => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  rankings,
  matches,
  onReset,
  onAddPlayer,
  onDeletePlayer,
  activeWhiteName,
  activeBlackName,
  onSelectPlayerForGame,
}) => {
  const [activeTab, setActiveTab] = useState<'ranking' | 'matches'>('ranking');
  const [searchTerm, setSearchTerm] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredRankings = rankings.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;
    onAddPlayer(newPlayerName.trim());
    setNewPlayerName('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              실시간 수학 체스 랭킹
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                LIVE
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {rankings.length > 0
                ? `총 ${rankings.length}명 등록 · ${matches.length}경기 누적`
                : '대전 결과가 즉시 누적 기록되는 실시간 순위표'}
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-zinc-200/80 dark:bg-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('ranking')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ranking'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            순위표 ({rankings.length})
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'matches'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            최근전적 ({matches.length})
          </button>
        </div>
      </div>

      {/* Sub Toolbar */}
      <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="참가자 이름 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-2.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            title="새 참가자 추가"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">참가자 등록</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="p-1.5 text-xs text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            title="전체 랭킹 및 전적 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Player Inline Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePlayer} className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 flex gap-2">
          <input
            type="text"
            placeholder="새 참가자 이름 입력 (예: 이도윤)"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-amber-300 dark:border-amber-700 rounded-lg text-zinc-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg cursor-pointer transition-colors"
          >
            등록
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer"
          >
            취소
          </button>
        </form>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900 flex items-center justify-between text-xs">
          <span className="text-rose-700 dark:text-rose-300 font-medium">
            모든 랭킹과 경기 기록을 0으로 초기화하시겠습니까?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReset();
                setShowResetConfirm(false);
              }}
              className="px-2.5 py-1 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-md font-semibold cursor-pointer"
            >
              초기화
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-2 py-1 text-xs text-zinc-500 hover:text-zinc-800 cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {activeTab === 'ranking' ? (
          rankings.length === 0 ? (
            <div className="py-12 px-5 text-center text-xs flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl shadow-xs">
                🏆
              </div>
              <div>
                <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm mb-1">
                  랭킹이 초기화되었습니다
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                  게임을 플레이하면 승패와 점수(Elo 레이팅)가 이곳에 실시간으로 계속 누적됩니다.
                </p>
              </div>
              <button
                onClick={() => {
                  onAddPlayer(activeWhiteName || '김민준');
                  if (activeBlackName && activeBlackName !== activeWhiteName) {
                    onAddPlayer(activeBlackName);
                  }
                }}
                className="mt-1 px-3 py-1.5 text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl transition-colors cursor-pointer border border-amber-500/30 flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>현재 대국자({activeWhiteName}, {activeBlackName}) 등록하기</span>
              </button>
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-400">
              ‘{searchTerm}’ 검색 결과와 일치하는 참가자가 없습니다.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-zinc-100 dark:bg-zinc-800/90 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="py-2.5 pl-3 pr-2 w-12 text-center">순위</th>
                  <th className="py-2.5 px-2">이름</th>
                  <th className="py-2.5 px-2 text-center">레이팅</th>
                  <th className="py-2.5 px-2 text-center">승/무/패</th>
                  <th className="py-2.5 pr-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredRankings.map((player, index) => {
                  const isCurrentWhite = player.name === activeWhiteName;
                  const isCurrentBlack = player.name === activeBlackName;
                  const winRate =
                    player.totalGames > 0
                      ? Math.round((player.wins / player.totalGames) * 100)
                      : 0;

                  return (
                    <tr
                      key={player.id || player.name}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group ${
                        isCurrentWhite || isCurrentBlack
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 font-medium'
                          : ''
                      }`}
                    >
                      {/* Rank badge */}
                      <td className="py-2.5 pl-3 pr-2 text-center font-bold">
                        {index === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                            🥇
                          </span>
                        ) : index === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            🥈
                          </span>
                        ) : index === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                            🥉
                          </span>
                        ) : (
                          <span className="text-zinc-500 font-mono">{index + 1}</span>
                        )}
                      </td>

                      {/* Player Name & quick assignment */}
                      <td className="py-2.5 px-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {player.name}
                          </span>
                          {player.winStreak >= 3 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-orange-600 dark:text-orange-400 font-bold bg-orange-100 dark:bg-orange-950/60 px-1.5 py-0.5 rounded-full">
                              <Flame className="w-3 h-3" />
                              {player.winStreak}연승
                            </span>
                          )}
                          {isCurrentWhite && (
                            <span className="text-[10px] px-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                              백(White)
                            </span>
                          )}
                          {isCurrentBlack && (
                            <span className="text-[10px] px-1 rounded bg-zinc-800 text-zinc-100">
                              흑(Black)
                            </span>
                          )}
                        </div>
                        {player.totalGames > 0 ? (
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            총 {player.totalGames}전 · 승률 {winRate}%
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-400 mt-0.5">
                            신규 등록 (전적 없음)
                          </div>
                        )}
                      </td>

                      {/* Rating (Elo points) */}
                      <td className="py-2.5 px-2 text-center">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                          {player.rating}
                        </span>
                      </td>

                      {/* W / D / L */}
                      <td className="py-2.5 px-2 text-center font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{player.wins}승</span>{' '}
                        {player.draws > 0 && <span className="text-zinc-400">{player.draws}무 </span>}
                        <span className="text-rose-600 dark:text-rose-400">{player.losses}패</span>
                      </td>

                      {/* Actions: select as white/black, delete */}
                      <td className="py-2.5 pr-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onSelectPlayerForGame && (
                            <>
                              <button
                                onClick={() => onSelectPlayerForGame(player.name, 'white')}
                                title={`${player.name}을(를) 백으로 지정`}
                                className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                              >
                                ⚪ 백
                              </button>
                              <button
                                onClick={() => onSelectPlayerForGame(player.name, 'black')}
                                title={`${player.name}을(를) 흑으로 지정`}
                                className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 dark:bg-zinc-700 hover:bg-zinc-900 text-white cursor-pointer"
                              >
                                ⚫ 흑
                              </button>
                            </>
                          )}
                          {onDeletePlayer && (
                            <button
                              onClick={() => onDeletePlayer(player.id)}
                              title="참가자 삭제"
                              className="p-1 rounded text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer opacity-40 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          /* Recent Match History */
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {matches.length === 0 ? (
              <div className="py-12 px-4 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
                <Clock className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                <span>아직 완료된 대전 기록이 없습니다.</span>
                <span className="text-[11px] text-zinc-400">
                  게임을 플레이하면 이곳에 승패와 수(Move) 기록이 실시간으로 차곡차곡 쌓입니다!
                </span>
              </div>
            ) : (
              matches.map((m) => (
                <div key={m.id} className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                    <span className="font-medium text-zinc-500 dark:text-zinc-400">
                      {m.mode === 'ai' ? '🤖 AI 대전' : '👥 1:1 대결'}
                    </span>
                    <span>{m.date}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className={m.winner === 'w' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'}>
                        ⚪ {m.whiteName}
                      </span>
                      <span className="text-zinc-400 text-[11px]">vs</span>
                      <span className={m.winner === 'b' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-700 dark:text-zinc-300'}>
                        ⚫ {m.blackName}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          m.winner === 'draw'
                            ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {m.winner === 'draw'
                          ? '무승부'
                          : m.winner === 'w'
                          ? `${m.whiteName} 승리!`
                          : `${m.blackName} 승리!`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>{m.winReason}</span>
                    <span className="font-mono">총 {m.totalMoves}수</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 text-center">
        🏆 승리 시 레이팅 점수가 오르며 랭킹에 즉시 반영됩니다.
      </div>
    </div>
  );
};
