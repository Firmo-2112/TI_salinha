# Setor de TI - Sistema de Gerenciamento para Técnico de TI

Sistema completo de gerenciamento para técnicos de TI, com controle de estoque, biblioteca de códigos (CMD/PowerShell/Batch) e gerenciamento de serviços/atividades.

## 📋 Funcionalidades

### 📦 Gerenciador de Estoque
- Cadastro de itens com nome, categoria, quantidade, localização e descrição
- Controle de estoque mínimo com alertas visuais
- Categorias: Hardware, Software, Periféricos, Cabos, Rede, Outros
- Busca e filtragem por categoria

### 💻 Biblioteca de Códigos
- Armazenamento de comandos CMD, PowerShell e scripts Batch
- Organização por categorias: Sistema, Impressora, Rede
- Sistema de tags para fácil localização
- Visualização e cópia rápida de códigos

### 🛠️ Gerenciador de Serviços
- Cadastro de serviços/atividades com cliente/setor
- Controle de prioridade: Baixa, Média, Alta, Urgente
- Acompanhamento de status: Pendente/Concluído
- Relatórios detalhados das atividades

### 📊 Dashboard
- Visão geral com estatísticas em tempo real
- Atalhos para ações rápidas
- Histórico de atividades recentes

### 🔐 Sistema de Login
- Autenticação segura
- Timeout por inatividade (1 hora)
- Senhas criptografadas (bcrypt)

## 🚀 Como Usar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm (gerenciador de pacotes do Node)

### Instalação

1. **Instalar dependências:**
```bash
cd "Prefeitura-TI/IT Technician Manager"
npm install
```

2. **Iniciar o servidor:**
```bash
npm start
```

Ou para desenvolvimento com recarregamento automático:
```bash
npm run dev
```

3. **Acessar a aplicação:**
- Abra o navegador e acesse: `http://localhost:3000`

### 🔑 Credenciais Padrão
- **Usuário:** `Admin`
- **Senha:** `Administracao@1`

## 📁 Estrutura do Projeto

```
Prefeitura-TI/IT Technician Manager/
├── index.html          # Página principal (frontend)
├── app.js              # Lógica da aplicação (frontend)
├── api.js              # Cliente API para comunicação com backend
├── styles.css          # Estilização da aplicação
├── server.js           # Servidor backend (Node.js + Express)
├── database.sql        # Script SQL do banco de dados
├── package.json        # Configuração do projeto Node.js
└── README.md           # Este arquivo
```

## 🗄️ Banco de Dados

O sistema utiliza SQLite como banco de dados. O arquivo do banco (`setor_ti.db`) é criado automaticamente na primeira execução.

### Tabelas do Banco de Dados:
- `usuarios` - Usuários do sistema
- `estoque_itens` - Itens do estoque
- `snippets` - Códigos/comandos salvos
- `servicos` - Serviços/atividades
- `atividades` - Histórico de atividades
- `configuracoes` - Configurações do sistema

## 🔄 Modo de Operação

O sistema funciona em dois modos:

### 1. Modo Online (com Banco de Dados)
Quando o servidor backend está rodando, todos os dados são persistidos no banco de dados SQLite.

### 2. Modo Offline (LocalStorage)
Se o servidor não estiver disponível, o sistema funciona usando o localStorage do navegador como fallback.

## 🛠️ API REST

O backend fornece as seguintes endpoints:

### Autenticação
- `POST /api/login` - Realizar login

### Configurações
- `GET /api/configuracoes` - Listar configurações
- `PUT /api/configuracoes/:chave` - Atualizar configuração

### Estoque
- `GET /api/estoque` - Listar itens
- `GET /api/estoque/:id` - Obter item específico
- `POST /api/estoque` - Criar novo item
- `PUT /api/estoque/:id` - Atualizar item
- `DELETE /api/estoque/:id` - Excluir item

### Snippets
- `GET /api/snippets` - Listar snippets
- `GET /api/snippets/:id` - Obter snippet específico
- `POST /api/snippets` - Criar novo snippet
- `PUT /api/snippets/:id` - Atualizar snippet
- `DELETE /api/snippets/:id` - Excluir snippet

### Serviços
- `GET /api/servicos` - Listar serviços
- `GET /api/servicos/:id` - Obter serviço específico
- `POST /api/servicos` - Criar novo serviço
- `PUT /api/servicos/:id` - Atualizar serviço
- `PUT /api/servicos/:id/concluir` - Concluir serviço

### Dashboard
- `GET /api/dashboard/resumo` - Obter resumo do dashboard
- `GET /api/dashboard/atividades/inventory` - Atividades de estoque
- `GET /api/dashboard/atividades/services` - Atividades de serviços

### Exportação
- `GET /api/exportar` - Exportar todos os dados

## 🎨 Temas

O sistema suporta dois temas:
- **Tema Escuro** (padrão)
- **Tema Claro**

Para alternar entre os temas, use o botão de lua/sol no rodapé da sidebar.

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktops
- Tablets
- Smartphones

## 🔧 Personalização

### Adicionar Novos Snippets de Exemplo
Edite o arquivo `app.js` na seção `SampleData.load()` para adicionar novos códigos de exemplo.

### Alterar Credenciais
Edite o arquivo `server.js` na função `insertDefaultData()` para alterar as credenciais padrão.

## 📝 Licença

MIT License - Sinta-se livre para usar e modificar conforme necessário.

## 👨‍💻 Desenvolvedor

Sistema desenvolvido para o Setor de TI da Prefeitura.

---

**Versão:** 1.0.0  
**Última Atualização:** 2026