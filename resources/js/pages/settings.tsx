import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Account settings',
        href: '/settings',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Settings() {
    const { auth } = usePage<SharedData>().props;

    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data: profileData,
        setData: setProfileData,
        patch,
        errors: profileErrors,
        processing: profileProcessing,
        recentlySuccessful: profileSuccess,
    } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        put,
        reset,
        processing: passwordProcessing,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <>
            <Head title="Account settings" />

<div style={{ backgroundColor: 'rgba(255,248,236,1)', minHeight: '100vh' }}>
            <main className="max-w-2xl mx-auto p-6 space-y-12" style={{ backgroundColor: 'rgba(255,248,236,1)', minHeight: '100vh' }}>
    <Button
    variant="outline"
    onClick={() => window.history.back()}
    className="mb-1"
    style={{ backgroundColor: 'rgba(254,105,0,1)', color: 'white' }}
>
    ← Kembali
    </Button>
                {/* Form Profile */}
                <form onSubmit={handleProfileSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow text-black">
                    <HeadingSmall
                        title="Profile information"
                        description="Update your name and email address"
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData('name', e.target.value)}
                            required
                            autoComplete="name"
                            placeholder="Full name"
                        />
                        <InputError className="mt-2" message={profileErrors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Email address"
                        />
                        <InputError className="mt-2" message={profileErrors.email} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={profileProcessing} style={{ backgroundColor: 'rgba(254,105,0,1)', color: 'white' }}>
                            Save Profile
                        </Button>
                        <Transition
                            show={profileSuccess}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Profile saved</p>
                        </Transition>
                    </div>
                </form>

                {/* Form Password */}
                <form onSubmit={handlePasswordSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow text-black">
                    <HeadingSmall
                        title="Update password"
                        description="Ensure your account is using a long, random password to stay secure"
                    />

                    <div className="grid gap-2">
                        <Label htmlFor="current_password">Current password</Label>
                        <Input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            placeholder="Current password"
                        />
                        <InputError message={passwordErrors.current_password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">New password</Label>
                        <Input
                            id="password"
                            ref={passwordInput}
                            value={passwordData.password}
                            onChange={(e) => setPasswordData('password', e.target.value)}
                            type="password"
                            autoComplete="new-password"
                            placeholder="New password"
                        />
                        <InputError message={passwordErrors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            value={passwordData.password_confirmation}
                            onChange={(e) =>
                                setPasswordData('password_confirmation', e.target.value)
                            }
                            type="password"
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={passwordErrors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={passwordProcessing} style={{ backgroundColor: 'rgba(254,105,0,1)', color: 'white' }}>
                            Change Password
                        </Button>
                        <Transition
                            show={passwordSuccess}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Password updated</p>
                        </Transition>
                    </div>
                </form>

                <DeleteUser />
            </main>
        </div>
        </>
    );
}
