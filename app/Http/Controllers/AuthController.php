<?php

namespace App\Http\Controllers;

use App\Services\RegisterUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $r, RegisterUser $action)
    {
        $r->merge(['email' => mb_strtolower(trim((string) $r->email))]);
        $data = $r->validate(['name' => 'required|string|max:100', 'email' => 'required|email|max:255|unique:users', 'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()]]);
        abort_if($data['email'] === config('assistent.admin_email'), 422, 'Этот адрес зарезервирован для администратора.');
        $u = $action->execute($data);
        Auth::login($u);
        $r->session()->regenerate();

        return response()->json(['user' => $u], 201);
    }

    public function login(Request $r)
    {
        $data = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        $data['email'] = mb_strtolower(trim($data['email']));
        $data['blocked'] = false;
        if (! Auth::attempt($data)) {
            throw ValidationException::withMessages(['email' => 'Неверный email или пароль.']);
        }
        $r->session()->regenerate();

        return ['user' => $r->user()];
    }

    public function logout(Request $r)
    {
        Auth::logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();

        return ['ok' => true];
    }

    public function forgot(Request $r)
    {
        $r->validate(['email' => 'required|email']);
        if (config('mail.default') === 'log') {
            abort(503, 'Почтовая служба ещё не настроена. Обратитесь к администратору.');
        }
        Password::sendResetLink($r->only('email'));

        return ['message' => 'Если адрес зарегистрирован, мы отправили письмо для восстановления.'];
    }

    public function reset(Request $r)
    {
        $r->validate(['token' => 'required', 'email' => 'required|email', 'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()]]);
        $status = Password::reset($r->only('email', 'password', 'password_confirmation', 'token'), function ($u, $p) {
            $u->password = $p;
            $u->remember_token = Str::random(60);
            $u->save();
        });
        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages(['email' => 'Ссылка недействительна или истекла.']);
        }

        return ['ok' => true];
    }

    public function password(Request $r)
    {
        $r->validate(['current_password' => 'required|current_password', 'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()]]);
        $r->user()->forceFill(['password' => $r->password, 'must_change_password' => false])->save();
        $r->session()->regenerate();

        return ['ok' => true];
    }
}
