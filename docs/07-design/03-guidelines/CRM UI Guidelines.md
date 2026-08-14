# CRM UI Guidelines

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

3.0

---

# Objetivo

Este documento define os padrões oficiais de experiência do utilizador (UX) e interface (UI) do FASBtech CRM.

Seu objetivo é garantir uma experiência:

- consistente;
- previsível;
- eficiente;
- acessível;
- responsiva;
- orientada à operação.

Toda nova tela deverá seguir estas diretrizes.

---

# Fonte da Verdade

A implementação da interface deverá respeitar obrigatoriamente a seguinte hierarquia:

```text
PRD v3.0

↓

Functional Requirements v3.0

↓

Business Rules v3.0

↓

Layout v3.0

↓

Components v3.0

↓

CRM UI Guidelines v3.0

↓

Implementation Guide

↓

Pages
```

Nenhuma tela poderá contrariar documentos de prioridade superior.

---

# Filosofia

O CRM é uma ferramenta operacional.

A interface existe para acelerar o trabalho do utilizador.

Todo elemento visual deverá contribuir para:

- produtividade;
- clareza;
- rapidez;
- previsibilidade;
- redução de erros;
- percepção de prioridade.

Evitar distrações visuais e elementos sem função.

---

# Princípios

## Clareza

Toda tela deverá responder rapidamente:

```text
Onde estou?

O que estou vendo?

O que posso fazer?

O que exige atenção?
```

---

## Consistência

Elementos equivalentes deverão apresentar o mesmo comportamento em todos os módulos.

Exemplos:

- mesma posição de ações equivalentes;
- mesma nomenclatura;
- mesmo padrão de feedback;
- mesma estrutura de listagem;
- mesma linguagem para ações sensíveis.

---

## Rapidez

As tarefas frequentes deverão exigir o menor número razoável de interações.

Priorizar:

- ações diretas;
- navegação previsível;
- fluxos curtos;
- reutilização de contexto.

Não reduzir cliques às custas de clareza ou segurança.

---

## Feedback

Toda ação relevante deverá gerar retorno visual adequado.

Exemplos:

```text
Cliente criado

Demanda atualizada

Acesso removido

Movimentação registrada

Contrato gerado
```

---

## Prevenção de Erros

A interface deverá reduzir erros através de:

- validação;
- confirmações;
- mensagens claras;
- estados Disabled quando apropriado;
- contexto antes de ações sensíveis;
- preservação de dados durante erros recuperáveis quando possível.

---

# Experiência do Utilizador

A navegação deverá favorecer:

```text
reconhecimento
```

em vez de:

```text
memorização
```

O utilizador não deverá precisar decorar onde uma funcionalidade está localizada.

A organização da interface deverá permanecer previsível entre módulos.

---

# Navegação Principal

A navegação oficial do MVP v3.0 é:

```text
Dashboard
Demandas
Financeiro
Contratos
Clientes
Acessos
```

A interface deverá refletir a mesma ordem definida no Layout.

---

# Navegação e Segurança

Ocultar uma opção na interface não representa autorização suficiente.

Exemplo:

```text
Financeiro não aparece no menu
```

não significa que a segurança esteja resolvida.

O backend e o banco deverão continuar negando acesso não autorizado.

---

# Fluxo Geral de Navegação

Para entidades operacionais, o padrão preferencial é:

```text
Listagem

↓

Detalhes

↓

Editar / Ação

↓

Salvar

↓

Retorno ao contexto apropriado
```

Nem todo fluxo precisa começar pelo Dashboard.

O Dashboard serve como ponto de resumo e decisão, não como etapa obrigatória para acessar todos os módulos.

---

# Estrutura Oficial das Páginas

As páginas deverão seguir a estrutura definida em:

```text
Layout v3.0
```

Padrão:

```text
Page Header

↓

Toolbar quando aplicável

↓

Conteúdo

↓

Paginação quando aplicável
```

---

# Page Header

Páginas funcionais deverão utilizar Page Header quando houver contexto relevante.

Responsável por:

