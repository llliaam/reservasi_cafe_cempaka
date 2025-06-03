import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import logo from '@/assets/images/cempaka-logo.jpg';
import bg from '@/assets/images/image.png';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen flex font-['Inter',_'Poppins',_system-ui,_sans-serif] bg-gradient-to-br from-orange-50 to-amber-50">
                {/* Left side - Modern design with shadow outline */}
                <div className="relative hidden overflow-hidden lg:flex lg:w-3/5 xl:w-2/3">
                    <div
                        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
                        style={{ backgroundImage: `url(${bg})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-amber-500/10 to-yellow-400/20" />
                    <div className="relative z-10 flex flex-col items-start justify-center p-16 text-white">
                        <div className="max-w-md p-8 border shadow-2xl bg-black/20 rounded-2xl border-white/10">
                            <h2 className="mb-4 text-4xl font-bold leading-tight drop-shadow-lg">
                                Welcome to<br />
                                <span className="text-orange-300 drop-shadow-lg">Cempaka Cafe</span>
                            </h2>
                            <p className="mb-6 text-lg text-orange-100 drop-shadow-md">
                                Delicious & Fresh meals await you. Sign in to explore our amazing menu and exclusive offers.
                            </p>
                            <div className="flex space-x-2">
                                <div className="w-12 h-1 bg-orange-400 rounded-full shadow-md" />
                                <div className="w-6 h-1 rounded-full shadow-sm bg-orange-300/50" />
                                <div className="w-6 h-1 rounded-full shadow-sm bg-orange-300/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="relative flex flex-col items-center justify-center w-full min-h-screen px-8 py-8 bg-white lg:w-2/5 xl:w-1/3">
                    {/* Background decoration with shadow outlines */}
                    <div className="absolute top-0 right-0 w-32 h-32 translate-x-16 -translate-y-16 rounded-full shadow-lg opacity-50 bg-gradient-to-bl from-orange-100 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 -translate-x-12 translate-y-12 rounded-full shadow-lg opacity-50 bg-gradient-to-tr from-amber-100 to-transparent" />

                    <div className="relative z-10 w-full max-w-sm">
                        {/* Logo */}
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 mb-4 border shadow-xl bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl border-orange-300/20">
                                <img src={logo} alt="Cempaka Logo" className="object-cover w-12 h-12 shadow-md rounded-xl" />
                            </div>
                            <h1 className="mb-2 text-3xl font-bold text-gray-800">Welcome Back!</h1>
                            <p className="font-medium text-gray-600">Sign in to continue your culinary journey</p>
                        </div>

                        {/* Status message */}
                        {status && (
                            <div className="p-4 mb-6 text-sm font-medium text-green-700 border border-green-200 shadow-sm bg-green-50 rounded-xl">
                                {status}
                            </div>
                        )}

                        <form className="space-y-6" onSubmit={submit}>
                            {/* Email field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password field */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                        Password
                                    </Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full px-4 py-3 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                                <InputError message={errors.password} />
                                {canResetPassword && (
                                    <div className="pt-2">
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
                                className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-orange-400/20"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            {/* Sign up link */}
                            <div className="pt-4 text-center border-t border-gray-100">
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
