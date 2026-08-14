# Animations

## Versão

1.0

---

# Objetivo

Este documento define todas as animações oficiais do FASBtech CRM.

As animações devem melhorar a experiência do utilizador, fornecer feedback visual e orientar a navegação.

Nunca devem ser utilizadas apenas por estética.

---

# Filosofia

Uma animação deve comunicar:

- uma mudança de estado;
- uma ação concluída;
- uma transição;
- uma hierarquia visual.

Toda animação deve possuir um propósito.

---

# Princípios

As animações devem ser:

- rápidas;
- discretas;
- suaves;
- previsíveis;
- acessíveis;
- consistentes.

Nunca devem prejudicar a produtividade.

---

# Duração

## Instant

100ms

Utilizado para:

- hover;
- focus;
- badges.

---

## Fast

150ms

Utilizado para:

- botões;
- inputs;
- ícones.

---

## Normal

250ms

Utilizado para:

- cards;
- drawers;
- dropdowns.

---

## Slow

350ms

Utilizado para:

- modais;
- transições de página;
- painéis.

---

# Curvas (Easing)

## Default

ease-in-out

Utilização padrão.

---

## Enter

ease-out

Elementos entrando na interface.

---

## Exit

ease-in

Elementos saindo da interface.

---

# Hover

Botões

- alteração de cor;
- sombra suave;
- duração: 150ms.

---

Cards

- elevação leve;
- translateY(-2px);
- sombra média;
- duração: 200ms.

---

Links

- alteração de cor;
- underline suave quando aplicável.

---

# Focus

Todos os componentes focáveis devem apresentar:

- focus ring;
- animação discreta;
- duração: 150ms.

Nunca remover o indicador de foco.

---

# Botões

Estados:

Default

↓

Hover

↓

Pressed

↓

Disabled

↓

Loading

Durante Loading:

- botão permanece no mesmo tamanho;
- evitar mudanças bruscas de layout.

---

# Inputs

Ao receber foco:

- alterar border;
- exibir focus ring;
- manter transição suave.

---

# Cards

Hover:

- pequena elevação;
- sombra;
- sem mudanças bruscas de escala.

---

# Sidebar

Desktop

Expandir/recolher suavemente.

---

Mobile

Abrir com slide lateral.

Fechar ao tocar fora ou pressionar ESC.

---

# Modal

Entrada

Fade + Scale

Saída

Fade

Duração:

250ms

---

# Drawer

Entrada

Slide

Saída

Slide

---

# Dropdown

Fade + Scale

Duração:

150ms

---

# Toast

Entrada

Fade + Slide

Saída

Fade

Tempo de exibição:

4 segundos

---

# Skeleton

Utilizar animação Pulse.

Nunca utilizar spinners em páginas completas.

---

# Loading

Sempre priorizar Skeleton.

Spinner apenas para ações pequenas.

Exemplos:

Salvar

Atualizar

Enviar

---

# Tabelas

Mudanças de página:

Fade curto.

Ordenação:

Animação apenas no indicador da coluna.

Nunca animar todas as linhas.

---

# Dashboard

KPIs

Fade + Slide

Cards

Fade

Gráficos

Fade

Nunca utilizar animações simultâneas exageradas.

---

# Feedback Visual

Operações concluídas

Toast

↓

Atualização do componente

↓

Animação discreta

---

# Erros

Campos inválidos

↓

Borda vermelha

↓

Focus automático

↓

Mensagem abaixo do campo

Evitar efeitos exagerados como "shake".

---

# Navegação

Mudanças de rota

Transição curta.

O conteúdo deve aparecer rapidamente.

---

# Responsividade

As animações devem funcionar igualmente em:

- Desktop;
- Tablet;
- Mobile.

---

# Performance

Animar apenas propriedades aceleradas por GPU.

Permitido:

- opacity;
- transform.

Evitar animar:

- width;
- height;
- top;
- left.

---

# prefers-reduced-motion

Respeitar sempre a preferência do sistema.

Quando ativado:

- remover animações decorativas;
- manter apenas transições essenciais.

---

# Acessibilidade

Animações nunca devem:

- provocar distração;
- dificultar leitura;
- impedir interação.

---

# Bibliotecas

Biblioteca oficial:

Framer Motion

Caso uma animação simples possa ser feita com CSS, preferir CSS.

Framer Motion deve ser reservado para animações mais complexas.

---

# Tokens

Todas as animações devem utilizar os Design Tokens.

Exemplos:

motion-fast

motion-normal

motion-slow

duration.fast

ease.default

Nunca utilizar valores hardcoded.

---

# Reutilização

As animações devem ser centralizadas.

Evitar criar animações específicas para cada componente.

---

# Checklist

Antes de criar uma animação verificar:

- possui objetivo?
- melhora a UX?
- respeita acessibilidade?
- utiliza Design Tokens?
- respeita prefers-reduced-motion?
- mantém 60 FPS?

---

# Não utilizar

- animações infinitas sem necessidade;
- bounce exagerado;
- zoom agressivo;
- rotações decorativas;
- delays longos;
- piscadas constantes.

---

# Futuras Evoluções

- Microinterações avançadas;
- Transições entre páginas;
- Motion Design para Dashboard;
- Timeline animada;
- Feedback visual em Activity Logs.

Estas funcionalidades não fazem parte do MVP.

---

# Definition of Done

Uma animação será considerada aprovada quando:

- possuir finalidade clara;
- utilizar Design Tokens;
- respeitar Accessibility.md;
- funcionar em Desktop, Tablet e Mobile;
- respeitar prefers-reduced-motion;
- manter boa performance;
- não comprometer a produtividade.