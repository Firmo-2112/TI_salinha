# Backend - Setor de TI Manager

Backend API para o sistema de gerenciamento Setor de TI, utilizando Node.js, Express e SQLite.

## Instalação

1. Certifique-se de ter o Node.js instalado (versão 16 ou superior)

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

Ou para desenvolvimento com auto-reload:
```bash
npm run dev
```

4. O servidor estará disponível em `http://localhost:3000`

## Estrutura do Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução. As tabelas incluem:

- **users**: Usuários do sistema (login/senha)
- **inventory**: Itens do estoque
- **snippets**: Códigos CMD/PowerShell/Batch
- **services**: Serviços/atividades
- **inventory_activities**: Histórico de atividades do estoque
- **services_activities**: Histórico de atividades dos serviços
- **settings**: Configurações do sistema

## API Endpoints

### Autenticação
- `POST /api/login` - Login de usuário

### Inventário
- `GET /api/inventory` - Listar itens
- `POST /api/inventory` - Adicionar item
- `PUT /api/inventory/:id` - Atualizar item
- `DELETE /api/inventory/:id` - Excluir item

### Snippets (Códigos)
- `GET /api/snippets` - Listar códigos
- `POST /api/snippets` - Adicionar código
- `PUT /api/snippets/:id` - Atualizar código
- `DELETE /api/snippets/:id` - Excluir código

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Adicionar serviço
- `PUT /api/services/:id` - Atualizar serviço
- `PATCH /api/services/:id/complete` - Marcar serviço como concluído
- `DELETE /api/services/:id` - Excluir serviço

### Atividades
- `GET /api/activities/inventory` - Histórico de atividades do estoque
- `GET /api/activities/services` - Histórico de atividades dos serviços

### Configurações
- `GET /api/settings` - Obter configurações
- `PUT /api/settings` - Atualizar configurações

## Credenciais Padrão

- **Usuário**: Admin
- **Senha**: Administracao@1

## Notas

- O banco de dados é criado automaticamente em `database.sqlite`
- Os 30 códigos padrão são inseridos automaticamente na primeira execução
- O usuário Admin é criado automaticamente na primeira execução