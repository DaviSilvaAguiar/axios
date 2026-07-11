<?php

declare(strict_types=1);

use App\Http\Controllers\LeadController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::controller(LeadController::class)->prefix('leads')->group(function (): void {
        Route::post('/', 'store');
    });
});
