# Remember Me — Sessão Persistente — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ligar o checkbox "Lembrar-me" na tela de login para persistir a sessão 365 dias (marcado) ou 30 dias (desmarcado), com TTL correto tanto no cookie do browser quanto no token Sanctum do servidor.

**Architecture:** O frontend passa `remember_me: boolean` no body do login. O backend cria o token Sanctum com `expiresAt` por token e retorna `expires_at` ISO 8601 na resposta. O frontend calcula os dias restantes a partir de `expires_at` e seta o cookie com `Max-Age` correspondente.

**Tech Stack:** Laravel 13 + Sanctum (backend), Next.js 16 + React 19 + react-hook-form + Zod (frontend), `document.cookie` para gestão de cookies.

---

## Mapa de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `backend/app/Http/Requests/LoginRequest.php` | Modificar | Aceitar campo `remember_me` |
| `backend/app/Services/AuthService.php` | Modificar | Calcular TTL e criar token com `expiresAt` |
| `backend/app/Http/Controllers/AuthController.php` | Modificar | Retornar `expires_at` na resposta |
| `backend/tests/Feature/AuthLoginTest.php` | Criar | Testar TTL dos tokens |
| `frontend/src/features/auth/auth.types.ts` | Modificar | Adicionar `remember_me` ao form schema e `expires_at` ao response schema |
| `frontend/src/features/auth/auth.api.ts` | Modificar | Passar `remember_me` no body da requisição |
| `frontend/src/lib/cookies.ts` | Modificar | Suportar `maxAgeDias` no `setCookie` e `setToken` |
| `frontend/src/contexts/AuthContext.tsx` | Modificar | Aceitar `rememberMe`, calcular dias e setar cookie com TTL |
| `frontend/src/app/login/page.tsx` | Modificar | Registrar checkbox no react-hook-form |

---

## Task 1: Backend — Aceitar `remember_me` no request

**Files:**
- Modify: `backend/app/Http/Requests/LoginRequest.php`

- [ ] **Step 1: Adicionar regra `remember_me`**

Abrir `backend/app/Http/Requests/LoginRequest.php`. Substituir o método `rules()` por:

```php
public function rules(): array
{
    return [
        'email'       => ['required', 'email'],
        'senha'       => ['required', 'string'],
        'remember_me' => ['nullable', 'boolean'],
    ];
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/app/Http/Requests/LoginRequest.php
git commit -m "feat(auth): aceita campo remember_me no LoginRequest"
```

---

## Task 2: Backend — Criar token com TTL e retornar `expires_at`

**Files:**
- Modify: `backend/app/Services/AuthService.php`
- Modify: `backend/app/Http/Controllers/AuthController.php`

- [ ] **Step 1: Atualizar `AuthService::login()`**

Abrir `backend/app/Services/AuthService.php`. Substituir o bloco de criação do token dentro de `login()`:

```php
// Antes:
$usuario->tokens()->delete();
$token = $usuario->createToken('api')->plainTextToken;

return [
    'token'   => $token,
    'usuario' => $usuario,
    'tenant'  => tenancy()->tenant,
];
```

```php
// Depois:
$usuario->tokens()->delete();
$dias      = ($dados['remember_me'] ?? false) ? 365 : 30;
$expiresAt = now()->addDays($dias);
$token     = $usuario->createToken('api', ['*'], $expiresAt)->plainTextToken;

return [
    'token'      => $token,
    'expires_at' => $expiresAt->toISOString(),
    'usuario'    => $usuario,
    'tenant'     => tenancy()->tenant,
];
```

- [ ] **Step 2: Retornar `expires_at` no `AuthController::login()`**

Abrir `backend/app/Http/Controllers/AuthController.php`. Substituir o `return response()->json(...)` dentro de `login()`:

```php
// Antes:
return response()->json([
    'token'   => $resultado['token'],
    'usuario' => $resultado['usuario'],
    'tenant'  => $resultado['tenant'],
]);
```

```php
// Depois:
return response()->json([
    'token'      => $resultado['token'],
    'expires_at' => $resultado['expires_at'],
    'usuario'    => $resultado['usuario'],
    'tenant'     => $resultado['tenant'],
]);
```

- [ ] **Step 3: Criar teste feature**

