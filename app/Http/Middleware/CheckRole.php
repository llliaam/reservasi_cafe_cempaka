<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        
        // Check if user has any of the required roles
        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        // Redirect based on user role if they don't have required permission
        return $this->redirectBasedOnRole($user->role);
    }

    /**
     * Redirect user based on their role
     */
    private function redirectBasedOnRole($role)
    {
        switch ($role) {
            case 'admin':
                return redirect()->route('adminDashboard');
            case 'staff':
                return redirect()->route('StaffPage');
            case 'customer':
            default:
                return redirect()->route('dashboard');
        }
    }
}