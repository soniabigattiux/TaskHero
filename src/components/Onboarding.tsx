import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ParentProfile, KidProfile } from '../types';
import { ChevronRight, Plus, Trash2, ShieldCheck, Smile, ArrowLeft } from 'lucide-react';

interface Props {
  onComplete: (users: User[]) => void;
}

const KID_AVATARS = ['👦', '👧', '🦊', '🐰', '🐯', '🐼', '🤖', '👽', '🦄', '🦖'];
const PARENT_AVATARS = ['👩', '👨', '🧑', '👵', '👴', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🦉'];

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [users, setUsers] = useState<User[]>([]);

  // First Parent State
  const [parentName, setParentName] = useState('');
  const [parentAvatar, setParentAvatar] = useState(PARENT_AVATARS[0]);
  const [parentPin, setParentPin] = useState('');
  const [parentConfirmPin, setParentConfirmPin] = useState('');

  // Add Member State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberRole, setMemberRole] = useState<'kid' | 'parent'>('kid');
  const [memberName, setMemberName] = useState('');
  const [memberAvatar, setMemberAvatar] = useState(KID_AVATARS[0]);
  const [memberPin, setMemberPin] = useState('');
  const [memberConfirmPin, setMemberConfirmPin] = useState('');

  const handleCreateFirstParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || parentPin.length !== 4 || parentPin !== parentConfirmPin) return;

    const firstParent: ParentProfile = {
      id: Date.now().toString(),
      role: 'parent',
      name: parentName.trim(),
      avatar: parentAvatar,
      pin: parentPin
    };

    setUsers([firstParent]);
    setStep(3);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;

    if (memberRole === 'parent') {
      if (memberPin.length !== 4 || memberPin !== memberConfirmPin) return;
      const newParent: ParentProfile = {
        id: Date.now().toString(),
        role: 'parent',
        name: memberName.trim(),
        avatar: memberAvatar,
        pin: memberPin
      };
      setUsers(prev => [...prev, newParent]);
    } else {
      const newKid: KidProfile = {
        id: Date.now().toString(),
        role: 'kid',
        name: memberName.trim(),
        avatar: memberAvatar,
        points: 0,
        lifetimePoints: 0,
        level: 1,
        streak: 0
      };
      setUsers(prev => [...prev, newKid]);
    }

    setIsAddingMember(false);
    setMemberName('');
    setMemberPin('');
    setMemberConfirmPin('');
    setMemberAvatar(KID_AVATARS[0]);
    setMemberRole('kid');
  };

  const handleDeleteMember = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 p-6">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full text-center space-y-8"
          >
            <motion.div 
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-6xl"
            >
              🦸‍♂️🦸‍♀️
            </motion.div>
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight mb-4">TaskHero</h1>
              <p className="text-xl text-slate-500 font-bold">¡Bienvenidos! Vamos a crear tu familia 👨‍👩‍👧‍👦</p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-indigo-200"
            >
              Empezar <ChevronRight className="w-6 h-6" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-12"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-slate-800">Primer Administrador</h2>
              <p className="text-slate-500 font-medium mt-2">Crea el perfil principal de padre o madre.</p>
            </div>

            <form onSubmit={handleCreateFirstParent} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Tu Nombre</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-lg"
                  placeholder="Ej. Mamá"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Elige tu Avatar</label>
                <div className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
                  {PARENT_AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setParentAvatar(a)}
                      className={`flex-shrink-0 w-16 h-16 rounded-2xl text-4xl flex items-center justify-center transition-all ${parentAvatar === a ? 'bg-indigo-100 border-4 border-indigo-400 scale-110 shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
                    >
                      <span className="leading-none">{a}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2">PIN (4 dígitos)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={parentPin}
                    onChange={e => setParentPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest text-lg"
                    placeholder="••••"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2">Confirmar</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={parentConfirmPin}
                    onChange={e => setParentConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest text-lg"
                    placeholder="••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!parentName.trim() || parentPin.length !== 4 || parentPin !== parentConfirmPin}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:border-indigo-300 disabled:text-white/80 disabled:cursor-not-allowed transition-colors text-lg mt-4"
              >
                Continuar
              </button>
            </form>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 flex flex-col max-w-sm mx-auto w-full pt-12"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-slate-800">Tu Familia</h2>
              <p className="text-slate-500 font-medium mt-2">Añade a los niños u otros administradores.</p>
            </div>

            {isAddingMember ? (
              <form onSubmit={handleAddMember} className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-700">Nuevo Miembro</h3>
                  <button type="button" onClick={() => setIsAddingMember(false)} className="text-slate-400 hover:text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setMemberRole('kid'); setMemberAvatar(KID_AVATARS[0]); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${memberRole === 'kid' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Niño/a
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMemberRole('parent'); setMemberAvatar(PARENT_AVATARS[0]); }}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${memberRole === 'parent' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Padre/Madre
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium"
                    placeholder={memberRole === 'kid' ? "Ej. Mateo" : "Ej. Papá"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">Avatar</label>
                  <div className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
                    {(memberRole === 'kid' ? KID_AVATARS : PARENT_AVATARS).map(a => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setMemberAvatar(a)}
                        className={`flex-shrink-0 w-16 h-16 rounded-2xl text-4xl flex items-center justify-center transition-all ${memberAvatar === a ? 'bg-indigo-100 border-4 border-indigo-400 scale-110 shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
                      >
                        <span className="leading-none">{a}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {memberRole === 'parent' && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2">PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={memberPin}
                        onChange={e => setMemberPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest"
                        placeholder="••••"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-600 mb-2">Confirmar</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={memberConfirmPin}
                        onChange={e => setMemberConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest"
                        placeholder="••••"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!memberName.trim() || (memberRole === 'parent' && (memberPin.length !== 4 || memberPin !== memberConfirmPin))}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:border-indigo-300 disabled:text-white/80 disabled:cursor-not-allowed transition-colors"
                >
                  Guardar Miembro
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {users.map(user => (
                    <div key={user.id} className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${user.role === 'parent' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-lg">{user.name}</p>
                          <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            {user.role === 'parent' ? <><ShieldCheck className="w-4 h-4"/> Admin</> : <><Smile className="w-4 h-4"/> Niño/a</>}
                          </p>
                        </div>
                      </div>
                      {users.length > 1 && user.id !== users[0].id && (
                        <button onClick={() => handleDeleteMember(user.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setIsAddingMember(true)}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border-2 border-dashed border-slate-300"
                >
                  <Plus className="w-5 h-5" /> Añadir otro miembro
                </button>

                <div className="pt-8">
                  <button
                    onClick={() => onComplete(users)}
                    className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors text-lg shadow-lg shadow-indigo-200"
                  >
                    ¡Ir a la app! 🚀
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
