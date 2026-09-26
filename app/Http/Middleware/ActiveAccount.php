<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ActiveAccount
{
    public function handle(Request $request, Closure $next)
    {
        abort_if($request->user()?->blocked, 403, 'Учётная запись заблокирована.');
        if ($request->user()?->must_change_password && ! $request->is('api/v1/me', 'api/v1/password', 'api/v1/logout')) {
            abort(403, 'Сначала смените первоначальный пароль в настройках.');
        }

        return $next($request);
    }
}
