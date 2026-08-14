# Design Tokens

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

Este documento define os Design Tokens oficiais do FASBtech CRM.

Os Design Tokens representam a camada entre o Design System e a implementação da aplicação.

Todo valor visual utilizado pelo sistema deverá ser obtido através destes tokens.

Nenhum componente poderá utilizar valores hardcoded.

Este documento é a **fonte oficial de todos os valores visuais do projeto**.

---

# Filosofia

Todo elemento visual deverá utilizar Design Tokens.

❌ Incorreto

```css
background: #DC2626;
padding: 24px;
border-radius: 12px;
transition: 250ms;
```

✅ Correto

```css
background: var(--color-primary-600);
padding: var(--spacing-xl);
border-radius: var(--radius-lg);
transition: var(--transition-default);
```

---

# Source of Truth

A hierarquia oficial do Design System é:

```text
Design Tokens
        │
        ▼
Color Palette
        │
        ▼
Spacing
        │
        ▼
Animations
        │
        ▼
Layout
        │
        ▼
Components
        │
        ▼
Implementation Guide
```

Nenhum documento poderá definir valores visuais diferentes dos tokens descritos neste arquivo.

---

# Convenção

Todos os tokens seguem o padrão:

```text
categoria.grupo.valor
```

Exemplos:

```text
color.primary.600

spacing.lg

radius.md

shadow.sm

motion.fast

table.row.height
```

Esta convenção deverá ser utilizada em toda a documentação e implementação.

---

# Color Tokens

## Primary

```text
color.primary.50
color.primary.100
color.primary.200
color.primary.300
color.primary.400
color.primary.500
color.primary.600
color.primary.700
color.primary.800
color.primary.900
```

---

## Neutral

```text
color.neutral.50
color.neutral.100
color.neutral.200
color.neutral.300
color.neutral.400
color.neutral.500
color.neutral.600
color.neutral.700
color.neutral.800
color.neutral.900
color.neutral.950
```

---

## Semantic

```text
color.success

color.warning

color.danger

color.info
```

---

## Background

```text
color.background.app

color.background.card

color.background.sidebar

color.background.header

color.background.modal
```

---

## Border

```text
color.border.default

color.border.hover

color.border.active
```

---

## Text

```text
color.text.primary

color.text.secondary

color.text.muted

color.text.disabled

color.text.inverse
```

---

# Typography

## Font Family

```text
font.family.sans

font.family.mono
```

---

## Font Weight

```text
font.weight.regular

font.weight.medium

font.weight.semibold

font.weight.bold
```

---

## Font Size

```text
font.size.display

font.size.h1

font.size.h2

font.size.h3

font.size.h4

font.size.h5

font.size.h6

font.size.body

font.size.small

font.size.caption
```

---

# Spacing

| Token | Valor |
|--------|--------|
| spacing.xs | 4px |
| spacing.sm | 8px |
| spacing.md | 12px |
| spacing.lg | 16px |
| spacing.xl | 24px |
| spacing.2xl | 32px |
| spacing.3xl | 40px |
| spacing.4xl | 48px |
| spacing.5xl | 64px |

---

# Radius

| Token | Valor |
|--------|--------|
| radius.none | 0 |
| radius.xs | 4px |
| radius.sm | 6px |
| radius.md | 8px |
| radius.lg | 12px |
| radius.xl | 16px |
| radius.2xl | 24px |
| radius.full | 9999px |

---

# Shadow

| Token | Valor |
|--------|--------|
| shadow.sm | 0 1px 2px rgba(0,0,0,.15) |
| shadow.md | 0 4px 8px rgba(0,0,0,.20) |
| shadow.lg | 0 8px 24px rgba(0,0,0,.25) |
| shadow.xl | 0 16px 40px rgba(0,0,0,.35) |

---

# Border Width

| Token | Valor |
|--------|--------|
| border.width.sm | 1px |
| border.width.md | 2px |
| border.width.lg | 4px |

---

# Opacity

| Token | Valor |
|--------|--------|
| opacity.disabled | .50 |
| opacity.hover | .80 |
| opacity.overlay | .60 |

---

# Z Index

| Token | Valor |
|--------|--------|
| z.base | 0 |
| z.dropdown | 10 |
| z.sticky | 20 |
| z.overlay | 30 |
| z.modal | 40 |
| z.toast | 50 |
| z.tooltip | 60 |

---

# Motion

| Token | Valor |
|--------|--------|
| motion.instant | 100ms |
| motion.fast | 150ms |
| motion.normal | 250ms |
| motion.slow | 350ms |
| motion.slower | 500ms |

---

# Easing