- título;
- descrição;
- Breadcrumb quando necessário;
- ação principal;
- ações secundárias quando aplicáveis.

---

# Breadcrumb

Breadcrumb deverá ser utilizado apenas quando representar uma hierarquia útil.

Exemplo:

```text
Clientes
    ↓
Empresa XPTO
    ↓
Editar
```

Não utilizar Breadcrumb apenas para preencher espaço.

---

# Ação Principal

A ação principal deverá aparecer em local previsível, normalmente no Page Header.

Exemplos:

```text
Novo Cliente

Nova Demanda

Nova Movimentação

Novo Contrato
```

Não duplicar a mesma ação no Page Header e Toolbar sem necessidade real.

---

# Toolbar

Utilizada principalmente em páginas de listagem.

Pode conter:

- Search;
- Filters;
- Sorting;
- ações em lote quando implementadas;
- Export quando fizer parte do produto;
- controles contextuais.

Nem toda página necessita de Toolbar.

---

# Pesquisa

Pesquisa deverá ser posicionada de maneira consistente dentro da Toolbar.

Placeholder deverá explicar o que pode ser pesquisado.

Exemplo:

```text
Pesquisar por nome, empresa ou e-mail...
```

A pesquisa deverá:

- ocorrer no banco;
- preservar autorização;
- não carregar toda a coleção para filtrar no navegador.

---

# Debounce

Debounce poderá ser utilizado quando melhorar a experiência e reduzir chamadas desnecessárias.

O tempo concreto deverá seguir o padrão técnico do projeto.

Não definir valores arbitrários sem necessidade.

---

# Filtros

Os filtros deverão reutilizar os componentes oficiais.

Desktop poderá utilizar:

- Select;
- Popover;
- Dropdown;
- controles inline.

Mobile poderá utilizar:

```text
Drawer / Sheet
```

quando isso melhorar a usabilidade.

---

# Filtros não devem

- existir para campos inexistentes;
- revelar dados não autorizados;
- alterar regras de domínio;
- ser implementados apenas no frontend para coleções persistidas.

---

# Ordenação

Ordenação deverá permanecer próxima aos filtros ou à própria tabela quando apropriado.

Toda ordenação disponível deverá representar campo oficialmente suportado.

A lógica deverá ocorrer na Query correspondente.

---

# Listagens

Páginas de listagem deverão reutilizar o padrão oficial.

Estrutura:

```text
Page Header

↓

Toolbar

↓

DataTable / Lista

↓

Paginação quando aplicável
```

---

# DataTable

Utilizar:

```text
DataTable Guidelines
```

quando o conteúdo for realmente tabular.

Não criar tabelas paralelas específicas para cada módulo sem necessidade real.

---

# Mobile

Em dispositivos menores, a listagem poderá adaptar-se para:

- Cards;
- listas;
- tabela com scroll controlado.

A adaptação deverá preservar:

- contexto;
- dados essenciais;
- ações;
- acessibilidade.

---

# Clientes

Clientes são a entidade operacional central do MVP.

A experiência de Cliente deverá funcionar como ponto de contexto para os demais módulos.

---

# Listagem de Clientes

Deverá permitir, conforme implementação:

- pesquisa;
- filtros aplicáveis;
- ordenação;
- paginação;
- criação de Cliente;
- acesso aos detalhes.

---

# Novo Cliente

Fluxo preferencial:

```text
Clientes

↓

Novo Cliente

↓

Formulário

↓

Criar Cliente

↓

Detalhes do Cliente
```

---

# Detalhes do Cliente

A página deverá evoluir progressivamente conforme os módulos forem implementados.

Estrutura conceitual final:

```text
Visão Geral

Demandas

Contratos

Financeiro

Documentos

Acessos

Atividades
```

Na Sprint 02, apresentar apenas:

```text
Visão Geral

Acessos

Atividades
```

quando essas áreas estiverem realmente implementadas.

---

# Tabs de Cliente

Tabs poderão ser utilizadas quando ajudarem a organizar o contexto do Cliente.

Não exibir Tabs vazias de módulos ainda não implementados.

Não exibir Tabs que o utilizador não possui autorização para acessar.

