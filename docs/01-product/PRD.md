# PRD — FASBtech CRM

## 1. Informações do documento

### Nome do produto

FASBtech CRM

### Versão do produto

0.1.0

### Versão do documento

1.0

### Status

Planejamento

### Responsável

Felipe Augusto

### Última atualização

04/08/2026

### Objetivo deste documento

Este Product Requirements Document define a visão, os objetivos, o escopo, os requisitos, os critérios de sucesso e as restrições do MVP do FASBtech CRM.

Este documento deve ser utilizado como fonte de verdade para decisões relacionadas a:

- produto;
- priorização;
- arquitetura;
- desenvolvimento;
- testes;
- validação;
- roadmap.

Os detalhes técnicos mais específicos devem permanecer nos documentos de arquitetura, banco de dados, decisões técnicas e sprints.

---

## 2. Resumo executivo

O FASBtech CRM será uma aplicação web interna destinada a centralizar as informações comerciais e operacionais da FASBtech.

O sistema permitirá acompanhar:

- leads;
- clientes;
- projetos;
- produtos contratados;
- domínios;
- hospedagens;
- pagamentos;
- tarefas;
- próximos contatos;
- datas de renovação.

A primeira versão será utilizada apenas pelo administrador da FASBtech.

A visão futura é transformar o sistema em uma plataforma que também possa atender freelancers, pequenas agências, software houses e empresas prestadoras de serviços.

Essa expansão futura não faz parte do MVP.

---

## 3. Contexto

A FASBtech está em fase inicial de organização e crescimento.

As informações importantes da empresa podem ficar distribuídas entre:

- mensagens;
- WhatsApp;
- e-mails;
- notas;
- planilhas;
- plataformas de hospedagem;
- registradores de domínio;
- documentos;
- memória do responsável.

Essa fragmentação dificulta o acompanhamento do negócio e aumenta o risco de erros.

Entre os principais problemas estão:

- perda de informações;
- esquecimento de follow-ups;
- atraso em renovações;
- falta de visibilidade sobre pagamentos;
- dificuldade para acompanhar projetos;
- retrabalho;
- ausência de histórico;
- dificuldade para crescer de forma organizada.

---

## 4. Problema principal

A FASBtech não possui uma única plataforma para acompanhar todo o ciclo comercial e operacional dos seus clientes.

O problema central é:

> Informações importantes sobre leads, clientes, projetos, pagamentos, domínios, hospedagens e renovações podem ficar dispersas, dificultando o acompanhamento e aumentando o risco de esquecimentos.

---

## 5. Hipótese do produto

A hipótese principal é:

> Se a FASBtech centralizar leads, clientes, projetos, domínios, hospedagens, pagamentos, tarefas e renovações em um único sistema simples e acessível, terá mais organização, menos esquecimentos e maior controle comercial e operacional.

Essa hipótese deverá ser validada pelo uso real do CRM.

---

## 6. Visão do produto

Criar um CRM interno, simples, seguro, responsivo e preparado para crescimento, capaz de centralizar as operações comerciais e administrativas da FASBtech.

O sistema deverá funcionar como a principal ferramenta de acompanhamento da empresa.

---

## 7. Objetivo principal

O principal objetivo do FASBtech CRM é:

> Organizar leads, clientes, projetos, serviços, pagamentos, tarefas, domínios, hospedagens e renovações em uma única aplicação.

---

## 8. Objetivos secundários

O sistema também deverá ajudar a:

- reduzir esquecimentos;
- melhorar o acompanhamento comercial;
- registrar próximos passos;
- facilitar a consulta de informações;
- acompanhar o progresso dos projetos;
- visualizar pagamentos pendentes;
- controlar datas de renovação;
- reduzir dependência de planilhas e notas;
- criar uma base preparada para futuras automações;
- gerar dados para decisões futuras.

---

## 9. Utilizador principal

### Perfil inicial

Felipe Augusto, administrador da FASBtech.

