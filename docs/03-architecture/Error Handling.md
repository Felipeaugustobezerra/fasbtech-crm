# Error Handling

## Versão

1.0

---

# Objetivo

Este documento define o padrão oficial de tratamento de erros do FASBtech CRM.

Toda operação da aplicação deve retornar respostas previsíveis, seguras e fáceis de tratar na interface.

O objetivo é evitar que cada módulo implemente erros de forma diferente.

---

# Princípios

O tratamento de erros deve ser:

- consistente;
- seguro;
- previsível;
- compreensível;
- rastreável;
- acessível.

Erros técnicos nunca devem ser exibidos diretamente ao utilizador.

---

# Camadas de tratamento

```text
Interface
    ↓
Server Action
    ↓
Service
    ↓
Query / Mutation
    ↓
Supabase
    ↓
PostgreSQL
```

Cada camada possui responsabilidades próprias.

---

# Responsabilidades

## Interface

Responsável por:

- exibir mensagens compreensíveis;
- associar erros aos campos corretos;
- exibir feedback de sucesso;
- permitir nova tentativa;
- preservar os dados do formulário quando possível.

A interface não deve:

- interpretar erros internos do banco;
- exibir stack traces;
- exibir códigos técnicos diretamente;
- decidir regras de autorização.

---

## Server Action

Responsável por:

- validar autenticação;
- validar autorização;
- validar entrada com Zod;
- chamar o Service ou Mutation;
- converter erros internos em respostas padronizadas;
- não expor dados sensíveis.

---

## Service

Responsável por:

- aplicar regras de negócio;
- detectar conflitos;
- lançar erros de domínio conhecidos;
- coordenar operações relacionadas.

---

## Query e Mutation

Responsáveis por:

- executar operações no banco;
- mapear erros técnicos relevantes;
- não retornar mensagens técnicas diretamente à interface.

---

## Banco de dados

Responsável por:

- constraints;
- foreign keys;
- unique constraints;
- check constraints;
- RLS;
- integridade dos dados.

---

# Contrato oficial das Server Actions

Toda Server Action deve retornar um objeto previsível.

## Sucesso

```ts
type ActionSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};
```

## Erro

```ts
type ActionError = {
  success: false;
  error: {
    code: ActionErrorCode;
    message: string;
    fieldErrors?: Record<string, string[]>;
  };
};
```

## Resultado completo

```ts
type ActionResult<T> = ActionSuccess<T> | ActionError;
```

---

# Códigos oficiais de erro

```ts
type ActionErrorCode =
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_REQUIRED"
  | "AUTHORIZATION_DENIED"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "UNEXPECTED_ERROR";
```

---

# Validation Error

Utilizado quando os dados de entrada são inválidos.

Exemplo:

```ts
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Verifique os campos informados.",
    fieldErrors: {
      name: ["O nome é obrigatório."],
      email: ["Informe um e-mail válido."]
    }
  }
}
```

A interface deve associar cada erro ao respetivo campo.

---

# Authentication Required

Utilizado quando não existe uma sessão autenticada válida.

Exemplo:

```ts
{
  success: false,
  error: {
    code: "AUTHENTICATION_REQUIRED",
    message: "A sua sessão expirou. Entre novamente."
  }
}
```

Quando adequado, a aplicação deve redirecionar para `/login`.

---

# Authorization Denied

Utilizado quando o utilizador está autenticado, mas não pode executar a operação.

Exemplo:

```ts
{
  success: false,
  error: {
    code: "AUTHORIZATION_DENIED",
    message: "Não possui permissão para executar esta ação."
  }
}
```

Nunca informar detalhes internos sobre policies, organização ou permissões.

---

# Not Found

Utilizado quando o registro não existe ou não está acessível.

Exemplo:

```ts
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "O registro solicitado não foi encontrado."
  }
}
```

Por segurança, não diferenciar entre:

- registro inexistente;
- registro pertencente a outra organização.

---

# Conflict

Utilizado quando a operação entra em conflito com o estado atual.

Exemplos:

- e-mail já utilizado;
- lead já arquivado;
- estado inválido;
- tentativa de criar duplicado;
- atualização concorrente.

```ts
{
  success: false,
  error: {
    code: "CONFLICT",
    message: "Não foi possível concluir a operação devido a um conflito."
  }
}
```

---

# Rate Limited

Reservado para limites futuros.

```ts
{
  success: false,
  error: {
    code: "RATE_LIMITED",
    message: "Muitas tentativas. Aguarde alguns instantes e tente novamente."
  }
}
```

---

# Database Error

Utilizado quando ocorre uma falha de persistência conhecida, mas não adequada para exposição direta.

```ts
{
  success: false,
  error: {
    code: "DATABASE_ERROR",
    message: "Não foi possível guardar as alterações."
  }
}
```

Detalhes técnicos devem ficar apenas nos logs do servidor.

---

# Unexpected Error

Utilizado para falhas não previstas.

```ts
{
  success: false,
  error: {
    code: "UNEXPECTED_ERROR",
    message: "Ocorreu um erro inesperado. Tente novamente."
  }
}
```

Nunca retornar:

