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
            <div className="min-h-screen flex font-sans">
                {/* Left image */}
                <div
                    className="w-3/4 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg})` }}
                ></div>

                {/* Right login form */}
                <div className="w-2/4 bg-[#C28743] flex flex-col justify-center items-center text-white px-8 relative">
                    <img src={logo} alt="Cempaka Logo" className="w-28 mb-6" />

                    <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
                    <p className="mb-6">Sign in to continue</p>

                    <form className="w-full max-w-sm space-y-4" onSubmit={submit}>
                        <Label htmlFor="email">Email address</Label>
                                               <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="email@example.com"
                                                    className="bg-white text-blue-600 border border-blue-500 placeholder-blue-300 focus:ring-2 focus:ring-blue-400"
                                                />

                                                <InputError message={errors.email} />
                                            <div className="grid gap-2">
                                                <div className="flex items-center">
                                                    <Label htmlFor="password">Password</Label>
                                                    {canResetPassword && (
                                                        <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                                            Forgot password?
                                                        </TextLink>
                                                    )}
                                                </div>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="current-password"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    placeholder="Password"
                                                    className="bg-white text-blue-600 border border-blue-500 placeholder-blue-300 focus:ring-2 focus:ring-blue-400"
                                                />
                                                <InputError message={errors.password} />
                                            </div>
                        <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>
                        <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>

                    <div className="text-foreground text-center text-sm">
                                        Don't have an account?{' '}
                                        <TextLink href={route('register')} tabIndex={5}>
                                            Sign up
                                        </TextLink>
                                    </div>
                    </form>
                </div>
            </div>
        </>
    );
}