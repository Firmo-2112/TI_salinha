// Importação das bibliotecas necessárias
const express = require('express'); // Framework web para criar a API
const cors = require('cors'); // Middleware para permitir requisições de outras origens
const Database = require('better-sqlite3'); // Biblioteca para banco de dados SQLite
const bcrypt = require('bcryptjs'); // Biblioteca para criptografar senhas
const jwt = require('jsonwebtoken'); // Biblioteca para gerar e validar tokens JWT
const path = require('path'); // Módulo para trabalhar com caminhos de arquivos
const fs = require('fs'); // Módulo para trabalhar com sistema de arquivos

// Criação da aplicação Express
const app = express();
const PORT = 3000; // Porta em que o servidor irá rodar
const JWT_SECRET = 'setor-ti-secret-key-2024'; // Chave secreta para assinar os tokens JWT

// Configuração de Middlewares
app.use(cors()); // Habilita CORS para permitir requisições do frontend
app.use(express.json()); // Permite receber dados em formato JSON nas requisições
app.use(express.static(path.join(__dirname, '../'))); // Serve os arquivos estáticos do frontend

// Configuração do Banco de Dados SQLite
// O banco de dados será criado em um arquivo chamado 'database.sqlite' na pasta backend
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Criação das Tabelas do Banco de Dados
// Este comando cria todas as tabelas necessárias se elas ainda não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    min_stock INTEGER DEFAULT 5,
    location TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    type TEXT NOT NULL,
    tags TEXT,
    description TEXT,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    client TEXT,
    priority TEXT DEFAULT 'media',
    date TEXT,
    description TEXT NOT NULL,
    report TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
  );

  CREATE TABLE IF NOT EXISTS inventory_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS services_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// Inserção do Usuário Padrão
