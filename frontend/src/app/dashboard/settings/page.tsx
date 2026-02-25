'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function SettingsPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [dietType, setDietType] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!user) return;
    setName(user.name || '');
    setAge(user.age?.toString() || '');
    setGender(user.gender || '');
    setHeightCm(user.height_cm?.toString() || '');
    setWeightKg(user.weight_kg?.toString() || '');
    setActivityLevel(user.activity_level || '');
    setDietType(user.diet_type || '');
    setGoal(user.goal || '');
  }, [user, authLoading, router]);

  if (authLoading || !user) return <div className="flex min-h-[60vh] items-center justify-center text-text-secondary">Loading...</div>;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/user/settings', {
        method: 'PUT',
        body: JSON.stringify({
          name,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          activity_level: activityLevel || null,
          diet_type: dietType || null,
          goal: goal || null,
        }),
      });
      await refreshUser();
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  }

  const selectClass = 'w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/dashboard" className="mb-4 inline-block text-sm text-text-tertiary hover:text-text-primary">&larr; Dashboard</Link>
      <h1 className="mb-8 font-display text-2xl font-bold">Settings</h1>

      {message && <Alert variant={message.type === 'success' ? 'success' : 'error'} className="mb-6">{message.text}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />

        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Age" type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Height (cm)" type="number" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          <Input label="Weight (kg)" type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Activity Level</label>
            <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value)} className={selectClass}>
              <option value="">Select</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
              <option value="extreme">Extremely Active</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-secondary">Diet Type</label>
            <select value={dietType} onChange={(e) => setDietType(e.target.value)} className={selectClass}>
              <option value="">Select</option>
              <option value="omnivore">Omnivore</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Goal</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className={selectClass}>
            <option value="">Select</option>
            <option value="lose_weight">Lose Weight</option>
            <option value="maintain">Maintain Weight</option>
            <option value="gain_muscle">Gain Muscle</option>
            <option value="improve_health">Improve Overall Health</option>
          </select>
        </div>

        <Button type="submit" loading={saving} size="lg" className="w-full">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
