# Design: Remember Me — Sessão Persistente

**Data:** 2026-05-18  
**Status:** Aprovado

## Contexto

O formulário de login possui checkbox "Lembrar-me" que existe no UI mas não está conectado a nenhuma lógica. Cookies de token são session cookies (sem `Max-Age`), sumindo ao fechar o browser. Tokens Sanctum têm `expiration: null` (nunca expiram no servidor).

## Requisitos

| Cenário | Cookie | Token Sanctum |
|---|---|---|
| "Lembrar-me" marcado | 365 dias (`Max-Age=31536000`) | 365 dias |
| "Lembrar-me" desmarcado | 30 dias (`Max-Age=2592000`) | 30 dias |

## Abordagem Escolhida

**Abordagem A:** Frontend envia `remember_me: boolean` ao backend. Backend cria token Sanctum com `expiresAt` por token (Sanctum 3.x+). Frontend calcula `Max-Age` do cookie a partir do `expires_at` retornado pela API.

`sanctum.php` permanece com `expiration: null` — o campo `expiresAt` passado por token tem precedência.

## Design

### Backend

**`StoreLoginRequest`**
- Adiciona campo `remember_me` (booleano, nullable, default `false`)

**`AuthService::login()`**
```php
$dias = $dados['remember_me'] ? 365 : 30;
$token = $usuario->createToken('api', [], now()->addDays($dias));
```

**`AuthController::login()`**
- Resposta inclui `expires_at` (ISO 8601) além de `token` e `usuario`

### Frontend

**`auth.types.ts`**
- `loginFormSchema` adiciona `remember_me: z.boolean().default(false)`
- `loginResponseSchema` adiciona `expires_at: z.string()`

**`auth.mapper.ts`**
- `mapLoginResponse` atualizado para incluir `expires_at`

**`auth.api.ts`**
- `loginApi()` passa `remember_me` no body

**`lib/cookies.ts`**
- `setCookie()` recebe parâmetro opcional `maxAgeDias`
- Se `maxAgeDias` fornecido: `Max-Age = maxAgeDias * 86400`
- Se não fornecido: sem `Max-Age` (session cookie — expira ao fechar browser, usado apenas em outros contextos futuros)

**`AuthContext.tsx`**
- `login()` calcula `diasParaExpirar` com base em `expires_at` retornado pelo servidor
- Passa `diasParaExpirar` para `cookieClient.setToken()`

**`login/page.tsx`**
- Checkbox "Lembrar-me" registrado via `react-hook-form` (`register('remember_me')`)

### Fluxo

```
Usuário marca "Lembrar-me" → clica Login
  → POST /v1/auth/login { email, senha, remember_me: true }
  → AuthService: createToken(..., expiresAt: now() + 365 dias)
  → Resposta: { token, expires_at: "2027-05-18T...", usuario }
  → Frontend: diasParaExpirar ≈ 365
  → setCookie("axios_token", token, 365) → Max-Age=31536000

Sem "Lembrar-me":
  → remember_me: false → token expira em 30 dias
  → setCookie("axios_token", token, 30) → Max-Age=2592000

Token expirado → 401 → AuthContext logout() → redirect /login
```

## Arquivos Alterados

**Backend:**
- `backend/app/Http/Requests/StoreLoginRequest.php`
- `backend/app/Services/AuthService.php`
- `backend/app/Http/Controllers/AuthController.php`

**Frontend:**
- `frontend/src/features/auth/auth.types.ts`
- `frontend/src/features/auth/auth.mapper.ts`
- `frontend/src/features/auth/auth.api.ts`
- `frontend/src/lib/cookies.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/app/login/page.tsx`
