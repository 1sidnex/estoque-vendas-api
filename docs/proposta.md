# Proposta da Aplicação

## Problema

Pequenas lojas frequentemente controlam estoque e vendas em planilhas ou
cadernos, o que gera divergências entre o que está registrado e o que
realmente existe na prateleira, dificulta saber quais produtos estão
acabando e não deixa claro o histórico de vendas por período ou por
vendedor.

## Solução

Uma API REST que centraliza o cadastro de produtos, categorias e
fornecedores, controla o estoque automaticamente a cada venda registrada e
mantém um histórico de vendas vinculado ao usuário que realizou cada uma.
O acesso é protegido por autenticação, e cada usuário tem um perfil
(administrador ou vendedor) que define o que pode fazer.

## Principais funcionalidades

- **Autenticação**: registro e login de usuários, com senha criptografada
  e emissão de token JWT.
- **Perfis de acesso**: `admin` (acesso total, incluindo gestão de
  usuários, produtos, categorias e fornecedores) e `vendedor` (pode
  registrar vendas e consultar o catálogo, mas não altera cadastros).
- **Gestão de categorias**: CRUD completo, usado para organizar os
  produtos.
- **Gestão de fornecedores**: CRUD completo, com CNPJ único por
  fornecedor.
- **Gestão de produtos**: CRUD completo, com preço, quantidade em
  estoque, categoria e fornecedor vinculados.
- **Registro de vendas**: ao criar uma venda com um ou mais itens, a API
  valida se há estoque suficiente, calcula o total automaticamente e dá
  baixa na quantidade em estoque de cada produto vendido.
- **Cancelamento de venda**: devolve os itens ao estoque e marca a venda
  como cancelada, mantendo o histórico.

## Usuários do sistema

- **Administrador**: dono ou gerente da loja — cadastra produtos,
  categorias, fornecedores e gerencia os usuários do sistema.
- **Vendedor**: funcionário do balcão — consulta o catálogo e registra as
  vendas do dia a dia.