Criar arquivo `backend/tests/Feature/AuthLoginTest.php`:

```php
<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

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
```

> **Nota:** Estes testes requerem um tenant configurado com um usuário `admin@teste.com` / `senha123`. Adapte as credenciais ao ambiente de testes do projeto ou mocke a autenticação conforme o padrão já usado.

- [ ] **Step 4: Rodar testes (a partir de `backend/`)**

```bash
composer run test
```

Os testes de `AuthLoginTest` podem falhar se não houver tenant e usuário de teste configurados — isso é esperado neste momento. O importante é que a aplicação não quebre (sem erros 500).

- [ ] **Step 5: Commit**

```bash
git add backend/app/Services/AuthService.php backend/app/Http/Controllers/AuthController.php backend/tests/Feature/AuthLoginTest.php
git commit -m "feat(auth): token com TTL por remember_me e expires_at na resposta"
```

---

## Task 3: Frontend — Atualizar tipos e schemas

**Files:**
- Modify: `frontend/src/features/auth/auth.types.ts`

- [ ] **Step 1: Adicionar `remember_me` ao `loginFormSchema`**

Abrir `frontend/src/features/auth/auth.types.ts`. Substituir:

```ts
export const loginFormSchema = z.object({
  empresa: z.string().min(1, "Informe a empresa"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha"),
});
```

Por:

```ts
export const loginFormSchema = z.object({
  empresa:     z.string().min(1, "Informe a empresa"),
  email:       z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha:       z.string().min(1, "Informe a senha"),
  remember_me: z.boolean().default(false),
});
```

- [ ] **Step 2: Adicionar `expires_at` ao `loginResponseSchema`**

No mesmo arquivo, substituir:

```ts
export const loginResponseSchema = z.object({
  token:   z.string(),
  usuario: usuarioSchema,
  tenant:  tenantInfoSchema,
});
```

Por:

```ts
export const loginResponseSchema = z.object({
  token:      z.string(),
  expires_at: z.string(),
  usuario:    usuarioSchema,
  tenant:     tenantInfoSchema,
});
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/features/auth/auth.types.ts
git commit -m "feat(auth): adiciona remember_me ao form schema e expires_at ao response schema"
```

---

## Task 4: Frontend — Passar `remember_me` na API

**Files:**
- Modify: `frontend/src/features/auth/auth.api.ts`

- [ ] **Step 1: Atualizar assinatura e body de `loginApi`**

Abrir `frontend/src/features/auth/auth.api.ts`. Substituir:

```ts
export async function loginApi(
  tenantSlug: string,
  email: string,
  senha: string
): Promise<LoginResponse> {
  const raw = await api.post("/v1/auth/login", { email, senha });
  return mapLoginResponse(raw);
}
```

Por:

```ts
export async function loginApi(
  tenantSlug: string,
  email: string,
  senha: string,
  rememberMe: boolean
): Promise<LoginResponse> {
  const raw = await api.post("/v1/auth/login", { email, senha, remember_me: rememberMe });
  return mapLoginResponse(raw);
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/features/auth/auth.api.ts
git commit -m "feat(auth): passa remember_me no body do loginApi"
```

---

## Task 5: Frontend — Suporte a `maxAgeDias` nos cookies

**Files:**
- Modify: `frontend/src/lib/cookies.ts`

- [ ] **Step 1: Atualizar `setCookie` e `cookieClient.setToken`**

Abrir `frontend/src/lib/cookies.ts`. Substituir o conteúdo completo por:

