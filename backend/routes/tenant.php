<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\CnpjLookupController;
use App\Http\Controllers\CostCenterController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentTypeController;
use App\Http\Controllers\ExpenseCategoryController;
use App\Http\Controllers\ExpenseReportController;
use App\Http\Controllers\ExpenseReportItemController;
use App\Http\Controllers\ExportBatchController;
use App\Http\Controllers\FundController;
use App\Http\Controllers\FundTransactionController;
use App\Http\Controllers\IntegrationController;
use App\Http\Controllers\ProviderController;
use App\Http\Controllers\ReimbursementController;
use App\Http\Controllers\ReimbursementItemController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Middleware\EnsureRoleAdmin;
use App\Http\Middleware\EnsureRoleAuditor;
use Illuminate\Support\Facades\Route;

Route::middleware(['tenant.header'])->prefix('v1')->group(function (): void {
    Route::controller(AuthController::class)->prefix('auth')->group(function (): void {
        Route::post('/login', 'login');
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::controller(UserController::class)->prefix('users')->whereNumber('id')->middleware('module:users')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store')->middleware(EnsureRoleAdmin::class);
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::get('/{id}/modules', 'modules')->middleware(EnsureRoleAdmin::class);
            Route::put('/{id}/modules', 'updateModules')->middleware(EnsureRoleAdmin::class);
        });

        Route::controller(AuthController::class)->prefix('auth')->group(function (): void {
            Route::post('/logout', 'logout');
            Route::get('/me', 'me');
        });

        Route::controller(CostCenterController::class)->prefix('cost-center')->whereNumber('id')->middleware('module:cost-center')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(ReimbursementController::class)->prefix('reimbursements')->whereNumber('id')->middleware('module:reimbursement')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::patch('/{id}/status', 'updateStatus');
            Route::get('/{id}/pdf', 'generatePdf');
        });

        Route::controller(ReimbursementItemController::class)
            ->prefix('reimbursements/{id}/items')
            ->whereNumber(['id', 'itemId', 'attachmentId'])
            ->middleware('module:reimbursement')
            ->group(function (): void {
                Route::post('/', 'store');
                Route::put('/{itemId}', 'update');
                Route::delete('/{itemId}', 'destroy');
                Route::get('/{itemId}/attachment', 'serveAttachment');
                Route::post('/{itemId}/attachment', 'storeAttachment');
                Route::delete('/{itemId}/attachment', 'destroyAttachment');
                Route::post('/{itemId}/attachments', 'addAttachment');
                Route::delete('/{itemId}/attachments/{attachmentId}', 'destroySpecificAttachment');
                Route::get('/{itemId}/attachments/{attachmentId}', 'serveSpecificAttachment');
            });

        Route::controller(ExpenseReportController::class)->prefix('expense-reports')->whereNumber('id')->middleware('module:expense-reports')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::post('/{id}/approve', 'approve')->middleware(EnsureRoleAuditor::class);
            Route::get('/{id}/pdf', 'generatePdf');
        });

        Route::controller(FundController::class)
            ->prefix('funds')
            ->whereNumber('id')
            ->middleware([EnsureRoleAuditor::class, 'module:expense-reports'])
            ->group(function (): void {
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::get('/{id}', 'show');
                Route::put('/{id}', 'update');
                Route::get('/{id}/statement', 'statement');
                Route::post('/{id}/close', 'close');
            });

        Route::controller(FundTransactionController::class)
            ->prefix('funds/{id}/transacoes')
            ->whereNumber('id')
            ->middleware([EnsureRoleAuditor::class, 'module:expense-reports'])
            ->group(function (): void {
                Route::post('/credit', 'postCredit');
                Route::post('/adjustment', 'postAdjustment');
            });

        Route::controller(ExpenseReportItemController::class)
            ->prefix('expense-reports/{id}/items')
            ->whereNumber(['id', 'itemId', 'attachmentId'])
            ->middleware('module:expense-reports')
            ->group(function (): void {
                Route::post('/', 'store');
                Route::put('/{itemId}', 'update');
                Route::delete('/{itemId}', 'destroy');
                Route::post('/{itemId}/attachments', 'storeAttachment');
                Route::get('/{itemId}/attachments/{attachmentId}', 'serveAttachment');
            });

        Route::controller(ExpenseCategoryController::class)->prefix('expense-categories')->whereNumber('id')->middleware('module:expense-category')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(BankAccountController::class)->prefix('bank-accounts')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(SupplierController::class)->prefix('suppliers')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::get('/cnpj-lookup/{cnpj}', [CnpjLookupController::class, 'show'])
            ->where('cnpj', '[0-9.\-\/]+');

        Route::controller(DocumentTypeController::class)->prefix('document-types')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(SettingController::class)->prefix('settings')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::patch('/{id}', 'update');
        });

        Route::controller(ProviderController::class)->prefix('provider')->group(function (): void {
            Route::get('/transactions', 'transactions');
        });

        Route::controller(DashboardController::class)->prefix('dashboard')->middleware(EnsureRoleAuditor::class)->group(function (): void {
            Route::get('/overview', 'overview');
            Route::get('/pending-approval', 'pendingApproval');
        });

        Route::controller(ExportBatchController::class)->prefix('export')->whereNumber('id')->middleware('module:export')->group(function (): void {
            Route::get('/pending/expense-reports', 'pendingExpenseReports');
            Route::get('/pending/reimbursements', 'pendingReimbursements');
            Route::get('/pending/stats', 'pendingStats');
            Route::get('/history', 'history');
            Route::get('/templates', 'templates');
            Route::post('/generate', 'export');
            Route::get('/batches/{id}/download', 'download');
        });

        Route::controller(IntegrationController::class)->prefix('integration')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/{id}/key', 'saveKey');
            Route::post('/send', 'send');
        });
    });
});
