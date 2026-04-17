-- ==========================================
-- BANCO DE DADOS - SETOR DE TI
-- Sistema de Gerenciamento para Técnico de TI
-- ==========================================

-- Criar banco de dados
CREATE DATABASE setor_ti;
USE setor_ti;

-- ==========================================
-- TABELA DE USUÁRIOS
-- ==========================================
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(100),
    email VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA DE ITENS DO ESTOQUE
-- ==========================================
CREATE TABLE estoque_itens (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 5,
    localizacao VARCHAR(100),
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA DE CÓDIGOS/SNIPPETS
-- ==========================================
CREATE TABLE snippets (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    tags VARCHAR(255),
    descricao TEXT,
    codigo TEXT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA DE SERVIÇOS
-- ==========================================
CREATE TABLE servicos (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    cliente_setor VARCHAR(100),
    prioridade VARCHAR(20) DEFAULT 'media',
    data_servico DATE,
    descricao TEXT NOT NULL,
    relatorio TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_conclusao DATETIME
);

-- ==========================================
-- TABELA DE ATIVIDADES (HISTÓRICO)
-- ==========================================
CREATE TABLE atividades (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(20) NOT NULL,
    acao VARCHAR(20) NOT NULL,
    detalhes TEXT NOT NULL,
    data_atividade DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABELA DE CONFIGURAÇÕES
-- ==========================================
CREATE TABLE configuracoes (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    chave VARCHAR(50) UNIQUE NOT NULL,
    valor TEXT,
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ÍNDICES PARA MELHORAR PERFORMANCE
-- ==========================================
CREATE INDEX idx_estoque_categoria ON estoque_itens(categoria);
CREATE INDEX idx_estoque_ativo ON estoque_itens(ativo);
CREATE INDEX idx_snippets_categoria ON snippets(categoria);
CREATE INDEX idx_snippets_tipo ON snippets(tipo);
CREATE INDEX idx_snippets_ativo ON snippets(ativo);
CREATE INDEX idx_servicos_status ON servicos(status);
CREATE INDEX idx_servicos_prioridade ON servicos(prioridade);
CREATE INDEX idx_atividades_tipo ON atividades(tipo);
CREATE INDEX idx_atividades_data ON atividades(data_atividade);

-- ==========================================
-- INSERIR DADOS PADRÃO
-- ==========================================

-- Usuário padrão (senha: Administracao@1)
INSERT INTO usuarios (usuario, senha, nome_completo, email) VALUES 
('Admin', 'Administracao@1', 'Administrador do Sistema', 'admin@setorti.gov.br');

-- Configurações padrão
INSERT INTO configuracoes (chave, valor) VALUES 
('tema', 'dark'),
('versao', '1.0.0');

-- ==========================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ==========================================

-- Itens de estoque de exemplo
INSERT INTO estoque_itens (nome, categoria, quantidade, estoque_minimo, localizacao, descricao) VALUES
('Mouse USB Logitech', 'perifericos', 15, 5, 'Armário A-01', 'Mouse USB com fio, DPI ajustável'),
('Teclado ABNT2', 'perifericos', 8, 5, 'Armário A-02', 'Teclado padrão brasileiro com fio'),
('Cabo de Rede CAT6 5m', 'cabos', 25, 10, 'Prateleira B-01', 'Cabo de rede azul 5 metros'),
('Memória RAM 8GB DDR4', 'hardware', 3, 5, 'Gaveta C-01', 'Memória RAM 8GB 3200MHz');

-- Snippets de exemplo
INSERT INTO snippets (titulo, categoria, tipo, tags, descricao, codigo) VALUES
('Limpar Cache DNS', 'rede', 'cmd', 'dns, cache, rede', 'Limpa o cache de DNS do Windows', 'ipconfig /flushdns'),
('Ver Configuracoes de Rede', 'rede', 'cmd', 'rede, ip', 'Exibe todas as configuracoes de rede detalhadas', 'ipconfig /all'),
('Testar Conexao Ping Continuo', 'rede', 'cmd', 'ping, gateway, rede', 'Pinga continuamente o gateway para testar conectividade', 'ping 192.168.1.1 -t'),
('Tracar Rota de Rede', 'rede', 'cmd', 'tracert, rota, rede', 'Rastreia o caminho dos pacotes ate um destino', 'tracert google.com'),
('Ver Tabela ARP', 'rede', 'cmd', 'arp, mac, rede', 'Exibe a tabela ARP IP x MAC da maquina', 'arp -a'),
('Ver Portas em Uso', 'rede', 'cmd', 'netstat, portas, rede', 'Lista todas as conexoes ativas e portas em uso', 'netstat -ano'),
('Consultar DNS de Dominio', 'rede', 'cmd', 'nslookup, dns', 'Consulta informacoes de DNS de um dominio', 'nslookup google.com'),
('Verificar Integridade do Sistema', 'sistema', 'cmd', 'sfc, sistema, reparo', 'Verifica e repara arquivos corrompidos do sistema Windows', 'sfc /scannow'),
('Verificar Espaco em Disco', 'sistema', 'cmd', 'disco, espaco, wmic', 'Exibe espaco total e disponivel em todos os discos', 'wmic logicaldisk get caption,size,freespace'),
('Ver Informacoes do Sistema', 'sistema', 'cmd', 'sistema, info, hardware', 'Exibe informacoes completas do sistema operacional', 'systeminfo'),
('Reiniciar Computador', 'sistema', 'cmd', 'reiniciar, shutdown', 'Reinicia o computador imediatamente', 'shutdown /r /t 0'),
('Desligar Computador', 'sistema', 'cmd', 'desligar, shutdown', 'Desliga o computador imediatamente', 'shutdown /s /t 0'),
('Reparar Disco com DISM', 'sistema', 'cmd', 'dism, reparo, windows', 'Repara a imagem do Windows com DISM - executar como Admin', 'DISM /Online /Cleanup-Image /RestoreHealth'),
('Ver Usuarios Logados', 'sistema', 'cmd', 'usuarios, sessao, logon', 'Lista todos os usuarios com sessao ativa', 'query user'),
('Verificar Versao do Windows', 'sistema', 'cmd', 'versao, windows', 'Exibe a versao exata do Windows instalado', 'winver'),
('Listar Processos por Memoria', 'sistema', 'powershell', 'processos, memoria, desempenho', 'Lista os 10 processos que mais consomem memoria RAM', 'Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, Id, WS, CPU'),
('Listar Programas Instalados', 'sistema', 'powershell', 'programas, instalados, inventario', 'Lista todos os programas instalados com versao', 'Get-ItemProperty HKLM:\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* | Select-Object DisplayName, DisplayVersion, Publisher | Sort-Object DisplayName | Format-Table -AutoSize'),
('Ver Log de Eventos de Erros', 'sistema', 'powershell', 'log, eventos, erros, auditoria', 'Exibe os ultimos 20 erros criticos do sistema', 'Get-EventLog -LogName System -EntryType Error -Newest 20 | Format-Table TimeGenerated, Source, Message -AutoSize'),
('Reiniciar Servico do Windows', 'sistema', 'powershell', 'servico, reiniciar, service', 'Reinicia um servico especifico do Windows', 'Restart-Service -Name "Spooler" -Force'),
('Listar Discos e Particoes', 'sistema', 'powershell', 'disco, particao, storage', 'Lista todos os discos fisicos e particoes', 'Get-Disk | Format-Table Number, FriendlyName, Size, HealthStatus'),
('Reiniciar Spooler de Impressao', 'impressora', 'cmd', 'spooler, impressora, reiniciar, fila', 'Para e reinicia o spooler para resolver filas travadas', 'net stop spooler & del /Q /F /S "%systemroot%\System32\spool\PRINTERS\*.*" & net start spooler'),
('Listar Impressoras Instaladas', 'impressora', 'powershell', 'impressoras, listar, inventario', 'Lista todas as impressoras instaladas e seus status', 'Get-Printer | Select-Object Name, DriverName, PortName, PrinterStatus | Format-Table -AutoSize'),
('Definir Impressora Padrao', 'impressora', 'powershell', 'impressora, padrao', 'Define uma impressora como padrao', '(New-Object -ComObject WScript.Network).SetDefaultPrinter("Nome da Impressora")');


-- Serviços de exemplo
INSERT INTO servicos (titulo, cliente_setor, prioridade, data_servico, descricao, relatorio, status) VALUES
('Manutenção Preventiva - PC Financeiro', 'Setor Financeiro', 'media', date('now'), 'Realizar manutenção preventiva no computador do setor financeiro, incluindo limpeza física e lógica.', 'Limpeza física realizada com sucesso. Troca de pasta térmica. Sistema operacional atualizado. Backup realizado.', 'completed'),
('Instalação de Impressora de Rede', 'Recursos Humanos', 'alta', date('now'), 'Instalar e configurar impressora de rede no setor de RH.', '', 'pending');

-- ==========================================
-- TRIGGERS PARA ATUALIZAR DATA DE ATUALIZAÇÃO
-- ==========================================

-- Trigger para estoque_itens
DROP TRIGGER IF EXISTS update_estoque_itens_timestamp;
CREATE TRIGGER update_estoque_itens_timestamp 
BEFORE UPDATE ON estoque_itens
FOR EACH ROW
SET NEW.data_atualizacao = CURRENT_TIMESTAMP;

-- Trigger para snippets
DROP TRIGGER IF EXISTS update_snippets_timestamp;
CREATE TRIGGER update_snippets_timestamp 
BEFORE UPDATE ON snippets
FOR EACH ROW
SET NEW.data_atualizacao = CURRENT_TIMESTAMP;

-- Trigger para servicos
DROP TRIGGER IF EXISTS update_servicos_timestamp;
CREATE TRIGGER update_servicos_timestamp 
BEFORE UPDATE ON servicos
FOR EACH ROW
SET NEW.data_atualizacao = CURRENT_TIMESTAMP;

-- Trigger para configuracoes
DROP TRIGGER IF EXISTS update_configuracoes_timestamp;
CREATE TRIGGER update_configuracoes_timestamp 
BEFORE UPDATE ON configuracoes
FOR EACH ROW
SET NEW.data_atualizacao = CURRENT_TIMESTAMP;
-- ==========================================
-- VIEW PARA RESUMO DO DASHBOARD
-- ==========================================
CREATE VIEW dashboard_resumo AS
SELECT 
    (SELECT COUNT(*) FROM estoque_itens WHERE ativo = TRUE) as total_itens_estoque,
    (SELECT COUNT(*) FROM estoque_itens WHERE ativo = TRUE AND quantidade <= estoque_minimo) as itens_estoque_baixo,
    (SELECT COUNT(*) FROM snippets WHERE ativo = TRUE) as total_snippets,
    (SELECT COUNT(*) FROM servicos WHERE status = 'pending') as servicos_pendentes,
    (SELECT COUNT(*) FROM servicos WHERE status = 'completed') as servicos_concluidos;