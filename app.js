// ==========================================
// ESTADO DA APLICAÇÃO
// ==========================================
const AppState = {
    inventory: [],           // Itens do estoque
    snippets: [],            // Códigos CMD/PowerShell/Batch
    services: [],            // Serviços/atividades
    activities: {
        inventory: [],       // Histórico de atividades do estoque
        services: []         // Histórico de atividades dos serviços
    },
    settings: {
        theme: 'dark'        // Tema atual (dark/light)
    },
    useDatabase: false       // Controle se está usando banco de dados ou localStorage
};

// ==========================================
// GERENCIADOR DE LOGIN
// ==========================================
const LoginManager = {
    inactivityTimer: null,
    INACTIVITY_TIMEOUT: 3600000, // 1 hora (3600000 ms)

    init() {
        this.setupEventListeners();
        this.checkSession();
    },

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const passwordToggle = document.getElementById('passwordToggle');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        passwordToggle.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });

        // Limpar erro ao digitar
        document.getElementById('loginUser').addEventListener('input', () => {
            this.hideError();
        });
        document.getElementById('loginPassword').addEventListener('input', () => {
            this.hideError();
        });

        // Botão de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    },

    checkSession() {
        const isLoggedIn = sessionStorage.getItem('setorTI_logged');
        if (isLoggedIn === 'true') {
            this.showApp();
        }
    },

    async handleLogin() {
        const user = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Verificar conexão com o servidor
        const serverConnected = await checkServerConnection();
        
        if (serverConnected) {
            // Usar API para login
            const result = await API.login(user, password);
            if (result.success) {
                sessionStorage.setItem('setorTI_logged', 'true');
                AppState.useDatabase = true;
                this.showApp();
                Toast.show('Login realizado com sucesso!', 'success');
            } else {
                this.showError(result.message || 'Usuário ou senha inválidos.');
            }
        } else {
            // Fallback para login local
            const userCorrect = user === 'Admin';
            const passwordCorrect = password === 'Administracao@1';

            if (userCorrect && passwordCorrect) {
                sessionStorage.setItem('setorTI_logged', 'true');
                AppState.useDatabase = false;
                this.showApp();
                Toast.show('Login realizado com sucesso! (Modo offline)', 'info');
            } else {
                let message = 'Usuário ou senha inválidos!';
                
                if (!userCorrect && !passwordCorrect) {
                    message = 'O usuário e senha estão errados!!';
                } else if (!userCorrect) {
                    message = 'O usuário está errado!!';
                } else {
                    message = 'A senha está errada!!';
                }
                
                this.showError(message);
            }
        }
    },

    logout() {
        sessionStorage.removeItem('setorTI_logged');
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        
        appContainer.style.display = 'none';
        loginScreen.style.display = 'flex';
        
        // Limpar formulário de login
        document.getElementById('loginForm').reset();
        this.hideError();
        
        Toast.show('Logout realizado com sucesso!', 'info');
    },

    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }
        
        this.inactivityTimer = setTimeout(() => {
            Toast.show('Sessão expirada por inatividade!', 'info');
            this.logout();
        }, this.INACTIVITY_TIMEOUT);
    },

    showError(message) {
        const errorEl = document.getElementById('loginError');
        const messageEl = document.getElementById('loginErrorMessage');
        
        if (message) {
            messageEl.textContent = message;
        }
        
        errorEl.classList.add('visible');
        
        // Animar o erro
        errorEl.style.animation = 'none';
        errorEl.offsetHeight; // Trigger reflow
        errorEl.style.animation = 'shake 0.3s ease';
    },

    hideError() {
        const errorEl = document.getElementById('loginError');
        errorEl.classList.remove('visible');
    },

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('loginPassword');
        const toggleBtn = document.getElementById('passwordToggle');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        }
    },

    showApp() {
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        
        loginScreen.style.display = 'none';
        appContainer.style.display = 'flex';
        
        // Iniciar timer de inatividade
        this.resetInactivityTimer();
        
        // Resetar timer em qualquer atividade do usuário
        const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        activityEvents.forEach(event => {
            document.addEventListener(event, () => this.resetInactivityTimer(), { passive: true });
        });
        
        // Inicializar o aplicativo
        this.initializeApp();
    },

    async initializeApp() {
        // Carregar configurações
        if (AppState.useDatabase) {
            const config = await API.getConfiguracoes();
            if (config.tema) {
                AppState.settings.theme = config.tema;
            }
        } else {
            StorageManager.load();
            SampleData.load();
        }
        
        // Configurar tema
        const themeToggle = document.getElementById('themeToggle');
        
        if (AppState.settings.theme === 'light') {
            themeToggle.checked = true;
            document.documentElement.setAttribute('data-theme', 'light');
        }

        themeToggle.addEventListener('change', async () => {
            if (themeToggle.checked) {
                document.documentElement.setAttribute('data-theme', 'light');
                AppState.settings.theme = 'light';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                AppState.settings.theme = 'dark';
            }
            
            if (AppState.useDatabase) {
                await API.setConfiguracao('tema', AppState.settings.theme);
            } else {
                StorageManager.save();
            }
        });

        Navigation.init();
        await Dashboard.update();
        Dashboard.setupQuickActions();
        await Inventory.init();
        await Snippets.init();
        await Services.init();
        await ActivityLogger.renderInventory();
        await ActivityLogger.renderServices();

        console.log('Setor de TI initialized successfully!');
        console.log('Modo:', AppState.useDatabase ? 'Banco de Dados' : 'Local (Offline)');
    }
};