### Características

- administra atualmente uma pequena carteira de clientes;
- utiliza computador e celular;
- precisa consultar informações rapidamente;
- pretende aumentar o número de clientes;
- precisa evitar esquecimentos;
- deseja estruturar a empresa desde o início;
- possui conhecimento técnico para administrar o sistema.

### Necessidades principais

- visualizar o estado de cada lead;
- acompanhar clientes ativos;
- acompanhar projetos;
- registrar conversas e observações;
- controlar pagamentos;
- controlar domínios e hospedagens;
- visualizar renovações próximas;
- registrar tarefas e próximos passos;
- acessar o sistema pelo celular.

---

## 10. Público futuro

Após a validação interna, o sistema poderá evoluir para atender:

- freelancers;
- pequenas agências;
- software houses;
- consultores;
- prestadores de serviços;
- pequenas empresas que administram clientes e serviços recorrentes.

Essa evolução não faz parte do MVP.

---

## 11. Jobs To Be Done

### Job funcional

Quando eu estiver administrando meus clientes e projetos, quero centralizar todas as informações importantes em um único sistema, para acompanhar o negócio sem depender de planilhas, mensagens e memória.

### Job emocional

Quero sentir segurança e controle sobre a operação da FASBtech.

### Job social

Quero administrar a FASBtech de forma profissional, organizada e preparada para crescer.

---

## 12. Objetivos do MVP

O MVP deverá validar se o CRM:

- centraliza as informações da FASBtech;
- reduz o uso de notas e planilhas separadas;
- ajuda a evitar esquecimentos;
- facilita o acompanhamento comercial;
- melhora o controle dos projetos;
- facilita o controle de pagamentos;
- facilita o controle de renovações;
- é útil no uso diário;
- funciona bem no computador e no celular.

---

## 13. Princípios do produto

O desenvolvimento deverá seguir estes princípios:

### Simplicidade

A interface deve ser clara e fácil de utilizar.

### Foco

Cada sprint deverá implementar apenas o escopo aprovado.

### Segurança

Os dados dos clientes devem ser protegidos.

### Responsividade

As funções principais devem funcionar no celular.

### Escalabilidade consciente

A estrutura poderá considerar crescimento futuro, mas sem aumentar desnecessariamente a complexidade do MVP.

### Documentação

Decisões, alterações e regras importantes devem permanecer documentadas.

### Dados úteis

O sistema deve armazenar apenas informações relevantes para a operação.

---

## 14. Escopo do MVP

### 14.1 Autenticação

O sistema deve permitir:

- login com e-mail e senha;
- logout;
- persistência da sessão;
- recuperação de senha;
- proteção de páginas privadas;
- redirecionamento de utilizadores não autenticados;
- validação da sessão no servidor.

No MVP haverá apenas um utilizador administrador.

---

### 14.2 Dashboard

O dashboard deve apresentar uma visão resumida da operação.

Informações previstas para a versão completa do MVP:

- total de leads ativos;
- total de clientes ativos;
- projetos em andamento;
- propostas enviadas;
- tarefas atrasadas;
- pagamentos pendentes;
- renovações próximas;
- receita prevista.

Na Sprint 01, o dashboard será apenas uma tela inicial simples com mensagem de boas-vindas.

---

### 14.3 Leads

O sistema deve permitir:

- criar lead;
- editar lead;
- visualizar lead;
- arquivar lead;
- alterar status;
- registrar empresa;
- registrar e-mail;
- registrar telefone;
- registrar WhatsApp;
- registrar origem do lead;
- registrar serviço de interesse;
- registrar valor estimado;
- registrar próximo contato;
- adicionar observações;
- converter lead ganho em cliente.

#### Campos iniciais

- nome;
- empresa;
- e-mail;
- telefone;
- WhatsApp;
- origem;
- serviço de interesse;
- status;
- valor estimado;
- próximo contato;
- observações;
- data de criação;
- data de atualização.

