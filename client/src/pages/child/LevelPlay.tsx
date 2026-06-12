import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Lightbulb, RotateCcw, Send, X, ChevronRight,
  Star, HelpCircle, Sparkles, Zap, CheckCircle2, XCircle
} from 'lucide-react';
import api from '../../api';
import { Level, Block } from '../../types';
import StarRating from '../../components/StarRating';
import Confetti from '../../components/Confetti';

interface WorkspaceBlock {
  uid: string;
  blockId: string;
}

export default function LevelPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceBlock[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    message: string;
    errors: string[];
    stars: number;
  } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animating, setAnimating] = useState(false);
  const dragCounter = useRef(0);

  useEffect(() => {
    loadLevel();
  }, [id]);

  const loadLevel = async () => {
    try {
      const res = await api.get(`/levels/${id}`);
      setLevel(res.data.level);
      setAttempts(res.data.level.progress?.attempts || 0);
      if (res.data.level.progress?.blocks_used) {
        try {
          const saved = JSON.parse(res.data.level.progress.blocks_used);
          setWorkspace(saved.map((blockId: string, idx: number) => ({
            uid: `${blockId}-${idx}-${Date.now()}`,
            blockId,
          })));
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getBlockInfo = (blockId: string): Block | undefined => {
    return level?.blocks_available.find(b => b.id === blockId);
  };

  const handleDragStart = (e: React.DragEvent, type: 'palette' | 'workspace', blockId: string, uid?: string) => {
    setDragging(uid || blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, blockId, uid }));
  };

  const handleDragEnd = () => {
    setDragging(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    (e.currentTarget as HTMLElement).classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      (e.currentTarget as HTMLElement).classList.remove('drag-over');
    }
  };

  const handleDropWorkspace = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    dragCounter.current = 0;
    (e.currentTarget as HTMLElement).classList.remove('drag-over');

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { type, blockId, uid } = data;

      if (type === 'palette') {
        const newBlock: WorkspaceBlock = {
          uid: `${blockId}-${Date.now()}-${Math.random()}`,
          blockId,
        };
        if (dropIndex !== undefined) {
          const newWorkspace = [...workspace];
          newWorkspace.splice(dropIndex, 0, newBlock);
          setWorkspace(newWorkspace);
        } else {
          setWorkspace([...workspace, newBlock]);
        }
      } else if (type === 'workspace' && uid) {
        const fromIndex = workspace.findIndex(b => b.uid === uid);
        if (fromIndex === -1) return;

        const newWorkspace = [...workspace];
        const [removed] = newWorkspace.splice(fromIndex, 1);
        let toIndex = dropIndex !== undefined ? dropIndex : newWorkspace.length;
        if (fromIndex < toIndex) toIndex--;
        newWorkspace.splice(toIndex, 0, removed);
        setWorkspace(newWorkspace);
      }
    } catch { /* ignore */ }
    setDragging(null);
  };

  const removeBlock = (uid: string) => {
    setWorkspace(workspace.filter(b => b.uid !== uid));
  };

  const clearWorkspace = () => {
    setWorkspace([]);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (submitting || animating) return;
    setSubmitting(true);
    setAnimating(true);

    setTimeout(async () => {
      try {
        const res = await api.post(`/levels/${id}/submit`, {
          blocks: workspace.map(b => b.blockId),
        });
        setAttempts(a => a + 1);
        setFeedback({
          show: true,
          correct: res.data.correct,
          message: res.data.message,
          errors: res.data.errors || [],
          stars: res.data.stars,
        });

        if (res.data.correct) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 4000);
        }
      } catch (err: any) {
        setFeedback({
          show: true,
          correct: false,
          message: err.response?.data?.error || '出错了，请重试',
          errors: [],
          stars: 0,
        });
      } finally {
        setSubmitting(false);
        setAnimating(false);
      }
    }, 600);
  };

  const closeFeedback = () => {
    setFeedback(null);
  };

  const nextHint = () => {
    if (level?.hints && hintIndex < level.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!level) {
    return (
      <div className="text-center py-20 text-white">
        <div className="text-6xl mb-4">😵</div>
        <p className="text-xl mb-4">关卡不存在哦</p>
        <Link to="/child" className="inline-block bg-white text-purple-600 px-6 py-3 rounded-xl font-bold">
          返回关卡列表
        </Link>
      </div>
    );
  }

  const categoryEmoji: Record<string, string> = {
    logic: '🧩', loop: '🔁', condition: '🤔', project: '🎯',
  };

  return (
    <div className="space-y-5">
      <Confetti active={showConfetti} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/child')}
          className="flex items-center gap-2 text-white hover:text-white/80 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
          <span>返回关卡</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Zap size={18} className="text-yellow-300" />
            <span>尝试次数：<strong>{attempts}</strong></span>
          </div>
          {level.progress?.status === 'completed' && (
            <div className="bg-green-400/30 backdrop-blur text-white px-4 py-2 rounded-xl flex items-center gap-2">
              <StarRating stars={level.progress.stars} size={18} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-start gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg">
            {categoryEmoji[level.category]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                难度 {'⭐'.repeat(level.difficulty)}
              </span>
              {level.progress?.status === 'completed' && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> 已通关
                </span>
              )}
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
                第{level.id}关
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{level.title}</h1>
            <p className="text-gray-500 mt-1">{level.description}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <HelpCircle size={22} />
            </div>
            <div>
              <div className="font-bold text-blue-900 mb-1">🎯 本关目标</div>
              <div className="text-blue-800 text-lg">{level.goal_description}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl p-5 shadow-xl h-full">
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🧱</span>
              可用积木
            </h2>
            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
              {level.blocks_available.map((block) => (
                <div
                  key={block.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, 'palette', block.id)}
                  onDragEnd={handleDragEnd}
                  className={`block-item px-4 py-3 rounded-xl text-white font-semibold shadow-md flex items-center gap-3 ${
                    dragging === block.id ? 'dragging' : ''
                  }`}
                  style={{ backgroundColor: block.color }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-sm">
                    ⋮⋮
                  </div>
                  <span className="flex-1">{block.label}</span>
                  <div className="w-7 h-7 rounded-full bg-white/30 flex items-center justify-center text-lg opacity-70">
                    +
                  </div>
                </div>
              ))}
            </div>

            {level.hints && level.hints.length > 0 && (
              <button
                onClick={() => {
                  setShowHint(true);
                  setHintIndex(0);
                }}
                className="mt-5 w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-md"
              >
                <Lightbulb size={20} />
                查看提示
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          <div
            className="bg-white rounded-3xl p-5 shadow-xl min-h-[400px] flex flex-col"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDropWorkspace(e)}
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <span className="text-2xl">💻</span>
                我的程序
                {workspace.length > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    {workspace.length} 块
                  </span>
                )}
              </h2>
              {workspace.length > 0 && (
                <button
                  onClick={clearWorkspace}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm"
                >
                  <RotateCcw size={16} />
                  清空
                </button>
              )}
            </div>

            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl p-4 min-h-[280px] bg-gradient-to-br from-gray-50 to-blue-50">
              {workspace.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                  <div className="text-6xl mb-3 animate-bounce-slow">📥</div>
                  <p className="text-lg font-semibold">把左边的积木拖到这里</p>
                  <p className="text-sm mt-1">按正确的顺序排列积木哦～</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {workspace.map((item, idx) => {
                    const info = getBlockInfo(item.blockId);
                    return (
                      <div key={item.uid}>
                        <div
                          className="flex items-center gap-3 group"
                          onDragOver={handleDragOver}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropWorkspace(e, idx)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 text-sm font-bold flex-shrink-0">
                            {idx + 1}
                          </div>
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'workspace', item.blockId, item.uid)}
                            onDragEnd={handleDragEnd}
                            className={`block-item flex-1 px-4 py-3 rounded-xl text-white font-semibold shadow-md flex items-center gap-3 ${
                              dragging === item.uid ? 'dragging' : ''
                            } ${animating ? 'animate-wiggle' : ''}`}
                            style={{ backgroundColor: info?.color || '#888' }}
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/25 flex items-center justify-center text-sm">
                              ⋮⋮
                            </div>
                            <span className="flex-1">{info?.label || item.blockId}</span>
                            <button
                              onClick={() => removeBlock(item.uid)}
                              className="w-7 h-7 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropWorkspace(e, workspace.length)}
                    className="py-2"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={clearWorkspace}
                className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={20} />
                重新组合
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || workspace.length === 0 || animating}
                className={`flex-[2] py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                  submitting || workspace.length === 0 || animating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 hover:scale-[1.02]'
                }`}
              >
                <Send size={20} className={submitting ? 'animate-bounce' : ''} />
                {submitting ? '运行中...' : '▶️ 运行程序'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showHint && level.hints && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowHint(false)}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Lightbulb size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">💡 小提示</h3>
                <p className="text-sm text-gray-500">第 {hintIndex + 1} / {level.hints.length} 条</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-5 mb-5">
              <p className="text-lg text-yellow-900 font-medium leading-relaxed">
                {level.hints[hintIndex]}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowHint(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                关闭
              </button>
              {hintIndex < level.hints.length - 1 ? (
                <button
                  onClick={nextHint}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold flex items-center justify-center gap-1 hover:opacity-90 transition-opacity"
                >
                  下一条提示
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setShowHint(false)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity"
                >
                  我明白了！
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {feedback && feedback.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeFeedback}>
          <div
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-pop text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {feedback.correct ? (
              <>
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-3xl font-bold text-green-600 mb-2 flex items-center justify-center gap-2">
                  <CheckCircle2 size={32} />
                  太棒了！
                </h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">{feedback.message}</p>

                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-5 mb-6">
                  <div className="text-sm text-amber-800 mb-3 font-semibold">
                    获得评价（尝试 {attempts} 次）
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={56}
                        className={`star-appear ${
                          i <= feedback.stars
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-lg'
                            : 'text-gray-200'
                        }`}
                        style={{ animationDelay: `${(i - 1) * 0.2}s` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 text-2xl font-bold text-amber-700">
                    {feedback.stars === 3 ? '🏆 完美通关！' : feedback.stars === 2 ? '👍 做得不错！' : '✅ 过关啦！'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      closeFeedback();
                      navigate('/child');
                    }}
                    className="flex-1 py-4 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                  >
                    关卡列表
                  </button>
                  <button
                    onClick={() => {
                      closeFeedback();
                      const nextId = parseInt(id as string) + 1;
                      navigate(`/child/level/${nextId}`);
                    }}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  >
                    <Sparkles size={20} />
                    下一关
                    <ChevronRight size={20} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-7xl mb-4">💪</div>
                <h3 className="text-3xl font-bold text-orange-500 mb-2 flex items-center justify-center gap-2">
                  <XCircle size={32} />
                  再接再厉！
                </h3>
                <p className="text-xl text-gray-700 mb-6 leading-relaxed">{feedback.message}</p>

                {feedback.errors && feedback.errors.length > 0 && (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 mb-6 text-left">
                    <div className="text-sm text-orange-800 font-semibold mb-2 flex items-center gap-2">
                      <Zap size={18} />
                      小建议：
                    </div>
                    <ul className="space-y-2">
                      {feedback.errors.map((err, i) => (
                        <li key={i} className="text-orange-700 flex items-start gap-2">
                          <span className="text-orange-500 font-bold mt-0.5">•</span>
                          <span>{err}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={closeFeedback}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                  >
                    <RotateCcw size={20} />
                    再试一次
                  </button>
                </div>

                {level.hints && level.hints.length > 0 && (
                  <button
                    onClick={() => {
                      closeFeedback();
                      setShowHint(true);
                      setHintIndex(0);
                    }}
                    className="mt-4 text-yellow-600 font-semibold hover:text-yellow-700 underline underline-offset-4"
                  >
                    💡 需要提示吗？
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