---

# Acessos

O módulo de Acessos deverá favorecer clareza sobre:

```text
quem possui acesso

a quais Clientes

com qual role
```

---

# Gestão de Utilizadores

A interface poderá apresentar:

- nome;
- role;
- status;
- Clientes associados;
- ações autorizadas.

Informações não necessárias à gestão não deverão ser expostas.

---

# Associação a Cliente

O fluxo deverá deixar claro que:

```text
associar utilizador ao Cliente
```

concede acesso operacional ao Cliente conforme as regras do sistema.

Não deverá sugerir que isso concede automaticamente:

```text
Financeiro

Contratos
```

---

# Remoção de Acesso

Ao remover um Client Assignment, a confirmação deverá explicar a consequência.

Exemplo:

```text
Remover acesso de João a Empresa XPTO?

João deixará de poder acessar este Cliente.
```

---

# Demandas

Demandas representam a unidade operacional de trabalho.

A interface deverá distinguir claramente:

```text
Status

Prioridade

Tags
```

Esses conceitos não deverão ser confundidos visualmente.

---

# Status de Demandas

Valores oficiais:

```text
OPEN
IN_PROGRESS
WAITING_CLIENT
REVIEW
COMPLETED
CANCELED
```

---

# Prioridade

Valores oficiais:

```text
LOW
MEDIUM
HIGH
URGENT
```

---

# Tags

Tags são complementares.

Não deverão utilizar o mesmo tratamento visual de Status de forma que confundam o utilizador.

---

# Prazo

A interface deverá destacar adequadamente:

- prazo normal;
- prazo próximo;
- atraso.

A regra funcional deverá vir do domínio, não do componente visual.

---

# Financeiro

O módulo Financeiro deverá transmitir clareza e evitar linguagem que sugira contabilidade fiscal completa.

Deverá permitir diferenciar claramente:

```text
Entradas

Saídas

Realizado

Pendente
```

conforme o modelo definitivo do domínio.

---

# Saldo

O saldo apresentado deverá representar apenas valores realizados conforme a regra oficial.

A interface não deverá permitir edição direta de um:

```text
saldo manual
```

---

# Meta Mensal

O progresso deverá ser apresentado de forma simples e compreensível.

Exemplo:

```text
Meta do mês

€ 10.000

Recebido

€ 6.200

Progresso

62%
```

---

# Recorrência

Quando uma movimentação for marcada como:

```text
RECURRING
```

a interface deverá deixar claro que, no MVP, isso é classificação informativa.

Não deverá sugerir que o CRM gerará automaticamente a cobrança.

---

# Contratos

A experiência de Contratos deverá favorecer revisão antes da geração final.

Fluxo conceitual:

```text
Selecionar Template

↓

Selecionar Cliente

↓

Completar Dados

↓

Revisar

↓

Gerar Contrato

↓

PDF

↓

Enviar
```

---

# Revisão de Contrato

Antes da geração final, o utilizador deverá conseguir revisar os dados que serão utilizados.

Após a geração, o contrato deverá representar o snapshot preservado.

---

# Contrato Assinado

No MVP, a assinatura ocorre externamente.

A interface deverá permitir:

```text
Upload da cópia assinada

↓

Marcar como SIGNED
```

Não apresentar assinatura eletrônica integrada como funcionalidade disponível.

---

# Dashboard

O Dashboard deverá seguir exclusivamente:

```text
Dashboard Guidelines v3.0
```

Estrutura conceitual:

```text
Resumo Executivo

↓

Situação Financeira

↓

Resumo de Demandas

↓

Prazos e Alertas

↓

Atividades Recentes

↓

Informações Complementares quando úteis
```

---

# Dashboard não deve apresentar

- Leads;
- Pipeline Comercial;
- Próximos Contatos de Leads;
- Projetos;
- reuniões sem fonte oficial;
- métricas simuladas;
- gráficos decorativos.

---

# Formulários

Formulários interativos deverão seguir:

```text
React Hook Form

+

Zod
```

com validação adicional server-side.

Fluxo:

