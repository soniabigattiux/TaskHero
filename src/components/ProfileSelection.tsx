import React, { useState } from 'react';
import { User, ParentProfile, KidProfile } from '../types';
import { ShieldCheck, Smile, Lock, Plus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PinPad } from './PinPad';

interface Props {
  users: User[];
  onSelect: (user: User) => void;
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
}

const KID_AVATARS = ['👦', '👧', '🦊', '🐰', '🐯', '🐼', '🤖', '👽', '🦄', '🦖'];
const PARENT_AVATARS = ['👩', '👨', '🧑', '👵', '👴', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🦉'];

export function ProfileSelection({ users, onSelect, setUsers }: Props) {
  const [selectedParent, setSelectedParent] = useState<ParentProfile | null>(null);
  
  // Add Profile State
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [showAddPinPad, setShowAddPinPad] = useState(false);
  const [newRole, setNewRole] = useState<'kid' | 'parent'>('kid');
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(KID_AVATARS[0]);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSelect = (user: User) => {
    if (user.role === 'parent') {
      setSelectedParent(user as ParentProfile);
    } else {
      onSelect(user);
    }
  };

  const handleAddClick = () => {
    setShowAddPinPad(true);
  };

  const handleAddPinSuccess = () => {
    setShowAddPinPad(false);
    setIsAddingProfile(true);
  };

  const handleSaveNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (newRole === 'parent') {
      if (newPin.length !== 4 || newPin !== confirmPin) return;
      const newParent: ParentProfile = {
        id: Date.now().toString(),
        role: 'parent',
        name: newName.trim(),
        avatar: newAvatar,
        pin: newPin
      };
      setUsers(prev => [...prev, newParent]);
    } else {
      const newKid: KidProfile = {
        id: Date.now().toString(),
        role: 'kid',
        name: newName.trim(),
        avatar: newAvatar,
        points: 0,
        lifetimePoints: 0,
        level: 1,
        streak: 0
      };
      setUsers(prev => [...prev, newKid]);
    }

    setIsAddingProfile(false);
    setNewName('');
    setNewPin('');
    setConfirmPin('');
    setNewAvatar(KID_AVATARS[0]);
    setNewRole('kid');
  };

  // Get all parent PINs to allow any parent to authorize adding a profile
  const parentPins = users.filter(u => u.role === 'parent').map(p => (p as ParentProfile).pin || '1234');

  if (isAddingProfile) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 p-6 pt-12">
        <div className="max-w-sm mx-auto w-full">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setIsAddingProfile(false)} className="p-2 bg-white rounded-full text-slate-500 hover:bg-slate-100 shadow-sm transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-slate-800">Añadir Perfil</h2>
          </div>

          <form onSubmit={handleSaveNewProfile} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => { setNewRole('kid'); setNewAvatar(KID_AVATARS[0]); }}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${newRole === 'kid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
              >
                Niño/a
              </button>
              <button
                type="button"
                onClick={() => { setNewRole('parent'); setNewAvatar(PARENT_AVATARS[0]); }}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${newRole === 'parent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                Padre/Madre
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Nombre</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium"
                placeholder={newRole === 'kid' ? "Ej. Mateo" : "Ej. Papá"}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Avatar</label>
              <div className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
                {(newRole === 'kid' ? KID_AVATARS : PARENT_AVATARS).map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setNewAvatar(a)}
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl text-4xl flex items-center justify-center transition-all ${newAvatar === a ? 'bg-indigo-100 border-4 border-indigo-400 scale-110 shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
                  >
                    <span className="leading-none">{a}</span>
                  </button>
                ))}
              </div>
            </div>

            {newRole === 'parent' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2">PIN</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest"
                    placeholder="••••"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Confirmar</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest"
                    placeholder="••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!newName.trim() || (newRole === 'parent' && (newPin.length !== 4 || newPin !== confirmPin))}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:border-indigo-300 disabled:text-white/80 disabled:cursor-not-allowed transition-colors"
            >
              Guardar Perfil
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-sky-50 relative">
      <AnimatePresence>
        {selectedParent && (
          <PinPad 
            expectedPin={selectedParent.pin || '1234'} 
            onSuccess={() => onSelect(selectedParent)} 
            onCancel={() => setSelectedParent(null)} 
          />
        )}
        {showAddPinPad && (
          <PinPad 
            expectedPin={parentPins} 
            onSuccess={handleAddPinSuccess} 
            onCancel={() => setShowAddPinPad(false)} 
            title="PIN de Administrador"
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="w-full max-w-sm space-y-10"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">¡Elige tu perfil!</h1>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {users.map((profile, index) => (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={profile.id}
              onClick={() => handleSelect(profile)}
              className="flex flex-col items-center gap-4 group outline-none"
            >
              <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center text-7xl transition-all border-4 border-b-8 relative active:border-b-4 active:translate-y-1 ${
                profile.role === 'parent' 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600 group-hover:border-indigo-300 group-hover:bg-indigo-100' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600 group-hover:border-emerald-300 group-hover:bg-emerald-100'
              }`}>
                {profile.avatar || (profile.role === 'parent' ? <ShieldCheck className="w-14 h-14" /> : <Smile className="w-14 h-14" />)}
                
                {profile.role === 'parent' && (
                  <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-2 border-4 border-indigo-200">
                    <Lock className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
              </div>
              <span className="text-slate-700 font-extrabold text-xl group-hover:text-slate-900 transition-colors">
                {profile.name}
              </span>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: users.length * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddClick}
            className="flex flex-col items-center gap-4 group outline-none"
          >
            <div className="w-32 h-32 rounded-[2rem] flex items-center justify-center bg-white border-4 border-b-8 border-slate-200 border-dashed group-hover:border-slate-300 group-hover:bg-slate-50 transition-all active:border-b-4 active:translate-y-1">
              <Plus className="w-14 h-14 text-slate-400 group-hover:text-slate-500 transition-colors" />
            </div>
            <span className="text-slate-500 font-extrabold text-xl group-hover:text-slate-600 transition-colors">
              Añadir perfil
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
