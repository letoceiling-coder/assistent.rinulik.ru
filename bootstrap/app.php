<?php

use App\Http\Middleware\ActiveAccount;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias(['active' => ActiveAccount::class]);
        $middleware->validateCsrfTokens(except: ['webhooks/*']);
        $middleware->trustProxies(at: ['172.18.0.0/16', '172.30.48.0/24']);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(fn ($request, $e) => $request->is('api/*', 'webhooks/*') || $request->expectsJson());
    })->create();
