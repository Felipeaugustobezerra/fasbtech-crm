# Changelog

## Não lançado

### Adicionado

- Estrutura inicial da documentação.
- Definição do MVP, requisitos e arquitetura inicial.
- Integração do Supabase Auth para browser, servidor e Proxy.
- Login com e-mail e senha, React Hook Form e Zod.
- Logout por operação de servidor.
- Proteção otimista de rotas com `proxy.ts` e validação no servidor.
- Layout base responsivo com sidebar placeholder, header e área principal.
- Dashboard inicial com mensagem de boas-vindas.
- Arquivo `.env.example` sem valores reais.

### Alterado

- Metadados, idioma e estilos globais do template inicial.
- Configuração do Turbopack com raiz explícita do projeto.
- Sprint 01 atualizada com resultados e lições aprendidas.

### Validado

- Login bem-sucedido com Supabase Auth.
- Renderização da área privada após autenticação.
- Persistência da sessão após recarregar a página.
- Redirecionamento de utilizador autenticado ao acessar `/login`.
- Logout e redirecionamento para `/login`.
- Bloqueio da rota privada antes do login e após o encerramento da sessão.
- Sprint 01 concluída em 06/08/2026.
