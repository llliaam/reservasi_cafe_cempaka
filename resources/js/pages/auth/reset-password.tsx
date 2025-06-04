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

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
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
                                Create New<br />
                                <span className="text-orange-300 drop-shadow-lg">Password</span>
                            </h2>
                            <p className="mb-6 text-base text-orange-100 xl:text-lg drop-shadow-md">
                                Your password reset link has been verified. Please enter your new password to secure your Cempaka Cafe account.
                            </p>
                            <div className="flex space-x-2">
                                <div className="w-12 h-1 bg-orange-400 rounded-full shadow-md" />
                                <div className="w-6 h-1 rounded-full shadow-sm bg-orange-300/50" />
                                <div className="w-6 h-1 rounded-full shadow-sm bg-orange-300/30" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Reset Password form */}
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
                            <h1 className="mb-1 text-xl font-bold text-gray-800 lg:text-2xl">Set New Password</h1>
                            <p className="text-xs font-medium text-gray-600 lg:text-sm">Enter your new password below</p>
                        </div>

                        <form className="space-y-3" onSubmit={submit}>
                            {/* Email field (readonly) */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    readOnly
                                    className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 bg-gray-100 border border-gray-200 shadow-sm cursor-not-allowed rounded-xl"
                                />
                                <InputError message={errors.email} />
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                    New Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoFocus
                                    tabIndex={2}
                                    autoComplete="new-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* Confirm Password field */}
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            {/* Submit button */}
                            <Button
                                type="submit"
                                className="w-full py-2 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-orange-400/20"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                        Updating Password...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </Button>

                            {/* Back to login link */}
                            <div className="pt-2 text-center border-t border-gray-100">
                                <p className="text-sm text-gray-600">
                                    Remember your password?{' '}
                                    <TextLink
                                        href={route('login')}
                                        tabIndex={5}
                                        className="font-semibold text-orange-500 transition-colors duration-200 hover:text-orange-600"
                                    >
                                        Back to Login
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
