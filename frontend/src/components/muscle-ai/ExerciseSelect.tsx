'use client';

const EXERCISES = [
  { id: 'regular_deadlift', label: 'Regular Deadlift' },
  { id: 'sumo_deadlift', label: 'Sumo Deadlift' },
  { id: 'squat', label: 'Squat' },
  { id: 'romanian_deadlift', label: 'Romanian Deadlift' },
  { id: 'zercher_squat', label: 'Zercher Squat' },
  { id: 'front_squat', label: 'Front Squat' },
];

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function ExerciseSelect({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {EXERCISES.map((ex) => (
        <button
          key={ex.id}
          type="button"
          onClick={() => onChange(ex.id)}
          className={`rounded-xl border p-5 text-left transition-all ${
            value === ex.id
              ? 'border-accent bg-accent-glow shadow-md shadow-accent/10'
              : 'border-border bg-bg-secondary hover:border-border-hover'
          }`}
        >
          <span className={`text-sm font-medium ${value === ex.id ? 'text-accent' : 'text-text-primary'}`}>
            {ex.label}
          </span>
        </button>
      ))}
    </div>
  );
}
