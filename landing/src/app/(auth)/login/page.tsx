import { AuthForm } from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Log In | MC Plugin Builder',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
