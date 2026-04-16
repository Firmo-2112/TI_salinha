// ==========================================
// SERVIDOR BACKEND - SETOR DE TI
// API REST para Gerenciamento de Técnico de TI
// ==========================================

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURAÇÃO DO SERVIDOR
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// ==========================================
// CONEXÃO COM O BANCO DE DADOS
// ==========================================
const db = new sqlite3.Database(path.join(__dirname, 'setor_ti.db'), (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite.');
        // Inicializar banco de dados
        initializeDatabase();
    }
});

// ==========================================
// FUNÇÕES DE INICIALIZAÇÃO DO BANCO
// ==========================================
function initializeDatabase() {
    // Criar tabelas se não existirem
    const createTables = `
        -- Tabela de Usuários
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario VARCHAR(50) UNIQUE NOT NULL,
            senha VARCHAR(255) NOT NULL,
            nome_completo VARCHAR(100),
            email VARCHAR(100),
            ativo BOOLEAN DEFAULT TRUE,
            data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabela de Itens do Estoque
        CREATE TABLE IF NOT EXISTS estoque_itens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        -- Tabela de Snippets
        CREATE TABLE IF NOT EXISTS snippets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        -- Tabela de Serviços
        CREATE TABLE IF NOT EXISTS servicos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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

        -- Tabela de Atividades
        CREATE TABLE IF NOT EXISTS atividades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo VARCHAR(20) NOT NULL,
            acao VARCHAR(20) NOT NULL,
            detalhes TEXT NOT NULL,
            data_atividade DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Tabela de Configurações
        CREATE TABLE IF NOT EXISTS configuracoes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chave VARCHAR(50) UNIQUE NOT NULL,
            valor TEXT,
            data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Índices
        CREATE INDEX IF NOT EXISTS idx_estoque_categoria ON estoque_itens(categoria);
        CREATE INDEX IF NOT EXISTS idx_estoque_ativo ON estoque_itens(ativo);
        CREATE INDEX IF NOT EXISTS idx_snippets_categoria ON snippets(categoria);
        CREATE INDEX IF NOT EXISTS idx_snippets_tipo ON snippets(tipo);
        CREATE INDEX IF NOT EXISTS idx_snippets_ativo ON snippets(ativo);
        CREATE INDEX IF NOT EXISTS idx_servicos_status ON servicos(status);
        CREATE INDEX IF NOT EXISTS idx_servicos_prioridade ON servicos(prioridade);
        CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON atividades(tipo);
        CREATE INDEX IF NOT EXISTS idx_atividades_data ON atividades(data_atividade);

        -- View para Dashboard
        CREATE VIEW IF NOT EXISTS dashboard_resumo AS
        SELECT 
            (SELECT COUNT(*) FROM estoque_itens WHERE ativo = TRUE) as total_itens_estoque,
            (SELECT COUNT(*) FROM estoque_itens WHERE ativo = TRUE AND quantidade <= estoque_minimo) as itens_estoque_baixo,
            (SELECT COUNT(*) FROM snippets WHERE ativo = TRUE) as total_snippets,
            (SELECT COUNT(*) FROM servicos WHERE status = 'pending') as servicos_pendentes,
            (SELECT COUNT(*) FROM servicos WHERE status = 'completed') as servicos_concluidos;
    `;

    db.exec(createTables, (err) => {
        if (err) {
            console.error('Erro ao criar tabelas:', err.message);
        } else {
            console.log('Tabelas criadas com sucesso.');
            // Inserir dados padrão
            insertDefaultData();
        }
    });
}

