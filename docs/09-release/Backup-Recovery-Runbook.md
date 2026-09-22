# Backup & Recovery Runbook — MVP v3.0

## Status

Runbook preparado. Backup remoto, retenção aprovada e teste de restore ainda não configurados.

---

# Objetivo

Definir a resposta mínima para perda, corrupção ou indisponibilidade de dados do FASBtech CRM, utilizando as capacidades geridas do plano Supabase contratado e sem introduzir infraestrutura própria desnecessária.

---

# Escopo

O plano de recuperação deve considerar em conjunto:

- PostgreSQL, incluindo Auth, dados de domínio e Activity Logs;
- objetos privados do bucket `private-files`;
- migrations versionadas;
- configuração operacional de Auth e Storage;
- secrets e variáveis, restaurados pelo cofre do provedor e nunca por backup no Git.

Backup do banco não deve ser presumido como backup dos objetos do Storage. A cobertura e retenção de cada serviço precisam ser confirmadas no plano contratado antes do `GO`.

---

# Objetivos Propostos para o MVP

| Objetivo | Proposta | Estado |
|---|---|---|
| RPO | até 24 horas | Requer aprovação do responsável de negócio e confirmação do plano Supabase |
| RTO | até 8 horas úteis | Requer aprovação do responsável operacional e ensaio de restore |
| Retenção mínima | 30 dias para banco e documentos privados | Requer validação de custo, plano e obrigações aplicáveis |

Se o plano selecionado não suportar esses objetivos, a decisão é `NO-GO` até ajuste do plano ou aprovação explícita de objetivos diferentes.

---

# Responsabilidades

| Papel | Responsabilidade |
|---|---|
| Release owner | Autorizar recuperação, comunicar impacto e decidir `GO/NO-GO` |
| Database owner | Confirmar backup, executar restore isolado, validar schema e integridade |
| Application owner | Implantar commit compatível, validar Auth e executar smoke funcional |
| Security owner | Revogar/rotacionar credenciais quando aplicável e revisar acessos |

Os nomes e contatos reais devem ser mantidos no sistema operacional da equipa, não neste documento público do repositório.

---

# Preparação Obrigatória

- [ ] Ativar e confirmar a política de backup do banco compatível com o plano Supabase.
- [ ] Definir mecanismo de cópia/recuperação dos objetos privados do Storage.
- [ ] Aprovar retenção, RPO e RTO.
- [ ] Atribuir responsáveis e canal de incidente.
- [ ] Guardar credenciais de recuperação somente no cofre aprovado.
- [ ] Confirmar que o commit e as migrations de cada release estão identificáveis.
- [ ] Executar restore trimestral ou antes de cada release de alto risco em ambiente isolado.

---

# Procedimento de Backup

1. confirmar que o backup gerido está ativo e registrar a última conclusão bem-sucedida;
2. confirmar separadamente cobertura e última cópia dos objetos de `private-files`;
3. registrar commit implantado e última migration aplicada;
4. validar que a retenção atende ao objetivo aprovado;
5. armazenar evidências sem exportar dados pessoais, documentos ou credenciais para o repositório;
6. antes de migration de risco, confirmar ponto recuperável recente e janela de manutenção.

Não utilizar fixtures, `db reset` ou dumps copiados para diretórios versionados como estratégia de backup.

---

# Procedimento de Restore

1. declarar o incidente e interromper escritas/deploys quando isso reduzir o dano;
2. identificar o último ponto consistente dentro do RPO;
3. criar ou selecionar ambiente isolado de recuperação, nunca o projeto local compartilhado;
4. restaurar o banco usando o mecanismo suportado pelo Supabase/plano contratado;
5. restaurar os objetos privados preservando bucket e caminhos esperados;
6. implantar o commit compatível com o schema restaurado;
7. reaplicar somente migrations posteriores que tenham sido formalmente aprovadas e sejam compatíveis;
8. executar a validação abaixo;
9. somente após aprovação, promover o ambiente recuperado ou executar o procedimento equivalente de produção;
10. rotacionar credenciais se o incidente envolver acesso indevido.

Nunca executar `supabase db reset` contra staging ou produção. Rollback de schema deve preferir migration corretiva; restore completo é reservado para falha não reversível ou recuperação de desastre.

---

# Validação de Restore

- [ ] Histórico de migrations corresponde ao commit recuperado.
- [ ] Tabelas, constraints, índices, RLS, Policies, Grants e RPCs estão presentes.
- [ ] `private-files` permanece privado e documentos esperados estão acessíveis somente a OWNER autorizado.
- [ ] Auth permite Login, refresh e Logout no ambiente isolado.
- [ ] Bootstrap permanece idempotente e não cria segunda Organization.
- [ ] OWNER, ADMIN e MEMBER mantêm a matriz de autorização esperada.
- [ ] Isolamento cross-Organization permanece ativo.
- [ ] Activity Logs anteriores permanecem íntegros e novas operações auditáveis registram eventos.
- [ ] Fluxos críticos de Clientes, Demandas, Financeiro, Contratos e Dashboard passam no smoke.
- [ ] Contagens e amostras operacionais aprovadas batem com a evidência pré-incidente disponível.

Não usar service role na aplicação para fazer o smoke passar.

---

# Cenários Operacionais

## Indisponibilidade sem perda confirmada

Verificar estado dos provedores, suspender deploys e preservar evidências. Não iniciar restore até confirmar que a recuperação gerida não será mais segura.

## Migration com falha

Interromper promoção. Se a transação tiver revertido, corrigir a migration e revalidar em staging. Se houver estado parcial ou alteração não reversível, seguir restore isolado e migration corretiva aprovada.

## Credencial comprometida

Revogar ou rotacionar a credencial, invalidar sessões quando aplicável, revisar logs de acesso, confirmar integridade dos dados e atualizar os cofres de cada ambiente. Nunca registrar o valor comprometido no incidente versionado.

## Documento ausente ou corrompido

Recuperar a cópia privada correspondente sem substituir silenciosamente `ORIGINAL_PDF` por `SIGNED_COPY` ou vice-versa. Validar metadata, Contract e autorização após recuperação.

---

# Critério para READY

Este runbook está `READY` como artefato local. A capacidade de recuperação permanece `NOT CONFIGURED` até que backup e retenção estejam ativos, RPO/RTO sejam aprovados e pelo menos um restore completo tenha sido validado em ambiente isolado com evidência operacional.
