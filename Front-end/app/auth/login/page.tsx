'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { FormInput } from '@/components/auth/FormInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { FormToggle } from '@/components/auth/FormToggle';

interface LoginFormData {
  email: string;
  password: string;
}

const loginValidationSchema = Yup.object({
  email: Yup.string().email('Please enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const resolveDashboardPath = (role?: string | null) => {
    if (role === 'admin') {
      return '/admin?entry=login';
    }

    if (role === 'driver') {
      return '/driver?entry=login';
    }

    return '/dashboard?entry=login';
  };

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        const result = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
          callbackUrl: '/dashboard?entry=login',
        });

        // If NextAuth returns an error, the credentials are invalid and we stay on this page.
        if (result?.error) {
          toast.error('Invalid email or password');
          return;
        }

        const session = await getSession();
        const destination = resolveDashboardPath(session?.user?.role);

        toast.success('Signed in successfully');
        router.push(destination);
      } catch (error) {
        toast.error('Unable to sign in right now. Please try again.');
        console.error('Login error:', error);
      } finally {
        setIsLoading(false);
      }
    },
  });

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
          <div className="backdrop-blur-md bg-orange-900/65 border border-orange-600/50 rounded-3xl shadow-2xl overflow-hidden gap-6 flex flex-col items-center justify-center">
            <div className="flex w-full flex-col items-center gap-6 px-10 py-8 sm:px-12 sm:py-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
              >
                <h1 className="text-4xl font-bold bg-linear-to-r from-white to-orange-100 bg-clip-text text-transparent mb-2">
                  RiverCity
                </h1>
                <p className="text-orange-100 text-sm">Courier Login</p>
              </motion.div>
        <div className="w-100 px-6 sm:px-8 gap-3 m-4">
              <form onSubmit={formik.handleSubmit} noValidate className=" space-y-6 text-left">
                <FormInput
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email ? formik.errors.email : undefined}
                  index={0}
                />

                <FormInput 
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password ? formik.errors.password : undefined}
                  index={1}
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

                
                  
                  <Link
                    href="#"
                    className="text-orange-200 hover:text-orange-100 transition-colors"
                  >
                    Forgot password?
                  </Link>

                <AuthButton text="Sign In" isLoading={isLoading} />
              </form>
            </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="relative w-full pt-2"
              >
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-600/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2  text-orange-200">Or <br /> continue with</span>
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
                

              <FormToggle
                text="Don't have an account?"
                linkText="Sign Up"
                href="/auth/signup"
              />
              {process.env.NODE_ENV !== 'production' && (
                <p className="text-xs text-orange-200/80">
                  Demo login: customer@test.com / Password123!
                </p>
              )}
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
