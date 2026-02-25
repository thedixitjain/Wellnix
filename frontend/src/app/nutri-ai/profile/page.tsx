import ProfileForm from '@/components/nutri-ai/ProfileForm';

export default function NutriProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-2 font-display text-2xl font-bold">Your Profile</h1>
      <p className="mb-8 text-text-secondary">Tell us about yourself so we can personalize your nutrition analysis.</p>
      <ProfileForm />
    </div>
  );
}
