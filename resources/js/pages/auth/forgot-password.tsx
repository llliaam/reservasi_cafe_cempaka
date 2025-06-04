import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import logo from '@/assets/images/cempaka-logo.jpg';
import bg from '@/assets/images/image.png';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot Password" />
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
                                Forgot Your<br />
                                <span className="text-orange-300 drop-shadow-lg">Password?</span>
                            </h2>
                            <p className="mb-6 text-base text-orange-100 xl:text-lg drop-shadow-md">
                                No worries! Enter your email address and we'll send you a reset link to get back into your account.
                            </p>
                            <div className="flex space-x-2">
                                <div className="w-12 h-1 bg-orange-400 rounded-full shadow-md" />
                                <div className="w-6 h-1 rounded-full shadow-sm bg-orange-300/50" />
                                <div className="w-6 h-1 rounded-full shadow-sm bg-orange-300/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Forgot Password form */}
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
                            <h1 className="mb-1 text-xl font-bold text-gray-800 lg:text-2xl">Reset Password</h1>
                            <p className="text-xs font-medium text-gray-600 lg:text-sm">Enter your email to receive reset instructions</p>
                        </div>

                        {/* Status message */}
                        {status && (
                            <div className="p-2 mb-3 text-sm font-medium text-green-700 border border-green-200 shadow-sm bg-green-50 rounded-xl">
                                {status}
                            </div>
                        )}

                        <form className="space-y-3" onSubmit={submit}>
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
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="w-full py-2 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-orange-400/20"
                                tabIndex={2}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Sending Reset Link...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>

                            {/* Back to login link */}
                            <div className="pt-2 text-center border-t border-gray-100">
                                <p className="text-sm text-gray-600">
                                    Remember your password?{' '}
                                    <TextLink
                                        href={route('login')}
                                        tabIndex={3}
                                        className="font-semibold text-orange-500 transition-colors duration-200 hover:text-orange-600"
                                    >
                                        Back to Login
                                    </TextLink>
                                </p>
                            </div>

                            {/* Sign up link */}
                            <div className="text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <TextLink
                                        href={route('register')}
                                        tabIndex={4}
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
