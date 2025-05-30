import { useState } from 'react';
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

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
    });
    const [step, setStep] = useState(1);


      const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
        });
    
    // Validasi dan lanjut step
const nextStep = () => {
    if (step === 1) {
        if (data.name.trim() && data.email.trim()) {
            setStep(2);
        } else {
            alert('Please complete Name and Email fields.');
        }
    }
};

// Kembali ke step sebelumnya
const backStep = () => {
    if (step === 2) {
        setStep(1);
    }
};
        const submit: FormEventHandler = (e) => {
            e.preventDefault();
            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        };

    return (
        <div className="flex h-screen w-screen">
            {/* Gambar kiri */}
            <div className="w-3/4 bg-cover bg-center"  style={{ backgroundImage: `url(${bg})` }} />

            {/* Form kanan */}
            <div className="w-2/4 bg-[#C78C44] flex flex-col justify-center items-center px-12 relative">
                <img src={logo} alt="Cempaka Logo" className="w-28 mb-6" />

                <div className="text-white text-center">
                    <h1 className="text-4xl font-extrabold drop-shadow-lg">Welcome</h1>
                    <p className="text-md mt-2 font-semibold drop-shadow-md">Register now, to get exclusive member</p>
                    {/* Bullets */}
                    <div className="mt-3 space-x-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${step === 1 ? 'bg-white' : 'bg-gray-800'}`} />
                        <span className={`inline-block w-2 h-2 rounded-full ${step === 2 ? 'bg-white' : 'bg-gray-800'}`} />
                    </div>
                </div>
             
            <form onSubmit={submit}>
                <div className="w-full max-w-sm mt-10 space-y-4">
                    {step === 1 ? (
                        <>
                           <Label htmlFor="name">Name</Label>
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
                                                       className="bg-white text-blue-600 border border-blue-500 placeholder-blue-300 focus:ring-2 focus:ring-blue-400"
                                                   />
                                                   <InputError message={errors.name} className="mt-2" />
                            <Label htmlFor="email">Email address</Label>
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
                                                        className="bg-white text-blue-600 border border-blue-500 placeholder-blue-300 focus:ring-2 focus:ring-blue-400"
                                                    />
                                                    <InputError message={errors.email} />
                            <Button
                                onClick={nextStep}
                                className="rounded-full bg-[#153944] text-white font-bold hover:bg-[#0e2b34] w-full"
                            >
                                NEXT
                            </Button>
                        </>
                    ) : (
                        <>
                            <Label htmlFor="password">Password</Label>
                                                    <Input
                                                        id="password"
                                                        type="password"
                                                        required
                                                        tabIndex={3}
                                                        autoComplete="new-password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        disabled={processing}
                                                        placeholder="Password"
                                                        className="bg-white text-blue-600 border border-blue-500 placeholder-blue-300 focus:ring-2 focus:ring-blue-400"
                                                    />
                                                    <InputError message={errors.password} />
                           <Label htmlFor="password_confirmation">Confirm password</Label>
                                                   <Input
                                                       id="password_confirmation"
                                                       type="password"
                                                       required
                                                       tabIndex={4}
                                                       autoComplete="new-password"
                                                       value={data.password_confirmation}
                                                       onChange={(e) => setData('password_confirmation', e.target.value)}
                                                       disabled={processing}
                                                       placeholder="Confirm password"
                                                       className="bg-white text-blue-600 border border-blue-500 placeholder-blue-300 focus:ring-2 focus:ring-blue-400"
                                                   />
                                                   <InputError message={errors.password_confirmation} />
                            <div className="flex space-x-4">
                                <Button
                                    onClick={backStep}
                                  className="rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700 px-4 py-2">
                                
                                    BACK
                                </Button>
                                <Button type="submit"   className="rounded-full bg-gray-600 text-white font-bold hover:bg-gray-700 px-4 py-2"  
                                tabIndex={5} 
                                disabled={processing}>
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                  Create account
                                </Button>
                            </div>
                            <div className="text-muted-foreground text-center text-sm">
                                Already have an account?{' '}
                                 <TextLink href={route('login')} tabIndex={6}>
                                        Log in
                                 </TextLink>
                             </div>
                        </>
                    )}
                </div>
               </form>
        </div>
    </div>
    );
}