```text
Form

↓

Zod

↓

Server Action

↓

Service
```

A interface não implementa regras de negócio.

---

# Estrutura dos Formulários

Formulários deverão possuir:

```text
Contexto da página

↓

Campos organizados

↓

Mensagens de validação

↓

Ações
```

O título principal pertence ao Page Header e não precisa ser duplicado dentro do formulário sem necessidade.

---

# Campos Obrigatórios

Campos obrigatórios deverão ser claramente identificados.

Mensagens de erro deverão aparecer próximas ao campo correspondente.

Nunca depender exclusivamente de cor para indicar erro.

---

# Validação

A validação visual deverá ocorrer no momento apropriado.

Evitar:

- mensagens agressivas antes da interação;
- limpar campos após erro sem necessidade;
- perder dados preenchidos quando a operação falhar de forma recuperável.

---

# Botões

Utilizar exclusivamente os componentes oficiais.

Variantes principais:

- Primary;
- Secondary;
- Outline;
- Danger;

e outras oficialmente definidas pelo Design System.

---

# Ações de Formulário

Exemplos:

```text
Criar Cliente
Cancelar
```

```text
Salvar alterações
Cancelar
```

```text
Gerar Contrato
Cancelar
```

A ação principal deverá possuir texto específico quando isso aumentar clareza.

---

# Navegação Pós-Ação

## Criar

Após criar uma entidade principal, preferir navegar para seus detalhes quando isso ajudar na continuidade do trabalho.

Exemplo:

```text
Criar Cliente

↓

Detalhes do Cliente
```

---

## Editar

Após editar:

```text
Salvar

↓

Detalhes atualizados
```

quando esse for o contexto natural.

---

## Arquivar

Após arquivar:

```text
Listagem
```

quando a entidade deixar de fazer parte da visualização operacional padrão.

---

# Página de Detalhes

Estrutura conceitual:

```text
Page Header

↓

Informações principais

↓

Relacionamentos / Seções

↓

Atividades quando aplicável
```

A ordem concreta deverá refletir o domínio.

---

# Feedback

Toda ação relevante deverá gerar feedback visual.

O utilizador não deverá ficar em dúvida se uma operação:

```text
funcionou

falhou

ou ainda está em andamento
```

---

# Success

Exemplos:

```text
Cliente criado com sucesso.

Demanda atualizada.

Acesso removido.

Contrato enviado.
```

---

# Warning

Utilizado para situações que exigem atenção.

Exemplos:

```text
Esta Demanda está próxima do prazo.

Esta ação removerá o acesso do utilizador ao Cliente.
```

---

# Error

Exemplo:

```text
Não foi possível salvar o Cliente.

Tente novamente.
```

Nunca exibir diretamente:

- Stack Trace;
- mensagem SQL;
- erro interno de Supabase;
- identificadores sensíveis.

---

# Info

Utilizado para informação neutra.

Exemplo:

```text
A recorrência é apenas informativa no MVP.
```

---

# Toasts

Feedbacks transitórios poderão utilizar Toast.

Tipos:

- Success;
- Warning;
- Error;
- Info.

---

# Toast não substitui Confirmação

Operações sensíveis deverão ser confirmadas antes de ocorrerem quando aplicável.

Toast aparece depois da operação.

---

# Alert

Alertas são mensagens persistentes.

Utilizar para:

- problemas relevantes;
- indisponibilidade;
- risco operacional;
- instruções administrativas;
- estados que precisam permanecer visíveis.

---

# Dialogs

Dialogs deverão ser utilizados para:

- confirmações;
- ações críticas;
- operações curtas;
- contexto limitado.

Não utilizar Dialog para fluxos extensos.

---

# Confirm Dialog

Operações sensíveis podem exigir confirmação.

Exemplos:

```text
Arquivar Cliente

Arquivar Demanda

Remover acesso

Cancelar Contrato
```

Estrutura:

```text
Título

↓

Descrição da consequência

↓

Cancelar

Confirmar
```

---

# Linguagem de Ações Sensíveis

Evitar confirmações genéricas como:

```text
Tem certeza?
```

Preferir:

