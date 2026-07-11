<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Testes de TTL do token de autenticação.
 *
 * Pré-requisito: requer um tenant ativo com usuário admin@teste.com / senha123.
 * Sem essa configuração, os testes retornam 404 e falham.
 */
class AuthLoginTest extends TestCase
{
    public function test_login_sem_remember_me_gera_token_com_30_dias(): void
    {
        $resposta = $this->postJson('/v1/auth/login', [
            'email'       => 'admin@teste.com',
            'senha'       => 'senha123',
            'remember_me' => false,
        ]);

        $resposta->assertStatus(200);
        $resposta->assertJsonStructure(['token', 'expires_at', 'usuario', 'tenant']);

        $expiresAt = new \DateTime($resposta->json('expires_at'));
        $diffDias  = (int) (new \DateTime())->diff($expiresAt)->days;

        $this->assertEqualsWithDelta(30, $diffDias, 1);
    }

    public function test_login_com_remember_me_gera_token_com_365_dias(): void
    {
        $resposta = $this->postJson('/v1/auth/login', [
            'email'       => 'admin@teste.com',
            'senha'       => 'senha123',
            'remember_me' => true,
        ]);

        $resposta->assertStatus(200);
        $resposta->assertJsonStructure(['token', 'expires_at', 'usuario', 'tenant']);

        $expiresAt = new \DateTime($resposta->json('expires_at'));
        $diffDias  = (int) (new \DateTime())->diff($expiresAt)->days;

        $this->assertEqualsWithDelta(365, $diffDias, 1);
    }
}
