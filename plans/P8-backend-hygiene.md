# P8 — Backend: higiene & robustez

> Resolve **D1** (PHPDoc sem padrão), **D2** (PHPDoc prosa redundante), **D3** (tratamento de erro faltando), **D4** (imports inline) e os **cleanups** (envelope de resposta inconsistente, `env()` no construtor, msg de debug vazando).
> **Depende de:** P1. **Evidência original:** `INCOMODOS-AXIOS.md` D1–D4 + cleanups.
> **Obs:** remoção de comentários (D5/D6) já foi feita no P1 — não se repete aqui.

## Itens

**1. PHPDoc padronizado (D1, D2).** Regra: PHPDoc **só onde agrega** o que o tipo não expressa (`@throws`, e `@param`/`@return` de tipos genéricos como `array<...>`). **Sem prosa** que só repete o nome do método. Aplicar a mesma regra em todo o backend (uns têm, outros não — hoje não há padrão).

**2. Imports no topo (D4).** Trocar FQN inline e imports dentro de método/closure por `use` no topo. Ex. conhecido: `\Illuminate\Contracts\Http\Kernel::class` e `Events\...` no provider de tenancy.

**3. Tratamento de erro (D3).** Muitas funções sem tratamento de retorno de erro. Definir e aplicar um padrão único de erro de domínio (ex.: exceções de domínio → handler central com HTTP code correto), acabando com a mistura atual (`ValidationException` vs `abort()` vs `RuntimeException`). Alinhar com a unificação de erro do P3.

**4. Envelope de resposta consistente (cleanup).** Hoje uns endpoints retornam model cru, outros `{mensagem,...}`, outros `{data}`, e ainda misturam chave `mensagem` (pt) e `message` (en). Padronizar um formato só — recomendado via **API Resources** — e uma língua só de chave (EN, pós-P1).

**5. `env()` fora de config (cleanup).** `env()` no construtor de service quebra com `config:cache`. Mover pra `config/` e injetar config.

**6. Msg de debug vazando (cleanup).** Remover a narrativa de investigação que virou mensagem de exceção de runtime no service da API externa.

## Checklist

- [ ] PHPDoc padronizado em todo o backend.
- [ ] Zero import inline/FQN — tudo no topo.
- [ ] Padrão único de erro aplicado.
- [ ] Envelope de resposta unificado (Resources) + chaves EN.
- [ ] `env()` só em `config/`.
- [ ] Msg de debug removida.

## Verificação / Pronto

- [ ] Análise estática/lint PHP passa (se houver — senão, revisão manual).
- [ ] Respostas da API num formato único e consistente.
- [ ] `grep` por `env(` fora de `config/` volta limpo.