// ==========================================
// GERENCIADOR DE ARMAZENAMENTO LOCAL
// ==========================================
const StorageManager = {
    // Salva estado atual no localStorage
    save() {
        try {
            localStorage.setItem('setorTI', JSON.stringify(AppState));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    },

    // Carrega dados do localStorage
    load() {
        try {
            const data = localStorage.getItem('setorTI');
            if (data) {
                const parsed = JSON.parse(data);
                Object.assign(AppState, parsed);
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        }
    },

    clear() {
        localStorage.removeItem('setorTI');
        location.reload();
    },

    async export() {
        if (AppState.useDatabase) {
            const data = await API.exportarDados();
            if (data) {
                const dataStr = JSON.stringify(data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'setor-ti-backup-' + new Date().toISOString().split('T')[0] + '.json';
                a.click();
                URL.revokeObjectURL(url);
                Toast.show('Dados exportados com sucesso!', 'success');
            }
        } else {
            const dataStr = JSON.stringify(AppState, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'setor-ti-backup-' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    },

    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    Object.assign(AppState, data);
                    this.save();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};

// ==========================================
// SISTEMA DE NOTIFICAÇÕES
// ==========================================
const Toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast ' + type;

        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        toast.innerHTML = '<div class="toast-icon">' + icons[type] + '</div><span class="toast-message">' + message + '</span><button class="toast-close">&times;</button>';

        container.appendChild(toast);

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        setTimeout(() => this.remove(toast), 4000);
    },

    remove(toast) {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }
};

// ==========================================
// SISTEMA DE MODAIS
// ==========================================
const Modal = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    },

    closeAll() {
        document.querySelectorAll('.modal-overlay.visible').forEach(modal => {
            modal.classList.remove('visible');
        });
        document.body.style.overflow = '';
    },

    confirm(title, message, callback) {
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        
        const confirmBtn = document.getElementById('confirmAction');
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        newBtn.addEventListener('click', () => {
            callback();
            this.close('confirmModal');
        });
        
        this.open('confirmModal');
    }
};

// ==========================================
// REGISTRADOR DE ATIVIDADES
// ==========================================
const ActivityLogger = {
    async renderInventory() {
        const container = document.getElementById('inventoryActivityList');
        
        let activities = [];
        
        if (AppState.useDatabase) {
            activities = await API.getAtividadesInventory();
        } else {
            activities = AppState.activities.inventory || [];
        }
        
        if (activities.length === 0) {
            container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><p>Nenhuma atividade recente</p></div>';
            return;
        }

        const icons = {
            add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
            edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
        };

        container.innerHTML = activities.slice(0, 10).map(activity => {
            const time = this.formatTime(activity.data_atividade || activity.timestamp);
            return '<div class="activity-item"><div class="activity-icon ' + activity.acao + '">' + icons[activity.acao] + '</div><div class="activity-content"><span class="activity-text">' + activity.detalhes + '</span><span class="activity-time">' + time + '</span></div></div>';
        }).join('');
    },

    async renderServices() {
        const container = document.getElementById('servicesActivityList');
        
        let activities = [];
        
        if (AppState.useDatabase) {
            activities = await API.getAtividadesServices();
        } else {
            activities = AppState.activities.services || [];
        }
        
        if (activities.length === 0) {
            container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><p>Nenhuma atividade recente</p></div>';
            return;
        }

        const icons = {
            add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
            edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            complete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
        };

        container.innerHTML = activities.slice(0, 10).map(activity => {
            const time = this.formatTime(activity.data_atividade || activity.timestamp);
            return '<div class="activity-item"><div class="activity-icon ' + activity.acao + '">' + icons[activity.acao] + '</div><div class="activity-content"><span class="activity-text">' + activity.detalhes + '</span><span class="activity-time">' + time + '</span></div></div>';
        }).join('');
    },

    formatTime(timestamp) {
        if (!timestamp) return 'Agora mesmo';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Agora mesmo';
        if (diff < 3600000) return 'Há ' + Math.floor(diff / 60000) + ' min';
        if (diff < 86400000) return 'Há ' + Math.floor(diff / 3600000) + ' horas';
        return date.toLocaleDateString('pt-BR');
    }
};

// ==========================================
// DASHBOARD
// ==========================================
const Dashboard = {
    async update() {
        if (AppState.useDatabase) {
            const resumo = await API.getDashboardResumo();
            document.getElementById('totalItems').textContent = resumo.total_itens_estoque || 0;
            document.getElementById('totalSnippets').textContent = resumo.total_snippets || 0;
            document.getElementById('pendingServices').textContent = resumo.servicos_pendentes || 0;
            document.getElementById('lowStockItems').textContent = resumo.itens_estoque_baixo || 0;
            
            document.getElementById('inventoryBadge').textContent = resumo.itens_estoque_baixo || 0;
            document.getElementById('inventoryBadge').style.display = (resumo.itens_estoque_baixo || 0) > 0 ? 'inline' : 'none';
            
            document.getElementById('servicesBadge').textContent = resumo.servicos_pendentes || 0;
            document.getElementById('servicesBadge').style.display = (resumo.servicos_pendentes || 0) > 0 ? 'inline' : 'none';
        } else {
            document.getElementById('totalItems').textContent = AppState.inventory.length;
            document.getElementById('totalSnippets').textContent = AppState.snippets.length;
            
            const pendingServices = AppState.services.filter(s => s.status === 'pending').length;
            document.getElementById('pendingServices').textContent = pendingServices;
            
            const lowStock = AppState.inventory.filter(item => {
                const qty = parseInt(item.quantity) || 0;
                const min = parseInt(item.minStock) || 5;
                return qty <= min;
            }).length;
            document.getElementById('lowStockItems').textContent = lowStock;
            document.getElementById('inventoryBadge').textContent = lowStock;
            document.getElementById('inventoryBadge').style.display = lowStock > 0 ? 'inline' : 'none';
            
            document.getElementById('servicesBadge').textContent = pendingServices;
            document.getElementById('servicesBadge').style.display = pendingServices > 0 ? 'inline' : 'none';
        }
    },

    setupQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                switch (action) {
                    case 'add-item':
                        Inventory.openAddModal();
                        break;
                    case 'add-snippet':
                        Snippets.openAddModal();
                        break;
                    case 'add-service':
                        Services.openAddModal();
                        break;
                    case 'export-data':
                        StorageManager.export();
                        break;
                }
            });
        });
    }
};

