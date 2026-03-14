import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Mail, Lock, User, ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { apiRegister } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { sendWelcomeEmail } from '@/lib/email-service';

const roleOptions = [
  { value: 'customer', label: 'Customer', description: 'Shop products, track orders, chat with AI support', icon: User },
  { value: 'owner', label: 'Business Owner', description: 'Manage products, view analytics, AI business copilot', icon: Building2 },
  { value: 'operations_manager', label: 'Operations Manager', description: 'Manage deliveries, monitor logistics, handle alerts', icon: ShieldCheck },
];

interface SignUpPageProps {
  onBackToLogin: () => void;
}

export default function SignUpPage({ onBackToLogin }: SignUpPageProps) {
  const { setUserFromRegister } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleSignUp = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await apiRegister({
        email,
        password,
        name,
        role,
        business_id: role === 'owner' ? undefined : 'b1', // customers/ops join default business
      });
      localStorage.setItem('access_token', result.access_token);
      setUserFromRegister(result.user);

      // Send welcome email (fire-and-forget — non-blocking)
      sendWelcomeEmail(name, email, role);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-ai">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Create Account</h1>
          <p className="mt-2 text-muted-foreground">Join the NexusOps AI platform</p>
        </div>

        {/* Step indicators */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <div className={`h-2 w-12 rounded-full transition-colors ${step >= 1 ? 'gradient-ai' : 'bg-secondary'}`} />
          <div className={`h-2 w-12 rounded-full transition-colors ${step >= 2 ? 'gradient-ai' : 'bg-secondary'}`} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {step === 1 ? (
          /* Step 1 — Credentials */
          <form onSubmit={handleStep1} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg gradient-ai py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Continue →
            </button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </button>
          </form>
        ) : (
          /* Step 2 — Role Selection */
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <p className="text-sm font-medium text-foreground">Select your role</p>

            <div className="space-y-3">
              {roleOptions.map((r) => (
                <motion.button
                  key={r.value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setRole(r.value)}
                  className={`group flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-all ${
                    role === r.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'bg-card shadow-card hover:shadow-card-hover hover:border-primary/30'
                  }`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    role === r.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                  }`}>
                    <r.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold font-display text-card-foreground">{r.label}</p>
                    <p className="text-xs text-muted-foreground">{r.description}</p>
                  </div>
                  {role === r.value && (
                    <div className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {role === 'owner' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                    className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </motion.div>
            )}

            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full rounded-lg gradient-ai py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