#### Status de lead

- Novo;
- Contato realizado;
- Reunião marcada;
- Diagnóstico;
- Proposta enviada;
- Negociação;
- Ganho;
- Perdido.

---

### 14.4 Clientes

O sistema deve permitir:

- criar cliente;
- editar cliente;
- visualizar cliente;
- desativar cliente;
- registrar nome ou razão social;
- registrar contato principal;
- registrar e-mail;
- registrar telefone;
- registrar NIF ou documento fiscal;
- registrar país;
- registrar cidade;
- registrar site;
- registrar Instagram;
- associar projetos;
- associar domínios;
- associar hospedagens;
- associar pagamentos;
- associar tarefas;
- registrar observações.

#### Status de cliente

- Ativo;
- Inativo;
- Potencial;
- Encerrado.

---

### 14.5 Contatos

O sistema poderá permitir múltiplos contatos por cliente.

Cada contato poderá possuir:

- nome;
- cargo;
- e-mail;
- telefone;
- WhatsApp;
- contato principal;
- observações.

No MVP, essa funcionalidade poderá começar de forma simplificada dentro do cadastro do cliente.

---

### 14.6 Projetos

O sistema deve permitir:

- criar projeto;
- editar projeto;
- visualizar projeto;
- associar projeto a um cliente;
- associar produto do Product Registry;
- registrar nome do projeto;
- registrar valor;
- registrar data de início;
- registrar prazo previsto;
- registrar data de conclusão;
- registrar domínio;
- registrar hospedagem;
- registrar repositório;
- registrar URL de produção;
- atualizar status;
- registrar observações.

#### Status de projeto

- Planejamento;
- Aguardando conteúdo;
- Design;
- Desenvolvimento;
- Revisão;
- Homologação;
- Publicado;
- Concluído;
- Pausado;
- Cancelado.

---

### 14.7 Produtos

O sistema deverá possuir um cadastro básico dos produtos da FASBtech.

Produtos iniciais:

- LP-001 — Landing Page Essential;
- SI-001 — Site Institucional;
- PF-001 — Portfólio Profissional;
- SEO-001 — SEO Técnico;
- PERF-001 — Performance Audit;
- HOST-001 — Setup de Hospedagem;
- SUP-001 — Plano de Suporte.

#### Campos iniciais

- código;
- nome;
- categoria;
- status;
- versão;
- descrição;
- preço de referência;
- prazo estimado;
- observações.

O cadastro completo e o versionamento avançado poderão ser desenvolvidos depois do MVP.

---

### 14.8 Domínios

O sistema deve permitir:

- registrar domínio;
- associar domínio a cliente;
- associar domínio a projeto;
- registrar empresa registradora;
- registrar data de compra;
- registrar data de renovação;
- registrar valor da renovação;
- registrar renovação automática;
- registrar responsável pelo pagamento;
- registrar status;
- registrar observações.

#### Responsável pelo pagamento

- Cliente;
- FASBtech;
- Incluído no plano;
- Terceiro.

#### Status

- Ativo;
- Próximo da renovação;
- Expirado;
- Cancelado;
- Transferido.

---

### 14.9 Hospedagens

O sistema deve permitir:

- registrar hospedagem;
- associar hospedagem a cliente;
- associar hospedagem a projeto;
- registrar fornecedor;
- registrar plano;
- registrar data de início;
- registrar data de renovação;
- registrar valor;
- registrar renovação automática;
- registrar responsável pelo pagamento;
- registrar status;
- registrar observações.

#### Status

- Ativa;
- Próxima da renovação;
- Suspensa;
- Expirada;
- Cancelada;
- Migrada.

---

### 14.10 Financeiro básico

O módulo financeiro do MVP será apenas um controle comercial.

Não será um sistema contábil ou de faturação.

O sistema deve permitir:

