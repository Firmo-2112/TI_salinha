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
('Verificar Integridade do Sistema', 'sistema', 'cmd', 'sistema, reparo, sfc', 'Verifica e repara arquivos do sistema Windows', 'sfc /scannow'),
('Listar Processos', 'sistema', 'powershell', 'processos, sistema', 'Lista processos em execução ordenados por memória', 'Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, Id, WS, CPU'),
('Resetar Configurações de Rede', 'rede', 'batch', 'rede, reset, tcp', 'Script para resetar configurações de rede', '@echo off
ipconfig /release
ipconfig /renew
ipconfig /flushdns
netsh winsock reset
netsh int ip reset
echo Concluido!
pause');

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
