'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';

export default function ProfileForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('moderate');
  const [diet, setDiet] = useState('omnivore');
  const [goal, setGoal] = useState('maintain');

  const selectClass = 'w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const profile = {
      age: parseInt(age) || 25,
      gender,
      height_cm: parseFloat(height) || 170,
      weight_kg: parseFloat(weight) || 70,
      activity_level: activity,
      diet_type: diet,
      goal,
      allergies: [],
      medical_history: { diseases: [] },
    };
    sessionStorage.setItem('nutri_profile', JSON.stringify(profile));
    router.push('/nutri-ai/upload');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Age</label>
          <input type="number" required min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Height (cm)</label>
          <input type="number" required step="0.1" value={height} onChange={(e) => setHeight(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Weight (kg)</label>
          <input type="number" required step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg-tertiary px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Activity Level</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className={selectClass}>
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="extreme">Extreme</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Diet</label>
          <select value={diet} onChange={(e) => setDiet(e.target.value)} className={selectClass}>
            <option value="omnivore">Omnivore</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="keto">Keto</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-secondary">Goal</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className={selectClass}>
            <option value="lose_weight">Lose Weight</option>
            <option value="maintain">Maintain</option>
            <option value="gain_muscle">Gain Muscle</option>
          </select>
        </div>
      </div>

      <Button type="submit" loading={loading} size="lg" className="w-full">Continue to Upload</Button>
    </form>
  );
}
