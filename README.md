# Controle de Estoque e Vendas

Projeto de faculdade: um sistema web para controlar estoque e vendas de uma
pequena loja. O repositório tem duas partes que funcionam juntas:

- **API** (`src/`): Node.js, Express e MongoDB (Mongoose), com login por JWT.
- **Interface web** (`web/`): Next.js, que consome a API.

A proposta completa está em [`docs/proposta.md`](docs/proposta.md).

## Resumo da proposta

Pequenas lojas costumam controlar estoque e vendas em planilha ou caderno, o
que gera diferença entre o que está anotado e o que existe na prateleira. O
sistema centraliza o cadastro de produtos, categorias e fornecedores, dá baixa
no estoque a cada venda e guarda o histórico de vendas de cada vendedor.

Cada usuário tem um perfil que define o que ele pode fazer:

| Tela | Administrador | Vendedor |
|------|---------------|----------|
| Produtos, Categorias e Fornecedores | consulta, cadastra, edita e exclui | só consulta |
| Vendas | registra, consulta e cancela | registra e consulta |
| Usuários | gerencia | sem acesso (vai para a tela de acesso negado) |

Os botões das ações que o perfil não pode fazer nem aparecem na tela, e a API
também bloqueia essas operações.

## Estrutura do projeto

```
src/                -> a API (back-end)
  config/           -> conexão com o banco de dados
  models/           -> schemas do Mongoose (Usuario, Produto, Categoria, Fornecedor, Venda)
  controllers/      -> regras de negócio de cada entidade
  routes/           -> definição dos endpoints da API
  middlewares/      -> autenticação (JWT), autorização por cargo e tratamento de erros
  seed.js           -> cria os usuários e dados de teste
  server.js         -> ponto de entrada da API
web/                -> a interface web (Next.js)
  src/app/          -> uma pasta por rota (login, cadastro, painel e telas internas)
  src/components/   -> componentes reutilizáveis e formulários de cada tela
  src/services/     -> chamadas HTTP para a API
  src/context/      -> sessão do usuário logado
docs/
  proposta.md       -> proposta da aplicação
  Diagrama.jpeg     -> diagrama de entidade-relacionamento
estoque-vendas-api.postman_collection.json -> coleção de requisições (Postman/Insomnia)
```

## O que você precisa antes de rodar

- [Node.js](https://nodejs.org/) instalado (usei a versão LTS)
- Uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/atlas)

Optei por usar o MongoDB Atlas (banco na nuvem) em vez de instalar o MongoDB
localmente. No Windows, instalar o MongoDB Server local costuma dar
trabalho (erro de serviço, DLL faltando etc.), então o Atlas acaba sendo o
caminho mais tranquilo — e é basicamente o que se usa no dia a dia mesmo.

## Configurando o banco no Atlas

