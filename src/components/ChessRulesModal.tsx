import React, { useState } from 'react';
import { ChessPiece } from '../utils/pieces';
import { PieceSymbol } from '../types';
import { X, BookOpen, Shield, Crown, Zap, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface ChessRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'pieces' | 'basics' | 'special';

interface PieceDetail {
  type: PieceSymbol;
  nameKo: string;
  nameEn: string;
  points: number | string;
  summary: string;
  movementText: string;
  captureText: string;
  strategyTip: string;
  // 5x5 visual grid showing movement pattern from center (2,2)
  // 'center' | 'move' | 'capture' | 'move-capture'
  gridPattern: Record<string, 'move' | 'capture' | 'both'>;
}

const PIECE_DETAILS: PieceDetail[] = [
  {
    type: 'p',
    nameKo: '폰 (Pawn)',
    nameEn: 'Pawn',
    points: 1,
    summary: '전선의 최전방을 지키는 체스의 보병이자 미래의 잠재적 퀸입니다.',
    movementText: '앞으로 1칸 전진합니다. 단, 아직 한 번도 움직이지 않은 폰은 첫 이동 시 앞으로 2칸 전진할 수 있습니다. 후진이나 옆으로 이동은 불가능합니다.',
    captureText: '앞으로 바로 마주한 적은 잡을 수 없으며, 대각선 앞 1칸에 있는 상대 기물만 잡을 수 있습니다.',
    strategyTip: '폰 구조(Pawn Chain)는 게임의 판도를 결정합니다. 상대 진영 끝까지 전진하면 가장 강력한 기물인 퀸 등으로 승급(프로모션)할 수 있습니다.',
    gridPattern: {
      '2,1': 'move', // 1 step forward (center is 2,2)
      '2,0': 'move', // 2 steps forward
      '1,1': 'capture', // diagonal capture left
      '3,1': 'capture', // diagonal capture right
    },
  },
  {
    type: 'n',
    nameKo: '나이트 (Knight)',
    nameEn: 'Knight',
    points: 3,
    summary: '기동성과 변칙적인 기습 공격에 특화된 체스의 기사(말)입니다.',
    movementText: '‘L자’ 모양으로 이동합니다 (어느 방향이든 2칸 직진 후 수직으로 1칸, 또는 1칸 직진 후 수직으로 2칸).',
    captureText: '도착하는 칸에 상대 기물이 있으면 잡을 수 있습니다.',
    strategyTip: '체스에서 유일하게 다른 기물(아군/적군 무관)을 뛰어넘을 수 있습니다! 체스판 중앙에 배치되면 최대 8개 칸을 제어하며 포크(Fork: 2개 이상의 기물을 동시 위협) 공격에 능합니다.',
    gridPattern: {
      '1,0': 'both',
      '3,0': 'both',
      '0,1': 'both',
      '4,1': 'both',
      '0,3': 'both',
      '4,3': 'both',
      '1,4': 'both',
      '3,4': 'both',
    },
  },
  {
    type: 'b',
    nameKo: '비숍 (Bishop)',
    nameEn: 'Bishop',
    points: 3,
    summary: '원거리 대각선을 광속으로 질주하는 날카로운 장거리 저격수입니다.',
    movementText: '원하는 만큼 대각선 방향으로 장애물에 막히지 않는 한 얼마든지 전진 또는 후진할 수 있습니다.',
    captureText: '대각선 이동 경로의 맨 마지막 칸에 있는 적 기물을 잡을 수 있습니다.',
    strategyTip: '각 플레이어는 밝은 칸 비숍과 어두운 칸 비숍을 1개씩 가집니다. 비숍은 평생 자신이 시작한 타일 색상 위로만 이동할 수 있으므로, 두 비숍을 함께 활용(Bishop Pair)하면 강력한 위력을 냅니다.',
    gridPattern: {
      '0,0': 'both', '1,1': 'both', '3,3': 'both', '4,4': 'both',
      '4,0': 'both', '3,1': 'both', '1,3': 'both', '0,4': 'both',
    },
  },
  {
    type: 'r',
    nameKo: '룩 (Rook)',
    nameEn: 'Rook',
    points: 5,
    summary: '수직선과 수평선을 지배하는 묵직하고 강력한 중전차(성채)입니다.',
    movementText: '가로(Rank) 또는 세로(File) 방향으로 장애물이 없는 한 몇 칸이든 직선 이동할 수 있습니다.',
    captureText: '직선 경로 끝에 있는 적 기물을 잡을 수 있습니다.',
    strategyTip: '게임 후반(엔드게임)으로 갈수록 기물들이 사라져 길이 열리면서 위력이 극대화됩니다. 킹과 함께하는 특수 규칙인 ‘캐슬링(Castling)’에 참여할 수 있습니다.',
    gridPattern: {
      '2,0': 'both', '2,1': 'both', '2,3': 'both', '2,4': 'both',
      '0,2': 'both', '1,2': 'both', '3,2': 'both', '4,2': 'both',
    },
  },
  {
    type: 'q',
    nameKo: '퀸 (Queen)',
    nameEn: 'Queen',
    points: 9,
    summary: '룩과 비숍의 힘을 모두 가진 체스판 최강의 최고 사령관입니다.',
    movementText: '가로, 세로, 대각선 모든 방향으로 장애물이 없는 한 원하는 만큼 자유롭게 이동할 수 있습니다.',
    captureText: '이동 경로 끝에 위치한 적 기물을 잡을 수 있습니다.',
    strategyTip: '가장 강력하고 가치가 높은 기물이므로, 초반에 너무 일찍 출격하면 상대의 가벼운 기물들(폰, 나이트)에게 쫓기며 템포를 빼앗길 수 있습니다. 신중하게 안전한 위치를 잡으세요.',
    gridPattern: {
      '2,0': 'both', '2,1': 'both', '2,3': 'both', '2,4': 'both',
      '0,2': 'both', '1,2': 'both', '3,2': 'both', '4,2': 'both',
      '0,0': 'both', '1,1': 'both', '3,3': 'both', '4,4': 'both',
      '4,0': 'both', '3,1': 'both', '1,3': 'both', '0,4': 'both',
    },
  },
  {
    type: 'k',
    nameKo: '킹 (King)',
    nameEn: 'King',
    points: '무한대',
    summary: '게임의 운명을 쥔 군주입니다. 킹이 체크메이트당하면 즉시 패배합니다.',
    movementText: '가로, 세로, 대각선 모든 방향으로 딱 1칸씩만 이동할 수 있습니다.',
    captureText: '인접한 1칸에 있는 적 기물을 직접 잡을 수 있습니다 (단, 잡았을 때 다른 적에게 공격당하지 않는 안전한 경우에만 가능).',
    strategyTip: '킹은 상대 기물의 공격을 받는 칸(체크 상태가 되는 칸)으로는 절대 이동할 수 없습니다. 초반에는 캐슬링으로 안전한 구석에 숨기고, 후반 엔드게임에서는 적극적으로 중앙에 진출해 폰을 호위해야 합니다.',
    gridPattern: {
      '1,1': 'both', '2,1': 'both', '3,1': 'both',
      '1,2': 'both',               '3,2': 'both',
      '1,3': 'both', '2,3': 'both', '3,3': 'both',
    },
  },
];

export const ChessRulesModal: React.FC<ChessRulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('pieces');
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentPiece = PIECE_DETAILS[selectedPieceIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 dark:bg-amber-400/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                체스 완벽 가이드북
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                체스 말별 이동법, 기본 규칙, 특수 룰을 한눈에 살펴보세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-5 pt-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveTab('pieces')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pieces'
                ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Crown className="w-4 h-4" />
            말별 이동 & 설명
          </button>
          <button
            onClick={() => setActiveTab('basics')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'basics'
                ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            기본 규칙 & 승리 조건
          </button>
          <button
            onClick={() => setActiveTab('special')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'special'
                ? 'border-amber-500 text-amber-700 dark:text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            체스 특수 규칙 (3가지)
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1 text-zinc-800 dark:text-zinc-200">
          {/* TAB 1: 말별 설명 */}
          {activeTab === 'pieces' && (
            <div className="space-y-6">
              {/* Piece Selector Buttons (3D Preview Pills) */}
              <div className="grid grid-cols-6 gap-2">
                {PIECE_DETAILS.map((p, idx) => {
                  const isSelected = idx === selectedPieceIndex;
                  return (
                    <button
                      key={p.type}
                      onClick={() => setSelectedPieceIndex(idx)}
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-md ring-2 ring-amber-400/40 scale-[1.03]'
                          : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        <ChessPiece type={p.type} color="w" size="100%" />
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-bold mt-1 ${
                          isSelected
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {p.nameEn}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        {p.points === '무한대' ? '★' : `${p.points}점`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Piece Comprehensive Card */}
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-700/80 grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Left: 3D Visual & Mini Move Board */}
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                  {/* Big 3D Model Display */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 flex items-center justify-center drop-shadow-lg">
                      <ChessPiece type={currentPiece.type} color="w" size="100%" />
                    </div>
                    <div className="w-16 h-16 flex items-center justify-center drop-shadow-lg">
                      <ChessPiece type={currentPiece.type} color="b" size="100%" />
                    </div>
                  </div>

                  <div className="text-center mb-3">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      {currentPiece.nameKo}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      기물 가치: {currentPiece.points === '무한대' ? '무한 (승패 결정)' : `${currentPiece.points}점`}
                    </div>
                  </div>

                  {/* 5x5 Mini Move Grid */}
                  <div className="w-full max-w-[200px] aspect-square rounded-lg border-2 border-zinc-800 overflow-hidden grid grid-cols-5 grid-rows-5 shadow-inner">
                    {[0, 1, 2, 3, 4].map((y) =>
                      [0, 1, 2, 3, 4].map((x) => {
                        const isCenter = x === 2 && y === 2;
                        const key = `${x},${y}`;
                        const pattern = currentPiece.gridPattern[key];
                        const isDarkCell = (x + y) % 2 === 1;

                        return (
                          <div
                            key={key}
                            className={`relative flex items-center justify-center text-[9px] ${
                              isDarkCell ? 'bg-[#764220]' : 'bg-[#ecddc8]'
                            }`}
                          >
                            {isCenter && (
                              <div className="w-6 h-6 flex items-center justify-center z-10">
                                <ChessPiece type={currentPiece.type} color="w" size="90%" />
                              </div>
                            )}

                            {pattern === 'move' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                            )}

                            {pattern === 'capture' && (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-rose-500 bg-rose-500/30" />
                            )}

                            {pattern === 'both' && (
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs ring-1 ring-amber-600/40" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" /> 이동/공격
                    </span>
                    {currentPiece.type === 'p' && (
                      <>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> 전진
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full border border-rose-500 bg-rose-500/30" /> 공격
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Details, Movements & Strategy */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                  <div>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-3">
                      {currentPiece.summary}
                    </p>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="font-bold text-zinc-900 dark:text-white block mb-0.5">
                          🧭 이동 방법
                        </span>
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {currentPiece.movementText}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                        <span className="font-bold text-zinc-900 dark:text-white block mb-0.5">
                          ⚔️ 상대 기물 잡기 (Capture)
                        </span>
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {currentPiece.captureText}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 dark:border-amber-400/20">
                        <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-0.5">
                          <Zap className="w-3.5 h-3.5" /> 실전 전략 팁
                        </span>
                        <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                          {currentPiece.strategyTip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 기본 규칙 & 승리 조건 */}
          {activeTab === 'basics' && (
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              {/* Goal */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/30">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2 mb-1.5">
                  <Crown className="w-5 h-5 text-amber-600" />
                  체스의 궁극적 목표: 체크메이트 (Checkmate)
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300">
                  체스는 상대의 기물을 전부 다 잡는 게임이 아닙니다. 상대방의 <strong>킹(King)</strong>을 공격하여, 상대가 <strong>어떤 합법적인 수로도 공격을 피할 수 없게 만드는 것(외통수)</strong>이 승리 조건입니다.
                </p>
              </div>

              {/* Check & CPR Defense */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  체크(Check)를 당했을 때 방어하는 3가지 방법 (CPR 원칙)
                </h4>
                <p className="text-zinc-600 dark:text-zinc-300">
                  자신의 킹이 공격받아 체크 상태가 되면, 플레이어는 반드시 그 턴에 체크를 해소해야 합니다. 다른 기물은 둘 수 없습니다:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      1. C (Capture)
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      내 킹을 공격하고 있는 상대 기물을 다른 기물이나 킹으로 직접 잡기.
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                      2. P (Protect / Block)
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      공격 기물과 내 킹 사이에 아군 기물을 끼워 넣어 경로 막기 (단, 나이트 공격은 방패 불가).
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                      3. R (Run)
                    </span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      킹을 공격받지 않는 안전한 인접 칸으로 도망치기.
                    </span>
                  </div>
                </div>
              </div>

              {/* Stalemate & Draw Conditions */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2.5">
                <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-zinc-500" />
                  무승부(Draw)가 되는 조건들
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>스테일메이트 (Stalemate)</strong>: 현재 턴인 사람의 킹이 체크 상태가 아니지만, 둘 수 있는 합법적인 수가 단 하나도 없을 때 (자동 무승부 처리).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>기물 부족 (Insufficient Material)</strong>: 양쪽 플레이어 모두 킹만 남았거나, 킹과 비숍 1개, 킹과 나이트 1개만 남아 수학적으로 체크메이트가 불가능할 때.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>3회 동형 반복 (Threefold Repetition)</strong>: 동일한 체스판 배치와 착수 권리가 3번 연속으로 반복될 때.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>50수 규칙 (Fifty-move Rule)</strong>: 폰의 이동이나 기물 잡기 없이 양측 합쳐 50수가 지나면 무승부 요청 가능.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: 체스 특수 규칙 3가지 */}
          {activeTab === 'special' && (
            <div className="space-y-4 text-xs sm:text-sm">
              {/* 1. Castling */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    캐슬링 (Castling) - 킹과 룩의 유일한 동시 이동
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 font-mono text-zinc-600 dark:text-zinc-300">
                    O-O / O-O-O
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  한 턴에 <strong>킹과 룩이 동시에 이동</strong>하여 킹을 안전한 모서리로 피신시키고 룩을 중앙으로 출격시키는 강력한 전술 수입니다. 킹이 룩 방향으로 2칸 이동하고, 룩이 킹 바로 반대편 옆자리로 뛰어넘습니다.
                </p>
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-1">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                    ⚠️ 캐슬링 필수 조건:
                  </span>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    ① 킹과 룩이 이번 판에서 단 한 번도 움직이지 않았어야 합니다.
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    ② 킹과 룩 사이에 다른 어떤 기물도 없어야 합니다.
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    ③ 현재 킹이 체크 상태이거나, 킹이 지나가는 경로 또는 도착할 칸이 적의 공격을 받고 있으면 캐슬링할 수 없습니다.
                  </p>
                </div>
              </div>

              {/* 2. En Passant */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      2
                    </span>
                    앙파상 (En Passant) - 지나치는 폰 낚아채기
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    프랑스어: '지나치며'
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  상대방의 폰이 첫 수로 <strong>앞으로 2칸 전진하여 내 폰의 바로 옆칸에 나란히 놓였을 때</strong> 발생합니다. 내 폰은 마치 상대 폰이 1칸만 이동한 것처럼 대각선 뒤로 비스듬히 이동하면서 상대 폰을 잡을 수 있습니다.
                </p>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200">
                  <strong>중요:</strong> 앙파상은 상대 폰이 2칸 전진한 <strong>바로 그 다음 턴에만</strong> 사용할 수 있습니다! 한 턴이라도 미루면 그 기회는 영원히 소멸합니다.
                </div>
              </div>

              {/* 3. Promotion */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                      3
                    </span>
                    프로모션 (Promotion) - 폰의 영웅적 승급
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold">
                    퀸 / 룩 / 비숍 / 나이트
                  </span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  가장 약한 보병인 <strong>폰이 상대방 진영의 맨 끝 줄(백은 8번째 랭크, 흑은 1번째 랭크)에 도달</strong>하면, 즉시 <strong>퀸, 룩, 비숍, 나이트</strong> 중 원하는 강력한 기물로 변신할 수 있습니다!
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                  대부분의 플레이어는 가장 위력이 강한 <strong>퀸(Queen)</strong>을 선택합니다 (퀸이 이미 체스판에 있어도 2번째, 3번째 퀸으로 계속 승급 가능).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs sm:text-sm shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
