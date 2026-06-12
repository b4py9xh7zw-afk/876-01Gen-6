import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, Users, TrendingDown, AlertTriangle,
  BookOpen, Trophy, Star, Award, CheckCircle2, XCircle, Target
} from 'lucide-react';
import api from '../../api';
import StarRating from '../../components/StarRating';

export default function ClassAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [id]);

  const loadAnalytics = async () => {
    try {
      const res = await api.get(`/classes/${id}/analytics`);
      setAnalytics(res.data);
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

  const { levelCompletion = [], studentProgress = [], difficultConcepts = [], commonErrors = [] } = analytics || {};

  const categoryLabels: Record<string, { label: string; emoji: string; bg: string }> = {
    logic: { label: '逻辑', emoji: '🧩', bg: 'from-green-400 to-emerald-500' },
    loop: { label: '循环', emoji: '🔁', bg: 'from-orange-400 to-amber-500' },
    condition: { label: '条件', emoji: '🤔', bg: 'from-blue-400 to-cyan-500' },
    project: { label: '项目', emoji: '🎯', bg: 'from-purple-400 to-pink-500' },
  };

  const avgStarsAll = studentProgress.length > 0
    ? (studentProgress.reduce((sum: number, s: any) => sum + (s.stars || 0), 0) / studentProgress.length).toFixed(1)
    : '0';
  const totalCompleted = studentProgress.reduce((sum: number, s: any) => sum + (s.completed || 0), 0);
  const avgCompletion = studentProgress.length > 0
    ? Math.round((studentProgress.reduce((sum: number, s: any) => sum + (s.completed || 0), 0) / studentProgress.length) / Math.max(levelCompletion.length, 1) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate(`/teacher/class/${id}`)}
          className="flex items-center gap-2 text-white hover:text-white/80 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
          <span>返回班级管理</span>
        </button>
      </div>

      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 />
              班级数据看板
            </h1>
            <p className="text-white/90">全面了解学生学习情况和知识点掌握程度</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4 text-center">
              <div className="text-3xl font-bold">{studentProgress.length}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1 mt-1">
                <Users size={14} /> 学生
              </div>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4 text-center">
              <div className="text-3xl font-bold">{totalCompleted}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1 mt-1">
                <Trophy size={14} /> 总通关数
              </div>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-4 text-center">
              <div className="text-3xl font-bold flex items-center justify-center gap-1">
                {avgStarsAll}
                <Star size={24} className="fill-yellow-300 text-yellow-300" />
              </div>
              <div className="text-xs text-white/80">平均星星</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <TrendingDown size={22} className="text-red-500" />
            学生卡点分析
            <span className="ml-auto text-sm font-normal text-gray-500">
              错误率超过30%的关卡
            </span>
          </h2>

          {difficultConcepts.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-5xl mb-3">🎉</div>
              <p className="font-medium text-gray-600">太棒了！没有明显的卡点</p>
              <p className="text-sm mt-1">所有关卡错误率都低于30%</p>
            </div>
          ) : (
            <div className="space-y-3">
              {difficultConcepts.map((concept: any, idx: number) => {
                const cat = categoryLabels[concept.category];
                const failRate = Math.round(concept.fail_rate * 100);
                return (
                  <div key={`${concept.id}-${idx}`} className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat?.bg || 'from-gray-400 to-gray-500'} flex items-center justify-center text-xl`}>
                          {cat?.emoji || '⚠️'}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{concept.title}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="bg-white px-2 py-0.5 rounded-full border border-gray-200">
                              {cat?.label}
                            </span>
                            <span>共 {concept.students_tried} 名学生尝试</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">{failRate}%</div>
                        <div className="text-xs text-red-500">错误率</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <XCircle size={14} className="text-red-500" />
                        {concept.students_failed} 名学生遇到困难
                      </span>
                      <span className="text-gray-500">建议重点讲解此知识点</span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden border border-red-200">
                      <div
                        className="h-full bg-gradient-to-r from-red-400 to-orange-500"
                        style={{ width: `${failRate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
            <AlertTriangle size={22} className="text-amber-500" />
            常见错误类型
          </h2>

          {commonErrors.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-5xl mb-3">📝</div>
              <p className="font-medium text-gray-600">还没有错误数据</p>
              <p className="text-sm mt-1">学生开始答题后这里会显示常见错误</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[480px] overflow-y-auto scrollbar-hide pr-2">
              {commonErrors.map((err: any, idx: number) => {
                let errors = [];
                try {
                  errors = JSON.parse(err.errors);
                } catch {
                  errors = [err.errors];
                }
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-amber-500 text-white w-6 h-6 rounded-lg flex items-center justify-center text-sm">
                          {idx + 1}
                        </span>
                        {err.level_title}
                      </div>
                      <span className="bg-amber-200 text-amber-800 px-3 py-1 rounded-full text-xs font-bold">
                        {err.count} 次
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {errors.map((e: string, i: number) => (
                        <div key={i} className="text-sm text-amber-800 bg-white/70 px-3 py-2 rounded-lg flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{e}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <BookOpen size={22} className="text-indigo-500" />
          各关卡完成情况
        </h2>

        {levelCompletion.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-5xl mb-3">📊</div>
            <p className="font-medium text-gray-600">还没有数据</p>
            <p className="text-sm mt-1">先在班级中布置关卡吧</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left rounded-l-xl text-sm font-bold text-gray-600">关卡</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">分类</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">难度</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">完成率</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600">平均星级</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-gray-600 rounded-r-xl">总尝试次数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {levelCompletion.map((lv: any) => {
                  const cat = categoryLabels[lv.category];
                  const completeRate = lv.total_students > 0
                    ? Math.round((lv.completed_count / lv.total_students) * 100)
                    : 0;
                  const rateColor = completeRate >= 80 ? 'green' : completeRate >= 50 ? 'yellow' : 'red';
                  return (
                    <tr key={lv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{lv.title}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm">
                          <span>{cat?.emoji}</span>
                          <span className="text-gray-600">{cat?.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-yellow-500">
                        {'⭐'.repeat(lv.difficulty)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                rateColor === 'green' ? 'bg-green-500' :
                                rateColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${completeRate}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold min-w-[48px] text-right ${
                            rateColor === 'green' ? 'text-green-600' :
                            rateColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {lv.completed_count}/{lv.total_students} ({completeRate}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <StarRating stars={Math.round(lv.avg_stars || 0)} size={14} />
                          <span className="text-sm font-bold text-gray-600 ml-1">
                            {lv.avg_stars || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                          {lv.total_attempts}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <Award size={22} className="text-yellow-500" />
          学生排行榜
        </h2>

        {studentProgress.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-5xl mb-3">👨‍🎓</div>
            <p className="font-medium text-gray-600">还没有学生数据</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentProgress.map((s: any, idx: number) => {
              const rankColors = ['from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-orange-400 to-amber-600'];
              const rankBg = idx < 3 ? rankColors[idx] : 'from-gray-100 to-gray-200';
              return (
                <div key={s.id} className="p-5 rounded-2xl border-2 border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${idx < 3 ? rankBg : 'from-pink-400 to-rose-500'} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                        {s.name.slice(0, 1)}
                      </div>
                      <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${rankBg} flex items-center justify-center text-xs font-bold ${
                        idx < 3 ? 'text-white' : 'text-gray-600'
                      } shadow`}>
                        {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 truncate">{s.name}</div>
                      <div className="text-xs text-gray-500">尝试 {s.total_attempts || 0} 次</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-green-600 flex items-center justify-center gap-1">
                        <Trophy size={16} />
                        {s.completed || 0}
                      </div>
                      <div className="text-xs text-gray-500">通关数</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-3 text-center">
                      <div className="text-xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                        <Star size={16} className="fill-current" />
                        {s.stars || 0}
                      </div>
                      <div className="text-xs text-gray-500">星星数</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
