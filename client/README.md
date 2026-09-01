# Interface web (React + Vite)

Front-end que consome a API de Controle de Estoque e Vendas. Feito com React,
Vite, React Router e Axios.

## Escopo desta entrega

O objetivo aqui não é cobrir a API inteira, e sim montar um **fluxo completo de
ponta a ponta**: cadastrar um usuário, fazer login e chegar em uma página que
só abre com o token na mão.

São três telas:

| Rota         | Tela              | Acesso    |
|--------------|-------------------|-----------|
| `/registrar` | Cadastro          | público   |
| `/login`     | Login             | público   |
| `/`          | Home              | com token |
| `*`          | 404               | —         |

As telas de produto, categoria, fornecedor e venda ficam para as próximas
aulas. Como a estrutura de pastas e o cliente HTTP já estão montados, cada uma
delas é basicamente criar um arquivo em `api/`, um em `pages/` e registrar a
rota no `App.jsx`.

## Como rodar

A API precisa estar rodando antes (na raiz do projeto, `npm run dev`).

Depois, dentro desta pasta:

```bash
npm install
```

```bash
npm run dev
```

A interface sobe em `http://localhost:5173`. O Vite encaminha tudo que começa
com `/api` para `http://localhost:3000`, então não é preciso configurar nada.
Se a API estiver em outro endereço, copie o `.env.example` para `.env` e
preencha a variável `VITE_API_URL`.

## Estrutura das pastas

```
src/
  api/          -> http.js (axios configurado) e authService.js (login/registro)
  components/
    ui/         -> peças genéricas: Botao, Campo, Selecao, Aviso, Etiqueta, Cartao
    RotaPrivada.jsx -> bloqueia a rota de quem não está logado
  context/      -> AuthContext: guarda o usuário logado e o token
  hooks/        -> useAuth: atalho para ler o contexto
  pages/        -> Login, Registrar, Home e NaoEncontrada
  styles/       -> CSS global com as variáveis de cor
  App.jsx       -> mapa de rotas
  main.jsx      -> ponto de entrada
```

A ideia da separação: **página** decide *o que* aparece e conversa com a API;
**componente** só recebe `props` e desenha. Por isso `Campo` e `Botao`
funcionam igual no login e no cadastro — mudar o visual em um lugar muda nos
dois.

## Como a autenticação funciona

1. O login chama `POST /api/auth/login` e recebe o token JWT.
2. O token e os dados do usuário ficam no `localStorage`, então a sessão
   sobrevive ao F5.
3. Um *interceptor* do Axios (`src/api/http.js`) coloca
   `Authorization: Bearer <token>` em toda requisição — nenhuma tela precisa
   se preocupar com isso.
4. Se a API responder `401` em uma rota protegida, o interceptor limpa a
   sessão e devolve o usuário para o login.
5. O componente `RotaPrivada` bloqueia a Home: sem token, redireciona para
   `/login` guardando a página de origem para voltar depois do login.

## Observação sobre o seletor de cargo no cadastro

A tela de cadastro deixa escolher entre vendedor e administrador porque a rota
pública `POST /api/auth/registrar` aceita o campo `cargo` vindo do corpo da
requisição. Isso é uma falha de segurança da API — qualquer pessoa poderia se
cadastrar como admin. Quando a API for corrigida (ignorando o `cargo` no
registro público), esse campo sai desta tela.