// ==========================================
// GERENCIADOR DE ESTOQUE
// ==========================================
const Inventory = {
    async init() {
        this.setupEventListeners();
        await this.render();
    },

    setupEventListeners() {
        document.getElementById('addItemBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('addFirstItemBtn').addEventListener('click', () => this.openAddModal());

        document.getElementById('itemForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveItem();
        });

        document.getElementById('inventorySearch').addEventListener('input', (e) => {
            this.render(e.target.value);
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.render(document.getElementById('inventorySearch').value, e.target.value);
        });
    },

    openAddModal() {
        document.getElementById('itemModalTitle').textContent = 'Adicionar Item';
        document.getElementById('itemForm').reset();
        document.getElementById('itemId').value = '';
        document.getElementById('itemQuantity').value = '1';
        document.getElementById('itemMinStock').value = '5';
        Modal.open('itemModal');
    },

    async openEditModal(id) {
        let item = AppState.inventory.find(i => i.id == id);
        if (!item && AppState.useDatabase) {
            item = await API.getEstoqueItem(id);
        }
        if (!item) return;

        document.getElementById('itemModalTitle').textContent = 'Editar Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemName').value = item.nome || item.name;
        document.getElementById('itemCategory').value = item.categoria || item.category;
        document.getElementById('itemQuantity').value = item.quantidade !== undefined ? item.quantidade : (item.quantity || 0);
        document.getElementById('itemMinStock').value = item.estoque_minimo || item.minStock || 5;
        document.getElementById('itemLocation').value = item.localizacao || item.location || '';
        document.getElementById('itemDescription').value = item.descricao || item.description || '';
        
        Modal.open('itemModal');
    },

    async saveItem() {
        const id = document.getElementById('itemId').value;
        const itemData = {
            nome: document.getElementById('itemName').value.trim(),
            categoria: document.getElementById('itemCategory').value,
            quantidade: parseInt(document.getElementById('itemQuantity').value) || 0,
            estoque_minimo: parseInt(document.getElementById('itemMinStock').value) || 5,
            localizacao: document.getElementById('itemLocation').value.trim(),
            descricao: document.getElementById('itemDescription').value.trim()
        };

        if (!itemData.nome || !itemData.categoria) {
            Toast.show('Preencha os campos obrigatórios!', 'error');
            return;
        }

        if (AppState.useDatabase) {
            if (id) {
                const result = await API.updateEstoqueItem(id, itemData);
                if (result.error) {
                    Toast.show('Erro ao atualizar item.', 'error');
                    return;
                }
                Toast.show('Item atualizado com sucesso!', 'success');
            } else {
                const result = await API.createEstoqueItem(itemData);
                if (result.error) {
                    Toast.show('Erro ao criar item.', 'error');
                    return;
                }
                itemData.id = result.id.toString();
                Toast.show('Item adicionado com sucesso!', 'success');
            }
        } else {
            if (id) {
                const index = AppState.inventory.findIndex(i => i.id === id);
                if (index !== -1) {
                    AppState.inventory[index] = { ...AppState.inventory[index], ...itemData };
                    Toast.show('Item atualizado com sucesso!', 'success');
                }
            } else {
                itemData.id = Date.now().toString();
                AppState.inventory.push(itemData);
                Toast.show('Item adicionado com sucesso!', 'success');
            }
            StorageManager.save();
        }

        Modal.close('itemModal');
        await this.render();
        await Dashboard.update();
        await ActivityLogger.renderInventory();
    },

    async deleteItem(id) {
        const item = AppState.inventory.find(i => i.id == id);
        if (!item) return;

        const itemName = item.nome || item.name;

        Modal.confirm(
            'Excluir Item',
            'Tem certeza que deseja excluir "' + itemName + '"?',
            async () => {
                if (AppState.useDatabase) {
                    const result = await API.deleteEstoqueItem(id);
                    if (result.error) {
                        Toast.show('Erro ao excluir item.', 'error');
                        return;
                    }
                } else {
                    AppState.inventory = AppState.inventory.filter(i => i.id !== id);
                    StorageManager.save();
                }
                
                Toast.show('Item excluído com sucesso!', 'success');
                await this.render();
                await Dashboard.update();
                await ActivityLogger.renderInventory();
            }
        );
    },

    getStockStatus(item) {
        const qty = parseInt(item.quantidade || item.quantity) || 0;
        const min = parseInt(item.estoque_minimo || item.minStock) || 5;
        
        if (qty === 0) return { class: 'out', text: 'Esgotado' };
        if (qty <= min) return { class: 'low', text: 'Baixo (' + qty + ')' };
        return { class: 'ok', text: 'OK' };
    },

    getCategoryLabel(category) {
        const labels = {
            hardware: 'Hardware',
            software: 'Software',
            perifericos: 'Periféricos',
            cabos: 'Cabos',
            rede: 'Rede',
            outros: 'Outros'
        };
        return labels[category] || category;
    },

    async render(searchTerm = '', categoryFilter = '') {
        const tbody = document.getElementById('inventoryBody');
        const emptyState = document.getElementById('inventoryEmpty');
        const table = document.getElementById('inventoryTable');

        let items = [];

        if (AppState.useDatabase) {
            items = await API.getEstoque(searchTerm, categoryFilter);
            AppState.inventory = items;
        } else {
            items = [...AppState.inventory];

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                items = items.filter(item => 
                    (item.nome || item.name || '').toLowerCase().includes(term) ||
                    (item.descricao || item.description || '').toLowerCase().includes(term) ||
                    (item.localizacao || item.location || '').toLowerCase().includes(term)
                );
            }

            if (categoryFilter) {
                items = items.filter(item => (item.categoria || item.category) === categoryFilter);
            }
        }

        if (items.length === 0) {
            table.style.display = 'none';
            emptyState.classList.add('visible');
        } else {
            table.style.display = 'table';
            emptyState.classList.remove('visible');

            tbody.innerHTML = items.map(item => {
                const status = this.getStockStatus(item);
                const itemId = item.id;
                const itemName = item.nome || item.name;
                const itemCategory = item.categoria || item.category;
                const itemQuantity = item.quantidade || item.quantity;
                const itemLocation = item.localizacao || item.location;
                const itemDescription = item.descricao || item.description;
                
                return `<tr>
                    <td><strong>${this.escapeHtml(itemName)}</strong>${itemDescription ? '<br><small style="color: var(--text-muted)">' + this.escapeHtml(itemDescription.substring(0, 50)) + '...</small>' : ''}</td>
                    <td><span class="snippet-tag">${this.getCategoryLabel(itemCategory)}</span></td>
                    <td>${itemQuantity}</td>
                    <td>${itemLocation || '-'}</td>
                    <td><span class="stock-status ${status.class}">${status.text}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-secondary btn-icon" onclick="Inventory.openEditModal('${itemId}')" title="Editar">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn btn-sm btn-danger btn-icon" onclick="Inventory.deleteItem('${itemId}')" title="Excluir">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>`;
            }).join('');
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ==========================================
// GERENCIADOR DE CÓDIGOS (SNIPPETS)
// ==========================================
const Snippets = {
    currentViewSnippet: null,

    async init() {
        this.setupEventListeners();
        await this.render();
    },

    setupEventListeners() {
        document.getElementById('addSnippetBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('addFirstSnippetBtn').addEventListener('click', () => this.openAddModal());

        document.getElementById('snippetForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSnippet();
        });

        document.getElementById('snippetsSearch').addEventListener('input', (e) => {
            this.render(e.target.value);
        });

        document.getElementById('snippetCategoryFilter').addEventListener('change', () => {
            this.render(document.getElementById('snippetsSearch').value, document.getElementById('snippetCategoryFilter').value, document.getElementById('snippetTypeFilter').value);
        });

        document.getElementById('snippetTypeFilter').addEventListener('change', () => {
            this.render(document.getElementById('snippetsSearch').value, document.getElementById('snippetCategoryFilter').value, document.getElementById('snippetTypeFilter').value);
        });

        document.getElementById('copyCodeBtn').addEventListener('click', () => {
            if (this.currentViewSnippet) {
                navigator.clipboard.writeText(this.currentViewSnippet.codigo || this.currentViewSnippet.code).then(() => {
                    Toast.show('Código copiado!', 'success');
                });
            }
        });
    },

    openAddModal() {
        document.getElementById('snippetModalTitle').textContent = 'Adicionar Código';
        document.getElementById('snippetForm').reset();
        document.getElementById('snippetId').value = '';
        Modal.open('snippetModal');
    },

    openEditModal(id) {
        const snippet = AppState.snippets.find(s => s.id == id);
        if (!snippet) return;

        document.getElementById('snippetModalTitle').textContent = 'Editar Código';
        document.getElementById('snippetId').value = snippet.id;
        document.getElementById('snippetTitle').value = snippet.titulo || snippet.title;
        document.getElementById('snippetCategory').value = snippet.categoria || snippet.category;
        document.getElementById('snippetType').value = snippet.tipo || snippet.type;
        document.getElementById('snippetTags').value = snippet.tags || '';
        document.getElementById('snippetDescription').value = snippet.descricao || snippet.description || '';
        document.getElementById('snippetCode').value = snippet.codigo || snippet.code;
        
        Modal.open('snippetModal');
    },

    viewSnippet(id) {
        const snippet = AppState.snippets.find(s => s.id == id);
        if (!snippet) return;

        this.currentViewSnippet = snippet;
        
        document.getElementById('viewSnippetTitle').textContent = snippet.titulo || snippet.title;
        document.getElementById('viewSnippetType').textContent = (snippet.tipo || snippet.type).toUpperCase();
        
        const codeElement = document.getElementById('viewSnippetCode');
        codeElement.textContent = snippet.codigo || snippet.code;
        
        const metaElement = document.getElementById('viewSnippetMeta');
        const categoryLabels = { sistema: 'Sistema', impressora: 'Impressora', rede: 'Rede' };
        const tags = snippet.tags ? snippet.tags.split(',').map(t => '<span class="snippet-tag">' + t.trim() + '</span>').join('') : '';
        metaElement.innerHTML = '<span class="snippet-type-badge ' + (snippet.tipo || snippet.type) + '">' + (snippet.tipo || snippet.type).toUpperCase() + '</span><span class="snippet-tag">' + (categoryLabels[snippet.categoria || snippet.category] || (snippet.categoria || snippet.category)) + '</span>' + tags;
        
        Modal.open('viewSnippetModal');
    },

    async saveSnippet() {
        const id = document.getElementById('snippetId').value;
        const snippetData = {
            titulo: document.getElementById('snippetTitle').value.trim(),
            categoria: document.getElementById('snippetCategory').value,
            tipo: document.getElementById('snippetType').value,
            tags: document.getElementById('snippetTags').value.trim(),
            descricao: document.getElementById('snippetDescription').value.trim(),
            codigo: document.getElementById('snippetCode').value
        };

        if (!snippetData.titulo || !snippetData.categoria || !snippetData.tipo || !snippetData.codigo) {
            Toast.show('Preencha os campos obrigatórios!', 'error');
            return;
        }

        if (AppState.useDatabase) {
            if (id) {
                const result = await API.updateSnippet(id, snippetData);
                if (result.error) {
                    Toast.show('Erro ao atualizar código.', 'error');
                    return;
                }
                Toast.show('Código atualizado com sucesso!', 'success');
            } else {
                const result = await API.createSnippet(snippetData);
                if (result.error) {
                    Toast.show('Erro ao criar código.', 'error');
                    return;
                }
                snippetData.id = result.id.toString();
                Toast.show('Código adicionado com sucesso!', 'success');
            }
        } else {
            if (id) {
                const index = AppState.snippets.findIndex(s => s.id === id);
                if (index !== -1) {
                    AppState.snippets[index] = { ...AppState.snippets[index], ...snippetData };
                    Toast.show('Código atualizado com sucesso!', 'success');
                }
            } else {
                snippetData.id = Date.now().toString();
                AppState.snippets.push(snippetData);
                Toast.show('Código adicionado com sucesso!', 'success');
            }
            StorageManager.save();
        }

        Modal.close('snippetModal');
        await this.render();
        await Dashboard.update();
    },

    async deleteSnippet(id) {
        const snippet = AppState.snippets.find(s => s.id == id);
        if (!snippet) return;

        const snippetTitle = snippet.titulo || snippet.title;

        Modal.confirm(
            'Excluir Código',
            'Tem certeza que deseja excluir "' + snippetTitle + '"?',
            async () => {
                if (AppState.useDatabase) {
                    const result = await API.deleteSnippet(id);
                    if (result.error) {
                        Toast.show('Erro ao excluir código.', 'error');
                        return;
                    }
                } else {
                    AppState.snippets = AppState.snippets.filter(s => s.id !== id);
                    StorageManager.save();
                }
                
                Toast.show('Código excluído com sucesso!', 'success');
                await this.render();
                await Dashboard.update();
            }
        );
    },

    getTypeLabel(type) {
        return type.toUpperCase();
    },

    getCategoryLabel(category) {
        const labels = { sistema: 'Sistema', impressora: 'Impressora', rede: 'Rede' };
        return labels[category] || category;
    },

    async render(searchTerm = '', categoryFilter = '', typeFilter = '') {
        const grid = document.getElementById('snippetsGrid');
        const emptyState = document.getElementById('snippetsEmpty');

        let snippets = [];

        if (AppState.useDatabase) {
            snippets = await API.getSnippets(searchTerm, categoryFilter, typeFilter);
            AppState.snippets = snippets;
        } else {
            snippets = [...AppState.snippets];

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                snippets = snippets.filter(snippet => 
                    (snippet.titulo || snippet.title || '').toLowerCase().includes(term) ||
                    (snippet.descricao || snippet.description || '').toLowerCase().includes(term) ||
                    (snippet.tags || '').toLowerCase().includes(term) ||
                    (snippet.codigo || snippet.code || '').toLowerCase().includes(term)
                );
            }

            if (categoryFilter) {
                snippets = snippets.filter(snippet => (snippet.categoria || snippet.category) === categoryFilter);
            }

            if (typeFilter) {
                snippets = snippets.filter(snippet => (snippet.tipo || snippet.type) === typeFilter);
            }
        }

        if (snippets.length === 0) {
            grid.style.display = 'none';
            emptyState.classList.add('visible');
        } else {
            grid.style.display = 'grid';
            emptyState.classList.remove('visible');

            grid.innerHTML = snippets.map(snippet => {
                const snippetId = snippet.id;
                const snippetTitle = snippet.titulo || snippet.title;
                const snippetType = snippet.tipo || snippet.type;
                const snippetCategory = snippet.categoria || snippet.category;
                const snippetDescription = snippet.descricao || snippet.description;
                const snippetTags = snippet.tags;
                const snippetCode = snippet.codigo || snippet.code;
                
                const tags = snippetTags ? snippetTags.split(',').slice(0, 3).map(t => '<span class="snippet-tag">' + t.trim() + '</span>').join('') : '';
                const codePreview = snippetCode.split('\n')[0] ? snippetCode.split('\n')[0].substring(0, 60) : '';

                return `<div class="snippet-card" onclick="Snippets.viewSnippet('${snippetId}')">
                    <div class="snippet-card-header">
                        <h4 class="snippet-title">${Inventory.escapeHtml(snippetTitle)}</h4>
                        <span class="snippet-type-badge ${snippetType}">${snippetType.toUpperCase()}</span>
                        <span class="snippet-tag">${this.getCategoryLabel(snippetCategory)}</span>
                    </div>
                    ${snippetDescription ? '<p class="snippet-description">' + Inventory.escapeHtml(snippetDescription) + '</p>' : ''}
                    ${tags ? '<div class="snippet-tags">' + tags + '</div>' : ''}
                    <div class="snippet-preview">${Inventory.escapeHtml(codePreview)}...</div>
                    <div class="snippet-card-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-sm btn-secondary" onclick="Snippets.openEditModal('${snippetId}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="Snippets.deleteSnippet('${snippetId}')">Excluir</button>
                    </div>
                </div>`;
            }).join('');
        }
    }
};

