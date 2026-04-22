import React, { useState } from 'react';
import { KidProfile, Task, TaskHistory } from '../types';
import { Trophy, Flame, Star, Medal, Crown, Edit2, Check, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getLevelProgress } from '../utils/levels';

interface Props {
  user: KidProfile;
  kids: KidProfile[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  taskHistory?: TaskHistory[];
}

const AVATARS = ['👦', '👧', '🦊', '🐰', '🐯', '🐼', '🤖', '👽', '🦄', '🦖'];

export function KidProgress({ user, kids, setUsers, taskHistory = [] }: Props) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(user.name);

  const progress = getLevelProgress(user.lifetimePoints);
  const completedTasksCount = taskHistory.filter(t => t.kidId === user.id).length;
  const hasProgress = user.lifetimePoints > 0 || completedTasksCount > 0;

  // Dynamic Badges
  const badges = [
    { id: 'first', name: 'Primera Tarea', icon: '🎯', earned: completedTasksCount > 0 },
    { id: 'streak3', name: 'Racha de 3', icon: '🔥', earned: user.streak >= 3 },
    { id: 'points100', name: '100 Puntos', icon: '💯', earned: user.lifetimePoints >= 100 },
    { id: 'level3', name: 'Nivel 3', icon: '⭐', earned: user.level >= 3 },
  ];

  // Ranking
  const sortedKids = [...kids].sort((a, b) => b.lifetimePoints - a.lifetimePoints);

  const changeAvatar = (avatar: string) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, avatar } : u));
    setIsAvatarModalOpen(false);
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, name: editName.trim() } : u));
    } else {
      setEditName(user.name);
    }
    setIsEditingName(false);
  };

  return (
    <div className="space-y-6 text-left pb-4">
      {/* Avatar & Level Header */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 transition-shadow hover:shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-emerald-50 to-transparent"></div>

        <button
          onClick={() => setIsAvatarModalOpen(true)}
          className="relative group z-10"
        >
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-5xl group-hover:scale-105 transition-transform shadow-inner border-4 border-white">
            {user.avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm border border-slate-200">
            <div className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
              <Edit2 className="w-3 h-3" />
            </div>
          </div>
        </button>

        <div className="flex-1 w-full text-center sm:text-left z-10">
          {isEditingName ? (
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-2xl font-extrabold text-slate-800 bg-slate-50 border-2 border-emerald-200 rounded-xl px-3 py-1 w-40 outline-none focus:border-emerald-400"
                autoFocus
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button onClick={handleSaveName} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200">
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 group">
              <h2 className="text-2xl font-extrabold text-slate-800">{user.name}</h2>
              <button onClick={() => setIsEditingName(true)} className="p-1.5 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-lg font-extrabold text-slate-700">Nivel {user.level}</span>
          </div>

          <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.percent}%` }}
              transition={{ type: "spring", bounce: 0.2, duration: 1 }}
              className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full relative"
            >
              <div className="absolute inset-0 bg-white/20 w-full h-1/2 rounded-t-full"></div>
            </motion.div>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2 text-right">
            {user.lifetimePoints} / {progress.max} pts para Nivel {user.level + 1}
          </p>
        </div>
      </motion.div>

      {!hasProgress && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-3xl text-white text-center shadow-md"
        >
          <div className="text-4xl mb-2">🚀</div>
          <h3 className="text-xl font-extrabold mb-1">¡Aún no tienes puntos!</h3>
          <p className="font-bold text-indigo-100">¡Completá tu primera tarea para empezar! 💪</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div whileHover={{ y: -4 }} className="bg-orange-50 p-4 rounded-3xl border-2 border-orange-100 flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md">
          <Flame className="w-7 h-7 text-orange-500 mb-1" />
          <span className="text-xl font-extrabold text-orange-600">{user.streak}</span>
          <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-wider">Días seguidos</span>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-amber-50 p-4 rounded-3xl border-2 border-amber-100 flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md">
          <Star className="w-7 h-7 fill-amber-500 text-amber-500 mb-1" />
          <span className="text-xl font-extrabold text-amber-600">{user.lifetimePoints}</span>
          <span className="text-[10px] font-bold text-amber-500/80 uppercase tracking-wider">Puntos Totales</span>
        </motion.div>
        <motion.div whileHover={{ y: -4 }} className="bg-blue-50 p-4 rounded-3xl border-2 border-blue-100 flex flex-col items-center justify-center text-center transition-shadow hover:shadow-md">
          <Check className="w-7 h-7 text-blue-500 mb-1" />
          <span className="text-xl font-extrabold text-blue-600">{completedTasksCount}</span>
          <span className="text-[10px] font-bold text-blue-500/80 uppercase tracking-wider">Tareas Hechas</span>
        </motion.div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Medal className="w-5 h-5 text-indigo-500" /> Mis Insignias
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {badges.map(badge => (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              key={badge.id}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center border-2 transition-all ${
                badge.earned 
                  ? 'bg-indigo-50 border-indigo-100 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 opacity-50 grayscale'
              }`}
            >
              <span className="text-2xl mb-1">{badge.icon}</span>
              <span className="text-[9px] font-extrabold text-slate-600 leading-tight">
                {badge.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sibling Ranking */}
      {kids.length > 1 && (
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" /> Ranking
          </h3>
          <motion.div whileHover={{ y: -2 }} className="bg-white rounded-3xl border-2 border-slate-100 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
            {sortedKids.map((kid, index) => (
              <div 
                key={kid.id}
                className={`flex items-center gap-4 p-4 ${
                  index !== sortedKids.length - 1 ? 'border-b border-slate-100' : ''
                } ${kid.id === user.id ? 'bg-emerald-50/50' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm ${
                  index === 0 ? 'bg-amber-100 text-amber-600' : 
                  index === 1 ? 'bg-slate-200 text-slate-600' : 
                  'bg-orange-100 text-orange-600'
                }`}>
                  #{index + 1}
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">
                  {kid.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{kid.name}</h4>
                  <p className="text-xs font-bold text-slate-500">Nivel {kid.level}</p>
                </div>
                <div className="font-extrabold text-amber-500">
                  {kid.lifetimePoints} pts
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-6"
            onClick={() => setIsAvatarModalOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">Elige tu Avatar</h3>
              <div className="grid grid-cols-4 gap-4">
                {AVATARS.map(avatar => (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    key={avatar}
                    onClick={() => changeAvatar(avatar)}
                    className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-colors ${
                      user.avatar === avatar ? 'bg-emerald-100 border-2 border-emerald-400' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                    }`}
                  >
                    {avatar}
                  </motion.button>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAvatarModalOpen(false)}
                className="w-full mt-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
