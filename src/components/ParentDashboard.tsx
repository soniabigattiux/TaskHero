import React, { useState } from 'react';
import { User, KidProfile, ParentProfile, Task, TaskInstance, Reward, RewardClaim, TaskHistory } from '../types';
import { ClipboardList, CheckCircle, Gift, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ParentTaskManager } from './ParentTaskManager';
import { ParentValidationManager } from './ParentValidationManager';
import { ParentRewardManager } from './ParentRewardManager';
import { ParentSettings } from './ParentSettings';

interface Props {
  user: ParentProfile;
  users: User[];
  kids: KidProfile[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  taskInstances?: TaskInstance[];
  setTaskInstances?: React.Dispatch<React.SetStateAction<TaskInstance[]>>;
  rewards: Reward[];
  setRewards: React.Dispatch<React.SetStateAction<Reward[]>>;
  rewardClaims?: RewardClaim[];
  setRewardClaims?: React.Dispatch<React.SetStateAction<RewardClaim[]>>;
  taskHistory?: TaskHistory[];
  setTaskHistory?: React.Dispatch<React.SetStateAction<TaskHistory[]>>;
  onLogout: () => void;
}

export function ParentDashboard({ user, users, kids, setUsers, tasks, setTasks, taskInstances = [], setTaskInstances, rewards, setRewards, rewardClaims = [], setRewardClaims, taskHistory, setTaskHistory, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState('tasks');

  const tabs = [
    { id: 'tasks', label: 'Tareas', icon: ClipboardList },
    { id: 'approvals', label: 'Validar', icon: CheckCircle },
    { id: 'rewards', label: 'Premios', icon: Gift },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  const pendingCount = taskInstances.filter(t => t.status === 'completed_pending_approval' || t.status === 'completed').length;
  const pendingRewardsCount = rewardClaims.filter(c => c.status === 'pending').length;

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white px-6 py-5 rounded-b-3xl shadow-sm flex items-center justify-between z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de {user.name}</h1>
          <p className="text-slate-500 text-sm font-medium">Modo Administrador</p>
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
            {activeTab === 'tasks' ? (
              <ParentTaskManager kids={kids} tasks={tasks} setTasks={setTasks} taskInstances={taskInstances} setTaskInstances={setTaskInstances} />
            ) : activeTab === 'approvals' ? (
              <ParentValidationManager kids={kids} setUsers={setUsers} tasks={tasks} setTasks={setTasks} taskInstances={taskInstances} setTaskInstances={setTaskInstances} currentUser={user} setTaskHistory={setTaskHistory} />
            ) : activeTab === 'rewards' ? (
              <ParentRewardManager rewards={rewards} setRewards={setRewards} rewardClaims={rewardClaims} setRewardClaims={setRewardClaims} kids={kids} />
            ) : activeTab === 'settings' ? (
              <ParentSettings users={users} setUsers={setUsers} currentUser={user} onLogout={onLogout} />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 px-6 py-4 pb-8 z-10">
        <ul className="flex justify-between items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="relative">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center p-2 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div className={`relative p-2 rounded-2xl mb-1 transition-colors ${isActive ? 'bg-indigo-50' : 'bg-transparent'}`}>
                    <Icon className={`w-6 h-6 ${isActive ? 'fill-indigo-100' : ''}`} />
                    {tab.id === 'approvals' && pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {pendingCount}
                      </span>
                    )}
                    {tab.id === 'rewards' && pendingRewardsCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        {pendingRewardsCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isActive ? 'text-indigo-600' : 'text-slate-500'}`}>
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