function insertDefaultData() {
    // Verificar se já existe usuário Admin
    db.get("SELECT COUNT(*) as count FROM usuarios WHERE usuario = 'Admin'", (err, row) => {
        if (err) {
            console.error('Erro ao verificar usuário padrão:', err.message);
        } else if (row.count === 0) {
            // Inserir usuário padrão
            const hashedPassword = bcrypt.hashSync('Administracao@1', 10);
            db.run(
                "INSERT INTO usuarios (usuario, senha, nome_completo, email) VALUES (?, ?, ?, ?)",
                ['Admin', hashedPassword, 'Administrador do Sistema', 'admin@setorti.gov.br'],
                (err) => {
                    if (err) {
                        console.error('Erro ao inserir usuário padrão:', err.message);
                    } else {
                        console.log('Usuário padrão criado.');
                    }
                }
            );
        }
    });

    // Inserir configurações padrão
    db.get("SELECT COUNT(*) as count FROM configuracoes WHERE chave = 'tema'", (err, row) => {
        if (err) {
            console.error('Erro ao verificar configurações:', err.message);
        } else if (row.count === 0) {
            db.run(
                "INSERT INTO configuracoes (chave, valor) VALUES (?, ?), (?, ?)",
                ['tema', 'dark', 'versao', '1.0.0'],
                (err) => {
                    if (err) {
                        console.error('Erro ao inserir configurações padrão:', err.message);
                    } else {
                        console.log('Configurações padrão criadas.');
                    }
                }
            );
        }
    });
}

// ==========================================
// FUNÇÕES DE SUPORTE
// ==========================================
function logActivity(tipo, acao, detalhes) {
    const stmt = db.prepare("INSERT INTO atividades (tipo, acao, detalhes) VALUES (?, ?, ?)");
    stmt.run(tipo, acao, detalhes, (err) => {
        if (err) {
            console.error('Erro ao registrar atividade:', err.message);
        }
    });
    stmt.finalize();
}

// ==========================================
// ROTAS DE LOGIN
// ==========================================
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios.' });
    }

    db.get("SELECT * FROM usuarios WHERE usuario = ? AND ativo = TRUE", [usuario], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro no servidor.' });
        }

        if (!row) {
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }

        if (bcrypt.compareSync(senha, row.senha)) {
            res.json({ 
                success: true, 
                message: 'Login realizado com sucesso!',
                user: {
                    id: row.id,
                    usuario: row.usuario,
                    nome_completo: row.nome_completo
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    });
});

// ==========================================
// ROTAS DE CONFIGURAÇÕES
// ==========================================
app.get('/api/configuracoes', (req, res) => {
    db.all("SELECT chave, valor FROM configuracoes", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const config = {};
        rows.forEach(row => {
            config[row.chave] = row.valor;
        });
        res.json(config);
    });
});

app.put('/api/configuracoes/:chave', (req, res) => {
    const { chave } = req.params;
    const { valor } = req.body;

    db.run(
        "INSERT OR REPLACE INTO configuracoes (chave, valor, data_atualizacao) VALUES (?, ?, CURRENT_TIMESTAMP)",
        [chave, valor],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, message: 'Configuração atualizada.' });
        }
    );
});

// ==========================================
// ROTAS DE ESTOQUE
// ==========================================
app.get('/api/estoque', (req, res) => {
    const { search, categoria } = req.query;
    let sql = "SELECT * FROM estoque_itens WHERE ativo = TRUE";
    let params = [];

    if (search) {
        sql += " AND (nome LIKE ? OR descricao LIKE ? OR localizacao LIKE ?)";
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }

    if (categoria) {
        sql += " AND categoria = ?";
        params.push(categoria);
    }

    sql += " ORDER BY nome";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/estoque/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM estoque_itens WHERE id = ? AND ativo = TRUE", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }
        res.json(row);
    });
});

app.post('/api/estoque', (req, res) => {
    const { nome, categoria, quantidade, estoque_minimo, localizacao, descricao } = req.body;

    if (!nome || !categoria) {
        return res.status(400).json({ error: 'Nome e categoria são obrigatórios.' });
    }

    const stmt = db.prepare("INSERT INTO estoque_itens (nome, categoria, quantidade, estoque_minimo, localizacao, descricao) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(nome, categoria, quantidade || 0, estoque_minimo || 5, localizacao || '', descricao || '', function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        logActivity('inventory', 'add', `Adicionado: ${nome}`);
        res.json({ id: this.lastID, message: 'Item adicionado com sucesso.' });
    });
    stmt.finalize();
});

