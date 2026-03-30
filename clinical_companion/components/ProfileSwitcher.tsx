import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSwitcherProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onSwitch: (id: string) => void;
  onAdd: (name: string, color: string) => void;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
}

const COLORS = [
  'bg-primary', 'bg-success', 'bg-accent',
  'bg-danger', 'bg-warning', 'bg-indigo-500'
];

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  profiles,
  activeProfileId,
  onSwitch,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [mode, setMode] = useState<'view' | 'add' | 'edit'>('view');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const resetForm = () => {
    setMode('view');
    setName('');
    setEditingId(null);
    setSelectedColor(COLORS[0]);
  };

  const handleEdit = (profile: UserProfile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setSelectedColor(profile.color);
    setMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (mode === 'add') {
      onAdd(name.trim(), selectedColor);
    } else if (mode === 'edit' && editingId) {
      onUpdate(editingId, name.trim(), selectedColor);
    }
    resetForm();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-users text-text-secondary/70"></i>
          Family Profiles
        </h3>
        {mode === 'view' ? (
          <button
            onClick={() => setMode('add')}
            className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors shadow-inner"
          >
            + Add Person
          </button>
        ) : (
          <button
            onClick={resetForm}
            className="text-[10px] font-bold text-text-secondary bg-black/5 dark:bg-white/5 border border-border px-3 py-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {mode !== 'view' ? (
        <form onSubmit={handleSubmit} className="bg-surface p-4 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-2">
                {mode === 'add' ? 'Add New Person' : 'Edit Profile'}
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah, Dad, Patient A"
                className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-text-secondary/50 text-text-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase mb-2">Theme Color</label>
              <div className="flex gap-3">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full ${color} transition-all shadow-inner ${selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-text-primary scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-xl text-sm shadow-[0_4px_15px_rgba(59,130,246,0.3)] hover:opacity-90 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {mode === 'add' ? 'Save Profile' : 'Update Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {profiles.map(profile => (
            <div key={profile.id} className="relative group">
              <button
                onClick={() => onSwitch(profile.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all border shrink-0 ${activeProfileId === profile.id
                    ? 'bg-primary/5 border-primary/30 shadow-sm'
                    : 'bg-surface border-transparent grayscale-[50%] opacity-60 hover:opacity-100 hover:grayscale-0 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                <div className={`w-10 h-10 rounded-full ${profile.color} flex items-center justify-center text-white shadow-inner relative`}>
                  <span className="font-black text-sm uppercase">{profile.name.charAt(0)}</span>
                  {activeProfileId === profile.id && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-background rounded-full flex items-center justify-center border border-border">
                      <i className="fa-solid fa-check text-[8px] text-primary"></i>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-bold ${activeProfileId === profile.id ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {profile.name}
                </span>
              </button>

              <div className="absolute top-0 right-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); handleEdit(profile); }}
                  className="w-5 h-5 bg-surface border border-border text-text-secondary hover:text-primary rounded-full flex items-center justify-center text-[8px] shadow-sm transform hover:scale-110 transition-transform"
                  title="Edit"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                    className="w-5 h-5 bg-surface border border-border text-text-secondary hover:text-danger rounded-full flex items-center justify-center text-[8px] shadow-sm transform hover:scale-110 transition-transform"
                    title="Delete"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileSwitcher;
