import React, { useState, useEffect } from 'react';
import { KidProfile, Task, TaskInstance, Reward, RewardClaim, TaskHistory, User } from '../types';
import { Home, Star, Gift, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KidTaskManager } from './KidTaskManager';
import { KidRewardManager } from './KidRewardManager';
import { KidProgress } from './KidProgress';
import { getLevelProgress } from '../utils/levels';
import { playSuccessSound } from '../utils/sounds';

interface Props {
  user: KidProfile;
  users: User[];
  kids: KidProfile[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskInstances?: TaskInstance[];
  setTaskInstances?: React.Dispatch<React.SetStateAction<TaskInstance[]>>;
  rewards: Reward[];
  rewardClaims?: RewardClaim[];
  setRewardClaims?: React.Dispatch<React.SetStateAction<RewardClaim[]>>;
  taskHistory?: TaskHistory[];
  onLogout: () => void;
}

export function KidDashboard({ user, users, kids, setUsers, tasks, setTasks, taskInstances = [], setTaskInstances, rewards, rewardClaims = [], setRewardClaims, taskHistory = [], onLogout }: Props) {
  const [activeTab, setActiveTab] = useState('home');
  const [deliveredNotification, setDeliveredNotification] = useState<string | null>(null);

  const tabs = [
    { id: 'home', label: 'Tareas', icon: Home },
    { id: 'progress', label: 'Progreso', icon: Star },
    { id: 'rewards', label: 'Premios', icon: Gift },
  ];

  const progress = getLevelProgress(user.lifetimePoints);

  // Check for newly delivered rewards
  useEffect(() => {
    const newlyDelivered = rewardClaims.find(
      c => c.kidId === user.id && c.status === 'delivered' && !c.kidAcknowledged
    );

    if (newlyDelivered && setRewardClaims) {
      const reward = rewards.find(r => r.id === newlyDelivered.rewardId);
      if (reward) {
        playSuccessSound();
        setDeliveredNotification(`¡Tu premio "${reward.title}" fue entregado! 🎉`);
        
        // Mark as acknowledged
        setRewardClaims(prev => prev.map(c => 
          c.id === newlyDelivered.id ? { ...c, kidAcknowledged: true } : c
        ));

        setTimeout(() => {
          setDeliveredNotification(null);
        }, 5000);
      }
    }
  }, [rewardClaims, user.id, rewards, setRewardClaims]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 relative">
      {/* Delivered Notification Toast */}
      <AnimatePresence>
        {deliveredNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 20, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="absolute top-0 left-4 right-4 bg-emerald-500 text-white p-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 font-bold z-50 text-center border-4 border-emerald-400"
          >
            <Sparkles className="w-8 h-8 flex-shrink-0 text-emerald-200" />
            <div className="text-lg font-extrabold">{deliveredNotification}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white px-6 py-5 rounded-b-3xl shadow-sm flex items-center justify-between z-10">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
            {user.avatar}
          </div>
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-extrabold text-slate-800">¡Hola {user.name}!</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-amber-500 font-bold flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                {user.points} pts
              </p>
              <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden max-w-[100px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percent}%` }}
                  transition={{ type: "spring", bounce: 0.2, duration: 1 }}
                  className="bg-emerald-500 h-full rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="p-3 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'home' ? (
              <KidTaskManager user={user} users={users} tasks={tasks} setTasks={setTasks} taskInstances={taskInstances} setTaskInstances={setTaskInstances} taskHistory={taskHistory} />
            ) : activeTab === 'progress' ? (
              <KidProgress user={user} kids={kids} setUsers={setUsers} taskHistory={taskHistory} />
            ) : activeTab === 'rewards' ? (
              <KidRewardManager user={user} rewards={rewards} setUsers={setUsers} rewardClaims={rewardClaims} setRewardClaims={setRewardClaims} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 px-8 py-4 pb-8 z-10">
        <ul className="flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 transition-all ${
                    isActive ? 'text-emerald-600 scale-110' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className={`p-3 rounded-2xl mb-1 transition-colors ${isActive ? 'bg-emerald-50' : 'bg-transparent'}`}>
                    <Icon className={`w-7 h-7 ${isActive ? 'fill-emerald-100' : ''}`} />
                  </div>
                  <span className={`text-sm font-extrabold ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