app.put('/api/estoque/:id', (req, res) => {
    const { id } = req.params;
    const { nome, categoria, quantidade, estoque_minimo, localizacao, descricao } = req.body;

    if (!nome || !categoria) {
        return res.status(400).json({ error: 'Nome e categoria são obrigatórios.' });
    }

    db.run(
        "UPDATE estoque_itens SET nome = ?, categoria = ?, quantidade = ?, estoque_minimo = ?, localizacao = ?, descricao = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
        [nome, categoria, quantidade, estoque_minimo, localizacao, descricao, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Item não encontrado.' });
            }
            logActivity('inventory', 'edit', `Editado: ${nome}`);
            res.json({ message: 'Item atualizado com sucesso.' });
        }
    );
});

app.delete('/api/estoque/:id', (req, res) => {
    const { id } = req.params;

    db.get("SELECT nome FROM estoque_itens WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        db.run("UPDATE estoque_itens SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?", [id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            logActivity('inventory', 'delete', `Excluído: ${row.nome}`);
            res.json({ message: 'Item excluído com sucesso.' });
        });
    });
});

// ==========================================
// ROTAS DE SNIPPETS
// ==========================================
app.get('/api/snippets', (req, res) => {
    const { search, categoria, tipo } = req.query;
    let sql = "SELECT * FROM snippets WHERE ativo = TRUE";
    let params = [];

    if (search) {
        sql += " AND (titulo LIKE ? OR descricao LIKE ? OR tags LIKE ? OR codigo LIKE ?)";
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (categoria) {
        sql += " AND categoria = ?";
        params.push(categoria);
    }

    if (tipo) {
        sql += " AND tipo = ?";
        params.push(tipo);
    }

    sql += " ORDER BY titulo";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/snippets/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM snippets WHERE id = ? AND ativo = TRUE", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Snippet não encontrado.' });
        }
        res.json(row);
    });
});

app.post('/api/snippets', (req, res) => {
    const { titulo, categoria, tipo, tags, descricao, codigo } = req.body;

    if (!titulo || !categoria || !tipo || !codigo) {
        return res.status(400).json({ error: 'Título, categoria, tipo e código são obrigatórios.' });
    }

    const stmt = db.prepare("INSERT INTO snippets (titulo, categoria, tipo, tags, descricao, codigo) VALUES (?, ?, ?, ?, ?, ?)");
    stmt.run(titulo, categoria, tipo, tags || '', descricao || '', codigo, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, message: 'Snippet adicionado com sucesso.' });
    });
    stmt.finalize();
});

app.put('/api/snippets/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, categoria, tipo, tags, descricao, codigo } = req.body;

    if (!titulo || !categoria || !tipo || !codigo) {
        return res.status(400).json({ error: 'Título, categoria, tipo e código são obrigatórios.' });
    }

    db.run(
        "UPDATE snippets SET titulo = ?, categoria = ?, tipo = ?, tags = ?, descricao = ?, codigo = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
        [titulo, categoria, tipo, tags, descricao, codigo, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Snippet não encontrado.' });
            }
            res.json({ message: 'Snippet atualizado com sucesso.' });
        }
    );
});

app.delete('/api/snippets/:id', (req, res) => {
    const { id } = req.params;

    db.get("SELECT titulo FROM snippets WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Snippet não encontrado.' });
        }

        db.run("UPDATE snippets SET ativo = FALSE, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?", [id], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Snippet excluído com sucesso.' });
        });
    });
});

// ==========================================
// ROTAS DE SERVIÇOS
// ==========================================
app.get('/api/servicos', (req, res) => {
    const { search, status } = req.query;
    let sql = "SELECT * FROM servicos";
    let params = [];

    if (search) {
        sql += " WHERE titulo LIKE ? OR descricao LIKE ? OR cliente_setor LIKE ? OR relatorio LIKE ?";
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
    }

    if (status) {
        if (search) {
            sql += " AND status = ?";
        } else {
            sql += " WHERE status = ?";
        }
        params.push(status);
    }

    sql += " ORDER BY data_criacao DESC";

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/servicos/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT * FROM servicos WHERE id = ?", [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Serviço não encontrado.' });
        }
        res.json(row);
    });
});