// ==========================================
// GERENCIADOR DE SERVIÇOS
// ==========================================
const Services = {
    currentViewService: null,

    async init() {
        this.setupEventListeners();
        await this.render();
    },

    setupEventListeners() {
        document.getElementById('addServiceBtn').addEventListener('click', () => this.openAddModal());
        document.getElementById('addFirstServiceBtn').addEventListener('click', () => this.openAddModal());

        document.getElementById('serviceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveService();
        });

        document.getElementById('servicesSearch').addEventListener('input', (e) => {
            this.render(e.target.value);
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.render(document.getElementById('servicesSearch').value, e.target.value);
        });

        document.getElementById('editFromViewBtn').addEventListener('click', () => {
            if (this.currentViewService) {
                Modal.close('viewServiceModal');
                this.openEditModal(this.currentViewService.id);
            }
        });
    },

    openAddModal() {
        document.getElementById('serviceModalTitle').textContent = 'Adicionar Serviço';
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceId').value = '';
        document.getElementById('serviceDate').value = new Date().toISOString().split('T')[0];
        Modal.open('serviceModal');
    },

    openEditModal(id) {
        const service = AppState.services.find(s => s.id == id);
        if (!service) return;

        document.getElementById('serviceModalTitle').textContent = 'Editar Serviço';
        document.getElementById('serviceId').value = service.id;
        document.getElementById('serviceTitle').value = service.titulo || service.title;
        document.getElementById('serviceClient').value = service.cliente_setor || service.client || '';
        document.getElementById('servicePriority').value = service.prioridade || service.priority || 'media';
        document.getElementById('serviceDate').value = service.data_servico || service.date || '';
        document.getElementById('serviceDescription').value = service.descricao || service.description || '';
        document.getElementById('serviceReport').value = service.relatorio || service.report || '';
        
        Modal.open('serviceModal');
    },

    viewService(id) {
        const service = AppState.services.find(s => s.id == id);
        if (!service) return;

        this.currentViewService = service;
        
        document.getElementById('viewServiceTitle').textContent = service.titulo || service.title;
        
        const statusLabel = service.status === 'pending' ? 'Pendente' : 'Concluído';
        const priorityLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };
        const priority = service.prioridade || service.priority;
        
        document.getElementById('viewServiceMeta').innerHTML = '<span class="service-status-badge ' + service.status + '">' + statusLabel + '</span><span class="service-priority ' + priority + '">' + priorityLabels[priority] + '</span>' + ((service.cliente_setor || service.client) ? '<span>' + Inventory.escapeHtml(service.cliente_setor || service.client) + '</span>' : '') + ((service.data_servico || service.date) ? '<span>' + new Date(service.data_servico || service.date).toLocaleDateString('pt-BR') + '</span>' : '');
        
        document.getElementById('viewServiceDescription').textContent = service.descricao || service.description;
        document.getElementById('viewServiceReport').textContent = service.relatorio || service.report || 'Nenhum relatório registrado.';
        
        Modal.open('viewServiceModal');
    },

    async saveService() {
        const id = document.getElementById('serviceId').value;
        const serviceData = {
            titulo: document.getElementById('serviceTitle').value.trim(),
            cliente_setor: document.getElementById('serviceClient').value.trim(),
            prioridade: document.getElementById('servicePriority').value,
            data_servico: document.getElementById('serviceDate').value,
            descricao: document.getElementById('serviceDescription').value.trim(),
            relatorio: document.getElementById('serviceReport').value.trim()
        };

        if (!serviceData.titulo || !serviceData.descricao) {
            Toast.show('Preencha os campos obrigatórios!', 'error');
            return;
        }

        if (AppState.useDatabase) {
            if (id) {
                const result = await API.updateServico(id, serviceData);
                if (result.error) {
                    Toast.show('Erro ao atualizar serviço.', 'error');
                    return;
                }
                Toast.show('Serviço atualizado com sucesso!', 'success');
            } else {
                const result = await API.createServico(serviceData);
                if (result.error) {
                    Toast.show('Erro ao criar serviço.', 'error');
                    return;
                }
                serviceData.id = result.id.toString();
                Toast.show('Serviço adicionado com sucesso!', 'success');
            }
        } else {
            if (id) {
                const index = AppState.services.findIndex(s => s.id === id);
                if (index !== -1) {
                    AppState.services[index] = { ...AppState.services[index], ...serviceData };
                    Toast.show('Serviço atualizado com sucesso!', 'success');
                }
            } else {
                serviceData.id = Date.now().toString();
                serviceData.status = 'pending';
                AppState.services.push(serviceData);
                Toast.show('Serviço adicionado com sucesso!', 'success');
            }
            StorageManager.save();
        }

        Modal.close('serviceModal');
        await this.render();
        await Dashboard.update();
        await ActivityLogger.renderServices();
    },

    async completeService(id) {
        if (AppState.useDatabase) {
            const result = await API.concluirServico(id);
            if (result.error) {
                Toast.show('Erro ao concluir serviço.', 'error');
                return;
            }
        } else {
            const service = AppState.services.find(s => s.id === id);
            if (!service) return;
            service.status = 'completed';
            service.completedAt = new Date().toISOString();
            StorageManager.save();
        }
        
        Toast.show('Serviço concluído com sucesso!', 'success');
        await this.render();
        await Dashboard.update();
        await ActivityLogger.renderServices();
    },

    getStatusLabel(status) {
        return status === 'pending' ? 'Pendente' : 'Concluído';
    },

    getPriorityLabel(priority) {
        const labels = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };
        return labels[priority] || priority;
    },

    async render(searchTerm = '', statusFilter = '') {
        const list = document.getElementById('servicesList');
        const emptyState = document.getElementById('servicesEmpty');

        let services = [];

        if (AppState.useDatabase) {
            services = await API.getServicos(searchTerm, statusFilter);
            AppState.services = services;
        } else {
            services = [...AppState.services];

            services.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                services = services.filter(service => 
                    (service.titulo || service.title || '').toLowerCase().includes(term) ||
                    (service.descricao || service.description || '').toLowerCase().includes(term) ||
                    (service.cliente_setor || service.client || '').toLowerCase().includes(term) ||
                    (service.relatorio || service.report || '').toLowerCase().includes(term)
                );
            }

            if (statusFilter) {
                services = services.filter(service => service.status === statusFilter);
            }
        }

        if (services.length === 0) {
            list.style.display = 'none';
            emptyState.classList.add('visible');
        } else {
            list.style.display = 'flex';
            emptyState.classList.remove('visible');

            list.innerHTML = services.map(service => {
                const serviceId = service.id;
                const serviceTitle = service.titulo || service.title;
                const serviceStatus = service.status;
                const serviceClient = service.cliente_setor || service.client;
                const servicePriority = service.prioridade || service.priority;
                const serviceDate = service.data_servico || service.date;
                const serviceDescription = service.descricao || service.description;
                
                const statusLabel = this.getStatusLabel(serviceStatus);
                const priorityLabel = this.getPriorityLabel(servicePriority);
                const date = serviceDate ? new Date(serviceDate).toLocaleDateString('pt-BR') : '-';

                let actionsHtml = '<div class="service-card-actions" onclick="event.stopPropagation()">';
                actionsHtml += `<button class="btn btn-sm btn-secondary" onclick="Services.openEditModal('${serviceId}')">Editar</button>`;
                
                if (serviceStatus === 'pending') {
                    actionsHtml += `<button class="btn btn-sm btn-primary" onclick="Services.completeService('${serviceId}')">Concluir</button>`;
                }
                
                actionsHtml += '</div>';

                return `<div class="service-card" onclick="Services.viewService('${serviceId}')">
                    <div class="service-card-header">
                        <h4 class="service-title">${Inventory.escapeHtml(serviceTitle)}</h4>
                        <span class="service-status-badge ${serviceStatus}">${statusLabel}</span>
                    </div>
                    <div class="service-meta">
                        ${serviceClient ? '<span>' + Inventory.escapeHtml(serviceClient) + '</span>' : ''}
                        <span class="service-priority ${servicePriority}">${priorityLabel}</span>
                        <span>${date}</span>
                    </div>
                    <p class="service-description">${Inventory.escapeHtml(serviceDescription)}</p>
                    ${actionsHtml}
                </div>`;
            }).join('');
        }
    }
};