- registrar entrada financeira;
- associar entrada a cliente;
- associar entrada a projeto;
- registrar descrição;
- registrar tipo;
- registrar valor;
- registrar data de vencimento;
- registrar data de pagamento;
- registrar método de pagamento;
- alterar status;
- adicionar observações.

#### Tipos

- Entrada;
- Parcela;
- Manutenção;
- Domínio;
- Hospedagem;
- Serviço extra;
- Reembolso.

#### Status

- Previsto;
- Pendente;
- Pago;
- Atrasado;
- Cancelado.

#### Métodos de pagamento

- Transferência bancária;
- PIX;
- MB Way;
- Cartão;
- Dinheiro;
- Outro.

---

### 14.11 Tarefas

O sistema deve permitir:

- criar tarefa;
- editar tarefa;
- concluir tarefa;
- arquivar tarefa;
- definir prazo;
- definir prioridade;
- definir status;
- associar a lead;
- associar a cliente;
- associar a projeto;
- associar a renovação;
- adicionar descrição;
- adicionar observações.

#### Prioridade

- Baixa;
- Média;
- Alta;
- Urgente.

#### Status

- Pendente;
- Em andamento;
- Concluída;
- Cancelada.

---

### 14.12 Notas

O sistema poderá permitir notas associadas a:

- lead;
- cliente;
- projeto;
- domínio;
- hospedagem;
- tarefa.

As notas deverão registrar:

- conteúdo;
- autor;
- data de criação;
- entidade relacionada.

---

### 14.13 Pesquisa e filtros

O sistema deve permitir:

- pesquisar por nome;
- pesquisar por empresa;
- pesquisar por domínio;
- filtrar leads por status;
- filtrar clientes por status;
- filtrar projetos por etapa;
- filtrar pagamentos por status;
- filtrar tarefas por prazo;
- filtrar tarefas por prioridade;
- filtrar renovações por período;
- ordenar resultados por data;
- limpar filtros aplicados.

---

### 14.14 Responsividade

O sistema deve funcionar em:

- desktop;
- tablet;
- celular.

As funções principais devem ser acessíveis pelo navegador do celular.

---

### 14.15 Estados da interface

As telas devem possuir estados claros para:

- carregamento;
- sucesso;
- erro;
- lista vazia;
- resultado sem correspondência;
- ação não autorizada;
- confirmação de exclusão ou arquivamento.

---

## 15. Fora do MVP

Não fazem parte da primeira versão:

- aplicativo iOS nativo;
- múltiplas organizações em uso real;
- múltiplos utilizadores;
- permissões avançadas;
- inteligência artificial;
- automações com n8n;
- integração automática com WhatsApp;
- envio automático de e-mails;
- integração bancária;
- emissão de faturas;
- portal do cliente;
- notificações push;
- geração automática de propostas;
- geração automática de contratos;
- assinatura eletrônica;
- dashboards avançados;
- relatórios contábeis;
- integração com Google Analytics;
- integração direta com o Notion;
- versão SaaS;
- pagamentos online;
- chat em tempo real;
- aplicativo desktop;
- armazenamento de documentos sensíveis;
- controle fiscal completo.

---

## 16. Requisitos funcionais resumidos

### RF-001 — Login

O utilizador deve conseguir entrar com e-mail e senha válidos.

### RF-002 — Logout

O utilizador deve conseguir encerrar sua sessão.

### RF-003 — Sessão persistente

A sessão deve permanecer ativa após atualizar a página.

### RF-004 — Proteção de rotas

Utilizadores não autenticados devem ser redirecionados para o login.

### RF-005 — Cadastro de lead

O utilizador deve conseguir cadastrar um lead.

### RF-006 — Atualização de lead

O utilizador deve conseguir editar um lead.

### RF-007 — Conversão de lead

Um lead ganho deve poder ser convertido em cliente.

### RF-008 — Cadastro de cliente

O utilizador deve conseguir cadastrar um cliente.

### RF-009 — Cadastro de projeto

O utilizador deve conseguir criar um projeto associado a um cliente.

