import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserRole, Year, Branch, Batch } from '../types';
import { LayoutDashboard, Lock, Mail, User, AlertCircle, GraduationCap, Building2, Users2 } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { api } from '../utils/api';
import { Alert, AlertDescription } from './ui/alert';
import lnmiitLogo from 'figma:asset/f574c4cf293f7e0b301cf0c3c63e420965130c74.png';

interface LoginPageProps {
  onLogin: (email: string, role: UserRole, name: string, year?: Year, branch?: Branch, batch?: Batch) => void;
  campusBackground: string;
}

export function LoginPage({ onLogin, campusBackground }: LoginPageProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('student');
  const [registerYear, setRegisterYear] = useState<Year>('Y23');
  const [registerBranch, setRegisterBranch] = useState<Branch>('CSE');
  const [registerBatch, setRegisterBatch] = useState<Batch>('B1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Define available batches for each branch based on year
  const getAvailableBatches = (year: Year, branch: Branch): Batch[] => {
    if (year === 'Y23') {
      // Y23 batch structure based on timetable data
      switch (branch) {
        case 'ECE':
          return ['A1', 'A2']; // ECE has A1 and A2
        case 'CSE':
          return ['B1', 'B2']; // CSE has B1 and B2
        case 'CCE':
          return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']; // CCE might have all batches
        case 'MECH':
          return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3']; // MECH might have all batches
        default:
          return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
      }
    } else if (year === 'Y25') {
      // Y25 has all batches for all branches
      return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
    } else {
      // Y22, Y24 - default to all batches
      return ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];
    }
  };

  // Handle branch change and reset batch if it's not available for the new branch
  const handleBranchChange = (newBranch: Branch) => {
    setRegisterBranch(newBranch);
    const availableBatches = getAvailableBatches(registerYear, newBranch);
    // If current batch is not available for the new branch, reset to first available batch
    if (!availableBatches.includes(registerBatch)) {
      setRegisterBatch(availableBatches[0]);
    }
  };

  // Handle year change and reset batch if needed
  const handleYearChange = (newYear: Year) => {
    setRegisterYear(newYear);
    const availableBatches = getAvailableBatches(newYear, registerBranch);
    // If current batch is not available for the new year, reset to first available batch
    if (!availableBatches.includes(registerBatch)) {
      setRegisterBatch(availableBatches[0]);
    }
  };

  const availableBatches = getAvailableBatches(registerYear, registerBranch);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // Clear any existing invalid session before logging in
      try {
        await supabase.auth.signOut();
      } catch (clearError) {
        // Ignore errors when clearing session
        console.log('Cleared any existing session');
      }
      
      // Sign in with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) {
        // Better error messages
        if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before logging in. Check your email inbox for a confirmation link.');
        } else if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (signInError.message.includes('Failed to fetch') || signInError.message.includes('fetch')) {
          setError('Cannot connect to authentication service. Please check your internet connection.');
        } else if (signInError.message.includes('refresh') || signInError.message.includes('Refresh Token')) {
          // Clear invalid session and ask user to retry
          try {
            await supabase.auth.signOut();
          } catch (e) {
            // Ignore
          }
          setError('Session expired. Please try logging in again.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Refresh the user to ensure we have the latest metadata
        try {
          const { data: refreshData } = await supabase.auth.getUser();
          const user = refreshData?.user || data.user;
          
          const role = (user.user_metadata?.role || 'student') as UserRole;
          const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const year = user.user_metadata?.year as Year | undefined;
          const branch = user.user_metadata?.branch as Branch | undefined;
          const batch = user.user_metadata?.batch as Batch | undefined;
          
          // Debug logging
          console.log('Login successful!');
          console.log('User metadata:', user.user_metadata);
          console.log('Extracted - Role:', role, 'Year:', year, 'Branch:', branch, 'Batch:', batch);
          
          // Validate student has required info
          if (role === 'student' && (!year || !branch || !batch)) {
            console.error('Student missing year/branch/batch. Full user object:', user);
            setError(`Student account is missing required information (Year: ${year || 'missing'}, Branch: ${branch || 'missing'}, Batch: ${batch || 'missing'}). Please contact administrator or re-register your account.`);
            setLoading(false);
            return;
          }
          
          console.log('Login complete, calling onLogin...');
          onLogin(loginEmail, role, name, year, branch, batch);
        } catch (refreshError: any) {
          console.log('⚠️ Could not refresh user metadata, using initial data');
          const user = data.user;
          const role = (user.user_metadata?.role || 'student') as UserRole;
          const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
          const year = user.user_metadata?.year as Year | undefined;
          const branch = user.user_metadata?.branch as Branch | undefined;
          const batch = user.user_metadata?.batch as Batch | undefined;
          
          onLogin(loginEmail, role, name, year, branch, batch);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('fetch'))) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Register through backend API with student details
      const result = await api.register(
        registerEmail, 
        registerPassword, 
        registerName, 
        registerRole,
        registerRole === 'student' ? registerYear : undefined,
        registerRole === 'student' ? registerBranch : undefined,
        registerRole === 'student' ? registerBatch : undefined
      );
      
      if (result.success) {
        console.log('✅ Registration successful!', result);
        
        // Show appropriate message based on email confirmation requirement
        const message = result.session === false 
          ? '🎉 Account created! Please check your email to confirm before logging in.' 
          : '🎉 Account created successfully! You can now login.';
        
        setSuccess(message);
        // Clear form
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        // Switch to login tab after a delay
        setTimeout(() => {
          const loginTab = document.querySelector('[value="login"]') as HTMLElement;
          loginTab?.click();
        }, 1500);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle specific error cases with better messages
      const errorMessage = err.message || 'Failed to register';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('fetch')) {
        setError('Cannot connect to server. Please check your internet connection and try again.');
      } else if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
        setError('This email is already registered. Please login instead or use a different email.');
        // Auto-switch to login tab after 3 seconds
        setTimeout(() => {
          const loginTab = document.querySelector('[value=\"login\"]') as HTMLElement;
          if (loginTab) {
            loginTab.click();
            setLoginEmail(registerEmail);
            setError('Account already exists. Please enter your password to login.');
          }
        }, 3000);
      } else if (errorMessage.includes('Invalid email')) {
        setError('Please enter a valid email address.');
      } else if (errorMessage.includes('Password')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${campusBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
      </div>

      {/* Centered Login Card */}
      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl bg-white/95 backdrop-blur-md border-white/50">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="flex justify-center mb-2">
              {lnmiitLogo ? (
                <img 
                  src={lnmiitLogo} 
                  alt="LNMIIT - The LNM Institute of Information Technology" 
                  className="h-24 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <LayoutDashboard className="h-11 w-11 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-3xl">CampusConnect</CardTitle>
              <CardDescription className="text-base mt-2">Lecture Hall Management System</CardDescription>
              <p className="text-xs text-gray-400 mt-1">LNMIIT</p>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="bg-green-50 text-green-900 border-green-200">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 h-11" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                  </Button>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    Don't have an account? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => {
                      const registerTab = document.querySelector('[value="register"]') as HTMLElement;
                      registerTab?.click();
                    }}>Create one</span>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="bg-green-50 text-green-900 border-green-200">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  {!error && !success && (
                    <Alert className="bg-blue-50 text-blue-900 border-blue-200">
                      <AlertDescription className="text-sm">
                        💡 Already have an account? Switch to the Login tab.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name
                    </Label>
                    <Input
                      id="register-name"
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-role">Role</Label>
                    <Select value={registerRole} onValueChange={(value) => setRegisterRole(value as UserRole)} disabled={loading}>
                      <SelectTrigger id="register-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="faculty">Faculty</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {registerRole === 'student' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="register-year" className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          Batch Year
                        </Label>
                        <Select value={registerYear} onValueChange={(value) => handleYearChange(value as Year)} disabled={loading}>
                          <SelectTrigger id="register-year">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y22">Y22 (2022 Batch)</SelectItem>
                            <SelectItem value="Y23">Y23 (2023 Batch)</SelectItem>
                            <SelectItem value="Y24">Y24 (2024 Batch)</SelectItem>
                            <SelectItem value="Y25">Y25 (2025 Batch)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-branch" className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Branch
                        </Label>
                        <Select value={registerBranch} onValueChange={(value) => handleBranchChange(value as Branch)} disabled={loading}>
                          <SelectTrigger id="register-branch">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CSE">CSE - Computer Science and Engineering</SelectItem>
                            <SelectItem value="ECE">ECE - Electronics and Communication Engineering</SelectItem>
                            <SelectItem value="CCE">CCE - Computer and Communication Engineering</SelectItem>
                            <SelectItem value="MECH">MECH - Mechanical Engineering</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-batch" className="flex items-center gap-2">
                          <Users2 className="h-4 w-4" />
                          Batch Section
                        </Label>
                        <Select value={registerBatch} onValueChange={(value) => setRegisterBatch(value as Batch)} disabled={loading}>
                          <SelectTrigger id="register-batch">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableBatches.map(batch => (
                              <SelectItem key={batch} value={batch}>
                                {batch}
                                {registerYear === 'Y23' && registerBranch === 'ECE' && (batch === 'A1' || batch === 'A2') && ' ✓'}
                                {registerYear === 'Y23' && registerBranch === 'CSE' && (batch === 'B1' || batch === 'B2') && ' ✓'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {registerYear === 'Y23' && (
                          <p className="text-xs text-gray-500 mt-1">
                            {registerBranch === 'ECE' && '💡 ECE students: Select A1 or A2'}
                            {registerBranch === 'CSE' && '💡 CSE students: Select B1 or B2'}
                            {(registerBranch === 'CCE' || registerBranch === 'MECH') && '💡 Select your batch section'}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 h-11" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Already have an account? <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => {
                      const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                      loginTab?.click();
                    }}>Sign in</span>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}