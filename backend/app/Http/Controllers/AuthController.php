<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\Usuario;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $service,
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $resultado = $this->service->login($request->validated());
        } catch (AuthenticationException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }

        return response()->json([
            'token'      => $resultado['token'],
            'expires_at' => $resultado['expires_at'],
            'usuario'    => $resultado['usuario'],
            'tenant'     => $resultado['tenant'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        $this->service->logout($usuario);

        return response()->json(['message' => 'Sessão encerrada com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var Usuario $usuario */
        $usuario = $request->user();
        $dados   = $this->service->me($usuario);

        return response()->json([
            'usuario' => $dados['usuario'],
            'tenant'  => $dados['tenant'],
            'modulos' => $dados['modulos'],
        ]);
    }
}
