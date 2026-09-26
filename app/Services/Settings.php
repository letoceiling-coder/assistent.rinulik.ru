<?php

namespace App\Services;

use App\Models\SystemSetting;

class Settings
{
    public function get(string $key, mixed $default = null): mixed
    {
        return SystemSetting::find($key)?->value['data'] ?? $default;
    }

    public function set(string $key, mixed $value): void
    {
        SystemSetting::updateOrCreate(['key' => $key], ['value' => ['data' => $value]]);
    }
}