- stack trace;
- SQL;
- informações de cookies;
- tokens;
- JWT;
- chaves;
- dados internos do Supabase.

---

# Erros de Zod

Os erros de Zod devem ser convertidos para `fieldErrors`.

Fluxo:

```text
FormData
    ↓
Zod safeParse
    ↓
Falha
    ↓
VALIDATION_ERROR
    ↓
fieldErrors
```

Nunca lançar erro de validação como exceção inesperada.

---

# Erros do Supabase

Erros do Supabase devem ser mapeados.

Exemplos:

- violação de unique constraint → `CONFLICT`;
- ausência de permissão/RLS → `AUTHORIZATION_DENIED`;
- registro não encontrado → `NOT_FOUND`;
- falha desconhecida → `DATABASE_ERROR`.

A interface não deve receber mensagens cruas do Supabase.

---

# Erros de RLS

Um bloqueio por RLS deve resultar em:

```text
AUTHORIZATION_DENIED
```

ou

```text
NOT_FOUND
```

A escolha depende do contexto.

Para leitura de registros, preferir `NOT_FOUND`.

Para ações administrativas explícitas, utilizar `AUTHORIZATION_DENIED`.

---

# Mensagens de sucesso

Mensagens de sucesso devem ser objetivas.

Exemplos:

- Lead criado com sucesso.
- Lead atualizado com sucesso.
- Lead arquivado com sucesso.
- Próximo contato atualizado.
- Status alterado com sucesso.

Evitar mensagens genéricas como:

- Operação executada.
- Ação concluída corretamente.

---

# Preservação dos dados do formulário

Quando uma ação falhar:

- preservar os valores preenchidos;
- limpar apenas campos sensíveis quando aplicável;
- destacar os erros;
- mover o foco para o primeiro campo inválido;
- apresentar resumo de erros quando necessário.

---

# Logging

Erros relevantes devem ser registados no servidor.

Informações permitidas:

- código do erro;
- módulo;
- ação;
- utilizador;
- organização;
- entidade;
- timestamp;
- identificador de correlação.

Nunca registrar:

- senhas;
- tokens;
- cookies;
- chaves privadas;
- conteúdo sensível desnecessário.

---

# Correlation ID

Falhas inesperadas podem possuir um identificador de correlação.

Exemplo:

```text
ERR-20260806-8F2A
```

A interface pode exibir:

> Ocorreu um erro inesperado. Código: ERR-20260806-8F2A

Esse identificador facilita investigação sem expor detalhes técnicos.

---

# Tratamento na interface

## Erro de campo

Exibir abaixo do campo correspondente.

## Erro de formulário

Exibir um resumo no início do formulário.

## Erro de ação

Utilizar Toast ou Alert.

## Erro de página

Utilizar Error State com:

- título;
- descrição;
- botão de tentar novamente.

---

# Toasts

## Success

Utilizado após operações concluídas.

## Warning

Utilizado para situações que exigem atenção.

## Error

Utilizado quando uma operação falha.

## Info

Utilizado para informação contextual.

Toasts nunca devem ser a única forma de comunicar erros de formulário.

---

# Error Boundaries

Páginas importantes devem possuir tratamento para falhas inesperadas.

Quando aplicável, utilizar:

- `error.tsx`;
- botão de tentar novamente;
- mensagem segura;
- logging no servidor.

---

# Not Found Pages

Registros inexistentes devem utilizar uma página ou estado de “não encontrado”.

Não exibir uma página vazia.

---

# Regras de segurança

Nunca:

- expor erros técnicos;
- confiar em mensagens do cliente;
- utilizar mensagens diferentes que revelem existência de recursos;
- mostrar se um e-mail de utilizador existe durante autenticação;
- retornar detalhes de RLS;
- retornar dados de outra organização.

---

# Exemplo de fluxo de criação

```text
Utilizador envia formulário
    ↓
Server Action valida sessão
    ↓
Zod valida entrada
    ↓
Service aplica regras
    ↓
Mutation grava no banco
    ↓
Activity Log é registado
    ↓
ActionResult retorna sucesso
    ↓
UI exibe Toast
```

---

# Exemplo de falha de validação

```text
Formulário inválido
    ↓
Zod falha
    ↓
ActionResult retorna VALIDATION_ERROR
    ↓
UI exibe erros nos campos
```

---

# Exemplo de falha de autorização

```text
Utilizador tenta acessar registro externo
    ↓
RLS bloqueia
    ↓
Query não retorna registro
    ↓
ActionResult retorna NOT_FOUND
```

---

# Testes obrigatórios

Testar:

- validação de campos;
- ausência de autenticação;
- ausência de autorização;
- registro inexistente;
- conflito;
- erro de banco;
- erro inesperado;
- mensagens seguras;
- ausência de dados sensíveis;
- foco no primeiro campo inválido;
- estados de erro no mobile.

---

# Definition of Done

O tratamento de erros será considerado implementado quando:

- todas as Server Actions utilizarem `ActionResult`;
- erros Zod forem mapeados para campos;
- erros do Supabase forem convertidos;
- mensagens técnicas não forem expostas;
- falhas inesperadas possuírem logging;
- a interface possuir estados de erro claros;
- testes de erro estiverem aprovados.