### RF-010 — Associação de produto

Um projeto deve poder ser associado a um produto do Product Registry.

### RF-011 — Cadastro de domínio

O utilizador deve conseguir registrar um domínio e sua renovação.

### RF-012 — Cadastro de hospedagem

O utilizador deve conseguir registrar uma hospedagem e sua renovação.

### RF-013 — Registro financeiro

O utilizador deve conseguir registrar valores previstos, pendentes e pagos.

### RF-014 — Cadastro de tarefa

O utilizador deve conseguir criar tarefas associadas a outras entidades.

### RF-015 — Pesquisa

O utilizador deve conseguir pesquisar registros.

### RF-016 — Filtros

O utilizador deve conseguir filtrar listas por status, prazo e período.

### RF-017 — Dashboard

O sistema deve exibir indicadores resumidos.

---

## 17. Requisitos não funcionais

### 17.1 Segurança

- utilizar autenticação segura;
- proteger rotas privadas;
- validar sessão no servidor;
- utilizar Row Level Security no Supabase;
- não expor chaves secretas no frontend;
- não versionar arquivos de ambiente;
- validar dados no cliente e no servidor;
- aplicar princípio do menor privilégio;
- impedir acesso a dados de outra organização;
- não armazenar senhas manualmente;
- registrar decisões de segurança relevantes.

### 17.2 Performance

- páginas principais devem carregar rapidamente;
- consultas devem ser otimizadas;
- evitar carregamento desnecessário de dados;
- utilizar paginação quando necessário;
- utilizar componentes de servidor quando adequado;
- evitar dependências sem necessidade;
- otimizar imagens e fontes.

### 17.3 Qualidade

- TypeScript em modo estrito;
- evitar `any`;
- utilizar validação com Zod;
- criar componentes reutilizáveis;
- separar interface, regras e acesso a dados;
- executar lint;
- executar typecheck;
- executar build antes de concluir sprints relevantes;
- manter documentação atualizada;
- tratar erros de forma previsível.

### 17.4 Acessibilidade

- navegação por teclado;
- labels em formulários;
- contraste adequado;
- foco visível;
- HTML semântico;
- mensagens de erro acessíveis;
- botões com nomes compreensíveis;
- suporte adequado a leitores de tela nas funções principais.

### 17.5 Usabilidade

- interface simples;
- navegação clara;
- mensagens de erro compreensíveis;
- confirmação em ações destrutivas;
- estados de carregamento;
- feedback após salvar informações;
- formulários organizados;
- datas e valores apresentados de forma clara.

### 17.6 Compatibilidade

O sistema deve funcionar nas versões recentes de:

- Google Chrome;
- Safari;
- Microsoft Edge;
- navegadores móveis modernos.

### 17.7 Manutenibilidade

- estrutura de pastas documentada;
- nomes claros;
- funções pequenas e focadas;
- componentes reutilizáveis;
- documentação sincronizada;
- decisões técnicas registradas em ADRs.

---

## 18. Stack oficial

### Aplicação

- Next.js;
- React;
- TypeScript;
- Tailwind CSS;
- App Router.

### Banco e autenticação

- Supabase;
- PostgreSQL;
- Supabase Auth;
- Supabase SSR.

### Formulários e validação

- React Hook Form;
- Zod;
- @hookform/resolvers.

### Hospedagem

- Vercel.

### Versionamento

- Git;
- GitHub.

### Documentação

- Obsidian;
- Markdown.

### Ferramentas de apoio

- Codex;
- Notion para documentação estratégica da empresa.

---

## 19. Arquitetura de alto nível

```text
Utilizador
    ↓
Aplicação Next.js
    ↓
Supabase Auth
    ↓
Serviços e regras da aplicação
    ↓
PostgreSQL
```

### Responsabilidades

