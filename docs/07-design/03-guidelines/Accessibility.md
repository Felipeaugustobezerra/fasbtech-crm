# Accessibility

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

Este documento define os requisitos oficiais de acessibilidade do FASBtech CRM.

Todas as interfaces, componentes e fluxos do sistema deverão cumprir estes requisitos para garantir uma experiência inclusiva, consistente e utilizável.

O objetivo é assegurar que qualquer utilizador consiga operar o sistema independentemente de limitações físicas, cognitivas ou tecnológicas.

---

# Fonte da Verdade

A implementação deverá respeitar a seguinte hierarquia:

```text
WCAG 2.2 AA

↓

Accessibility

↓

Components

↓

Layout

↓

Implementation Guide

↓

Interface
```

Nenhuma implementação poderá contrariar este documento.

---

# Filosofia

A acessibilidade não é uma funcionalidade adicional.

Ela faz parte da qualidade do software.

Todo componente deverá nascer acessível.

Nunca considerar acessibilidade como uma etapa posterior do desenvolvimento.

---

# Objetivos

Toda interface deverá ser:

- perceptível;
- operável;
- compreensível;
- robusta.

Seguindo os quatro princípios fundamentais da WCAG.

---

# Contraste

Todo texto deverá respeitar WCAG 2.2 AA.

Mínimos:

Texto normal

```text
4.5 : 1
```

Texto grande

```text
3 : 1
```

Nunca utilizar:

- cinza sobre cinza;
- vermelho sobre preto;
- texto claro sobre fundo claro;
- contraste insuficiente.

As cores oficiais encontram-se em:

```text
Color Palette.md
```

---

# Navegação por Teclado

Todo componente deverá funcionar completamente utilizando apenas teclado.

Fluxo esperado:

```text
Tab

↓

Shift + Tab

↓

Enter

↓

Space

↓

Esc
```

Nenhuma funcionalidade poderá depender exclusivamente do mouse.

---

# Focus

Todo elemento focável deverá apresentar Focus Ring visível.

Nunca remover:

```css
outline
```

sem substituição pelo Focus Ring oficial.

O Focus deverá utilizar exclusivamente os Design Tokens definidos para foco.

---

# Labels

Todo campo deverá possuir Label.

Nunca utilizar Placeholder como substituto de Label.

Campos obrigatórios deverão ser claramente identificados.

---

# Formulários

Todos os formulários deverão utilizar:

- React Hook Form;
- Zod.

As mensagens de erro deverão:

- estar associadas ao campo;
- ser anunciadas por leitores de tela;
- permanecer visíveis até a correção.

Nunca utilizar apenas cor para indicar erro.

---

# Botões

Todo botão deverá possuir:

- texto visível;

ou

- `aria-label`.

Exemplo:

```tsx
<Button aria-label="Novo Lead" />
```

Botões apenas com ícones deverão possuir obrigatoriamente `aria-label`.

---

# Ícones

Ícones decorativos:

```tsx
aria-hidden="true"
```

Ícones funcionais:

```tsx
aria-label
```

obrigatório.

A biblioteca oficial é:

```text
Lucide React
```

---

# Links

Nunca utilizar textos genéricos.

Errado:

```text
Clique aqui
```

Correto:

```text
Ver detalhes do Lead
```

Os links deverão indicar claramente seu destino.

---

# DataTable

Todas as DataTables deverão cumprir WCAG 2.2 AA.

Obrigatório:

- `<caption>`;
- `<thead>`;
- `<tbody>`;
- `<th scope="col">`;
- ordem correta de navegação;
- foco visível;
- suporte a leitores de tela.

Seguir obrigatoriamente:

```text
DataTable Guidelines.md
```

---

# Dashboard

Os Dashboards deverão:

- manter hierarquia visual;
- permitir navegação por teclado;
- possuir títulos claros;
- utilizar componentes acessíveis;
- respeitar ordem lógica de leitura.

Seguir:

```text
Dashboard Guidelines.md
```

---

# Dialog

Ao abrir:

- foco vai para o primeiro elemento interativo.

Ao fechar:

- foco retorna ao elemento que abriu o Dialog.

A tecla:

```text
Esc
```

deverá fechar o Dialog quando apropriado.

---

# Drawer

Segue exatamente o mesmo comportamento do Dialog.

---

# Toast

Os Toasts deverão:

- possuir texto;
- não depender apenas da cor;
- ser anunciados por leitores de tela quando necessário.

---

# Loading

Utilizar Skeleton.

Nunca bloquear completamente a interface.

O Skeleton deverá aproximar-se da estrutura final para reduzir Layout Shift.

---

# Motion

Toda animação deverá respeitar:

```css
prefers-reduced-motion
```

As animações deverão utilizar exclusivamente os Motion Tokens oficiais.

Nunca utilizar animações excessivas.

---

# Responsividade

A interface deverá funcionar corretamente com:

- zoom de até 200%;
- orientação retrato e paisagem;
- diferentes tamanhos de ecrã.

Nenhuma funcionalidade poderá ser perdida.

---

# Componentes Oficiais

Todos os componentes definidos em:

```text
Components.md
```

deverão cumprir integralmente este documento.

---

# Testes

Os testes deverão validar:

- navegação por teclado;
- foco;
- labels;
- mensagens de erro;
- contraste;
- leitores de tela quando aplicável.

Seguir:

```text
Testing Strategy.md
```

---

# Regras

Nunca:

- remover Focus Ring;
- depender apenas de cores;
- utilizar Placeholder como Label;
- bloquear navegação por teclado;
- criar componentes inacessíveis.

Sempre:

- utilizar HTML semântico;
- utilizar ARIA quando necessário;
- respeitar WCAG 2.2 AA;
- reutilizar Components oficiais.

---

# Referências

Este documento deverá permanecer sincronizado com:

- Components
- Layout
- Dashboard Guidelines
- DataTable Guidelines
- Design Tokens
- Color Palette
- Implementation Guide
- Testing Strategy

---

# Definition of Done

Uma interface será considerada acessível quando:

- cumprir WCAG 2.2 AA;
- funcionar completamente por teclado;
- possuir Focus Ring visível;
- possuir contraste adequado;
- utilizar HTML semântico;
- possuir Labels acessíveis;
- utilizar ARIA quando necessário;
- respeitar este documento em todos os componentes.