<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Send OTP to email for verification
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email'
        ]);

        $email = $request->email;

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 10 minutes
        Cache::put("otp_verification_{$email}", $otp, now()->addMinutes(10));

        try {
            // Send OTP via email
            Mail::raw("Your verification code is: {$otp}", function ($message) use ($email) {
                $message->to($email)
                        ->subject('Email Verification Code - Cempaka Cafe');
            });

            return response()->json([
                'success' => true,
                'message' => 'OTP sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send OTP'
            ], 500);
        }
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6'
        ]);

        $email = $request->email;
        $inputOtp = $request->otp;

        // Get stored OTP from cache
        $storedOtp = Cache::get("otp_verification_{$email}");

        if (!$storedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'OTP expired or not found'
            ], 400);
        }

        if ($inputOtp !== $storedOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP'
            ], 400);
        }

        // Mark email as verified
        Cache::put("email_verified_{$email}", true, now()->addMinutes(30));

        // Remove OTP from cache
        Cache::forget("otp_verification_{$email}");

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully'
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone' => 'required|string|max:20|unique:'.User::class.',phone',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'otp' => 'required|string|size:6'
        ]);

        $email = $request->email;
        $inputOtp = $request->otp;

        // Verify OTP one more time during registration
        $storedOtp = Cache::get("otp_verification_{$email}");
        $emailVerified = Cache::get("email_verified_{$email}");

        if (!$emailVerified && (!$storedOtp || $inputOtp !== $storedOtp)) {
            throw ValidationException::withMessages([
                'otp' => ['Invalid or expired verification code.'],
            ]);
        }

        // Normalize phone number format
        $phone = $this->normalizePhoneNumber($request->phone);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $phone,
            'password' => Hash::make($request->password),
            'email_verified_at' => now(), // Mark email as verified
        ]);

        // Clean up cache
        Cache::forget("otp_verification_{$email}");
        Cache::forget("email_verified_{$email}");

        event(new Registered($user));
        Auth::login($user);
        return to_route('dashboard');
    }

    /**
     * Normalize phone number to consistent format
     */
    private function normalizePhoneNumber(string $phone): string
    {
        // Remove any spaces, dashes, or parentheses
        $phone = preg_replace('/[\s\-\(\)]/', '', $phone);

        // If phone starts with 0, replace with +62
        if (str_starts_with($phone, '0')) {
            $phone = '+62' . substr($phone, 1);
        }

        // If phone doesn't start with +62, add it
        if (!str_starts_with($phone, '+62')) {
            $phone = '+62' . $phone;
        }

        return $phone;
    }
}