app.post('/api/servicos', (req, res) => {
    const { titulo, cliente_setor, prioridade, data_servico, descricao, relatorio } = req.body;

    if (!titulo || !descricao) {
        return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
    }

    const stmt = db.prepare("INSERT INTO servicos (titulo, cliente_setor, prioridade, data_servico, descricao, relatorio, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    stmt.run(titulo, cliente_setor || '', prioridade || 'media', data_servico || null, descricao, relatorio || '', 'pending', function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        logActivity('services', 'add', `Adicionado serviço: ${titulo}`);
        res.json({ id: this.lastID, message: 'Serviço adicionado com sucesso.' });
    });
    stmt.finalize();
});

app.put('/api/servicos/:id', (req, res) => {
    const { id } = req.params;
    const { titulo, cliente_setor, prioridade, data_servico, descricao, relatorio } = req.body;

    if (!titulo || !descricao) {
        return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
    }

    db.run(
        "UPDATE servicos SET titulo = ?, cliente_setor = ?, prioridade = ?, data_servico = ?, descricao = ?, relatorio = ?, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
        [titulo, cliente_setor, prioridade, data_servico, descricao, relatorio, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            logActivity('services', 'edit', `Editado serviço: ${titulo}`);
            res.json({ message: 'Serviço atualizado com sucesso.' });
        }
    );
});

app.put('/api/servicos/:id/concluir', (req, res) => {
    const { id } = req.params;

    db.run(
        "UPDATE servicos SET status = 'completed', data_conclusao = CURRENT_TIMESTAMP, data_atualizacao = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Serviço não encontrado.' });
            }
            logActivity('services', 'complete', `Concluído: ${id}`);
            res.json({ message: 'Serviço concluído com sucesso.' });
        }
    );
});

// ==========================================
// ROTAS DE DASHBOARD
// ==========================================
app.get('/api/dashboard/resumo', (req, res) => {
    db.get("SELECT * FROM dashboard_resumo", (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

app.get('/api/dashboard/atividades/inventory', (req, res) => {
    db.all("SELECT * FROM atividades WHERE tipo = 'inventory' ORDER BY data_atividade DESC LIMIT 10", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.get('/api/dashboard/atividades/services', (req, res) => {
    db.all("SELECT * FROM atividades WHERE tipo = 'services' ORDER BY data_atividade DESC LIMIT 10", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// ==========================================
// ROTAS DE EXPORTAÇÃO/IMPORTAÇÃO
// ==========================================
app.get('/api/exportar', (req, res) => {
    const data = {};

    // Exportar configurações
    db.all("SELECT chave, valor FROM configuracoes", (err, configRows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        data.configuracoes = {};
        configRows.forEach(row => {
            data.configuracoes[row.chave] = row.valor;
        });

        // Exportar estoque
        db.all("SELECT * FROM estoque_itens WHERE ativo = TRUE", (err, estoqueRows) => {
            if (err) return res.status(500).json({ error: err.message });
            
            data.estoque = estoqueRows;

            // Exportar snippets
            db.all("SELECT * FROM snippets WHERE ativo = TRUE", (err, snippetsRows) => {
                if (err) return res.status(500).json({ error: err.message });
                
                data.snippets = snippetsRows;

                // Exportar serviços
                db.all("SELECT * FROM servicos", (err, servicosRows) => {
                    if (err) return res.status(500).json({ error: err.message });
                    
                    data.servicos = servicosRows;

                    // Exportar atividades
                    db.all("SELECT * FROM atividades", (err, atividadesRows) => {
                        if (err) return res.status(500).json({ error: err.message });
                        
                        data.atividades = atividadesRows;

                        res.json(data);
                    });
                });
            });
        });
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('API REST para Setor de TI está pronta!');
});