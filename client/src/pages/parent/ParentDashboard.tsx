import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Star, Trophy, TrendingUp, Clock, ChevronRight, Baby, Sparkles } from 'lucide-react';
import api from '../../api';
import { ChildInfo } from '../../types';
import StarRating from '../../components/StarRating';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      const res = await api.get('/parent/children');
      setChildren(res.data.children);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCompleted = children.reduce((sum, c) => sum + c.completed_levels, 0);
  const totalStars = children.reduce((sum, c) => sum + c.total_stars, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="text-emerald-200" />
              欢迎，家长！
            </h1>
            <p className="text-white/90">查看孩子的学习进度和成就</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-3 text-center">
              <div className="text-3xl font-bold">{children.length}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1">
                <Users size={14} /> 孩子数量
              </div>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-3 text-center">
              <div className="text-3xl font-bold">{totalCompleted}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1">
                <Trophy size={14} /> 总完成关数
              </div>
            </div>
            <div className="bg-white/25 backdrop-blur rounded-2xl px-5 py-3 text-center">
              <div className="text-3xl font-bold">{totalStars}</div>
              <div className="text-xs text-white/80 flex items-center justify-center gap-1">
                <Star size={14} className="fill-yellow-300 text-yellow-300" /> 星星总数
              </div>
            </div>
          </div>
        </div>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-xl">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <Baby size={48} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">还没有关联的孩子</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
            请让您的孩子在注册时填写您的用户名作为"家长关联码"，
            或者联系孩子的老师将孩子添加到班级中，即可在老师端查看。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 max-w-md mx-auto text-left">
            <div className="font-bold text-blue-800 mb-2">💡 小提示</div>
            <div className="text-blue-700 text-sm space-y-1">
              <p>1. 如果孩子已有账号，可由老师在班级中添加</p>
              <p>2. 孩子注册时在"家长关联码"中填写您的用户名</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Baby size={22} />
            我的孩子们
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {children.map((child) => {
              const progress = child.total_levels > 0
                ? Math.round((child.completed_levels / child.total_levels) * 100)
                : 0;
              const avgStars = child.completed_levels > 0
                ? Math.round(child.total_stars / child.completed_levels)
                : 0;

              return (
                <button
                  key={child.id}
                  onClick={() => navigate(`/parent/child/${child.id}`)}
                  className="group bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 text-left"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-red-400 flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform">
                      {child.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors">
                        {child.name}
                      </h3>
                      <div className="text-sm text-gray-500">@{child.username}</div>
                    </div>
                    <ChevronRight
                      size={24}
                      className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-600">{child.completed_levels}</div>
                      <div className="text-xs text-gray-500">/ {child.total_levels} 关</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-3 text-center">
                      <div className="flex justify-center mb-1">
                        <StarRating stars={avgStars} size={16} />
                      </div>
                      <div className="text-xs text-gray-500">{child.total_stars} ⭐</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{progress}%</div>
                      <div className="text-xs text-gray-500">完成率</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">学习进度</span>
                      <span className="text-emerald-600 font-bold">{progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700 group-hover:from-emerald-500 group-hover:to-cyan-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-500 flex items-center gap-1">
                      <TrendingUp size={16} className="text-emerald-500" />
                      点击查看详细学习报告
                    </span>
                    <span className="text-emerald-500 font-semibold group-hover:translate-x-1 transition-transform">
                      查看详情 →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock size={20} className="text-emerald-500" />
          学习小贴士
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🎯', title: '鼓励为主', desc: '孩子遇到困难时请耐心引导，不要直接告诉答案' },
            { icon: '⏰', title: '合理安排', desc: '每次学习20-30分钟效果最好，保护孩子的视力' },
            { icon: '🏆', title: '庆祝进步', desc: '每完成一个小目标都要给予鼓励，增强成就感' },
          ].map((tip, i) => (
            <div key={i} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4">
              <div className="text-3xl mb-2">{tip.icon}</div>
              <div className="font-bold text-gray-800 mb-1">{tip.title}</div>
              <div className="text-sm text-gray-600 leading-relaxed">{tip.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
