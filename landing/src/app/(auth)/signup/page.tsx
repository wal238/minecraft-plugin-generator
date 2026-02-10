import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign Up | MC Plugin Builder',
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
