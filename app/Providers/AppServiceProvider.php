<?php

namespace App\Providers;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
       Inertia::share([
        'user' => function () {
            return Auth::user()
                ? Auth::user()->only(['name', 'email'])
                : null;
        },
    ]);
    }
}
