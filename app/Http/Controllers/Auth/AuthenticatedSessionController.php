<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
   public function store(LoginRequest $request): RedirectResponse
{
    // Cari user berdasarkan email atau phone
    $user = \App\Models\User::where('email', $request->email)
                           ->orWhere('phone', $request->email)
                           ->first();

    // Cek apakah user ditemukan dan statusnya diblokir
    if ($user && $user->is_blocked) {
        return redirect()->back()->withErrors([
            'email' => 'Akun Anda telah diblokir. Silakan hubungi administrator untuk informasi lebih lanjut.',
        ]);
    }

    $request->authenticate();

    $request->session()->regenerate();

    // Redirect berdasarkan role setelah login berhasil
    $user = auth()->user();

    if ($user->isAdmin()) {
        return redirect()->intended(route('adminDashboard'));
    } elseif ($user->isStaff()) {
        return redirect()->intended(route('StaffPage'));
    } else {
        return redirect()->intended(route(name: 'home'));
    }
}

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