1. Crie uma conta em [mongodb.com/atlas](https://www.mongodb.com/atlas/register).
2. Crie um cluster gratuito (**M0**). Pode deixar tudo no padrão, ou
   escolher uma região mais perto do Brasil se aparecer a opção.
3. Na tela de configuração inicial:
   - Em autenticação, deixe **Username and Password**. Defina um usuário e
     uma senha — evite usar `@`, `/` ou espaço na senha, porque isso
     complica na hora de montar a string de conexão.
   - Em "Where would you like to connect from", clique em **Add My Current
     IP Address** e também adicione `0.0.0.0/0` (allow access from
     anywhere), para não correr o risco de a conexão parar de funcionar se
     o seu IP mudar depois.
4. No cluster criado, clique em **Connect → Drivers → Node.js**.
5. Copie a string de conexão que aparece, parecida com:
   ```
   mongodb+srv://usuario:<db_password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
   ```
   e troque `<db_password>` pela senha que você definiu.

Se ao rodar o projeto aparecer um erro `querySrv ECONNREFUSED`, foi o que
aconteceu comigo: algumas redes bloqueiam a consulta DNS que o formato
`mongodb+srv://` usa. Nesse caso, na mesma tela do passo 4 tem um botão
"SRV Connection String" — desligando ele, o Atlas mostra uma string
alternativa (sem `+srv`, com vários endereços `host:27017` separados por
vírgula) que resolve o problema.

## Rodando o projeto

A API e a interface rodam em terminais separados: a API na porta `3000` e a
interface na `3001`.

### 1. API

Clone o repositório e entre na pasta:
```bash
git clone <url-do-seu-repositorio>
cd estoque-vendas-api
```

Instale as dependências:
```bash
npm install
```

Copie o arquivo de variáveis de ambiente:
```bash
copy .env.example .env
```
(no Linux/Mac o comando é `cp .env.example .env`)

Abra o `.env` e preencha com a sua string do Atlas — acrescentando
`/estoque-vendas` antes do `?`, que é o nome do banco — e um segredo
qualquer para o JWT:
```
PORT=3000
MONGO_URI=mongodb+srv://usuario:suasenha@cluster0.xxxxx.mongodb.net/estoque-vendas?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=um_segredo_bem_grande_e_aleatorio
JWT_EXPIRES_IN=1d
```
Não precisa criar o banco `estoque-vendas` manualmente lá no Atlas — o
Mongoose cria sozinho assim que a API salva o primeiro dado.

Crie os usuários e dados de teste (veja a seção [Usuários de teste](#usuários-de-teste)):
```bash
npm run seed
```

Agora é só subir o servidor:
```bash
npm run dev
```
(ou `npm start`, se não quiser o reinício automático do nodemon)

Se der tudo certo, o terminal mostra "Conectado ao MongoDB com sucesso" e
"Servidor rodando em http://localhost:3000".

### 2. Interface web

Com a API rodando, abra **outro terminal** na pasta do projeto e execute:

```bash
cd web
```

```bash
npm install
```

```bash
npm run dev
```

A interface abre em `http://localhost:3001` e já sabe conversar com a API em
`http://localhost:3000/api`. Se a API estiver em outro endereço, copie
`web/.env.example` para `web/.env.local` e ajuste o `NEXT_PUBLIC_API_URL`.

Se a tela mostrar "Não foi possível conectar à API", confira se o terminal da
API continua rodando na porta 3000.

## Usuários de teste

O comando `npm run seed` cria estes usuários no banco configurado no `.env`:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | `admin@loja.test` | `admin123` |
| Vendedor | `vendedor@loja.test` | `vendedor123` |

Ele também cadastra duas categorias, um fornecedor e quatro produtos de
exemplo (um deles com estoque zerado), para já dar para testar vendas.

Pode rodar o seed mais de uma vez: ele não duplica nem apaga nada. A única
coisa que ele refaz é a senha e o cargo desses dois usuários de teste.

## Autenticação

1. Registra um usuário em `POST /api/auth/registrar` (o cadastro público
   sempre cria um `vendedor`).
2. Faz login em `POST /api/auth/login`, que devolve um `token`.
3. Esse token vai no header das rotas protegidas:
   ```
   Authorization: Bearer <token>
   ```

Tem dois cargos possíveis (`cargo`): `admin`, que tem acesso a tudo, e
`vendedor`, que consulta o catálogo e registra vendas mas não mexe em
cadastro de produto, categoria, fornecedor ou usuário.

Um `admin` só pode ser criado por outro admin, pela tela de Usuários ou por
`POST /api/usuarios`. O primeiro admin vem do `npm run seed`.

## Testando com Postman ou Insomnia

O arquivo [`estoque-vendas-api.postman_collection.json`](estoque-vendas-api.postman_collection.json),
na raiz do projeto, já traz todas as requisições organizadas por entidade
e algumas variáveis prontas (`base_url`, `token`, `categoria_id`, etc). É
só importar e ir preenchendo o `token` depois do login. A requisição de
login já vem com o admin de teste do seed.

## Rotas principais

| Método | Rota                      | O que faz                            | Quem acessa  |
|--------|---------------------------|----------------------------------------|--------------|
| POST   | /api/auth/registrar       | cria um usuário vendedor               | público      |
| POST   | /api/auth/login           | login, devolve token                   | público      |
| POST   | /api/usuarios             | cria usuário escolhendo o cargo        | admin        |
| GET    | /api/usuarios             | lista usuários                         | admin        |
| GET    | /api/categorias           | lista categorias                       | logado       |
| POST   | /api/categorias           | cria categoria                         | admin        |
| GET    | /api/fornecedores         | lista fornecedores                     | logado       |
| POST   | /api/fornecedores         | cria fornecedor                        | admin        |
| GET    | /api/produtos             | lista produtos                         | logado       |
| POST   | /api/produtos             | cria produto                           | admin        |
| POST   | /api/vendas               | registra venda e dá baixa no estoque   | logado       |
| GET    | /api/vendas               | lista vendas                           | logado       |
| PATCH  | /api/vendas/:id/cancelar  | cancela venda e devolve ao estoque     | admin        |

Rotas de criação retornam `201`; erro de validação retorna `400`; rota
protegida sem token retorna `401`; sem permissão de cargo retorna `403`;
recurso que não existe retorna `404`; e excluir uma categoria que ainda tem
produtos retorna `409`.

## Sobre a parte de segurança

- Senha nunca é salva em texto puro — passa pelo `bcrypt` antes de ir pro
  banco.
- O login gera um token JWT assinado com o segredo do `.env`.
- Rotas privadas passam por um middleware que confere o token e, quando
  precisa, também o cargo do usuário. O cargo é lido do banco a cada
  requisição, então rebaixar ou excluir um usuário vale na hora.
- O `.env` está no `.gitignore`, então nenhuma credencial real vai junto
  no repositório. As senhas do seed são só para teste.