```text
Arquivar Empresa XPTO?

Ela deixará de aparecer nas listagens operacionais, mas o histórico será preservado.
```

---

# Drawers

Podem ser utilizados para:

- menu Mobile;
- filtros;
- informações contextuais;
- ações rápidas;
- formulários curtos.

Não substituir páginas completas por Drawers sem necessidade.

---

# Loading

Telas assíncronas deverão possuir Loading adequado.

Preferir:

```text
Skeleton
```

quando houver estrutura de conteúdo previsível.

Spinner poderá ser utilizado em:

- Buttons;
- ações pequenas;
- carregamentos locais.

Não bloquear toda a interface durante carregamentos parciais sem necessidade.

---

# Empty State

Coleções vazias deverão possuir Empty State.

Estrutura:

- ícone opcional;
- título;
- descrição;
- CTA quando aplicável.

Exemplo:

```text
Ainda não existem Clientes cadastrados.

[Novo Cliente]
```

---

# Empty State sem Permissão

Se o utilizador não puder executar a ação correspondente, não apresentar CTA que ele não possa usar.

---

# Error State

Telas assíncronas deverão possuir Error State quando aplicável.

Estrutura mínima:

- título;
- descrição;
- ação de recuperação quando possível.

Nunca apresentar detalhes internos.

---

# Success State

Representa o estado normal da interface.

Os dados exibidos deverão estar:

- autorizados;
- consistentes;
- atualizados conforme estratégia oficial.

---

# Responsividade

Todas as telas deverão funcionar em:

```text
Desktop

Tablet

Mobile
```

---

# Desktop

Experiência completa.

Priorizar uso eficiente da largura sem excesso de informação.

---

# Tablet

Adaptar:

- Sidebar;
- Grid;
- tabelas;
- formulários;
- ações.

---

# Mobile

Utilizar:

- Drawer para navegação;
- filtros adaptados;
- Cards ou listas quando necessário;
- botões acessíveis ao toque;
- campos em coluna quando apropriado.

Nenhuma funcionalidade essencial poderá desaparecer.

---

# Mobile e Ações

A ação principal deverá permanecer acessível.

Evitar depender de hover.

Ações secundárias poderão ser agrupadas quando isso melhorar a experiência.

---

# Performance

A interface deverá priorizar:

- Server Components quando possível;
- carregamento progressivo;
- Queries eficientes;
- poucos Client Components;
- reutilização de componentes;
- estado local mínimo.

Evitar:

- re-renderizações desnecessárias;
- carregamentos duplicados;
- hidratação excessiva;
- componentes pesados sem benefício.

---

# Acessibilidade

Todas as telas deverão cumprir:

```text
WCAG 2.2 AA
```

Obrigatório:

- navegação por teclado;
- Focus Ring visível;
- labels acessíveis;
- contraste adequado;
- semântica HTML;
- suporte a leitores de tela;
- gestão correta de foco;
- áreas de toque adequadas.

---

# Cor não é Informação Suficiente

Estados como:

```text
URGENT
COMPLETED
CANCELED
atrasado
erro
```

deverão possuir também:

- texto;
- ícone;
- label;
- contexto.

Nunca depender apenas de cor.

---

# Design Tokens

Toda interface deverá utilizar:

- Design Tokens;
- Color Palette;
- Typography;
- Spacing;
- Motion;
- Icons.

Evitar:

- valores HEX diretos;
- pixels arbitrários quando existir token;
- sombras arbitrárias;
- animações fora do sistema.

---

# Linguagem

A linguagem da interface deverá ser:

- clara;
- curta;
- orientada à ação;
- consistente.

Evitar jargão técnico quando não for necessário ao utilizador.

---

# Nomenclatura

Utilizar os nomes oficiais do produto.

Exemplos:

```text
Clientes

Demandas

Financeiro

Contratos

Acessos
```

Não reutilizar termos antigos como:

```text
Leads
Projetos
Pipeline
Próximos Contatos
```

dentro do MVP atual.

---

# Dados Simulados

Dados simulados podem ser utilizados em testes e ambientes próprios de desenvolvimento.