// Verifica se o usuário 'Admin' já existe no banco de dados
const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get('Admin');
if (!existingUser) {
  // Se não existir, cria o usuário Admin com a senha criptografada
  // bcrypt.hashSync criptografa a senha com 10 rounds de salt
  const hashedPassword = bcrypt.hashSync('Administracao@1', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('Admin', hashedPassword);
}

// Inserção dos Snippets (Códigos) Padrão
// Verifica quantos snippets existem no banco de dados
const existingSnippets = db.prepare('SELECT COUNT(*) as count FROM snippets').get();
if (existingSnippets.count === 0) {
  // Se não houver snippets, insere os 30 códigos padrão (CMD, PowerShell, Batch)
  const snippets = [
    { id: '1', title: 'Limpar Cache DNS', category: 'rede', type: 'cmd', tags: 'dns, cache, rede', description: 'Limpa o cache de DNS do Windows', code: 'ipconfig /flushdns' },
    { id: '2', title: 'Verificar Integridade do Sistema', category: 'sistema', type: 'cmd', tags: 'sistema, reparo, sfc', description: 'Verifica e repara arquivos do sistema Windows', code: 'sfc /scannow' },
    { id: '3', title: 'Listar Processos', category: 'sistema', type: 'powershell', tags: 'processos, sistema', description: 'Lista processos em execução ordenados por memória', code: 'Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, Id, WS, CPU' },
    { id: '4', title: 'Resetar Configurações de Rede', category: 'rede', type: 'batch', tags: 'rede, reset, tcp', description: 'Script para resetar configurações de rede', code: '@echo off\nipconfig /release\nipconfig /renew\nipconfig /flushdns\nnetsh winsock reset\nnetsh int ip reset\necho Concluido!\npause' },
    { id: '5', title: 'Verificar Espaço em Disco', category: 'sistema', type: 'cmd', tags: 'disco, espaço', description: 'Mostra espaço disponível em disco', code: 'wmic logicaldisk get size,freespace,caption' },
    { id: '6', title: 'Liberar IP', category: 'rede', type: 'cmd', tags: 'ip, rede, dhcp', description: 'Libera e renova endereço IP', code: 'ipconfig /release\nipconfig /renew' },
    { id: '7', title: 'Verificar Drivers de Impressora', category: 'impressora', type: 'powershell', tags: 'impressora, driver', description: 'Lista drivers de impressora instalados', code: 'Get-PrinterDriver | Select-Object Name, Manufacturer, Version' },
    { id: '8', title: 'Limpar Fila de Impressão', category: 'impressora', type: 'batch', tags: 'impressora, fila, spooler', description: 'Para e reinicia o spooler de impressão', code: 'net stop spooler\ndel /Q /F %systemroot%\\System32\\spool\\printers\\*\nnet start spooler\necho Fila de impressao limpa!\npause' },
    { id: '9', title: 'Testar Conexão de Rede', category: 'rede', type: 'cmd', tags: 'rede, ping, teste', description: 'Testa conectividade de rede', code: 'ping 8.8.8.8 -n 4\nping google.com -n 4' },
    { id: '10', title: 'Verificar Temperatura do Sistema', category: 'sistema', type: 'powershell', tags: 'temperatura, hardware', description: 'Verifica temperatura do processador', code: 'Get-WmiObject MSAcpi_ThermalZoneTemperature -Namespace "root/wmi" | ForEach-Object { $temp = ($_.CurrentTemperature - 2732) / 10; Write-Host "Temperatura: $temp °C" }' },
    { id: '11', title: 'Configurar Impressora Padrão', category: 'impressora', type: 'powershell', tags: 'impressora, padrao', description: 'Define impressora como padrão', code: 'Get-Printer -Name "Nome da Impressora" | Set-Printer -Shared $true' },
    { id: '12', title: 'Verificar Portas de Rede', category: 'rede', type: 'cmd', tags: 'portas, rede, netstat', description: 'Lista portas de rede abertas', code: 'netstat -an | findstr LISTENING' },
    { id: '13', title: 'Reparar Imagem do Windows', category: 'sistema', type: 'cmd', tags: 'sistema, dism, reparo', description: 'Repara imagem do Windows usando DISM', code: 'DISM /Online /Cleanup-Image /RestoreHealth' },
    { id: '14', title: 'Listar Serviços do Windows', category: 'sistema', type: 'cmd', tags: 'servicos, sistema', description: 'Lista todos os serviços do Windows', code: 'sc query type= service state= all' },
    { id: '15', title: 'Verificar Ativação do Windows', category: 'sistema', type: 'cmd', tags: 'ativacao, windows, licença', description: 'Verifica status de ativação do Windows', code: 'slmgr /xpr' },
    { id: '16', title: 'Reiniciar Spooler de Impressão', category: 'impressora', type: 'cmd', tags: 'impressora, spooler, reiniciar', description: 'Reinicia o serviço de spooler', code: 'net stop spooler\nnet start spooler' },
    { id: '17', title: 'Listar Impressoras Instaladas', category: 'impressora', type: 'cmd', tags: 'impressora, listar', description: 'Lista todas as impressoras instaladas', code: 'wmic printer get name,portname' },
    { id: '18', title: 'Testar Porta de Impressora', category: 'impressora', type: 'powershell', tags: 'impressora, porta, teste', description: 'Testa conectividade com porta de impressora', code: 'Test-NetConnection -ComputerName 192.168.1.100 -Port 9100' },
    { id: '19', title: 'Verificar Tabela de Roteamento', category: 'rede', type: 'cmd', tags: 'rede, rota, tabela', description: 'Mostra tabela de roteamento do Windows', code: 'route print' },
    { id: '20', title: 'Liberar e Renovar IP Completo', category: 'rede', type: 'batch', tags: 'ip, dhcp, rede', description: 'Script completo para renovar IP', code: '@echo off\necho Liberando IP...\nipconfig /release\necho Renovando IP...\nipconfig /renew\necho Limpando DNS...\nipconfig /flushdns\necho Concluido!\npause' },
    { id: '21', title: 'Verificar Adaptadores de Rede', category: 'rede', type: 'cmd', tags: 'rede, adaptador, placa', description: 'Mostra todas as interfaces de rede', code: 'ipconfig /all' },
    { id: '22', title: 'Limpar Arquivos Temporários', category: 'sistema', type: 'batch', tags: 'limpeza, temporario, disco', description: 'Limpa arquivos temporários do sistema', code: '@echo off\ndel /q /f %temp%\\*\nrd /s /q %temp%\necho Arquivos temporarios limpos!\npause' },
    { id: '23', title: 'Verificar Uso de Disco', category: 'sistema', type: 'powershell', tags: 'disco, uso, armazenamento', description: 'Mostra uso de espaço em disco', code: 'Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="Free(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}' },
    { id: '24', title: 'Resetar Pilha TCP/IP', category: 'rede', type: 'cmd', tags: 'rede, tcp/ip, reset', description: 'Reseta configurações TCP/IP', code: 'netsh int ip reset\nnetsh winsock reset' },
    { id: '25', title: 'Verificar Eventos de Erro', category: 'sistema', type: 'powershell', tags: 'evento, erro, log', description: 'Lista últimos erros do sistema', code: 'Get-EventLog -LogName System -EntryType Error -Newest 10 | Format-Table TimeGenerated, Source, Message -AutoSize' },
    { id: '26', title: 'Testar Velocidade de Rede', category: 'rede', type: 'powershell', tags: 'rede, velocidade, teste', description: 'Testa latência de rede', code: 'Measure-Command { ping -n 10 8.8.8.8 }' },
    { id: '27', title: 'Remover Impressora por Nome', category: 'impressora', type: 'powershell', tags: 'impressora, remover, excluir', description: 'Remove impressora específica', code: 'Remove-Printer -Name "Nome da Impressora"' },
    { id: '28', title: 'Verificar Memória RAM', category: 'sistema', type: 'cmd', tags: 'memoria, ram, hardware', description: 'Mostra informações da memória RAM', code: 'wmic memorychip get capacity,speed,manufacturer' },
    { id: '29', title: 'Mapear Unidade de Rede', category: 'rede', type: 'cmd', tags: 'rede, mapear, unidade', description: 'Mapeia pasta de rede como unidade', code: 'net use Z: \\\\servidor\\pasta /persistent:yes' },
    { id: '30', title: 'Verificar Saúde do Disco', category: 'sistema', type: 'powershell', tags: 'disco, saude, smart', description: 'Verifica saúde do disco via SMART', code: 'Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus' }
  ];

  const insertSnippet = db.prepare('INSERT OR IGNORE INTO snippets (id, title, category, type, tags, description, code) VALUES (?, ?, ?, ?, ?, ?, ?)');
  snippets.forEach(s => {
    insertSnippet.run(s.id, s.title, s.category, s.type, s.tags, s.description, s.code);
  });
}

// Middleware de Autenticação de Token JWT
// Esta função verifica se o usuário está autenticado antes de permitir acesso às rotas protegidas
const authenticateToken = (req, res, next) => {
  // Pega o cabeçalho Authorization da requisição
  const authHeader = req.headers['authorization'];
  // Extrai o token (formato esperado: "Bearer <token>")
  const token = authHeader && authHeader.split(' ')[1];
  
  // Se nenhum token for fornecido, retorna erro 401 (Não Autorizado)
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // Verifica se o token é válido usando a chave secreta
  jwt.verify(token, JWT_SECRET, (err, user) => {
    // Se o token for inválido ou expirado, retorna erro 403 (Proibido)
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    // Se válido, armazena as informações do usuário na requisição e continua
    req.user = user;
    next();
  });
};

// ==========================================
// ROTAS DE AUTENTICAÇÃO
// ==========================================

// Rota de Login
// Recebe username e password, verifica as credenciais e retorna um token JWT
app.post('/api/login', (req, res) => {
  // Extrai username e password do corpo da requisição
  const { username, password } = req.body;
  
  // Busca o usuário no banco de dados pelo nome de usuário
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  
  // Verifica se o usuário existe e se a senha está correta
  // bcrypt.compareSync compara a senha fornecida com a senha criptografada no banco
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  // Gera um token JWT com as informações do usuário, válido por 24 horas
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  // Retorna o token e as informações do usuário
  res.json({ token, user: { id: user.id, username: user.username } });
});

// ==========================================
// ROTAS DE INVENTÁRIO (ESTOQUE)
// ==========================================

// Rota para listar todos os items do estoque
// Requer autenticação (token JWT)
app.get('/api/inventory', authenticateToken, (req, res) => {
  // Busca todos os items no banco de dados, ordenados por nome
  const items = db.prepare('SELECT * FROM inventory ORDER BY name').all();
  // Retorna a lista de items em formato JSON
  res.json(items);
});

// Rota para adicionar um novo item ao estoque
app.post('/api/inventory', authenticateToken, (req, res) => {
  // Extrai os dados do item do corpo da requisição
  const { id, name, category, quantity, minStock, location, description } = req.body;
  
  // Insere o novo item no banco de dados
  db.prepare(`
    INSERT INTO inventory (id, name, category, quantity, min_stock, location, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, category, quantity, minStock, location, description);

  // Registra a atividade de adição no histórico
  db.prepare('INSERT INTO inventory_activities (action, details) VALUES (?, ?)').run('add', 'Adicionado: ' + name);
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para atualizar um item existente no estoque
app.put('/api/inventory/:id', authenticateToken, (req, res) => {
  // Pega o ID do item a partir dos parâmetros da URL
  const { id } = req.params;
  // Extrai os novos dados do item do corpo da requisição
  const { name, category, quantity, minStock, location, description } = req.body;
  
  // Atualiza os dados do item no banco, incluindo o timestamp de atualização
  db.prepare(`
    UPDATE inventory SET name = ?, category = ?, quantity = ?, min_stock = ?, location = ?, description = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(name, category, quantity, minStock, location, description, id);

  // Registra a atividade de edição no histórico
  db.prepare('INSERT INTO inventory_activities (action, details) VALUES (?, ?)').run('edit', 'Editado: ' + name);
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para excluir um item do estoque
app.delete('/api/inventory/:id', authenticateToken, (req, res) => {
  // Pega o ID do item a partir dos parâmetros da URL
  const { id } = req.params;
  // Busca o nome do item para registrar no histórico
  const item = db.prepare('SELECT name FROM inventory WHERE id = ?').get(id);
  
  // Se o item existir, exclui e registra no histórico
  if (item) {
    db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
    db.prepare('INSERT INTO inventory_activities (action, details) VALUES (?, ?)').run('delete', 'Excluído: ' + item.name);
  }
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// ==========================================
// ROTAS DE SNIPPETS (CÓDIGOS)
// ==========================================

// Rota para listar todos os snippets (códigos CMD/PowerShell/Batch)
app.get('/api/snippets', authenticateToken, (req, res) => {
  // Busca todos os snippets no banco, ordenados por título
  const snippets = db.prepare('SELECT * FROM snippets ORDER BY title').all();
  // Retorna a lista de snippets
  res.json(snippets);
});

// Rota para adicionar um novo snippet
app.post('/api/snippets', authenticateToken, (req, res) => {
  // Extrai os dados do snippet do corpo da requisição
  const { id, title, category, type, tags, description, code } = req.body;
  
  // Insere o novo snippet no banco de dados
  db.prepare(`
    INSERT INTO snippets (id, title, category, type, tags, description, code)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, category, type, tags, description, code);
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para atualizar um snippet existente
app.put('/api/snippets/:id', authenticateToken, (req, res) => {
  // Pega o ID do snippet a partir dos parâmetros da URL
  const { id } = req.params;
  // Extrai os novos dados do snippet
  const { title, category, type, tags, description, code } = req.body;
  
  // Atualiza os dados do snippet no banco
  db.prepare(`
    UPDATE snippets SET title = ?, category = ?, type = ?, tags = ?, description = ?, code = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, category, type, tags, description, code, id);
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para excluir um snippet
app.delete('/api/snippets/:id', authenticateToken, (req, res) => {
  // Pega o ID do snippet a partir dos parâmetros da URL
  const { id } = req.params;
  // Exclui the snippet do banco de dados
  db.prepare('DELETE FROM snippets WHERE id = ?').run(id);
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// ==========================================
// ROTAS DE SERVIÇOS
// ==========================================

// Rota para listar todos os serviços
app.get('/api/services', authenticateToken, (req, res) => {
  // Busca todos os serviços ordenados do mais recente para o mais antigo
  const services = db.prepare('SELECT * FROM services ORDER BY created_at DESC').all();
  // Retorna a lista de serviços
  res.json(services);
});

// Rota para adicionar um novo serviço
app.post('/api/services', authenticateToken, (req, res) => {
  // Extrai os dados do serviço do corpo da requisição
  const { id, title, client, priority, date, description, report, status } = req.body;
  
  // Insere o novo serviço no banco (status padrão: 'pending')
  db.prepare(`
    INSERT INTO services (id, title, client, priority, date, description, report, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, client, priority, date, description, report || '', status || 'pending');

  // Registra a atividade no histórico
  db.prepare('INSERT INTO services_activities (action, details) VALUES (?, ?)').run('add', 'Adicionado serviço: ' + title);
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para atualizar um serviço existente
app.put('/api/services/:id', authenticateToken, (req, res) => {
  // Pega o ID do serviço a partir dos parâmetros da URL
  const { id } = req.params;
  // Extrai os novos dados do serviço
  const { title, client, priority, date, description, report, status } = req.body;
  
  // Atualiza os dados do serviço no banco
  db.prepare(`
    UPDATE services SET title = ?, client = ?, priority = ?, date = ?, description = ?, report = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, client, priority, date, description, report, status, id);

  // Registra a atividade no histórico
  db.prepare('INSERT INTO services_activities (action, details) VALUES (?, ?)').run('edit', 'Editado serviço: ' + title);
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para marcar um serviço como concluído
app.patch('/api/services/:id/complete', authenticateToken, (req, res) => {
  // Pega o ID do serviço a partir dos parâmetros da URL
  const { id } = req.params;
  // Busca o título do serviço para registrar no histórico
  const service = db.prepare('SELECT title FROM services WHERE id = ?').get(id);
  
  // Atualiza o status para 'completed' e define a data de conclusão
  db.prepare(`
    UPDATE services SET status = 'completed', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);

  // Registra a conclusão no histórico se o serviço existir
  if (service) {
    db.prepare('INSERT INTO services_activities (action, details) VALUES (?, ?)').run('complete', 'Concluído: ' + service.title);
  }
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// Rota para excluir um serviço
app.delete('/api/services/:id', authenticateToken, (req, res) => {
  // Pega o ID do serviço a partir dos parâmetros da URL
  const { id } = req.params;
  // Exclui o serviço do banco de dados
  db.prepare('DELETE FROM services WHERE id = ?').run(id);
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// ==========================================
// ROTAS DE ATIVIDADES (HISTÓRICO)
// ==========================================

// Rota para listar as atividades do inventário (últimas 50)
app.get('/api/activities/inventory', authenticateToken, (req, res) => {
  // Busca as 50 atividades mais recentes do inventário
  const activities = db.prepare('SELECT * FROM inventory_activities ORDER BY timestamp DESC LIMIT 50').all();
  // Retorna a lista de atividades
  res.json(activities);
});

// Rota para listar as atividades dos serviços (últimas 50)
app.get('/api/activities/services', authenticateToken, (req, res) => {
  // Busca as 50 atividades mais recentes dos serviços
  const activities = db.prepare('SELECT * FROM services_activities ORDER BY timestamp DESC LIMIT 50').all();
  // Retorna a lista de atividades
  res.json(activities);
});

// ==========================================
// ROTAS DE CONFIGURAÇÕES
// ==========================================

// Rota para obter as configures do sistema
app.get('/api/settings', authenticateToken, (req, res) => {
  // Busca todas as configurações no banco de dados
  const settings = db.prepare('SELECT * FROM settings').all();
  // Converte o array de configurações em um objeto chave-valor
  const settingsObj = {};
  settings.forEach(s => { settingsObj[s.key] = s.value; });
  // Retorna as configurações como um objeto
  res.json(settingsObj);
});

// Rota para atualizar as configurações do sistema
app.put('/api/settings', authenticateToken, (req, res) => {
  // Pega as novas configurações do corpo da requisição
  const settings = req.body;
  // Prepara a query para inserir ou atualizar (upsert) as configurações
  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  
  // Itera sobre cada configuração e salva no banco
  Object.entries(settings).forEach(([key, value]) => {
    upsert.run(key, value);
  });
  
  // Retorna confirmação de sucesso
  res.json({ success: true });
});

// ==========================================
// ROTA PARA SERVIR O FRONTEND
// ==========================================

// Rota curinga que serve o arquivo index.html para qualquer rota não definida
// Isso permite que o frontend funcione corretamente com rotas do lado do cliente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================

// Inicia o servidor na porta configurada (3000)
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
  console.log(`API disponível em http://localhost:${PORT}/api`);
});
