import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Trophy, Target, Calendar, TrendingUp,
  Award, Zap, BookOpen, CheckCircle2, Circle, BarChart3
} from 'lucide-react';
import api from '../../api';
import { Progress } from '../../types';
import StarRating from '../../components/StarRating';

const categoryInfo: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  logic: { label: '逻辑基础', emoji: '🧩', color: 'text-green-700', bg: 'from-green-400 to-emerald-500' },
  loop: { label: '循环结构', emoji: '🔁', color: 'text-orange-700', bg: 'from-orange-400 to-amber-500' },
  condition: { label: '条件判断', emoji: '🤔', color: 'text-blue-700', bg: 'from-blue-400 to-cyan-500' },
  project: { label: '小项目', emoji: '🎯', color: 'text-purple-700', bg: 'from-purple-400 to-pink-500' },
};

export default function ChildProgress() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [childInfo, setChildInfo] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const res = await api.get(`/progress/child/${id}`);
      setChildInfo(res.data.childInfo);
      setStats(res.data.stats);
      setProgress(res.data.progress);
      setRecentActivity(res.data.recentActivity);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!childInfo) {
    return (
      <div className="text-center py-20 text-white">
        <div className="text-6xl mb-4">😵</div>
        <p className="text-xl mb-4">找不到孩子信息</p>
        <Link to="/parent" className="inline-block bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold">
          返回
        </Link>
      </div>
    );
  }

  const progressPercent = stats.totalLevels > 0
    ? Math.round((stats.completedLevels / stats.totalLevels) * 100)
    : 0;
  const avgStars = stats.completedLevels > 0
    ? (stats.totalStars / stats.completedLevels).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/parent')}
          className="flex items-center gap-2 text-white hover:text-white/80 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
          <span>返回概览</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-white/30 backdrop-blur flex items-center justify-center text-5xl shadow-lg">
            {childInfo.name?.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3">
              {childInfo.name}
              <span className="text-xl bg-white/25 px-3 py-1 rounded-full">👶 小朋友</span>
            </h1>
            <p className="text-white/80 mb-4">@{childInfo.username}</p>

            <div className="max-w-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium flex items-center gap-1">
                  <TrendingUp size={16} /> 总学习进度
                </span>
                <span className="font-bold text-lg">{progressPercent}%</span>
              </div>
              <div className="h-4 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4 text-center">
              <div className="text-4xl font-bold">{stats.completedLevels}</div>
              <div className="text-sm text-white/80 flex items-center justify-center gap-1 mt-1">
                <Trophy size={14} />
                已完成关数
              </div>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4 text-center">
              <div className="text-4xl font-bold flex items-center justify-center gap-1">
                {stats.totalStars}
                <Star size={28} className="fill-yellow-300 text-yellow-300" />
              </div>
              <div className="text-sm text-white/80">获得星星</div>
            </div>
          </div>
        </div>
      </div>

      {stats.byCategory && stats.byCategory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <BarChart3 size={22} className="text-rose-500" />
            各知识点掌握情况
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {stats.byCategory.map((cat: any) => {
              const info = categoryInfo[cat.category];
              if (!info) return null;
              const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
              const avgStarsCat = cat.completed > 0 ? (cat.stars / cat.completed).toFixed(1) : '0';
              return (
                <div key={cat.category} className="rounded-2xl overflow-hidden border-2 border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`bg-gradient-to-r ${info.bg} p-4 text-white`}>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{info.emoji}</span>
                      <div>
                        <div className="font-bold">{info.label}</div>
                        <div className="text-xs text-white/80">{cat.completed}/{cat.total} 关</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StarRating stars={Math.round(parseFloat(avgStarsCat))} size={16} showCount />
                      <span className="text-xs text-gray-500">平均 {avgStarsCat}⭐</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full bg-gradient-to-r ${info.bg}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>进度</span>
                      <span className="font-bold text-gray-700">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <BookOpen size={22} className="text-indigo-500" />
            关卡通关记录
          </h2>

          {progress.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-5xl mb-3">📚</div>
              <p>还没有开始学习哦～</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-2">
              {progress.map((p) => {
                const info = categoryInfo[p.category || 'logic'];
                const isCompleted = p.status === 'completed';
                const date = p.completed_at || p.last_attempt_at;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      isCompleted
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 hover:border-green-200'
                        : 'bg-gray-50 border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info?.bg || 'from-gray-400 to-gray-500'} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {info?.emoji || '📦'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`font-bold ${isCompleted ? 'text-gray-800' : 'text-gray-600'}`}>
                          {p.title || `关卡 ${p.level_id}`}
                        </span>
                        {isCompleted ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> 已通关
                          </span>
                        ) : p.status === 'in_progress' ? (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <Target size={12} /> 进行中
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                            <Circle size={12} /> 未开始
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="bg-white px-2 py-0.5 rounded-full border border-gray-200">
                          尝试 {p.attempts} 次
                        </span>
                        {date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(date).toLocaleDateString('zh-CN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="flex-shrink-0">
                        <StarRating stars={p.stars || 0} size={20} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 rounded-3xl p-6 text-white shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award size={22} />
              学习成就
            </h2>

            <div className="space-y-3">
              <div className={`p-4 rounded-2xl ${stats.completedLevels >= 3 ? 'bg-white/30 backdrop-blur' : 'bg-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌟</span>
                  <div>
                    <div className="font-bold">初出茅庐</div>
                    <div className="text-sm text-white/80">完成3个关卡</div>
                  </div>
                  {stats.completedLevels >= 3 && <Award size={20} className="ml-auto" />}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${stats.completedLevels >= 6 ? 'bg-white/30 backdrop-blur' : 'bg-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <div className="font-bold">进步神速</div>
                    <div className="text-sm text-white/80">完成6个关卡</div>
                  </div>
                  {stats.completedLevels >= 6 && <Award size={20} className="ml-auto" />}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${stats.totalStars >= 10 ? 'bg-white/30 backdrop-blur' : 'bg-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  <div>
                    <div className="font-bold">星星收藏家</div>
                    <div className="text-sm text-white/80">收集10颗星星</div>
                  </div>
                  {stats.totalStars >= 10 && <Award size={20} className="ml-auto" />}
                </div>
              </div>

              <div className={`p-4 rounded-2xl ${parseFloat(avgStars) >= 2.5 ? 'bg-white/30 backdrop-blur' : 'bg-white/10 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💎</span>
                  <div>
                    <div className="font-bold">完美主义</div>
                    <div className="text-sm text-white/80">平均星级 ≥ 2.5</div>
                  </div>
                  {parseFloat(avgStars) >= 2.5 && <Award size={20} className="ml-auto" />}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/20 text-center">
              <div className="text-sm text-white/80 mb-1">平均星级</div>
              <div className="text-3xl font-bold">{avgStars} ⭐</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap size={22} className="text-yellow-500" />
              最近学习动态
            </h2>

            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-sm">暂无学习记录</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto scrollbar-hide">
                {recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                      act.is_correct
                        ? 'bg-green-100 text-green-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}>
                      {act.is_correct ? '✓' : '✗'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {act.level_title}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span>
                          {act.is_correct ? '挑战成功 🎉' : '继续努力 💪'}
                        </span>
                        <span>·</span>
                        <span>{new Date(act.created_at).toLocaleString('zh-CN', {
                          month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