- Next.js: interface, rotas e lógica da aplicação;
- Supabase Auth: autenticação e sessão;
- PostgreSQL: persistência dos dados;
- Zod: validação;
- React Hook Form: formulários;
- Vercel: hospedagem da aplicação;
- GitHub: versionamento;
- Obsidian: documentação técnica.

---

## 20. Modelo de dados inicial

Tabelas previstas:

- organizations;
- users;
- leads;
- clients;
- contacts;
- products;
- projects;
- domains;
- hosting_services;
- financial_entries;
- tasks;
- notes;
- activity_logs.

O modelo detalhado será mantido em:

```text
docs/04-database/data-model.md
```

---

## 21. Relações principais

```text
Organization
├── Users
├── Leads
├── Clients
├── Products
├── Projects
├── Domains
├── Hosting Services
├── Financial Entries
└── Tasks

Client
├── Contacts
├── Projects
├── Domains
├── Hosting Services
├── Financial Entries
├── Tasks
└── Notes

Project
├── Product
├── Domain
├── Hosting Service
├── Financial Entries
├── Tasks
└── Notes
```

---

## 22. Regras de negócio principais

1. Todo registro operacional deve pertencer a uma organização.
2. No MVP existirá apenas uma organização ativa.
3. Todo lead deve possuir nome.
4. O status inicial de um lead deve ser `Novo`.
5. Um lead somente poderá ser convertido após ser marcado como `Ganho`.
6. A conversão não deve apagar o lead original.
7. Todo projeto deve pertencer a um cliente.
8. Todo projeto deve possuir um status.
9. Um projeto pode estar associado a um produto.
10. Um cliente pode possuir vários projetos.
11. Um domínio pode estar associado a um cliente ou projeto.
12. Uma hospedagem pode estar associada a um cliente ou projeto.
13. Toda renovação deve possuir uma data.
14. Toda entrada financeira deve possuir valor e status.
15. Toda tarefa deve possuir título e status.
16. Registros importantes devem ser arquivados em vez de apagados quando houver necessidade de histórico.
17. Ações destrutivas devem solicitar confirmação.
18. Datas de criação e atualização devem ser registradas automaticamente.

---

## 23. Fluxo principal do produto

```text
Novo lead
↓
Registrar dados
↓
Realizar contato
↓
Atualizar pipeline
↓
Realizar diagnóstico
↓
Enviar proposta
↓
Negociar
↓
Marcar como ganho
↓
Converter em cliente
↓
Criar projeto
↓
Associar produto
↓
Registrar pagamentos
↓
Acompanhar execução
↓
Registrar domínio e hospedagem
↓
Concluir projeto
↓
Acompanhar suporte e renovação
```

---

## 24. Fluxo inicial de autenticação

```text
Utilizador acessa rota privada
↓
Sistema verifica sessão
↓
Sem sessão
→ redireciona para login

Com sessão
→ permite acesso

Utilizador realiza logout
↓
Sessão é encerrada
↓
Sistema redireciona para login
```

---

## 25. Critérios de sucesso do MVP

O MVP será considerado validado quando:

- o sistema for utilizado várias vezes por semana;
- as informações dos clientes estiverem centralizadas;
- os leads forem acompanhados pelo pipeline;
- os próximos contatos forem registrados;
- nenhuma renovação relevante for esquecida;
- os projetos puderem ser acompanhados pelo sistema;
- os pagamentos pendentes puderem ser identificados;
- tarefas atrasadas ficarem visíveis;
- o sistema reduzir o uso de notas e planilhas externas;
- o utilizador considerar o CRM útil para a operação diária;
- as principais funções forem utilizáveis pelo celular.

---

## 26. Métricas iniciais

- número de leads cadastrados;
- número de leads ganhos;
- taxa de conversão de leads;
- número de clientes ativos;
- número de projetos ativos;
- quantidade de tarefas concluídas;
- quantidade de tarefas atrasadas;
- número de renovações próximas;
- quantidade de pagamentos pendentes;
- valor total pendente;
- frequência semanal de uso;
- tempo necessário para localizar uma informação;
- número de informações ainda mantidas fora do CRM;
- número de erros ou esquecimentos evitados.

