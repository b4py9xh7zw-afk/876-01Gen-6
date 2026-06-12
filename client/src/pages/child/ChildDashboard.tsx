import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, BookOpen, Target, Sparkles, Play } from 'lucide-react';
import api from '../../api';
import { Level } from '../../types';
import StarRating from '../../components/StarRating';

const categoryInfo: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  logic: { label: '逻辑基础', emoji: '🧩', color: 'text-green-700', bg: 'from-green-400 to-emerald-500' },
  loop: { label: '循环结构', emoji: '🔁', color: 'text-orange-700', bg: 'from-orange-400 to-amber-500' },
  condition: { label: '条件判断', emoji: '🤔', color: 'text-blue-700', bg: 'from-blue-400 to-cyan-500' },
  project: { label: '小项目', emoji: '🎯', color: 'text-purple-700', bg: 'from-purple-400 to-pink-500' },
};

export default function ChildDashboard() {
  const navigate = useNavigate();
  const [levels, setLevels] = useState<Level[]>([]);
  const [stats, setStats] = useState({
    totalLevels: 0,
    completedLevels: 0,
    totalStars: 0,
    byCategory: [] as any[],
  });
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [levelsRes, progressRes] = await Promise.all([
        api.get('/levels'),
        api.get('/progress/my-progress'),
      ]);
      setLevels(levelsRes.data.levels);
      setStats(progressRes.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLevels = activeCategory === 'all'
    ? levels
    : levels.filter(l => l.category === activeCategory);

  const categories = ['all', 'logic', 'loop', 'condition', 'project'];
  const categoryLabels: Record<string, string> = {
    all: '全部 🎨',
    logic: '逻辑 🧩',
    loop: '循环 🔁',
    condition: '条件 🤔',
    project: '项目 🎯',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  const progressPercent = stats.totalLevels > 0
    ? Math.round((stats.completedLevels / stats.totalLevels) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="text-yellow-200" />
              欢迎回来，小冒险家！
            </h1>
            <p className="text-white/90">继续你的编程探险吧！</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-3 text-center">
              <div className="text-3xl font-bold">{stats.totalStars}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1">
                <Star size={14} className="fill-yellow-300 text-yellow-300" />
                星星
              </div>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-3 text-center">
              <div className="text-3xl font-bold">{stats.completedLevels}/{stats.totalLevels}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1">
                <Trophy size={14} />
                已完成
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">总进度</span>
            <span className="font-bold">{progressPercent}%</span>
          </div>
          <div className="h-4 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {stats.byCategory && stats.byCategory.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.byCategory.map((cat) => {
            const info = categoryInfo[cat.category];
            if (!info) return null;
            const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            return (
              <div key={cat.category} className="bg-white rounded-2xl p-4 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.bg} flex items-center justify-center text-xl`}>
                    {info.emoji}
                  </div>
                  <div>
                    <div className={`text-xs ${info.color} font-semibold`}>{info.label}</div>
                    <div className="text-xs text-gray-500">{cat.completed}/{cat.total}关</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= Math.round((cat.stars || 0) / Math.max(cat.completed, 1))
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-600">{pct}%</span>
                </div>
                <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${info.bg} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-white text-purple-700 shadow-lg scale-105'
                : 'bg-white/50 text-white hover:bg-white/75'
            }`}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredLevels.map((level, idx) => {
          const info = categoryInfo[level.category];
          const isCompleted = level.progress?.status === 'completed';
          const isInProgress = level.progress?.status === 'in_progress';
          return (
            <button
              key={level.id}
              onClick={() => navigate(`/child/level/${level.id}`)}
              className={`group relative bg-white rounded-3xl p-5 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 text-left overflow-hidden ${
                isCompleted ? 'ring-2 ring-green-400' : ''
              } ${isInProgress ? 'ring-2 ring-yellow-400' : ''}`}
            >
              <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${info.bg} opacity-20 group-hover:opacity-30 transition-opacity`} />

              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.bg} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                    {info.emoji}
                  </div>
                  {isCompleted && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Trophy size={12} /> 已通关
                    </div>
                  )}
                  {isInProgress && !isCompleted && (
                    <div className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Target size={12} /> 进行中
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold ${info.color}`}>
                    第{idx + 1}关 · {info.label}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {level.title}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {level.description}
                </p>

                <div className="flex items-center justify-between">
                  <StarRating
                    stars={level.progress?.stars || 0}
                    size={18}
                    showCount
                  />
                  <div className="flex items-center gap-1 text-gray-500">
                    {[...Array(level.difficulty)].map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                </div>

                <div className={`mt-4 py-3 rounded-xl bg-gradient-to-r ${info.bg} text-white font-semibold text-center flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0`}>
                  <Play size={18} className="fill-current" />
                  {isCompleted ? '再玩一次' : '开始挑战'}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredLevels.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-white text-lg">这个分类暂时还没有关卡哦～</p>
        </div>
      )}
    </div>
  );
}
