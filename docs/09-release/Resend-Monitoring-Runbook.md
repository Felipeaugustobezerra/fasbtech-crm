# Resend & Monitoring Runbook — MVP v3.0

## Status

Integração e sinal técnico local preparados. Configuração real de Resend, destino dos logs, monitor externo e alertas ainda não comprovados em staging/produção.

---

# Resend

## Configuração por ambiente

- Configurar `RESEND_API_KEY` somente como secret server-only no cofre do provedor. Não utilizar prefixo `NEXT_PUBLIC_`.
- Configurar `CONTRACTS_EMAIL_FROM` como endereço do domínio de envio verificado. O formato pode ser `email@dominio` ou `Nome <email@dominio>`.
- Usar credenciais e remetentes separados entre staging e produção. Não registrar os valores no repositório, em tickets ou nos logs.
- Verificar no painel Resend o domínio de envio e os registos DNS exigidos para o ambiente antes do teste real.
- Restringir acesso à chave, registrar responsável e definir revogação/rotação no cofre operacional.

O serviço valida presença das duas variáveis e sintaxe do remetente antes de contactar o provider. Uma falha devolve à UI apenas o erro seguro `UNEXPECTED_ERROR`; o log server-side indica um código técnico fixo, sem valor da variável ou resposta bruta do Resend. Uma falha de envio mantém o Contract em `GENERATED`; `SENT` só é persistido depois da confirmação do provider.

## Teste real controlado em staging

1. Confirmar domínio verificado, secret de staging, remetente e destinatário interno autorizado.
2. Criar em staging um Cliente e um Contract com dados sintéticos, gerar o PDF privado e confirmar status `GENERATED`.
3. Enviar uma única vez para o destinatário controlado; não usar e-mail ou dados de Cliente real.
4. Confirmar resposta de sucesso do Resend e transição para `SENT`, com `sent_at`, destinatário persistido e Activity Log correspondente.
5. Confirmar recebimento e conteúdo esperado do PDF; verificar que o original continua privado.
6. Executar um ensaio de falha controlado com configuração de staging isolada e confirmar que o status continua `GENERATED` e a UI não mostra dados internos.
7. Registrar data, operador e resultado sem guardar API key, endereço do destinatário, PDF ou payload no repositório.

O teste real não foi executado nesta fase. Produção permanece `NO-GO` até domínio/remetente validados e envio controlado concluído.

---

# Logs Técnicos

O runtime escreve uma linha JSON por evento técnico em `stdout/stderr`, sem framework adicional. Os níveis atuais são:

| Nível | Evento |
|---|---|
| `warn` | Falha de Login retornada pelo Supabase Auth |
| `error` | Falha de Server Action de Clientes, Acessos, Demandas, Financeiro ou Contratos; falha de Auth indisponível; erro server-side não capturado pelo Next.js |

Campos permitidos: `timestamp`, `eventId`, `level`, `module`, `operation`, `code` e `diagnosticCode` conhecido. O identificador do evento permite localizar a ocorrência no destino de logs. A UI continua recebendo somente mensagens e códigos públicos do contrato de Error Handling.

Nunca registrar: API key, publishable key, senha, token, cookie, e-mail, payload de formulário, snapshot de Contract, PDF, `object_path`, resposta bruta de RPC/Storage/Resend, stack completa ou mensagem arbitrária do provider. As causas técnicas permanecem encadeadas nas exceções do servidor; somente códigos de diagnóstico predefinidos são emitidos no log.

As falhas de RPC capturadas pelas Actions geram evento com módulo, operação e código público. As falhas de PDF, Storage e Resend incluem também o código técnico fixo quando existe. Erros inesperados de renderização, Route Handler e download privado são capturados pelo hook `onRequestError` do Next.js sem registrar URL, headers ou parâmetros da requisição. Os `error.tsx` existentes continuam exibindo texto seguro e tentativa de recuperação.

Antes do `GO`, confirmar que os logs do runtime chegam a um destino com acesso restrito, retenção definida e operador responsável pela triagem. O logger local por si só não configura retenção nem alerta externo.

---

# Health

`GET /api/health` é público para monitorização e não exige sessão. A resposta não contém secrets ou configuração:

```json
{"application":"operational","auth":"available"}
```

Retorna `200` se a aplicação responde e o endpoint de health do Supabase Auth responde dentro de dois segundos. Retorna `503` com `application: "operational"` e `auth: "unavailable"` quando a configuração necessária está ausente, a consulta falha ou o timeout é atingido. A resposta usa `Cache-Control: no-store`.

Esse endpoint verifica apenas a aplicação e Supabase Auth. Não comprova PostgreSQL, RLS, Storage, geração de PDF ou Resend. Esses fluxos exigem smoke separado; um `200` não é aprovação integral de produção.

---

# Monitoramento mínimo

| Sinal | Fonte | Ação inicial |
|---|---|---|
| Health/deploy | `GET /api/health` e plataforma de aplicação | Verificar último deploy, disponibilidade da aplicação e Supabase Auth. |
| Falhas de Login | Eventos `auth/login`, métricas do Supabase Auth | Verificar indisponibilidade e aumento anormal de rejeições sem investigar credenciais individuais em logs. |
| Falhas de banco/RPC | Eventos server-side por módulo; painel Supabase | Verificar incidentes, conexões, migrations e RLS/Grants sem contornar autorização. |
| Storage/download privado | Código de diagnóstico de Storage, erro server-side e smoke OWNER | Verificar bucket, Policies e disponibilidade; preservar privacidade do documento. |
| Geração de PDF | Evento `contracts/generate_pdf` | Confirmar se Contract permaneceu `DRAFT` e se há objeto órfão a reconciliar. |
| Envio de contratos | Evento `contracts/send_email` e painel Resend | Confirmar domínio/remetente, provider e se Contract permaneceu `GENERATED`. |

Antes do `GO`, configurar no provedor ou ferramenta operacional existente:

- verificação periódica do health e alerta após falhas repetidas;
- triagem de eventos `error` recorrentes e picos de `warn` de Login;
- alertas de indisponibilidade dos provedores necessários;
- responsável e canal de resposta para cada alerta.

Não introduzir APM distribuído ou pipeline de logs complexo sem necessidade comprovada.

---

# Incidente inicial

1. Registrar hora, ambiente, evento técnico e serviço afetado sem dados sensíveis.
2. Confirmar se o problema começou após deploy/configuração e consultar estado dos provedores.
3. Reduzir impacto: suspender envio ou alterações operacionais afetadas, sem alterar status de Contract manualmente.
4. Se envolver credencial, revogar/rotacionar pelo processo do cofre e seguir o runbook de recuperação.
5. Verificar o estado persistido antes de repetir operações, sobretudo envio de e-mail e upload.
6. Executar smoke seguro após correção, registrar resultado e encerrar somente quando o alerta cessar.

Para perda/corrupção de dados, usar `docs/09-release/Backup-Recovery-Runbook.md`.
