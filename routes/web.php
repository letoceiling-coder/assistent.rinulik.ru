<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\DemoController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\KnowledgeController;
use App\Http\Controllers\WebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/webhooks/notifications', [WebhookController::class, 'notification'])->middleware('throttle:120,1');
Route::post('/webhooks/{id}', [WebhookController::class, 'receive'])->middleware('throttle:300,1');
Route::prefix('api/v1')->group(function () {
    Route::get('csrf', fn () => ['token' => csrf_token()]);
    // Public website demo with a real model; rate-limited per IP, per session and by a global daily budget.
    Route::post('demo/messages', [DemoController::class, 'message'])->middleware('throttle:demo');
    Route::middleware('throttle:auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgot']);
        Route::post('reset-password', [AuthController::class, 'reset']);
    });
    Route::middleware(['auth', 'active', 'throttle:120,1'])->group(function () {
        Route::get('me', [AccountController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('password', [AuthController::class, 'password']);
        Route::get('dashboard', [AccountController::class, 'dashboard']);
        Route::get('wallet', [AccountController::class, 'wallet']);
        Route::get('usage', [AccountController::class, 'usage']);
        Route::get('leads', [AccountController::class, 'leads']);
        Route::patch('leads/{lead}', [AccountController::class, 'lead']);
        Route::post('notifications/connect', [AccountController::class, 'connectNotifications']);
        Route::patch('notifications', [AccountController::class, 'notifications']);
        Route::post('assistants/generate', [AssistantController::class, 'generate'])->middleware('throttle:5,1');
        Route::apiResource('assistants', AssistantController::class)->except('show');
        Route::get('knowledge', [KnowledgeController::class, 'index']);
        Route::post('knowledge', [KnowledgeController::class, 'store']);
        Route::post('knowledge/generate', [KnowledgeController::class, 'generate'])->middleware('throttle:5,1');
        Route::get('knowledge/{knowledge}', [KnowledgeController::class, 'show']);
        Route::delete('knowledge/{knowledge}', [KnowledgeController::class, 'destroy']);
        Route::post('knowledge/{knowledge}/upload', [KnowledgeController::class, 'upload'])->middleware('throttle:10,1');
        Route::post('knowledge/{knowledge}/text', [KnowledgeController::class, 'text']);
        Route::post('documents/{document}/retry', [KnowledgeController::class, 'retry']);
        Route::get('documents/{document}/text', [KnowledgeController::class, 'showDocument']);
        Route::patch('documents/{document}/text', [KnowledgeController::class, 'updateDocument']);
        Route::get('conversations', [ConversationController::class, 'index']);
        Route::post('assistants/{assistant}/test', [ConversationController::class, 'create']);
        Route::get('conversations/{conversation}', [ConversationController::class, 'show']);
        Route::post('conversations/{conversation}/messages', [ConversationController::class, 'send'])->middleware('throttle:20,1');
        Route::patch('conversations/{conversation}', [ConversationController::class, 'status']);
        Route::get('integrations', [IntegrationController::class, 'index']);
        Route::post('integrations', [IntegrationController::class, 'store']);
        Route::post('integrations/{integration}/reconnect', [IntegrationController::class, 'reconnect']);
        Route::post('integrations/{integration}/disconnect', [IntegrationController::class, 'disconnect']);
        Route::prefix('admin')->middleware('can:admin')->group(function () {
            Route::get('dashboard', [AdminController::class, 'dashboard']);
            Route::get('users', [AdminController::class, 'users']);
            Route::patch('users/{user}', [AdminController::class, 'user']);
            Route::get('settings', [AdminController::class, 'settings']);
            Route::patch('settings', [AdminController::class, 'saveSettings']);
            Route::get('models', [AdminController::class, 'models']);
            Route::post('models/sync', [AdminController::class, 'sync']);
            Route::put('assignments/{purpose}', [AdminController::class, 'assignment']);
            Route::get('health', [AdminController::class, 'health']);
            Route::get('audit', [AdminController::class, 'auditLogs']);
        });
    });
});
Route::get('/login', fn () => view('app'))->name('login');
Route::get('/reset-password/{token}', fn () => view('app'))->name('password.reset');
Route::get('/{path?}',fn () => view('app'))->where('path','^(?!api/|webhooks/).*$');
