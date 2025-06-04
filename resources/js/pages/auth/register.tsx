import { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import logo from '@/assets/images/cempaka-logo.jpg';
import bg from '@/assets/images/image.png';
import axios from 'axios';

type RegisterForm = {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    otp: string;
};

export default function Register() {
    const [step, setStep] = useState(1);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);

    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        otp: '',
    });

    // Timer for OTP countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(timer => timer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    // Send OTP function
    const sendOtp = async () => {
        try {
            const response = await axios.post(route('send-otp'), {
                email: data.email
            });

            if (response.data.success) {
                setIsOtpSent(true);
                setOtpTimer(60);
                alert('OTP has been sent to your email!');
            }
        } catch (error: any) {
            console.error('Error sending OTP:', error);
            if (error.response?.data?.message) {
                alert(error.response.data.message);
            } else {
                alert('Failed to send OTP. Please try again.');
            }
        }
    };

    // Resend OTP function
    const resendOtp = () => {
        if (otpTimer === 0) {
            sendOtp();
        }
    };

    // Format phone number function
    const formatPhoneNumber = (value: string) => {
        // Remove all non-digit characters
        const cleaned = value.replace(/\D/g, '');

        // Apply formatting: XXXX XXXX XXXX
        let formatted = '';
        for (let i = 0; i < cleaned.length && i < 12; i++) {
            if (i > 0 && i % 4 === 0) {
                formatted += ' ';
            }
            formatted += cleaned[i];
        }

        return formatted;
    };

    // Handle phone input change
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedPhone = formatPhoneNumber(e.target.value);
        setData('phone', formattedPhone);
    };

    // Validasi dan lanjut step
    const nextStep = () => {
        if (step === 1) {
            if (data.name.trim() && data.email.trim() && data.phone.trim()) {
                setStep(2);
            } else {
                alert('Please complete Name, Email, and Phone fields.');
            }
        } else if (step === 2) {
            if (data.password.trim() && data.password_confirmation.trim()) {
                // Send OTP when moving to step 3
                sendOtp();
                setStep(3);
            } else {
                alert('Please complete Password fields.');
            }
        }
    };

    // Kembali ke step sebelumnya
    const backStep = () => {
        if (step === 2) {
            setStep(1);
        } else if (step === 3) {
            setStep(2);
        }
    };

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        if (step === 3) {
            // Verify OTP first
            try {
                const verifyResponse = await axios.post(route('verify-otp'), {
                    email: data.email,
                    otp: data.otp
                });

                if (verifyResponse.data.success) {
                    // OTP verified, proceed with registration
                    post(route('register'), {
                        onFinish: () => reset('password', 'password_confirmation'),
                    });
                }
            } catch (error: any) {
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                } else {
                    alert('Invalid verification code. Please try again.');
                }
                return;
            }
        } else {
            // Regular form submission for other steps
            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    return (
        <>
            <Head title="Register" />
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
                                Join our community of food lovers. Register now to get exclusive member benefits and amazing offers.
                            </p>
                            <div className="flex space-x-2">
                                <div className={`h-1 rounded-full shadow-md transition-all duration-300 ${step === 1 ? 'w-12 bg-orange-400' : 'w-6 bg-orange-300/50'}`} />
                                <div className={`h-1 rounded-full shadow-md transition-all duration-300 ${step === 2 ? 'w-12 bg-orange-400' : 'w-6 bg-orange-300/50'}`} />
                                <div className={`h-1 rounded-full shadow-md transition-all duration-300 ${step === 3 ? 'w-12 bg-orange-400' : 'w-6 bg-orange-300/50'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Register form */}
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
                            <h1 className="mb-1 text-xl font-bold text-gray-800 lg:text-2xl">Welcome!</h1>
                            <p className="text-xs font-medium text-gray-600 lg:text-sm">Register now, to get exclusive member</p>

                            {/* Step indicators */}
                            <div className="flex justify-center mt-2 space-x-2">
                                <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${step === 1 ? 'bg-orange-500 shadow-md' : 'bg-gray-300'}`} />
                                <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${step === 2 ? 'bg-orange-500 shadow-md' : 'bg-gray-300'}`} />
                                <span className={`inline-block w-2 h-2 rounded-full transition-all duration-300 ${step === 3 ? 'bg-orange-500 shadow-md' : 'bg-gray-300'}`} />
                            </div>
                        </div>

                        <form className="space-y-3" onSubmit={submit}>
                            {step === 1 ? (
                                <>
                                    {/* Name field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Full name"
                                            className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    {/* Email field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="email@example.com"
                                            className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Phone field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            required
                                            tabIndex={3}
                                            autoComplete="tel"
                                            value={data.phone}
                                            onChange={handlePhoneChange}
                                            disabled={processing}
                                            placeholder="0812 3456 7890"
                                            maxLength={14} // 12 digits + 2 spaces
                                            className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                        />
                                        <InputError message={errors.phone} />
                                    </div>

                                    {/* Next button */}
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="w-full py-2 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border border-orange-400/20"
                                        tabIndex={4}
                                    >
                                        NEXT
                                    </Button>
                                </>
                            ) : step === 2 ? (
                                <>
                                    {/* Password field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                            Password
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            autoFocus
                                            tabIndex={5}
                                            autoComplete="new-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            disabled={processing}
                                            placeholder="Password"
                                            className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Confirm Password field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700">
                                            Confirm Password
                                        </Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            tabIndex={6}
                                            autoComplete="new-password"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            disabled={processing}
                                            placeholder="Confirm password"
                                            className="w-full px-4 py-2 font-medium text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    {/* Back and Next buttons */}
                                    <div className="flex space-x-4">
                                        <Button
                                            type="button"
                                            onClick={backStep}
                                            className="flex-1 px-6 py-2 font-semibold text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-200 shadow-md hover:bg-gray-200 rounded-xl hover:shadow-lg"
                                        >
                                            BACK
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            className="flex-1 py-2 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border border-orange-400/20"
                                            tabIndex={7}
                                        >
                                            NEXT
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Email Verification Step */}
                                    <div className="mb-4 text-center">
                                        <h3 className="mb-2 text-lg font-semibold text-gray-800">Verify Your Email</h3>
                                        <p className="text-sm text-gray-600">
                                            We've sent a verification code to<br />
                                            <span className="font-medium text-orange-600">{data.email}</span>
                                        </p>
                                    </div>

                                    {/* OTP field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="otp" className="text-sm font-semibold text-gray-700">
                                            Verification Code
                                        </Label>
                                        <Input
                                            id="otp"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={8}
                                            maxLength={6}
                                            value={data.otp}
                                            onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))}
                                            disabled={processing}
                                            placeholder="Enter 6-digit code"
                                            className="w-full px-4 py-2 text-lg font-medium tracking-widest text-center text-gray-800 placeholder-gray-400 transition-all duration-200 border border-gray-200 shadow-sm bg-gray-50 rounded-xl focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                        />
                                        <InputError message={errors.otp} />
                                    </div>

                                    {/* Resend OTP */}
                                    <div className="text-center">
                                        {otpTimer > 0 ? (
                                            <p className="text-sm text-gray-500">
                                                Resend code in {otpTimer}s
                                            </p>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={resendOtp}
                                                className="text-sm font-medium text-orange-500 transition-colors duration-200 hover:text-orange-600"
                                                disabled={processing}
                                            >
                                                Resend verification code
                                            </button>
                                        )}
                                    </div>

                                    {/* Back and Submit buttons */}
                                    <div className="flex space-x-4">
                                        <Button
                                            type="button"
                                            onClick={backStep}
                                            className="flex-1 px-6 py-2 font-semibold text-gray-700 transition-all duration-200 bg-gray-100 border border-gray-200 shadow-md hover:bg-gray-200 rounded-xl hover:shadow-lg"
                                        >
                                            BACK
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 py-2 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-orange-400/20"
                                            tabIndex={9}
                                            disabled={processing}
                                        >
                                            {processing ? (
                                                <>
                                                    <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                'Create Account'
                                            )}
                                        </Button>
                                    </div>

                                    {/* Login link */}
                                    <div className="pt-2 text-center border-t border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            Already have an account?{' '}
                                            <TextLink
                                                href={route('login')}
                                                tabIndex={10}
                                                className="font-semibold text-orange-500 transition-colors duration-200 hover:text-orange-600"
                                            >
                                                Log in
                                            </TextLink>
                                        </p>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
