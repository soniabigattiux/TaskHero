import { useState, useEffect } from 'react';
import { User, KidProfile, ParentProfile, Task, TaskInstance, Reward, RewardClaim, TaskHistory } from './types';
import { ProfileSelection } from './components/ProfileSelection';
import { ParentDashboard } from './components/ParentDashboard';
import { KidDashboard } from './components/KidDashboard';
import { Onboarding } from './components/Onboarding';
import { getLogicalDay } from './utils/date';

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useLocalStorage<(KidProfile | ParentProfile)[]>('taskhero_users', []);
  const [tasks, setTasks] = useLocalStorage<Task[]>('taskhero_tasks', []);
  const [taskInstances, setTaskInstances] = useLocalStorage<TaskInstance[]>('taskhero_task_instances', []);
  const [rewards, setRewards] = useLocalStorage<Reward[]>('taskhero_rewards', []);
  const [rewardClaims, setRewardClaims] = useLocalStorage<RewardClaim[]>('taskhero_claims', []);
  const [taskHistory, setTaskHistory] = useLocalStorage<TaskHistory[]>('taskhero_history', []);

  // Migration for old tasks format
  useEffect(() => {
    let migrated = false;
    const newTasks = [...tasks];
    const newInstances = [...taskInstances];

    newTasks.forEach(t => {
      // Check if it's an old task (assignedTo is a string)
      if (typeof t.assignedTo === 'string') {
        const childId = t.assignedTo as string;
        t.assignedTo = [childId];
        
        // Create instance if not exists
        if (!newInstances.find(i => i.taskId === t.id && i.childId === childId)) {
          newInstances.push({
            id: `${t.id}_${childId}`,
            taskId: t.id,
            childId: childId,
            status: (t as any).status || 'pending',
            date: t.createdAt,
            completionTimestamp: (t as any).completedAt,
            approvedBy: (t as any).approvedBy
          });
        }
        
        // Clean up old fields
        delete (t as any).status;
        delete (t as any).completedAt;
        delete (t as any).approvedBy;
        migrated = true;
      }
    });

    if (migrated) {
      setTasks(newTasks);
      setTaskInstances(newInstances);
    }
  }, [tasks, taskInstances, setTasks, setTaskInstances]);

  // Daily Reset Logic
  useEffect(() => {
    const checkResets = () => {
      const currentLogicalDay = getLogicalDay();
      let needsUpdate = false;
      
      const updatedInstances = taskInstances.map(instance => {
        const task = tasks.find(t => t.id === instance.taskId);
        if (!task) return instance;

        const instanceLogicalDay = instance.lastResetLogicalDay || getLogicalDay(instance.date);
        
        if (task.frequency === 'daily' && instanceLogicalDay < currentLogicalDay && instance.status !== 'completed_pending_approval') {
          needsUpdate = true;
          return {
            ...instance,
            status: 'pending' as const,
            completedCountToday: 0,
            lastResetLogicalDay: currentLogicalDay,
            completionTimestamp: undefined,
            approvedBy: undefined
          };
        }
        return instance;
      });

      if (needsUpdate) {
        setTaskInstances(updatedInstances);
      }
    };

    checkResets();
    const interval = setInterval(checkResets, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks, taskInstances, setTaskInstances]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Auto-lock admin session on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && currentUser?.role === 'parent') {
        setCurrentUser(null);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentUser]);

  const kids = users.filter(u => u.role === 'kid') as KidProfile[];

  // Keep currentUser in sync with users array updates (like points, name, avatar)
  const syncedCurrentUser = currentUser 
    ? users.find(u => u.id === currentUser.id) || currentUser 
    : null;

  return (
    <div className="min-h-screen bg-slate-200 flex justify-center">
      {/* Mobile container constraint for desktop viewing */}
      <div className="w-full max-w-md bg-white shadow-2xl relative overflow-hidden flex flex-col">
        {users.length === 0 ? (
          <Onboarding onComplete={setUsers} />
        ) : !syncedCurrentUser ? (
          <ProfileSelection users={users} onSelect={setCurrentUser} setUsers={setUsers} />
        ) : syncedCurrentUser.role === 'parent' ? (
          <ParentDashboard 
            user={syncedCurrentUser as ParentProfile} 
            users={users}
            kids={kids}
            setUsers={setUsers}
            tasks={tasks}
            setTasks={setTasks}
            taskInstances={taskInstances}
            setTaskInstances={setTaskInstances}
            rewards={rewards}
            setRewards={setRewards}
            rewardClaims={rewardClaims}
            setRewardClaims={setRewardClaims}
            taskHistory={taskHistory}
            setTaskHistory={setTaskHistory}
            onLogout={handleLogout} 
          />
        ) : (
          <KidDashboard 
            user={syncedCurrentUser as KidProfile} 
            users={users}
            kids={kids}
            setUsers={setUsers}
            tasks={tasks}
            setTasks={setTasks}
            taskInstances={taskInstances}
            setTaskInstances={setTaskInstances}
            rewards={rewards}
            rewardClaims={rewardClaims}
            setRewardClaims={setRewardClaims}
            taskHistory={taskHistory}
            onLogout={handleLogout} 
          />
        )}
      </div>
    </div>
  );
}
