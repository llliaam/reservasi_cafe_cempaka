import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import logo from '@/assets/images/cempaka-logo.jpg';
import bg from '@/assets/images/image.png';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Eye, EyeOff } from 'lucide-react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const isBlockedError = errors.email && 
    (errors.email.includes('diblokir') || 
     errors.email.includes('blocked') || 
     errors.email.includes('administrator'));

    return (
        
        <>
            <Head title="Login" />
            <div className="h-screen w-screen overflow-hidden flex font-['Inter',_'Poppins',_system-ui,_sans-serif] bg-gradient-to-br from-orange-50 to-amber-50">
                {/* Left side - Modern design with shadow outline */}
                <div className="relative hidden h-full overflow-hidden lg:flex lg:w-3/5 xl:w-2/3">
                    <div
                        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                        style={{ backgroundImage: `url(${bg})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-yellow-400/20" />
                    <div className="relative z-10 flex flex-col items-start justify-center h-full p-8 text-white xl:p-16">
                        <div className="max-w-md p-6 xl:p-8 backdrop-blur-2xl bg-black/20 rounded-2xl border-white/10">
                            <h2 className="mb-4 text-3xl font-bold leading-tight xl:text-4xl drop-shadow-lg">
                                Welcome to<br />
                                <span className="text-orange-300 drop-shadow-lg">Cempaka Cafe</span>
                            </h2>
                            <p className="mb-6 text-base text-orange-100 xl:text-lg drop-shadow-md">
                                Delicious & Fresh meals await you. Sign in to explore our amazing menu and exclusive offers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="relative flex flex-col items-center justify-center w-full h-full px-6 py-4 bg-white lg:w-2/5 xl:w-1/3 lg:px-8">
                    {/* Background decoration with shadow outlines */}
                    <div className="absolute top-0 right-0 w-24 h-24 translate-x-12 -translate-y-12 rounded-full shadow-lg opacity-50 lg:w-32 lg:h-32 lg:translate-x-16 lg:-translate-y-16 bg-gradient-to-bl from-orange-100 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 -translate-x-10 translate-y-10 rounded-full shadow-lg opacity-50 lg:w-24 lg:h-24 lg:-translate-x-12 lg:translate-y-12 bg-gradient-to-tr from-amber-100 to-transparent" />

                    <div className="relative z-10 flex-shrink-0 w-full max-w-sm">
                        {/* Logo */}
                        <div className="mb-4 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 mb-2 border shadow-xl lg:w-28 lg:h-28 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl border-orange-300/20">
                                <img src={logo} alt="Cempaka Logo" className="object-cover w-16 h-16 shadow-md lg:w-20 lg:h-20 rounded-xl" />
                            </div>
                            <h1 className="mb-1 text-xl font-bold text-gray-800 lg:text-2xl">Welcome Back!</h1>
                            <p className="text-xs font-medium text-gray-600 lg:text-sm">Sign in to continue your culinary journey</p>
                        </div>

                        {/* Status message */}
                        {status && (
                            <div className="p-2 mb-3 text-sm font-medium text-green-700 border border-green-200 shadow-sm bg-green-50 rounded-xl">
                                {status}
                            </div>
                        )}

                        {/* Blocked Account Alert */}
                        {errors.email && (errors.email.includes('diblokir') || errors.email.includes('blocked') || errors.email.includes('administrator')) && (
                            <div className="p-4 mb-4 border border-red-200 shadow-sm bg-red-50 rounded-xl">
                                <div className="flex items-start space-x-3">
                                    <div className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">⚠️</div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-red-800 mb-1">
                                            Akun Diblokir
                                        </h3>
                                        <p className="text-sm text-red-700 leading-relaxed">
                                            {errors.email}
                                        </p>
                                        <div className="mt-3 p-3 bg-red-100 rounded-lg border border-red-200">
                                            <p className="text-xs text-red-800 font-medium">
                                                📞 Hubungi Administrator:
                                            </p>
                                            <p className="text-xs text-red-700 mt-1">
                                                Email: admin@cempakacafe.com<br />
                                                Phone: +62 123 456 7890<br />
                                                WhatsApp: +62 123 456 7890
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form className="space-y-3" onSubmit={submit}>
                            {/* Email/Phone field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Email Address / Phone Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email or phone number"
                                       className={`w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:ring-2 ${
                                            isBlockedError 
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                                                : errors.email 
                                                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                                                : 'border-gray-200 focus:border-orange-400 focus:ring-orange-100'
                                        }`}
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                        Password
                                    </Label>
                                </div>

                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'} // <-- ubah jadi dinamis
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-2 pr-12 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    />

                                    {/* Eye toggle icon */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-orange-500 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                       {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}

                                    </button>
                                </div>

                                <InputError message={errors.password} />

                                {canResetPassword && (
                                    <div className="pt-1">
                                        <TextLink
                                            href={route('password.request')}
                                            className="text-sm font-medium text-orange-500 transition-colors duration-200 hover:text-orange-600"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    </div>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    tabIndex={3}
                                    className="text-orange-500 border-gray-300 rounded-md shadow-sm focus:ring-orange-200"
                                />
                                <Label htmlFor="remember" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Remember me for 30 days
                                </Label>
                            </div>

                            {/* Submit button */}
                            <Button
                                type="submit"
                                className={`w-full py-2 px-6 text-white font-semibold rounded-xl shadow-lg transform transition-all duration-200 disabled:transform-none border ${
                                    isBlockedError
                                        ? 'bg-gray-400 hover:bg-gray-400 border-gray-400/20 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:scale-[1.02] border-orange-400/20'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                tabIndex={4}
                                disabled={processing || isBlockedError}
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Signing In...
                                    </>
                                ) : isBlockedError ? (
                                    'Account Blocked'
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            {/* Sign up link */}
                            <div className="pt-2 text-center border-t border-gray-100">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <TextLink
                                        href={route('register')}
                                        tabIndex={5}
                                        className="font-semibold text-orange-500 transition-colors duration-200 hover:text-orange-600"
                                    >
                                        Create Account
                                    </TextLink>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