---

## 27. Roadmap resumido

### Sprint 01 — Fundação

- autenticação;
- login;
- logout;
- persistência de sessão;
- proteção de rotas;
- layout base;
- tela inicial.

### Sprint 02 — Leads

- CRUD de leads;
- status;
- filtros;
- próximo contato;
- pipeline inicial.

### Sprint 03 — Clientes

- CRUD de clientes;
- contatos;
- conversão de lead;
- histórico básico.

### Sprint 04 — Projetos e produtos

- projetos;
- associação com clientes;
- associação com Product Registry;
- status de execução.

### Sprint 05 — Domínios e hospedagens

- cadastro;
- datas de renovação;
- responsáveis;
- alertas visuais.

### Sprint 06 — Financeiro básico

- entradas;
- parcelas;
- vencimentos;
- pagamentos;
- status.

### Sprint 07 — Tarefas

- tarefas;
- prazos;
- prioridades;
- relações com outras entidades.

### Sprint 08 — Dashboard

- indicadores;
- renovações próximas;
- pagamentos pendentes;
- tarefas atrasadas.

### Sprint 09 — Qualidade

- testes;
- segurança;
- acessibilidade;
- performance;
- tratamento de erros.

### Sprint 10 — Deploy e validação

- deploy;
- configuração de produção;
- testes reais;
- coleta de feedback;
- revisão do MVP.

---

## 28. Dependências do projeto

- conta no GitHub;
- repositório privado;
- projeto no Supabase;
- credenciais públicas do Supabase;
- utilizador de teste;
- conta na Vercel;
- Node.js;
- npm;
- Git;
- Codex;
- Obsidian.

---

## 29. Riscos

### 29.1 Escopo excessivo

Risco:

Adicionar funcionalidades antes de validar o MVP.

Mitigação:

- seguir os documentos de sprint;
- não implementar itens fora do escopo;
- registrar novas ideias no backlog;
- revisar o roadmap antes de cada sprint.

### 29.2 Dependência do fundador

Risco:

Todo o conhecimento e a operação dependem de uma única pessoa.

Mitigação:

- documentar decisões;
- criar processos;
- manter código e documentação atualizados;
- registrar aprendizados.

### 29.3 Segurança de dados

Risco:

O CRM armazenará informações de clientes.

Mitigação:

- autenticação;
- políticas de acesso;
- variáveis de ambiente;
- validação;
- princípio do menor privilégio;
- RLS;
- backups quando aplicável.

### 29.4 Complexidade futura

Risco:

Preparar o sistema para SaaS cedo demais pode aumentar o custo do MVP.

Mitigação:

- manter `organization_id` na estrutura;
- não desenvolver multiempresa agora;
- evitar abstrações sem necessidade real;
- registrar decisões futuras em ADRs.

### 29.5 Documentação desatualizada

Risco:

O código evoluir e a documentação permanecer antiga.

Mitigação:

- incluir atualização documental na Definition of Done;
- revisar changelog;
- atualizar a sprint ao concluir;
- registrar decisões relevantes.

### 29.6 Dependência de fornecedores

Risco:

Dependência de Supabase e Vercel.

Mitigação:

- manter código versionado;
- usar PostgreSQL;
- documentar configurações;
- evitar recursos proprietários sem necessidade.

---

## 30. Restrições

- o MVP será utilizado inicialmente apenas pela FASBtech;
- o orçamento deve permanecer baixo;
- o sistema deve utilizar serviços cloud;
- o sistema deve funcionar no navegador;
- o desenvolvimento deve ocorrer por sprints;
- nenhuma funcionalidade fora da sprint deve ser adicionada sem aprovação;
- documentação e código devem permanecer sincronizados;
- dados sensíveis não devem ser enviados ao GitHub;
- o sistema não substituirá contabilidade ou faturação oficial;
- o sistema deve ser utilizável em dispositivos móveis.

