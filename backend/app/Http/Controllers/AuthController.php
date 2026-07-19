<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Models\User;
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
            $result = $this->service->login($request->validated());
        } catch (AuthenticationException $e) {
            return response()->json(['message' => $e->getMessage()], 401);
        }

        return response()->json([
            'token'      => $result['token'],
            'expires_at' => $result['expires_at'],
            'user'       => $result['user'],
            'tenant'     => $result['tenant'],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $this->service->logout($user);

        return response()->json(['message' => 'Session ended successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $this->service->me($user);

        return response()->json([
            'user'    => $data['user'],
            'tenant'  => $data['tenant'],
            'modules' => $data['modules'],
        ]);
    }
}
