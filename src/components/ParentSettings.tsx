import React, { useState } from 'react';
import { User, KidProfile, ParentProfile } from '../types';
import { Plus, Trash2, ShieldCheck, Edit2, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PinPad } from './PinPad';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface Props {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<any[]>>;
  currentUser: ParentProfile;
  onLogout: () => void;
}

const KID_AVATARS = ['👦', '👧', '🦊', '🐰', '🐯', '🐼', '🤖', '👽', '🦄', '🦖'];
const PARENT_AVATARS = ['👩', '👨', '🧑', '👵', '👴', '🦸‍♀️', '🦸‍♂️', '🧙‍♀️', '🧙‍♂️', '🦉'];

export function ParentSettings({ users, setUsers, currentUser, onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<'kids' | 'parents'>('kids');
  
  // Add User State
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState(KID_AVATARS[0]);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  
  // Change PIN State
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [editNewPin, setEditNewPin] = useState('');
  const [editConfirmPin, setEditConfirmPin] = useState('');

  // Delete User State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);
  const [showPinPadForReset, setShowPinPadForReset] = useState(false);

  const kids = users.filter(u => u.role === 'kid') as KidProfile[];
  const parents = users.filter(u => u.role === 'parent') as ParentProfile[];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (activeTab === 'kids') {
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
    } else {
      if (newPin.length !== 4) {
        alert('El PIN debe tener 4 dígitos.');
        return;
      }
      if (newPin !== confirmPin) {
        alert('Los PINs no coinciden.');
        return;
      }
      const newParent: ParentProfile = {
        id: Date.now().toString(),
        role: 'parent',
        name: newName.trim(),
        avatar: newAvatar,
        pin: newPin
      };
      setUsers(prev => [...prev, newParent]);
    }
    
    setNewName('');
    setNewAvatar(activeTab === 'kids' ? KID_AVATARS[0] : PARENT_AVATARS[0]);
    setNewPin('');
    setConfirmPin('');
  };

  const handleDeleteClick = (user: User) => {
    if (user.role === 'parent' && parents.length <= 1) {
      alert('Debe haber al menos un perfil de administrador.');
      return;
    }
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    
    setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
    
    if (userToDelete.id === currentUser.id) {
      onLogout();
    }
    
    setUserToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleFullResetClick = () => {
    setShowFullResetConfirm(true);
  };

  const handleConfirmFullReset = () => {
    setShowFullResetConfirm(false);
    setShowPinPadForReset(true);
  };

  const executeFullReset = () => {
    // Clear all localStorage data
    window.localStorage.removeItem('taskhero_users');
    window.localStorage.removeItem('taskhero_tasks');
    window.localStorage.removeItem('taskhero_rewards');
    window.localStorage.removeItem('taskhero_claims');
    window.localStorage.removeItem('taskhero_history');
    
    // Force reload to reset all state and show onboarding
    window.location.reload();
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditAvatar(user.avatar || (user.role === 'parent' ? PARENT_AVATARS[0] : KID_AVATARS[0]));
    setIsChangingPin(false);
    setCurrentPin('');
    setEditNewPin('');
    setEditConfirmPin('');
  };

  const handleSaveEdit = () => {
    if (!editingUser || !editName.trim()) return;

    if (isChangingPin && editingUser.role === 'parent') {
      const parentUser = editingUser as ParentProfile;
      // If parent has a pin, verify it. If they don't have a pin (legacy), allow setting one.
      if (parentUser.pin && currentPin !== parentUser.pin) {
        alert('El PIN actual es incorrecto.');
        return;
      }
      if (editNewPin.length !== 4) {
        alert('El nuevo PIN debe tener 4 dígitos.');
        return;
      }
      if (editNewPin !== editConfirmPin) {
        alert('Los nuevos PINs no coinciden.');
        return;
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === editingUser.id) {
        const updated = { ...u, name: editName.trim(), avatar: editAvatar };
        if (isChangingPin && u.role === 'parent') {
          (updated as ParentProfile).pin = editNewPin;
        }
        return updated;
      }
      return u;
    }));
    
    setEditingUser(null);
  };

  const handleTabChange = (tab: 'kids' | 'parents') => {
    setActiveTab(tab);
    setNewName('');
    setNewAvatar(tab === 'kids' ? KID_AVATARS[0] : PARENT_AVATARS[0]);
    setNewPin('');
    setConfirmPin('');
    setEditingUser(null);
  };

  const currentAvatars = activeTab === 'kids' ? KID_AVATARS : PARENT_AVATARS;

  if (editingUser) {
    const editAvatars = editingUser.role === 'parent' ? PARENT_AVATARS : KID_AVATARS;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 text-left">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Editar Perfil</h2>
          <button onClick={() => setEditingUser(null)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-100">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Nombre</label>
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Avatar</label>
            <div className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
              {editAvatars.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setEditAvatar(a)}
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl text-4xl flex items-center justify-center transition-all ${editAvatar === a ? 'bg-indigo-100 border-4 border-indigo-400 scale-110 shadow-sm' : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'}`}
                >
                  <span className="leading-none">{a}</span>
                </button>
              ))}
            </div>
          </div>

          {editingUser.role === 'parent' && (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input 
                  type="checkbox" 
                  checked={isChangingPin} 
                  onChange={(e) => setIsChangingPin(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm font-bold text-slate-700">Cambiar PIN de acceso</span>
              </label>

              {isChangingPin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                  {(editingUser as ParentProfile).pin && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">PIN Actual</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={currentPin}
                        onChange={e => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium tracking-widest"
                        placeholder="••••"
                      />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Nuevo PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={editNewPin}
                        onChange={e => setEditNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium tracking-widest"
                        placeholder="••••"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 mb-1">Confirmar</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={editConfirmPin}
                        onChange={e => setEditConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium tracking-widest"
                        placeholder="••••"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <button
            onClick={handleSaveEdit}
            disabled={!editName.trim() || (isChangingPin && (editNewPin.length !== 4 || editNewPin !== editConfirmPin))}
            className="w-full py-3 mt-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:border-indigo-300 disabled:text-white/80 disabled:cursor-not-allowed transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-800">Ajustes y Perfiles</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Gestiona los perfiles de la familia.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
        <button
          onClick={() => handleTabChange('kids')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all ${
            activeTab === 'kids' 
              ? 'bg-white text-indigo-600 shadow-sm scale-100' 
              : 'text-slate-500 hover:text-slate-700 scale-95'
          }`}
        >
          Niños
        </button>
        <button
          onClick={() => handleTabChange('parents')}
          className={`flex-1 py-3 rounded-xl font-extrabold text-sm transition-all ${
            activeTab === 'parents' 
              ? 'bg-white text-indigo-600 shadow-sm scale-100' 
              : 'text-slate-500 hover:text-slate-700 scale-95'
          }`}
        >
          Padres (Admins)
        </button>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAddUser} className="bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-700">Añadir {activeTab === 'kids' ? 'niño/a' : 'padre/madre'}</h3>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Nombre</label>
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium"
            placeholder={activeTab === 'kids' ? "Ej. Mateo" : "Ej. Mamá"}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-600 mb-2">Avatar</label>
          <div className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
            {currentAvatars.map(a => (
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

        {activeTab === 'parents' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-2">PIN (4 dígitos)</label>
              <input
                type="password"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest"
                placeholder="••••"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-2">Confirmar PIN</label>
              <input
                type="password"
                maxLength={4}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-full p-3 rounded-xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-300 focus:ring-0 outline-none transition-colors font-medium text-center tracking-widest"
                placeholder="••••"
              />
            </div>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!newName.trim() || (activeTab === 'parents' && (newPin.length !== 4 || newPin !== confirmPin))}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 disabled:border-indigo-300 disabled:text-white/80 transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Añadir Perfil
        </motion.button>
      </form>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-700 mb-2">Perfiles Actuales</h3>
        {(activeTab === 'kids' ? kids : parents).map(user => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            key={user.id} 
            className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${user.role === 'parent' ? 'bg-indigo-100' : 'bg-emerald-100'}`}>
                {user.avatar || (user.role === 'parent' ? <ShieldCheck className="w-6 h-6 text-indigo-600" /> : '👦')}
              </div>
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  {user.name}
                  {user.id === currentUser.id && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Tú</span>}
                </p>
                {user.role === 'kid' && 'points' in user && (
                  <p className="text-xs font-bold text-slate-500">Nivel {user.level} • {user.lifetimePoints} pts</p>
                )}
                {user.role === 'parent' && (
                  <p className="text-xs font-bold text-slate-500">Administrador</p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => startEditing(user)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDeleteClick(user)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
        {(activeTab === 'kids' ? kids : parents).length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            No hay perfiles creados.
          </p>
        )}
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t-2 border-red-100">
        <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> Zona de Peligro
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Estas acciones son irreversibles. Procedé con precaución.
        </p>
        <button
          onClick={handleFullResetClick}
          className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border-2 border-red-100 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-5 h-5" /> Reiniciar toda la aplicación
        </button>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && userToDelete && (
          <DeleteConfirmationModal
            title={`¿Eliminar a ${userToDelete.name}?`}
            message={userToDelete.role === 'kid' ? "Se perderán todos sus puntos, tareas y recompensas." : "Este administrador ya no tendrá acceso."}
            onConfirm={() => {
              setShowDeleteConfirm(false);
              // We keep userToDelete set so PinPad knows who we are deleting
            }}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setUserToDelete(null);
            }}
          />
        )}

        {userToDelete && !showDeleteConfirm && (
          <PinPad 
            expectedPin={currentUser.pin || '1234'} 
            onSuccess={handleConfirmDelete} 
            onCancel={() => setUserToDelete(null)} 
            title="Confirma tu PIN para eliminar"
          />
        )}

        {showFullResetConfirm && (
          <DeleteConfirmationModal
            title="¿Reiniciar toda la aplicación?"
            message="Se borrarán TODOS los usuarios, tareas, puntos y recompensas. La app volverá a su estado inicial. Esta acción no se puede deshacer."
            onConfirm={handleConfirmFullReset}
            onCancel={() => setShowFullResetConfirm(false)}
          />
        )}

        {showPinPadForReset && (
          <PinPad 
            expectedPin={currentUser.pin || '1234'} 
            onSuccess={executeFullReset} 
            onCancel={() => setShowPinPadForReset(false)} 
            title="Confirma tu PIN para reiniciar"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
