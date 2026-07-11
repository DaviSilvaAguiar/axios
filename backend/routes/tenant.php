<?php

declare(strict_types=1);

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CaixaContaController;
use App\Http\Controllers\CaixaController;
use App\Http\Controllers\CaixaDespesaController;
use App\Http\Controllers\CaixaTransacaoController;
use App\Http\Controllers\CategoriaDespesaController;
use App\Http\Controllers\ConsultaCnpjController;
use App\Http\Controllers\ContaBancariaController;
use App\Http\Controllers\FornecedorController;
use App\Http\Controllers\CentroCustoController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DespesaRcmController;
use App\Http\Controllers\IntegracaoController;
use App\Http\Controllers\LoteExportacaoController;
use App\Http\Controllers\PrestadorController;
use App\Http\Controllers\RcmController;
use App\Http\Controllers\TipoDocumentoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Middleware\EnsurePerfilAdmin;
use App\Http\Middleware\EnsurePerfilAuditor;
use Illuminate\Support\Facades\Route;

Route::middleware(['tenant.header'])->prefix('v1')->group(function (): void {

    Route::controller(AuthController::class)->prefix('auth')->group(function (): void {
        Route::post('/login', 'login');
    });

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::controller(UsuarioController::class)->prefix('usuarios')->whereNumber('id')->middleware('modulo:usuarios')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store')->middleware(EnsurePerfilAdmin::class);
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::get('/{id}/modulos', 'modulos')->middleware(EnsurePerfilAdmin::class);
            Route::put('/{id}/modulos', 'updateModulos')->middleware(EnsurePerfilAdmin::class);
        });

        Route::controller(AuthController::class)->prefix('auth')->group(function (): void {
            Route::post('/logout', 'logout');
            Route::get('/me', 'me');
        });

        Route::controller(CentroCustoController::class)->prefix('centro-custo')->whereNumber('id')->middleware('modulo:centro-custo')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(RcmController::class)->prefix('rcms')->whereNumber('id')->middleware('modulo:rcm')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::patch('/{id}/status', 'atualizarStatus');
            Route::get('/{id}/pdf', 'gerarPdf');
        });

        Route::controller(DespesaRcmController::class)
            ->prefix('rcms/{id}/despesas')
            ->whereNumber(['id', 'idDespesa', 'idAnexo'])
            ->middleware('modulo:rcm')
            ->group(function (): void {
                Route::post('/', 'store');
                Route::put('/{idDespesa}', 'update');
                Route::delete('/{idDespesa}', 'destroy');
                Route::get('/{idDespesa}/anexo', 'servirAnexo');
                Route::post('/{idDespesa}/anexo', 'storeAnexo');
                Route::delete('/{idDespesa}/anexo', 'destroyAnexo');
                Route::post('/{idDespesa}/anexos', 'adicionarAnexo');
                Route::delete('/{idDespesa}/anexos/{idAnexo}', 'destroyAnexoEspecifico');
                Route::get('/{idDespesa}/anexos/{idAnexo}', 'servirAnexoEspecifico');
            });

        Route::controller(CaixaController::class)->prefix('caixas')->whereNumber('id')->middleware('modulo:caixas')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::post('/{id}/aprovar', 'aprovar')->middleware(EnsurePerfilAuditor::class);
            Route::get('/{id}/pdf', 'gerarPdf');
        });

        Route::controller(CaixaContaController::class)
            ->prefix('caixa-conta')
            ->whereNumber('id')
            ->middleware([EnsurePerfilAuditor::class, 'modulo:caixas'])
            ->group(function (): void {
                Route::get('/', 'index');
                Route::post('/', 'store');
                Route::get('/{id}', 'show');
                Route::put('/{id}', 'update');
                Route::get('/{id}/extrato', 'extrato');
                Route::post('/{id}/fechar', 'fechar');
            });

        Route::controller(CaixaTransacaoController::class)
            ->prefix('caixa-conta/{id}/transacoes')
            ->whereNumber('id')
            ->middleware([EnsurePerfilAuditor::class, 'modulo:caixas'])
            ->group(function (): void {
                Route::post('/credito', 'lancarCredito');
                Route::post('/ajuste', 'lancarAjuste');
            });

        Route::controller(CaixaDespesaController::class)
            ->prefix('caixas/{id}/despesas')
            ->whereNumber(['id', 'idDespesa', 'idAnexo'])
            ->middleware('modulo:caixas')
            ->group(function (): void {
                Route::post('/', 'store');
                Route::put('/{idDespesa}', 'update');
                Route::delete('/{idDespesa}', 'destroy');
                Route::post('/{idDespesa}/anexos', 'storeAnexo');
                Route::get('/{idDespesa}/anexos/{idAnexo}', 'servirAnexo');
            });

        Route::controller(CategoriaDespesaController::class)->prefix('categoria-despesa')->whereNumber('id')->middleware('modulo:categoria')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(ContaBancariaController::class)->prefix('conta-bancaria')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(FornecedorController::class)->prefix('fornecedor')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::get('/consulta-cnpj/{cnpj}', [ConsultaCnpjController::class, 'show'])
            ->where('cnpj', '[0-9.\-\/]+');

        Route::controller(TipoDocumentoController::class)->prefix('tipo-documento')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::put('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
        });

        Route::controller(ConfigController::class)->prefix('configs')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::patch('/{id}', 'update');
        });

        Route::controller(PrestadorController::class)->prefix('prestador')->group(function (): void {
            Route::get('/lancamentos', 'lancamentos');
        });

        Route::controller(DashboardController::class)->prefix('dashboard')->middleware(EnsurePerfilAuditor::class)->group(function (): void {
            Route::get('/overview', 'overview');
            Route::get('/pendentes-aprovacao', 'pendentesAprovacao');
        });

        Route::controller(LoteExportacaoController::class)->prefix('exportacao')->whereNumber('id')->middleware('modulo:exportacao')->group(function (): void {
            Route::get('/pendentes/caixas', 'pendentesCaixas');
            Route::get('/pendentes/rcms', 'pendentesRcms');
            Route::get('/pendentes/stats', 'statsPendentes');
            Route::get('/historico', 'historico');
            Route::get('/templates', 'templates');
            Route::post('/gerar', 'exportar');
            Route::get('/lotes/{id}/download', 'download');
        });

        Route::controller(IntegracaoController::class)->prefix('integracao')->whereNumber('id')->group(function (): void {
            Route::get('/', 'index');
            Route::post('/{id}/chave', 'salvarChave');
            Route::post('/enviar', 'enviar');
        });
    });
});
