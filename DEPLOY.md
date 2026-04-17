# 🚀 Como Hospedar no Railway (Gratuito)

O Railway oferece hospedagem gratuita com Node.js + SQLite sem configuração complexa.

## Passo a Passo

### 1. Criar conta no Railway
Acesse https://railway.app e crie uma conta gratuita (pode usar o GitHub).

### 2. Instalar Railway CLI (opcional, método mais fácil: GitHub)

**Método A — Via GitHub (recomendado):**
1. Crie um repositório no GitHub com esses arquivos
2. No Railway, clique em **"New Project" → "Deploy from GitHub"**
3. Selecione o repositório
4. O Railway detecta Node.js automaticamente e faz o deploy

**Método B — Via CLI:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### 3. Variáveis de ambiente
Não são necessárias — o `PORT` é configurado automaticamente pelo Railway.

### 4. Acessar a aplicação
Após o deploy, o Railway fornece uma URL pública como:
`https://seu-projeto.up.railway.app`

## Credenciais Padrão
- **Usuário:** `Admin`
- **Senha:** `Administracao@1`

## ⚠️ Nota sobre o banco de dados
O SQLite no Railway funciona em disco efêmero — os dados são resetados se o serviço reiniciar.
Para produção persistente, considere usar o **Railway PostgreSQL** (também gratuito no plano Hobby).

## Estrutura de Arquivos
```
├── index.html     # Frontend
├── app.js         # Lógica do frontend
├── api.js         # Cliente API (URL relativa /api)
├── styles.css     # Estilos
├── server.js      # Backend Node.js + Express
├── package.json   # Dependências
├── railway.json   # Config do Railway
└── .gitignore
```