// ==========================================
// DADOS DE EXEMPLO
// ==========================================
const SampleData = {
    load() {
        if (AppState.inventory.length === 0) {
            AppState.inventory = [
                { id: '1', name: 'Mouse USB Logitech', categoria: 'perifericos', quantidade: 15, estoque_minimo: 5, localizacao: 'Armário A-01', descricao: 'Mouse USB com fio, DPI ajustável' },
                { id: '2', name: 'Teclado ABNT2', categoria: 'perifericos', quantidade: 8, estoque_minimo: 5, localizacao: 'Armário A-02', descricao: 'Teclado padrão brasileiro com fio' },
                { id: '3', name: 'Cabo de Rede CAT6 5m', categoria: 'cabos', quantidade: 25, estoque_minimo: 10, localizacao: 'Prateleira B-01', descricao: 'Cabo de rede azul 5 metros' },
                { id: '4', name: 'Memória RAM 8GB DDR4', categoria: 'hardware', quantidade: 3, estoque_minimo: 5, localizacao: 'Gaveta C-01', descricao: 'Memória RAM 8GB 3200MHz' }
            ];
        }

        if (AppState.snippets.length === 0) {
            AppState.snippets = [
                { id: '1', title: 'Limpar Cache DNS', categoria: 'rede', tipo: 'cmd', tags: 'dns, cache, rede', descricao: 'Limpa o cache de DNS do Windows', codigo: 'ipconfig /flushdns' },
                { id: '2', title: 'Ver Configuracoes de Rede', categoria: 'rede', tipo: 'cmd', tags: 'rede, ip, configuracao', descricao: 'Exibe todas as configuracoes de rede detalhadas', codigo: 'ipconfig /all' },
                { id: '3', title: 'Testar Conexao Ping Continuo', categoria: 'rede', tipo: 'cmd', tags: 'ping, gateway, rede, teste', descricao: 'Pinga continuamente o gateway para testar conectividade', codigo: 'ping 192.168.1.1 -t' },
                { id: '4', title: 'Tracar Rota de Rede', categoria: 'rede', tipo: 'cmd', tags: 'tracert, rota, rede', descricao: 'Rastreia o caminho dos pacotes ate um destino', codigo: 'tracert google.com' },
                { id: '5', title: 'Ver Tabela ARP', categoria: 'rede', tipo: 'cmd', tags: 'arp, mac, rede', descricao: 'Exibe a tabela ARP (IP x MAC) da maquina', codigo: 'arp -a' },
                { id: '6', title: 'Ver Portas em Uso', categoria: 'rede', tipo: 'cmd', tags: 'netstat, portas, rede, conexao', descricao: 'Lista todas as conexoes ativas e portas em uso', codigo: 'netstat -ano' },
                { id: '7', title: 'Mapear Unidade de Rede', categoria: 'rede', tipo: 'cmd', tags: 'rede, mapeamento, compartilhamento, drive', descricao: 'Mapeia uma unidade de rede compartilhada como letra Z:', codigo: 'net use Z: \\\\servidor\\pasta /persistent:yes' },
                { id: '8', title: 'Consultar DNS de Dominio', categoria: 'rede', tipo: 'cmd', tags: 'nslookup, dns, dominio', descricao: 'Consulta informacoes de DNS de um dominio', codigo: 'nslookup google.com' },
                { id: '9', title: 'Resetar Configuracoes de Rede', categoria: 'rede', tipo: 'batch', tags: 'rede, reset, tcp, winsock', descricao: 'Script completo para resetar todas as configuracoes de rede', codigo: '@echo off\necho Resetando configuracoes de rede...\nipconfig /release\nipconfig /renew\nipconfig /flushdns\nnetsh winsock reset\nnetsh int ip reset\necho.\necho Concluido! Reinicie o computador.\npause' },
                { id: '10', title: 'Diagnostico de Rede Completo', categoria: 'rede', tipo: 'batch', tags: 'rede, diagnostico, ping, log', descricao: 'Testa conectividade com gateway e internet e salva log', codigo: '@echo off\necho === DIAGNOSTICO DE REDE === > rede_log.txt\ndate /t >> rede_log.txt\ntime /t >> rede_log.txt\necho Testando gateway... >> rede_log.txt\nping 192.168.1.1 -n 4 >> rede_log.txt\necho Testando DNS Google... >> rede_log.txt\nping 8.8.8.8 -n 4 >> rede_log.txt\necho Testando internet... >> rede_log.txt\nping google.com -n 4 >> rede_log.txt\necho Log salvo em rede_log.txt\ntype rede_log.txt\npause' },
                { id: '11', title: 'Mapear Rede e Exportar Lista', categoria: 'rede', tipo: 'batch', tags: 'rede, compartilhamentos, mapeamento, inventario', descricao: 'Lista computadores e compartilhamentos da rede e salva em arquivo', codigo: '@echo off\necho === MAPEAMENTO DE REDE === > mapa_rede.txt\ndate /t >> mapa_rede.txt\necho.\necho Computadores na rede: >> mapa_rede.txt\nnet view >> mapa_rede.txt\necho Compartilhamentos locais: >> mapa_rede.txt\nnet share >> mapa_rede.txt\necho Resultado salvo em mapa_rede.txt\npause' },
                { id: '12', title: 'Verificar Integridade do Sistema', categoria: 'sistema', tipo: 'cmd', tags: 'sfc, sistema, reparo, integridade', descricao: 'Verifica e repara arquivos corrompidos do sistema Windows', codigo: 'sfc /scannow' },
                { id: '13', title: 'Verificar Espaco em Disco', categoria: 'sistema', tipo: 'cmd', tags: 'disco, espaco, wmic', descricao: 'Exibe espaco total e disponivel em todos os discos', codigo: 'wmic logicaldisk get caption,size,freespace' },
                { id: '14', title: 'Ver Informacoes do Sistema', categoria: 'sistema', tipo: 'cmd', tags: 'sistema, info, hardware, OS', descricao: 'Exibe informacoes completas do sistema operacional e hardware', codigo: 'systeminfo' },
                { id: '15', title: 'Reiniciar Computador', categoria: 'sistema', tipo: 'cmd', tags: 'reiniciar, shutdown, sistema', descricao: 'Reinicia o computador imediatamente', codigo: 'shutdown /r /t 0' },
                { id: '16', title: 'Desligar Computador', categoria: 'sistema', tipo: 'cmd', tags: 'desligar, shutdown, sistema', descricao: 'Desliga o computador imediatamente', codigo: 'shutdown /s /t 0' },
                { id: '17', title: 'Reparar Disco com DISM', categoria: 'sistema', tipo: 'cmd', tags: 'dism, reparo, windows image', descricao: 'Repara a imagem do Windows com DISM (executar como Admin)', codigo: 'DISM /Online /Cleanup-Image /RestoreHealth' },
                { id: '18', title: 'Limpar Arquivos Temporarios', categoria: 'sistema', tipo: 'cmd', tags: 'temp, limpeza, disco, cache', descricao: 'Remove todos os arquivos da pasta temporaria do usuario', codigo: 'del /q /f /s %temp%\*' },
                { id: '19', title: 'Ver Usuarios Logados', categoria: 'sistema', tipo: 'cmd', tags: 'usuarios, sessao, logon', descricao: 'Lista todos os usuarios com sessao ativa no sistema', codigo: 'query user' },
                { id: '20', title: 'Verificar Versao do Windows', categoria: 'sistema', tipo: 'cmd', tags: 'versao, windows, OS', descricao: 'Exibe a versao exata do Windows instalado', codigo: 'winver' },
                { id: '21', title: 'Listar Processos por Memoria', categoria: 'sistema', tipo: 'powershell', tags: 'processos, memoria, sistema, desempenho', descricao: 'Lista os 10 processos que mais consomem memoria RAM', codigo: 'Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, Id, WS, CPU' },
                { id: '22', title: 'Ver Uso de CPU e RAM', categoria: 'sistema', tipo: 'powershell', tags: 'cpu, ram, memoria, desempenho', descricao: 'Exibe percentual de uso atual de CPU e memoria', codigo: '$cpu = (Get-WmiObject Win32_Processor).LoadPercentage\n$ram = Get-WmiObject Win32_OperatingSystem\n$usedRAM = [math]::Round(($ram.TotalVisibleMemorySize - $ram.FreePhysicalMemory)/1MB, 2)\n$totalRAM = [math]::Round($ram.TotalVisibleMemorySize/1MB, 2)\nWrite-Host "CPU: $cpu%"\nWrite-Host "RAM usada: $usedRAM GB de $totalRAM GB"' },
                { id: '23', title: 'Listar Programas Instalados', categoria: 'sistema', tipo: 'powershell', tags: 'programas, instalados, inventario, software', descricao: 'Lista todos os programas instalados com versao e fabricante', codigo: 'Get-ItemProperty HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Select-Object DisplayName, DisplayVersion, Publisher | Sort-Object DisplayName | Format-Table -AutoSize' },
                { id: '24', title: 'Reiniciar Servico do Windows', categoria: 'sistema', tipo: 'powershell', tags: 'servico, reiniciar, windows service', descricao: 'Reinicia um servico especifico do Windows (edite o nome)', codigo: '$servico = "Spooler"\nRestart-Service -Name $servico -Force\nWrite-Host "Servico $servico reiniciado com sucesso!"' },
                { id: '25', title: 'Ver Log de Eventos de Erros', categoria: 'sistema', tipo: 'powershell', tags: 'log, eventos, erros, sistema, auditoria', descricao: 'Exibe os ultimos 20 erros criticos do log do sistema', codigo: 'Get-EventLog -LogName System -EntryType Error -Newest 20 | Format-Table TimeGenerated, Source, Message -AutoSize' },
                { id: '26', title: 'Listar Discos e Particoes', categoria: 'sistema', tipo: 'powershell', tags: 'disco, particao, storage, hardware', descricao: 'Lista todos os discos fisicos e particoes do sistema', codigo: 'Get-Disk | Format-Table Number, FriendlyName, Size, HealthStatus\nGet-Partition | Format-Table DiskNumber, PartitionNumber, Size, DriveLetter' },
                { id: '27', title: 'Reiniciar Spooler de Impressao', categoria: 'impressora', tipo: 'cmd', tags: 'spooler, impressora, reiniciar, fila, travamento', descricao: 'Para e reinicia o spooler para resolver filas de impressao travadas', codigo: 'net stop spooler\ndel /Q /F /S "%systemroot%\\System32\\spool\\PRINTERS\\*.*"\nnet start spooler\necho Spooler reiniciado!' },
                { id: '28', title: 'Listar Impressoras Instaladas', categoria: 'impressora', tipo: 'powershell', tags: 'impressoras, listar, inventario, drivers', descricao: 'Lista todas as impressoras instaladas e seus status', codigo: 'Get-Printer | Select-Object Name, DriverName, PortName, PrinterStatus | Format-Table -AutoSize' },
                { id: '29', title: 'Definir Impressora Padrao', categoria: 'impressora', tipo: 'powershell', tags: 'impressora, padrao, configuracao', descricao: 'Define uma impressora como padrao (edite o nome)', codigo: '$impressora = "Nome da Impressora"\n(New-Object -ComObject WScript.Network).SetDefaultPrinter($impressora)\nWrite-Host "Impressora padrao definida: $impressora"' },
                { id: '30', title: 'Instalar Impressora de Rede', categoria: 'impressora', tipo: 'batch', tags: 'impressora, rede, driver, instalar, UNC', descricao: 'Conecta e instala impressora compartilhada via caminho de rede UNC', codigo: '@echo off\nset IMPRESSORA=\\\\\\\\servidor\\\\NomeImpressora\necho Instalando impressora %IMPRESSORA%...\nrundll32 printui.dll,PrintUIEntry /in /n %IMPRESSORA%\necho Instalacao concluida!\npause' }
            ];
        }

        if (AppState.services.length === 0) {
            AppState.services = [
                { id: '1', title: 'Manutenção Preventiva - PC Financeiro', status: 'completed', cliente_setor: 'Setor Financeiro', prioridade: 'media', data_servico: new Date().toISOString().split('T')[0], descricao: 'Realizar manutenção preventiva no computador do setor financeiro.', relatorio: 'Limpeza física realizada com sucesso. Troca de pasta térmica. Sistema atualizado.' },
                { id: '2', title: 'Instalação de Impressora de Rede', status: 'pending', cliente_setor: 'Recursos Humanos', prioridade: 'alta', data_servico: new Date().toISOString().split('T')[0], descricao: 'Instalar e configurar impressora de rede no setor de RH.', relatorio: '' }
            ];
        }

        StorageManager.save();
    }
};

// ==========================================
// NAVEGAÇÃO
// ==========================================
const Navigation = {
    init() {
        this.setupEventListeners();
    },

    setupEventListeners() {
        document.querySelectorAll('.nav-item[data-tab]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.dataset.tab;
                this.switchTab(tabId);
            });
        });

        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                Modal.close(btn.dataset.close);
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    Modal.closeAll();
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                Modal.closeAll();
            }
        });
    },

    async switchTab(tabId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.tab === tabId);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetTab = document.getElementById(tabId + '-tab');
        if (targetTab) {
            targetTab.classList.add('active');
        }

        switch (tabId) {
            case 'dashboard':
                await Dashboard.update();
                await ActivityLogger.renderInventory();
                await ActivityLogger.renderServices();
                break;
            case 'inventory':
                await Inventory.render();
                break;
            case 'snippets':
                await Snippets.render();
                break;
            case 'services':
                await Services.render();
                break;
        }
    }
};

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de login
    LoginManager.init();
});