---

## 31. Premissas

- haverá apenas um administrador no MVP;
- o volume inicial de dados será baixo;
- o sistema será utilizado principalmente em português;
- os produtos da FASBtech já possuem códigos definidos;
- o utilizador possui acesso às contas de domínio e hospedagem;
- o Supabase será suficiente para a fase inicial;
- o sistema será hospedado na Vercel;
- futuras expansões serão avaliadas com base em dados reais.

---

## 32. Decisões já tomadas

- utilizar Next.js;
- utilizar TypeScript;
- utilizar Tailwind CSS;
- utilizar Supabase;
- utilizar PostgreSQL;
- utilizar Supabase Auth;
- utilizar Zod;
- utilizar React Hook Form;
- utilizar Vercel;
- utilizar GitHub;
- utilizar Obsidian para documentação técnica;
- desenvolver por sprints;
- utilizar `proxy.ts` para redirecionamento e verificação otimista no Next.js 16;
- validar a sessão novamente no servidor em áreas privadas.

---

## 33. Decisões em aberto

As seguintes decisões devem ser registradas em ADRs quando forem tomadas:

- uso direto do Supabase ou ORM;
- estratégia completa de migrations;
- política de exclusão versus arquivamento;
- estratégia de logs de atividade;
- estratégia de paginação;
- estratégia de testes automatizados;
- estratégia de notificações de renovação;
- estratégia de backups;
- futura transformação em SaaS;
- internacionalização;
- gerenciamento de arquivos;
- política de retenção de dados.

---

## 34. Critérios de aceite gerais

Uma funcionalidade somente será considerada concluída quando:

- cumprir o escopo da sprint;
- respeitar as regras de negócio;
- possuir validação adequada;
- tratar erros;
- apresentar feedback ao utilizador;
- funcionar em desktop e celular quando aplicável;
- não apresentar erros de lint;
- não apresentar erros de TypeScript;
- compilar corretamente;
- possuir documentação atualizada;
- não implementar itens fora do escopo.

---

## 35. Definition of Done do MVP

O MVP será considerado concluído quando:

- todos os módulos definidos no escopo estiverem funcionais;
- autenticação e proteção de dados estiverem configuradas;
- os fluxos principais funcionarem;
- as telas principais funcionarem no desktop e celular;
- lint estiver sem erros;
- typecheck estiver sem erros;
- build estiver funcionando;
- testes essenciais estiverem executados;
- documentação estiver atualizada;
- aplicação estiver publicada;
- o CRM estiver sendo utilizado com dados reais da FASBtech;
- o período inicial de validação tiver sido realizado;
- os resultados da validação estiverem documentados.

---

## 36. Documentos relacionados

### Produto

- `docs/01-product/vision.md`
- `docs/01-product/mvp-scope.md`
- `docs/01-product/roadmap.md`

### Requisitos

- `docs/02-requirements/functional-requirements.md`
- `docs/02-requirements/business-rules.md`
- `docs/02-requirements/user-stories.md`

### Arquitetura

- `docs/03-architecture/system-architecture.md`
- `docs/03-architecture/folder-structure.md`
- `docs/03-architecture/security.md`

### Banco de dados

- `docs/04-database/data-model.md`
- `docs/04-database/migrations.md`

### Decisões

- `docs/05-decisions/ADR-001-stack.md`

### Desenvolvimento

- `docs/06-development/setup.md`
- `docs/06-development/conventions.md`
- `docs/06-development/changelog.md`

### Sprints

- `docs/08-sprints/Sprint-01.md`

---

## 37. Histórico de alterações

### Versão 1.0

Data: 04/08/2026

Alterações:

- criação inicial do PRD;
- definição do problema;
- definição do MVP;
- definição dos módulos;
- definição de requisitos;
- definição de métricas;
- definição de riscos;
- definição do roadmap;
- definição da Definition of Done.