```ts
export const TOKEN_COOKIE  = 'axios_token';
export const TENANT_COOKIE = 'axios_tenant';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAgeDias?: number): void {
  const maxAge = maxAgeDias != null ? `; Max-Age=${maxAgeDias * 86400}` : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${maxAge}`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export const cookieClient = {
  getToken:    ():                      string | null => getCookie(TOKEN_COOKIE),
  setToken:    (value: string, maxAgeDias?: number): void => setCookie(TOKEN_COOKIE, value, maxAgeDias),
  removeToken: ():                      void         => removeCookie(TOKEN_COOKIE),

  getTenant:    (): string | null => getCookie(TENANT_COOKIE),
  setTenant:    (value: string):  void => setCookie(TENANT_COOKIE, value),
  removeTenant: ():               void => removeCookie(TENANT_COOKIE),

  clear: (): void => {
    removeCookie(TOKEN_COOKIE);
    removeCookie(TENANT_COOKIE);
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/cookies.ts
git commit -m "feat(auth): setCookie e cookieClient.setToken aceitam maxAgeDias"
```

---

## Task 6: Frontend — `AuthContext` usa `expires_at` para calcular TTL do cookie

**Files:**
- Modify: `frontend/src/contexts/AuthContext.tsx`

- [ ] **Step 1: Atualizar interface e função `login`**

Abrir `frontend/src/contexts/AuthContext.tsx`. Substituir a interface `AuthContextValue` e a função `login`:

```ts
// Antes — interface:
interface AuthContextValue extends AuthState {
  login: (tenant: string, email: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

```ts
// Depois — interface:
interface AuthContextValue extends AuthState {
  login: (tenant: string, email: string, senha: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
}
```

```ts
// Antes — função login dentro do AuthProvider:
async function login(tenantSlug: string, email: string, senha: string): Promise<void> {
  cookieClient.setTenant(tenantSlug);

  const { token, usuario, tenant } = await loginApi(tenantSlug, email, senha);

  cookieClient.setToken(token);
  setState({ usuario, tenant, isAuthenticated: true, isLoading: false });
}
```

```ts
// Depois — função login dentro do AuthProvider:
async function login(tenantSlug: string, email: string, senha: string, rememberMe: boolean): Promise<void> {
  cookieClient.setTenant(tenantSlug);

  const { token, expires_at, usuario, tenant } = await loginApi(tenantSlug, email, senha, rememberMe);

  const diasParaExpirar = Math.ceil(
    (new Date(expires_at).getTime() - Date.now()) / 86_400_000
  );
  cookieClient.setToken(token, diasParaExpirar);
  setState({ usuario, tenant, isAuthenticated: true, isLoading: false });
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/contexts/AuthContext.tsx
git commit -m "feat(auth): login recebe rememberMe e seta cookie com TTL baseado em expires_at"
```

---

## Task 7: Frontend — Ligar checkbox ao react-hook-form na tela de login

**Files:**
- Modify: `frontend/src/app/login/page.tsx`

- [ ] **Step 1: Atualizar `onSubmit` para destruturar e passar `remember_me`**

Abrir `frontend/src/app/login/page.tsx`. Substituir a função `onSubmit`:

```ts
// Antes:
async function onSubmit({ empresa, email, senha }: LoginFormData) {
  try {
    await login(empresa, email, senha);
    router.push("/dashboard");
  } catch (err) {
    setError("root", {
      message: err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.",
    });
  }
}
```

```ts
// Depois:
async function onSubmit({ empresa, email, senha, remember_me }: LoginFormData) {
  try {
    await login(empresa, email, senha, remember_me);
    router.push("/dashboard");
  } catch (err) {
    setError("root", {
      message: err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.",
    });
  }
}
```

- [ ] **Step 2: Registrar o checkbox no react-hook-form**

No mesmo arquivo, substituir o `<input type="checkbox">` não conectado:

```tsx
{/* Antes: */}
<input
  type="checkbox"
  className="w-4 h-4 rounded accent-brand cursor-pointer"
/>
```

```tsx
{/* Depois: */}
<input
  type="checkbox"
  className="w-4 h-4 rounded accent-brand cursor-pointer"
  {...register("remember_me")}
/>
```

- [ ] **Step 3: Testar manualmente no browser**

1. Subir o servidor frontend: `npm run dev` (dentro de `frontend/`)
2. Acessar a tela de login
3. Fazer login **sem** marcar "Lembrar-me" → Inspecionar cookies (DevTools → Application → Cookies) → `axios_token` deve ter `Max-Age` ~30 dias
4. Fazer logout, login **com** "Lembrar-me" marcado → `axios_token` deve ter `Max-Age` ~365 dias
5. Verificar no servidor (Tinker ou banco) que o token salvo em `personal_access_tokens` tem `expires_at` correspondente

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/login/page.tsx
git commit -m "feat(auth): liga checkbox remember_me ao react-hook-form"
```
