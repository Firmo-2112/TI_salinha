// ==========================================
// CLIENTE API - SETOR DE TI
// Módulo para comunicação com o backend
// ==========================================

const API_BASE_URL = '/api';

const API = {
    // ==========================================
    // MÉTODOS DE LOGIN
    // ==========================================
    async login(usuario, senha) {
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usuario, senha })
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Erro de conexão com o servidor.' };
        }
    },

    // ==========================================
    // MÉTODOS DE CONFIGURAÇÕES
    // ==========================================
    async getConfiguracoes() {
        try {
            const response = await fetch(`${API_BASE_URL}/configuracoes`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            return { tema: 'dark', versao: '1.0.0' };
        }
    },

    async setConfiguracao(chave, valor) {
        try {
            const response = await fetch(`${API_BASE_URL}/configuracoes/${chave}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ valor })
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar configuração:', error);
            return { success: false };
        }
    },

    // ==========================================
    // MÉTODOS DE ESTOQUE
    // ==========================================
    async getEstoque(search = '', categoria = '') {
        try {
            let url = `${API_BASE_URL}/estoque`;
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (categoria) params.append('categoria', categoria);
            if (params.toString()) url += `?${params.toString()}`;
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar estoque:', error);
            return [];
        }
    },

    async getEstoqueItem(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/estoque/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar item:', error);
            return null;
        }
    },

    async createEstoqueItem(itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/estoque`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar item:', error);
            return { error: 'Erro ao criar item.' };
        }
    },

    async updateEstoqueItem(id, itemData) {
        try {
            const response = await fetch(`${API_BASE_URL}/estoque/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
            return { error: 'Erro ao atualizar item.' };
        }
    },

    async deleteEstoqueItem(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/estoque/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir item:', error);
            return { error: 'Erro ao excluir item.' };
        }
    },

    // ==========================================
    // MÉTODOS DE SNIPPETS
    // ==========================================
    async getSnippets(search = '', categoria = '', tipo = '') {
        try {
            let url = `${API_BASE_URL}/snippets`;
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (categoria) params.append('categoria', categoria);
            if (tipo) params.append('tipo', tipo);
            if (params.toString()) url += `?${params.toString()}`;
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar snippets:', error);
            return [];
        }
    },

    async getSnippet(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/snippets/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar snippet:', error);
            return null;
        }
    },

    async createSnippet(snippetData) {
        try {
            const response = await fetch(`${API_BASE_URL}/snippets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(snippetData)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar snippet:', error);
            return { error: 'Erro ao criar snippet.' };
        }
    },

    async updateSnippet(id, snippetData) {
        try {
            const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(snippetData)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar snippet:', error);
            return { error: 'Erro ao atualizar snippet.' };
        }
    },

    async deleteSnippet(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir snippet:', error);
            return { error: 'Erro ao excluir snippet.' };
        }
    },

    // ==========================================
    // MÉTODOS DE SERVIÇOS
    // ==========================================
    async getServicos(search = '', status = '') {
        try {
            let url = `${API_BASE_URL}/servicos`;
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (status) params.append('status', status);
            if (params.toString()) url += `?${params.toString()}`;
            
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar serviços:', error);
            return [];
        }
    },

    async getServico(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar serviço:', error);
            return null;
        }
    },

    async createServico(servicoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(servicoData)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao criar serviço:', error);
            return { error: 'Erro ao criar serviço.' };
        }
    },

    async updateServico(id, servicoData) {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(servicoData)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar serviço:', error);
            return { error: 'Erro ao atualizar serviço.' };
        }
    },

    async concluirServico(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/servicos/${id}/concluir`, {
                method: 'PUT'
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao concluir serviço:', error);
            return { error: 'Erro ao concluir serviço.' };
        }
    },

    // ==========================================
    // MÉTODOS DE DASHBOARD
    // ==========================================
    async getDashboardResumo() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/resumo`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar resumo do dashboard:', error);
            return {
                total_itens_estoque: 0,
                itens_estoque_baixo: 0,
                total_snippets: 0,
                servicos_pendentes: 0,
                servicos_concluidos: 0
            };
        }
    },

    async getAtividadesInventory() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/atividades/inventory`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar atividades de estoque:', error);
            return [];
        }
    },

    async getAtividadesServices() {
        try {
            const response = await fetch(`${API_BASE_URL}/dashboard/atividades/services`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar atividades de serviços:', error);
            return [];
        }
    },

    // ==========================================
    // MÉTODOS DE EXPORTAÇÃO
    // ==========================================
    async exportarDados() {
        try {
            const response = await fetch(`${API_BASE_URL}/exportar`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            return null;
        }
    }
};

// ==========================================
// VERIFICADOR DE CONEXÃO COM O SERVIDOR
// ==========================================
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/configuracoes`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Exportar para uso global
window.API = API;
window.checkServerConnection = checkServerConnection;