Nunca deverão aparecer para o utilizador como se fossem dados reais da operação.

---

# Segurança na Interface

A UI pode adaptar-se às permissões.

Exemplo:

```text
canEdit = false
```

pode ocultar ou desabilitar determinada ação.

Porém:

```text
UI Permission
≠
Backend Authorization
```

Toda operação continua sujeita à autorização oficial.

---

# Data Leakage

A interface nunca deverá receber dados proibidos apenas para ocultá-los posteriormente.

Exemplo incorreto:

```text
Query retorna todos os Clientes

↓

React remove os não autorizados
```

Exemplo correto:

```text
Query já retorna somente Clientes autorizados
```

---

# MEMBER

Para MEMBER, a interface deverá refletir apenas Clientes permitidos.

Não exibir:

- Clientes não associados;
- atividades de Clientes não autorizados;
- documentos não autorizados;
- indicadores derivados de dados proibidos.

---

# Áreas Sensíveis

Acesso a Cliente não significa acesso automático a:

```text
Financeiro

Contratos
```

A interface deverá respeitar essas permissões separadamente.

---

# Funcionalidades não Implementadas

A interface não deverá simular funcionalidade futura.

Exemplo incorreto:

```text
Assinatura eletrônica
[Assinar agora]
```

quando não existe integração real.

Preferir não apresentar a função até que esteja implementada.

---

# Regras

Nunca:

- criar componentes duplicados;
- utilizar cores fora da Color Palette;
- implementar regras de negócio na interface;
- acessar banco diretamente;
- utilizar valores hardcoded quando houver token;
- apresentar Leads;
- apresentar Pipeline Comercial;
- apresentar Projetos como módulo do MVP;
- apresentar reuniões sem fonte oficial;
- apresentar funcionalidades futuras como disponíveis;
- utilizar a UI como única camada de segurança.

Sempre:

- reutilizar Components;
- seguir Layout;
- utilizar Design Tokens;
- respeitar Module Architecture;
- respeitar autorização;
- utilizar linguagem clara;
- apresentar feedback;
- preservar consistência.

---

# Fora do Escopo

Este documento não define:

- regras de banco;
- RLS;
- arquitetura de Services;
- schemas físicos;
- estratégia de migrations;
- regras fiscais;
- assinatura eletrônica integrada;
- Agenda;
- Leads;
- Projetos;
- personalização completa de Dashboard;
- Portal do Cliente.

---

# Referências

Este documento deverá permanecer sincronizado com:

- PRD v3.0;
- MVP Scope v3.0;
- Functional Requirements v3.0;
- Business Rules v3.0;
- User Stories v3.0;
- Layout v3.0;
- Components v3.0;
- Dashboard Guidelines v3.0;
- DataTable Guidelines;
- Design Tokens;
- Color Palette;
- Accessibility;
- Implementation Guide;
- Module Architecture v3.0.

---

# Fonte da Verdade Final

A experiência principal do MVP gira em torno de:

```text
Cliente

├── Visão Geral
├── Demandas
├── Contratos
├── Financeiro
├── Documentos
├── Acessos
└── Atividades
```

e da navegação principal:

```text
Dashboard

Demandas

Financeiro

Contratos

Clientes

Acessos
```

A interface deverá sempre priorizar:

```text
clareza

↓

ação

↓

feedback

↓

segurança

↓

consistência
```

---

# Definition of Done

Uma interface será considerada concluída quando:

- seguir este documento;
- respeitar o Layout oficial;
- reutilizar os Components oficiais;
- utilizar Design Tokens;
- possuir Feedback adequado;
- possuir Loading, Empty, Error e Success quando aplicáveis;
- funcionar em Desktop, Tablet e Mobile;
- cumprir WCAG 2.2 AA;
- não implementar regras de negócio;
- não acessar diretamente o banco;
- respeitar autorização;
- não causar Data Leakage;
- não apresentar funcionalidades futuras como disponíveis;
- não possuir referências funcionais ao modelo antigo de Leads ou Projetos;
- manter consistência visual e operacional com o FASBtech CRM v3.0.