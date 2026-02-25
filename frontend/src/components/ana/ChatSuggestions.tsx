'use client';

const suggestions = [
  'I have chicken, rice, and broccoli. What can I make?',
  'Suggest a high-protein vegetarian meal with lentils.',
  'I have eggs, spinach, and tomatoes. Healthy breakfast ideas?',
  'What is a balanced post-workout meal?',
];

interface Props {
  onSelect: (text: string) => void;
}

export default function ChatSuggestions({ onSelect }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover shadow-lg shadow-accent/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 3z" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold">Chat with Ana</h2>
      <p className="max-w-md text-center text-sm text-text-secondary">
        Tell me what ingredients you have, and I will suggest healthy, balanced meals personalized to your needs.
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="rounded-full border border-border bg-bg-secondary px-4 py-2 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