| Token | Valor |
|--------|--------|
| ease.default | ease-in-out |
| ease.in | ease-in |
| ease.out | ease-out |
| ease.inOut | ease-in-out |

---

# Transition

| Token | Valor |
|--------|--------|
| transition.default | motion.normal + ease.default |
| transition.fast | motion.fast + ease.out |
| transition.slow | motion.slow + ease.inOut |

---

# Focus Ring

| Token | Valor |
|--------|--------|
| focus.ring.width | 2px |
| focus.ring.offset | 2px |
| focus.ring.color | color.primary.600 |

---

# Overlay

| Token | Valor |
|--------|--------|
| overlay.blur.sm | 4px |
| overlay.blur.md | 8px |
| overlay.blur.lg | 16px |

---

# Breakpoints

| Token | Valor |
|--------|--------|
| breakpoint.mobile | 640px |
| breakpoint.tablet | 768px |
| breakpoint.desktop | 1024px |
| breakpoint.wide | 1280px |
| breakpoint.ultrawide | 1536px |

---

# Containers

| Token | Valor |
|--------|--------|
| container.sm | 640px |
| container.md | 768px |
| container.lg | 1024px |
| container.xl | 1280px |
| container.2xl | 1440px |
| container.full | 100% |

---

# Sidebar

| Token | Valor |
|--------|--------|
| sidebar.width.expanded | 280px |
| sidebar.width.collapsed | 80px |
| sidebar.item.height | 48px |
| sidebar.icon.size | 20px |

---

# Header

| Token | Valor |
|--------|--------|
| header.height | 72px |
| header.padding | spacing.xl |

---

# Card

| Token | Valor |
|--------|--------|
| card.padding | spacing.xl |
| card.radius | radius.lg |
| card.shadow | shadow.md |
| card.border | border.width.sm |

---

# Button

| Token | Valor |
|--------|--------|
| button.height.sm | 36px |
| button.height.md | 44px |
| button.height.lg | 52px |
| button.padding | spacing.lg |
| button.radius | radius.md |

---

# Input

| Token | Valor |
|--------|--------|
| input.height | 44px |
| input.padding | spacing.lg |
| input.radius | radius.md |
| input.border | border.width.sm |

---

# Table

| Token | Valor |
|--------|--------|
| table.header.height | 52px |
| table.row.height | 52px |
| table.padding | spacing.lg |

---

# Modal

| Token | Valor |
|--------|--------|
| modal.width | 640px |
| modal.maxWidth | 900px |
| modal.padding | spacing.xl |
| modal.radius | radius.lg |

---

# Icons

| Token | Valor |
|--------|--------|
| icon.xs | 14px |
| icon.sm | 16px |
| icon.md | 20px |
| icon.lg | 24px |
| icon.xl | 32px |

---

# Avatar

| Token | Valor |
|--------|--------|
| avatar.sm | 32px |
| avatar.md | 40px |
| avatar.lg | 56px |
| avatar.xl | 72px |

---

# Accessibility

Todos os componentes deverão respeitar:

- WCAG 2.2 AA;
- contraste mínimo de 4.5:1 para texto normal;
- contraste mínimo de 3:1 para texto grande;
- foco visível;
- suporte a `prefers-reduced-motion`.

Todo componente deverá utilizar os tokens oficiais de Focus Ring.

Nenhum componente poderá remover o outline padrão sem substituí-lo pelo Focus Ring oficial.

---

# Implementação

Os Design Tokens deverão ser utilizados em:

- CSS Variables;
- Tailwind CSS;
- React Components;
- shadcn/ui;
- Radix UI;
- Figma (futuro);
- React Native (futuro).

---

# Regras

Nunca utilizar:

- valores hexadecimais diretamente;
- pixels arbitrários;
- sombras arbitrárias;
- border-radius arbitrário;
- durations arbitrárias;
- transitions arbitrárias.

Toda implementação deverá utilizar exclusivamente os tokens definidos neste documento.

---

# Evolução

Este documento servirá como fonte para geração automática de:

- globals.css;
- tokens.css;
- tailwind.config.ts;
- tema do shadcn/ui;
- Figma Variables;
- React Native Theme.

---

# Referências

Este documento deve permanecer sincronizado com:

- Color Palette
- Spacing
- Animations
- Components
- Layout
- Accessibility
- Implementation Guide

---

# Definition of Done

Uma implementação será considerada correta quando:

- utilizar exclusivamente os Design Tokens oficiais;
- não possuir valores hardcoded;
- respeitar o Design System;
- manter consistência visual em toda a aplicação;
- permanecer sincronizada com todos os documentos do Design System.