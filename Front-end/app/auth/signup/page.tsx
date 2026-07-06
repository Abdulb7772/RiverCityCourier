'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { FormInput } from '@/components/auth/FormInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { FormToggle } from '@/components/auth/FormToggle';

interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  role: 'customer' | 'driver' | 'admin';
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

const signupSchema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[0-9\s()-]{7,}$/, 'Please enter a valid phone number'),
  role: Yup.mixed<'customer' | 'driver' | 'admin'>().oneOf(['customer', 'driver', 'admin']).required('Role is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
  agreeToTerms: Yup.bool().oneOf([true], 'You must agree to the terms'),
});

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik<SignupFormData>({
    initialValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'customer',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    validationSchema: signupSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });

        const payload = await response.json();
        if (!response.ok) {
          toast.error(payload.error ?? 'Unable to create your account');
          return;
        }

        toast.success('Account created successfully');

        const destination =
          values.role === 'admin'
            ? '/admin?entry=signup'
            : values.role === 'driver'
              ? '/driver?entry=signup'
              : '/dashboard?entry=signup';

        const loginResult = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
          callbackUrl: destination,
        });

        if (loginResult?.error) {
          toast.error('Account created, but automatic login failed. Please sign in.');
          router.push('/auth/login');
          return;
        }

        toast.success('Signed in successfully');
        router.push(loginResult?.url ?? destination);
      } catch (err) {
        toast.error('Signup failed. Please try again.');
        console.error('Signup error:', err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formik.values.password);
  const strengthConfig = [
    { label: 'Very Weak', text: 'text-red-400', color: 'bg-red-500' },
    { label: 'Weak', text: 'text-orange-400', color: 'bg-orange-500' },
    { label: 'Fair', text: 'text-yellow-400', color: 'bg-yellow-500' },
    { label: 'Strong', text: 'text-emerald-400', color: 'bg-emerald-500' },
    { label: 'Very Strong', text: 'text-emerald-300', color: 'bg-emerald-400' },
  ] as const;

  const currentStrength = strengthConfig[Math.min(passwordStrength, strengthConfig.length - 1)];

  return (
    <div className="min-h-screen w-full">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md mx-auto"
        >
          <div className="backdrop-blur-md bg-orange-900/65 border border-orange-600/50 rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex w-full flex-col items-center gap-6 px-8 py-8 sm:px-10 sm:py-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <h1 className="text-4xl font-bold bg-linear-to-r from-white to-orange-100 bg-clip-text text-transparent mb-2">
                  RiverCity
                </h1>
                <p className="text-orange-100 text-sm">Create your courier account</p>
                <p className="mt-1 text-xs text-orange-200/90">Choose customer, driver, or admin based on how you use the platform.</p>
              </motion.div>
            <div className="w-100 px-6 sm:px-8 gap-3 m-4">
              <form onSubmit={formik.handleSubmit} className="w-full space-y-6 text-left">
                <FormInput
                  label="Full Name"
                  name="fullName"
                  placeholder="John Doe"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.fullName ? formik.errors.fullName : undefined}
                  index={0}
                />

                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email ? formik.errors.email : undefined}
                  index={1}
                />

                <FormInput
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone ? formik.errors.phone : undefined}
                  index={2}
                />

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium text-orange-100">
                    Account Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-lg border border-orange-600/50 bg-orange-950/40 px-4 py-3 text-sm text-orange-50 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
                  >
                    <option value="customer">Customer</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formik.touched.role && formik.errors.role && (
                    <p className="text-xs text-red-400">{formik.errors.role}</p>
                  )}
                </div>

                <FormInput
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password ? formik.errors.password : undefined}
                  index={3}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="text-orange-300/70 transition hover:text-orange-100"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                {formik.values.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <div className="flex gap-1.5">
                      {strengthConfig.map((strength, index) => (
                        <motion.div
                          key={strength.label}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            index <= passwordStrength ? strength.color : 'bg-orange-900/40'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-xs font-medium ${currentStrength.text}`}>
                        {currentStrength.label}
                      </p>
                      <p className="text-xs text-orange-300/60">
                        {passwordStrength < 2 && 'Add uppercase & numbers'}
                        {passwordStrength === 2 && 'Add a special character'}
                        {passwordStrength === 3 && 'Almost there!'}
                        {passwordStrength === 4 && 'Great password ✓'}
                      </p>
                    </div>
                  </motion.div>
                )}

                <FormInput
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
                  index={4}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="text-orange-300/70 transition hover:text-orange-100"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                />

                <div className="mt-2 mb-3 flex flex-col gap-2">
                  <div className="flex items-start gap-6">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formik.values.agreeToTerms}
                    onChange={formik.handleChange}
                    className="mt-1 rounded bg-orange-800 border-orange-600 text-orange-400 focus:ring-orange-400"
                  />
                  <label className="text-orange-100 text-xs">
                    I agree to the{' '}
                    <Link href="#" className="text-orange-300 hover:text-orange-200">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-orange-300 hover:text-orange-200">
                      Privacy Policy
                    </Link>
                  </label>
                  </div>
                {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                  <p className="text-red-400 text-xs">{formik.errors.agreeToTerms}</p>
                )}
              </div>
                <AuthButton text="Create Account" isLoading={isLoading} />
                
              </form>
            </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="relative w-full pt-1"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-600/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-orange-900/65 text-orange-200">Or</span>
                </div>
              </motion.div>

              <div className="flex flex-col items-center gap-4 w-full">
                <button
                  type="button"
                  className="py-6 w-100 bg-orange-800/40 border border-orange-600/50 rounded-lg hover:border-orange-500 transition-all duration-300 text-orange-50 text-sm font-medium hover:bg-orange-800/60"
                >
                  Google
                </button>
                <button
                  type="button"
                  className="py-6 px-4 w-100 bg-orange-800/40 border border-orange-600/50 rounded-lg hover:border-orange-500 transition-all duration-300 text-orange-50 text-sm font-medium hover:bg-orange-800/60"
                >
                  GitHub
                </button>
                </div>

              <FormToggle text="Already have an account?" linkText="Sign In" href="/auth/login" />
            </div>
          </div>

          <motion.div
            animate={{ float: [0, 20, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-20 -left-20 w-40 h-40 bg-orange-400/30 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ float: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"
          />
        </motion.div>
      </div>
    </div>
  );
}
