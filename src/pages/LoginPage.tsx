import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Bot, BarChart3, Truck, ShoppingBag, Mail, Lock, ArrowLeft } from 'lucide-react';
import SignUpPage from './SignUpPage';
import { sendLoginNotification } from '@/lib/email-service';

const roles: {role: UserRole;label: string;description: string;icon: typeof Bot;}[] = [
{ role: 'customer', label: 'Customer', description: 'Browse products, track orders, chat with AI', icon: ShoppingBag },
{ role: 'owner', label: 'Business Owner', description: 'Revenue analytics, inventory, AI copilot', icon: BarChart3 },
{ role: 'operations_manager', label: 'Operations Manager', description: 'Deliveries, logistics, operational alerts', icon: Truck }];


export default function LoginPage() {
  const { login, loginWithCredentials } = useAuth();
  const [mode, setMode] = useState<'select' | 'credentials' | 'signup'>('select');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithCredentials(email, password);

      // Send login notification email (fire-and-forget — non-blocking)
      sendLoginNotification(email.split('@')[0], email);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Show SignUp page
  if (mode === 'signup') {
    return <SignUpPage onBackToLogin={() => setMode('select')} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg">
        
        <div className="mb-8 text-center">
          

          
          <h1 className="text-3xl font-bold font-display text-foreground">NexusOps AI</h1>
          <p className="mt-2 text-muted-foreground">Autonomous Business Operations Platform</p>
        </div>

        {mode === 'select' ?
        <>
            {/* Quick demo role selection */}
            <div className="space-y-3">
              {roles.map((r, i) =>
            <motion.button
              key={r.role}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              onClick={() => login(r.role)}
              className="group flex w-full items-center gap-4 rounded-lg border bg-card p-5 text-left shadow-card transition-all hover:shadow-card-hover hover:border-primary/30">
              
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <r.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold font-display text-card-foreground">{r.label}</p>
                    <p className="text-sm text-muted-foreground">{r.description}</p>
                  </div>
                </motion.button>
            )}
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or sign in with credentials</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <button
              onClick={() => setMode('credentials')}
              className="w-full rounded-lg border bg-card p-3 text-sm font-medium text-card-foreground shadow-card transition-all hover:shadow-card-hover hover:border-primary/30">
              
                <Mail className="inline h-4 w-4 mr-2" />
                Sign in with Email & Password
              </button>

              <button
              onClick={() => setMode('signup')}
              className="w-full rounded-lg gradient-ai p-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              
                Create a New Account
              </button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Demo mode — select a role to explore, or sign up for full backend integration
            </p>
          </> :

        <>
            {/* Email/password login form */}
            <form onSubmit={handleCredentialLogin} className="space-y-4">
              <button
              type="button"
              onClick={() => {setMode('select');setError('');}}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              
                <ArrowLeft className="h-4 w-4" /> Back to role selection
              </button>

              {error &&
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
            }

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
                  className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                
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
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border bg-secondary/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
                
                </div>
              </div>

              <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg gradient-ai py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('signup')} className="font-medium text-primary hover:underline">
                  Sign up
                </button>
              </p>
            </form>
          </>
        }
      </motion.div>
    </div>);

}