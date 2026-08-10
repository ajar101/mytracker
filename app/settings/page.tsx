'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Save } from 'lucide-react';
import BottomNav from '@/components/shared/BottomNav';
import ThemeToggle from '@/components/shared/ThemeToggle';
import Modal from '@/components/shared/Modal';
import { getSettings, saveSettings } from '@/lib/storage';
import type { AppSettings, CustomIbadahItem, WorkoutItem, CustomGeneralItem } from '@/lib/types';

type Section = 'general' | 'ibadah' | 'gym' | 'custom';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [expanded, setExpanded] = useState<Section>('general');
  const [saved, setSaved] = useState(false);
  const [addModal, setAddModal] = useState<'ibadah' | 'gym' | 'custom' | null>(null);
  const [newItemForm, setNewItemForm] = useState({ name: '', type: 'checklist', target: '', unit: '' });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const save = (updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Memuat...</p>
    </div>
  );

  const toggleSection = (s: Section) => setExpanded(prev => prev === s ? 'general' : s);

  const handleAddItem = () => {
    if (!newItemForm.name.trim() || !addModal) return;
    const id = `custom_def_${Date.now()}`;

    if (addModal === 'ibadah') {
      const item: CustomIbadahItem = { id, name: newItemForm.name, type: newItemForm.type as 'checklist' | 'number', done: false, unit: newItemForm.unit || undefined, active: true };
      save({ ...settings, customIbadahItems: [...settings.customIbadahItems, item] });
    } else if (addModal === 'gym') {
      const item: WorkoutItem = { id, name: newItemForm.name, target: Number(newItemForm.target) || 0, actual: 0, unit: newItemForm.unit || 'x', active: true };
      save({ ...settings, customWorkoutItems: [...settings.customWorkoutItems, item] });
    } else if (addModal === 'custom') {
      const item: CustomGeneralItem = { id, name: newItemForm.name, type: newItemForm.type as 'checklist' | 'number', done: false, target: Number(newItemForm.target) || undefined, unit: newItemForm.unit || undefined, active: true };
      save({ ...settings, customGeneralItems: [...settings.customGeneralItems, item] });
    }

    setNewItemForm({ name: '', type: 'checklist', target: '', unit: '' });
    setAddModal(null);
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '1rem', paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Konfigurasi</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>Settings</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {saved && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>✓ Tersimpan</span>}
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="page-content">

        {/* ── General Settings ── */}
        <div className="card animate-fade-up" style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => toggleSection('general')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚙️</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Umum</span>
            </div>
            {expanded === 'general' ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
          </button>

          {expanded === 'general' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>
                Target Steps Harian
              </label>
              <input
                type="number"
                className="input-field"
                value={settings.stepsTarget}
                onChange={e => save({ ...settings, stepsTarget: Number(e.target.value) })}
              />
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                Default: 10.000 langkah per hari
              </p>
            </div>
          )}
        </div>

        {/* ── Custom Ibadah Items ── */}
        <div className="card animate-fade-up-1" style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => toggleSection('ibadah')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>🕌</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Ibadah Custom</span>
              <span className="badge badge-green">{settings.customIbadahItems.length}</span>
            </div>
            {expanded === 'ibadah' ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
          </button>

          {expanded === 'ibadah' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              {settings.customIbadahItems.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Belum ada item custom</p>
              ) : (
                settings.customIbadahItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < settings.customIbadahItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.type} {item.unit ? `· ${item.unit}` : ''}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          const updated = settings.customIbadahItems.map(it => it.id === item.id ? { ...it, active: !it.active } : it);
                          save({ ...settings, customIbadahItems: updated });
                        }}
                        className={`badge ${item.active ? 'badge-green' : 'badge-rose'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {item.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        onClick={() => save({ ...settings, customIbadahItems: settings.customIbadahItems.filter(it => it.id !== item.id) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button className="btn-ghost" style={{ width: '100%', marginTop: '0.875rem' }} onClick={() => setAddModal('ibadah')}>
                <Plus size={14} /> Tambah Item Ibadah
              </button>
            </div>
          )}
        </div>

        {/* ── Custom Gym Items ── */}
        <div className="card animate-fade-up-2" style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => toggleSection('gym')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>💪</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Workout Custom</span>
              <span className="badge badge-blue">{settings.customWorkoutItems.length}</span>
            </div>
            {expanded === 'gym' ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
          </button>

          {expanded === 'gym' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              {settings.customWorkoutItems.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Belum ada workout custom</p>
              ) : (
                settings.customWorkoutItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < settings.customWorkoutItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Target: {item.target} {item.unit}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          const updated = settings.customWorkoutItems.map(it => it.id === item.id ? { ...it, active: !it.active } : it);
                          save({ ...settings, customWorkoutItems: updated });
                        }}
                        className={`badge ${item.active ? 'badge-green' : 'badge-rose'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {item.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        onClick={() => save({ ...settings, customWorkoutItems: settings.customWorkoutItems.filter(it => it.id !== item.id) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button className="btn-ghost" style={{ width: '100%', marginTop: '0.875rem' }} onClick={() => setAddModal('gym')}>
                <Plus size={14} /> Tambah Workout
              </button>
            </div>
          )}
        </div>

        {/* ── Custom General Items ── */}
        <div className="card animate-fade-up-3" style={{ marginBottom: '0.75rem' }}>
          <button
            onClick={() => toggleSection('custom')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✨</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)' }}>Custom Umum</span>
              <span className="badge badge-gold">{settings.customGeneralItems.length}</span>
            </div>
            {expanded === 'custom' ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
          </button>

          {expanded === 'custom' && (
            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              {settings.customGeneralItems.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Belum ada item custom</p>
              ) : (
                settings.customGeneralItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < settings.customGeneralItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text)' }}>{item.name}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.type}{item.target ? ` · target ${item.target} ${item.unit}` : ''}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          const updated = settings.customGeneralItems.map(it => it.id === item.id ? { ...it, active: !it.active } : it);
                          save({ ...settings, customGeneralItems: updated });
                        }}
                        className={`badge ${item.active ? 'badge-green' : 'badge-rose'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                      >
                        {item.active ? 'Aktif' : 'Nonaktif'}
                      </button>
                      <button
                        onClick={() => save({ ...settings, customGeneralItems: settings.customGeneralItems.filter(it => it.id !== item.id) })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))
              )}
              <button className="btn-ghost" style={{ width: '100%', marginTop: '0.875rem' }} onClick={() => setAddModal('custom')}>
                <Plus size={14} /> Tambah Item Custom
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="card animate-fade-up-4">
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.875rem' }}>⚠️ Danger Zone</p>
          <button
            className="btn-ghost"
            style={{ width: '100%', color: 'var(--accent-rose)', borderColor: 'var(--accent-rose)' }}
            onClick={() => {
              if (confirm('Yakin ingin menghapus SEMUA data? Aksi ini tidak bisa dibatalkan!')) {
                const keys = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if (k && k.startsWith('mytracker_')) keys.push(k);
                }
                keys.forEach(k => localStorage.removeItem(k));
                alert('Semua data telah dihapus.');
                window.location.reload();
              }
            }}
          >
            🗑️ Reset Semua Data
          </button>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={!!addModal}
        onClose={() => { setAddModal(null); setNewItemForm({ name: '', type: 'checklist', target: '', unit: '' }); }}
        title={`Tambah ${addModal === 'ibadah' ? 'Item Ibadah' : addModal === 'gym' ? 'Workout' : 'Item Custom'}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Nama *</label>
            <input type="text" className="input-field" placeholder="Nama item" value={newItemForm.name} onChange={e => setNewItemForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </div>
          {addModal !== 'gym' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Tipe</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['checklist', 'number'] as const).map(t => (
                  <button key={t} className={`radio-pill ${newItemForm.type === t ? 'active-masjid' : ''}`} onClick={() => setNewItemForm(f => ({ ...f, type: t }))} style={{ flex: 1, padding: '0.5rem' }}>
                    {t === 'checklist' ? '✓ Checklist' : '# Angka'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(addModal === 'gym' || newItemForm.type === 'number') && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Target</label>
                <input type="number" className="input-field" placeholder="100" value={newItemForm.target} onChange={e => setNewItemForm(f => ({ ...f, target: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Satuan</label>
                <input type="text" className="input-field" placeholder="x / kg / L" value={newItemForm.unit} onChange={e => setNewItemForm(f => ({ ...f, unit: e.target.value }))} />
              </div>
            </div>
          )}
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleAddItem}>Simpan</button>
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
