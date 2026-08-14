# Color Palette

## Projeto

FASBtech CRM

---

## Status

🟢 Ativo

---

## Versão

2.0

---

# Objetivo

Este documento define todas as cores oficiais utilizadas pela FASBtech.

Nenhuma interface deverá utilizar cores fora desta paleta sem aprovação arquitetural.

Esta paleta representa a implementação visual oficial do Design System.

---

# Fonte da Verdade

Este documento representa apenas a camada visual.

Os estados do sistema são definidos pelos documentos de domínio.

Para Leads:

```text
Leads Schema

↓

Color Palette

↓

Design Tokens

↓

Components

↓

Interface
```

Novos Status deverão ser adicionados inicialmente ao domínio.

Somente depois poderão receber representação visual.

---

# Filosofia

A identidade visual da FASBtech é baseada em três pilares:

- Dark First
- Alto Contraste
- Vermelho como Accent Color

A maior parte da interface utiliza tons neutros.

O vermelho existe apenas para direcionar a atenção do utilizador.

---

# Primary

Cor principal da marca.

Utilizada para:

- Botões principais;
- Links;
- Estados ativos;
- Indicadores;
- Elementos importantes.

| Nome | HEX |
|------|------|
| Primary 50 | #FFF5F5 |
| Primary 100 | #FFE5E5 |
| Primary 200 | #FFC9C9 |
| Primary 300 | #FFA3A3 |
| Primary 400 | #FF7070 |
| Primary 500 | #EF4444 |
| Primary 600 | #DC2626 |
| Primary 700 | #B91C1C |
| Primary 800 | #991B1B |
| Primary 900 | #7F1D1D |

---

# Neutral

Base da interface.

| Nome | HEX |
|------|------|
| Neutral 50 | #FAFAFA |
| Neutral 100 | #F5F5F5 |
| Neutral 200 | #E5E5E5 |
| Neutral 300 | #D4D4D4 |
| Neutral 400 | #A3A3A3 |
| Neutral 500 | #737373 |
| Neutral 600 | #525252 |
| Neutral 700 | #404040 |
| Neutral 800 | #262626 |
| Neutral 900 | #171717 |
| Neutral 950 | #0A0A0A |

---

# Semantic Colors

## Success

Utilizada para:

- operações concluídas;
- Lead ganho;
- sucesso.

| Nome | HEX |
|------|------|
| Success | #22C55E |

---

## Warning

Utilizada para:

- atenção;
- prazos;
- lembretes.

| Nome | HEX |
|------|------|
| Warning | #F59E0B |

---

## Danger

Utilizada para:

- erros;
- perdas;
- falhas;
- operações críticas.

| Nome | HEX |
|------|------|
| Danger | #EF4444 |

---

## Info

Utilizada para:

- informações;
- estados neutros;
- links secundários.

| Nome | HEX |
|------|------|
| Info | #3B82F6 |

---

# Background

| Elemento | HEX |
|----------|------|
| App | #09090B |
| Card | #111111 |
| Sidebar | #0D0D0D |
| Header | #111111 |
| Modal | #111111 |

---

# Borders

| Estado | Valor |
|---------|--------|
| Default | #262626 |
| Hover | #3F3F46 |
| Active | Primary 600 |

---

# Text

## Primary

```text
#FAFAFA
```

---

## Secondary

```text
#A1A1AA
```

---

## Muted

```text
#A3A3A3
```

Este valor substitui o anterior (`#71717A`) para garantir conformidade com WCAG 2.2 AA sobre os fundos oficiais da aplicação.

---

## Disabled

```text
#52525B
```

---

# Lead Status Colors

Os Status abaixo representam exatamente os valores oficiais definidos no Leads Schema.

| Status | Cor |
|---------|------|
| NEW | Neutral |
| CONTACTED | Info |
| QUALIFIED | Primary 500 |
| PROPOSAL_SENT | Primary 600 |
| NEGOTIATION | Primary 700 |
| WON | Success |
| LOST | Danger |
| ARCHIVED | Neutral 600 |

Não é permitido adicionar estados visuais que não existam no domínio.

---

# Status Tokens

Cada Status deverá utilizar exclusivamente Design Tokens.

| Status | Token |
|---------|--------|
| NEW | status.new |
| CONTACTED | status.contacted |
| QUALIFIED | status.qualified |
| PROPOSAL_SENT | status.proposal |
| NEGOTIATION | status.negotiation |
| WON | status.success |
| LOST | status.danger |
| ARCHIVED | status.archived |

Nunca utilizar cores diretamente nos componentes.

---

# Financeiro

| Estado | Cor |
|---------|------|
| Pago | Success |
| Pendente | Warning |
| Atrasado | Danger |
| Cancelado | Neutral |

---

# Botões

## Primary

Background

Primary 600

Hover

Primary 700

---

## Secondary

Background

Transparent

Border

Neutral 700

Hover

Neutral 800

---

## Danger

Background

Danger

Hover

Primary 800

---

# Inputs

| Estado | Cor |
|---------|------|
| Background | Neutral 900 |
| Border | Neutral 700 |
| Hover | Neutral 600 |
| Focus | Primary 600 |

---

# Tabelas

| Elemento | Cor |
|----------|------|
| Header | Neutral 900 |
| Row | Transparent |
| Hover | Neutral 900 |
| Selected | Primary 900 |

---

# Gráficos

Utilizar no máximo cinco cores principais.

Ordem recomendada:

1. Primary
2. Success
3. Info
4. Warning
5. Danger

---

# Regras

Nunca utilizar:

- verde para botões principais;
- vermelho como fundo da aplicação;
- múltiplas Accent Colors;
- gradientes coloridos;
- cores arbitrárias;
- Hexadecimal diretamente em componentes.

Sempre utilizar Design Tokens.

---

# Acessibilidade

Todos os pares de cores deverão respeitar WCAG 2.2 AA.

Sempre validar:

- contraste;
- foco;
- estados hover;
- estados disabled.

---

# Futuras Evoluções

Este documento servirá de base para:

- Design Tokens;
- Tailwind Theme;
- CSS Variables;
- shadcn/ui Theme;
- Figma Variables;
- React Native Theme.

---

# Definition of Done

Uma nova cor somente poderá ser adicionada quando:

- possuir Design Token;
- possuir documentação;
- respeitar WCAG 2.2 AA;
- não conflitar com a identidade visual;
- estar alinhada aos documentos de domínio do sistema.