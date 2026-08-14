# Bootstrap

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

# Objetivo

Definir como a primeira organização do sistema será criada.

O Bootstrap é executado apenas uma única vez para inicializar o sistema.

Após sua conclusão, todo o restante do sistema utilizará o fluxo normal de autenticação e autorização.

---

# Quando Executar

O Bootstrap deverá ser executado após o primeiro login realizado com sucesso.

---

# Mecanismo de Execução

O Bootstrap será executado exclusivamente através da função RPC:

`bootstrap_initial_organization()`

Esta função será implementada no PostgreSQL utilizando `SECURITY DEFINER`.

Ela representa a única exceção controlada às políticas normais de Row Level Security (RLS) para permitir a inicialização segura do sistema.

Nenhuma Server Action poderá criar diretamente Organizations ou Organization Members durante o Bootstrap.

---

# Fluxo

```text
Primeiro Login

↓

Verificar Profile

↓

Profile existe?

↓

NÃO
│
├── Executar RPC
│
│   bootstrap_initial_organization()
│
│
│   BEGIN
│
│   Garantir Profile
│
│   Garantir Organization
│
│   Garantir Membership OWNER
│
│   COMMIT
│
└── Fim

↓

SIM

↓

Verificar Membership

↓

Membership existe?

↓

SIM
│
├── Continuar acesso ao sistema
│
└── Fim

↓

NÃO

↓

Existe alguma Organization?

↓

NÃO

↓

Executar RPC

bootstrap_initial_organization()

↓

SIM

↓

Aguardar associação realizada por um OWNER

↓

Fim
```

---

# Responsabilidades

O Bootstrap deverá:

- garantir a existência do Profile do utilizador;
- criar a primeira Organization do sistema;
- criar o primeiro Organization Member;
- definir o primeiro utilizador como OWNER.

---

# Regras

O Bootstrap somente poderá ser executado quando:

- não existir nenhuma Organization;
- o utilizador não possuir Membership.

O Bootstrap nunca deverá:

- criar uma segunda Organization;
- criar um segundo OWNER automaticamente;
- alterar organizações existentes;
- remover dados existentes.

---

# Organização Inicial

Nome

FASBtech

Slug

fasbtech

Status

ACTIVE

---

# Primeiro Utilizador

Role

OWNER

Status

ACTIVE

---

# Segurança

Toda criação deverá ocorrer exclusivamente no servidor.

Nenhuma informação sensível será enviada pela interface.

O `organization_id` será obtido exclusivamente no backend.

O Bootstrap é uma operação privilegiada, transacional e idempotente.

Nenhuma operação comum da aplicação poderá contornar as políticas de segurança através desta função.

---

# Origem dos Dados

O campo `profiles.full_name` será obtido prioritariamente dos metadados do utilizador autenticado (`auth.users.raw_user_meta_data`).

Caso essa informação não esteja disponível, o e-mail autenticado poderá ser utilizado temporariamente como valor inicial.

O utilizador poderá atualizar seu perfil posteriormente através do módulo de Perfil.

---

# Bootstrap Transacional

O Bootstrap deverá ser executado como uma única operação atômica.

```text
BEGIN

↓

Garantir Profile

↓

Garantir Organization

↓

Garantir Membership OWNER

↓

COMMIT
```

Caso qualquer etapa falhe:

```text
ROLLBACK
```

Nenhuma alteração deverá permanecer no banco de dados.

---

# Idempotência

O Bootstrap deverá ser seguro para múltiplas execuções.

Caso a função seja chamada novamente:

- não deverá criar uma segunda Organization;
- não deverá criar um novo OWNER;
- não deverá duplicar Memberships;
- deverá apenas garantir que a estrutura inicial exista.

A função deverá utilizar verificações internas e as constraints do banco de dados para impedir duplicações.

---

# Concorrência

Caso duas requisições tentem executar o Bootstrap simultaneamente, apenas uma delas poderá concluir a inicialização.

A operação deverá utilizar a transação do PostgreSQL juntamente com as constraints de unicidade para impedir a criação de múltiplas Organizations ou múltiplos Memberships OWNER.

---

# Utilizadores Posteriores

Após a inicialização do sistema:

- novos utilizadores nunca executarão o Bootstrap;
- novos utilizadores deverão ser associados manualmente a uma Organization por um utilizador com permissão OWNER;
- somente após possuir um Membership válido o utilizador poderá acessar os módulos protegidos.

---

# Resultado Esperado

Após a conclusão do Bootstrap existirão:

- um Profile;
- uma Organization;
- um Organization Member;
- exatamente um Membership OWNER para a Organization inicial.

Todos os utilizadores futuros dependerão de um Membership existente para acessar o sistema.

---

# Definition of Done

O Bootstrap será considerado concluído quando:

- existir exatamente uma Organization inicial;
- existir um Profile para o primeiro utilizador;
- existir exatamente um Membership OWNER para a Organization inicial;
- o primeiro utilizador conseguir acessar normalmente o sistema;
- o Bootstrap não puder criar novas Organizations ou novos OWNERS em execuções posteriores;
- todas as operações ocorrerem de forma transacional e compatível com as políticas de RLS.