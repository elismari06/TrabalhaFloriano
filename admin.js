// admin.js - DASHBOARD MODERNO + SEÇÕES FUNCIONAIS
const API_URL = 'http://localhost:3000';

// Estado global
let vagaEditando = null;
let usuarioEditando = null;

// ==================== FUNÇÕES PRINCIPAIS ====================
function showModule(moduleName, element) {
    console.log(`📂 Carregando módulo: ${moduleName}`);
    
    // Esconde todos os módulos
    document.querySelectorAll('.module-section').forEach(module => {
        module.classList.add('hidden');
    });
    
    // Remove active de todos os links
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mostra o módulo selecionado
    document.getElementById(moduleName + 'Module').classList.remove('hidden');
    element.classList.add('active');
    
    // Carrega os dados do módulo
    loadModuleData(moduleName);
}

function loadModuleData(moduleName) {
    console.log(`🔄 Carregando dados do módulo: ${moduleName}`);
    switch(moduleName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'vagas':
            loadVagasData();
            break;
        case 'usuarios':
            loadUsuariosData();
            break;
    }
}

// ==================== DASHBOARD MODERNO ====================
async function loadDashboardData() {
    console.log('📊 Carregando dashboard moderno...');
    try {
        const [vagasResponse, usuariosResponse] = await Promise.all([
            fetch(`${API_URL}/vagas`),
            fetch(`${API_URL}/usuarios`)
        ]);
        
        if (!vagasResponse.ok) throw new Error('Erro ao buscar vagas');
        if (!usuariosResponse.ok) throw new Error('Erro ao buscar usuários');
        
        const vagas = await vagasResponse.json();
        const usuarios = await usuariosResponse.json();
        
        // Estatísticas
        const totalVagas = vagas.length;
        const vagasPendentes = vagas.filter(v => v.status === 'pendente').length;
        const vagasAprovadas = vagas.filter(v => v.status === 'aprovada').length;
        const totalContratantes = usuarios.filter(u => u.role === 'contratante' && u.ativo).length;
        const totalColaboradores = usuarios.filter(u => u.role === 'colaborador' && u.ativo).length;
        const usuariosAtivos = usuarios.filter(u => u.ativo).length;
        
        // Vagas recentes (últimas 5)
        const vagasRecentes = vagas
            .sort((a, b) => new Date(b.date || b.dataCriacao) - new Date(a.date || a.dataCriacao))
            .slice(0, 5);
        
        // Usuários recentes (últimos 5)
        const usuariosRecentes = usuarios
            .sort((a, b) => new Date(b.dataCadastro || b.dataCriacao) - new Date(a.dataCadastro || a.dataCriacao))
            .slice(0, 5);
        
        // Renderiza o dashboard moderno
        renderDashboardModerno({
            totalVagas,
            vagasPendentes,
            vagasAprovadas,
            totalContratantes,
            totalColaboradores,
            usuariosAtivos,
            vagasRecentes,
            usuariosRecentes,
            vagas,
            usuarios
        });
        
        console.log('✅ Dashboard moderno carregado');
    } catch (error) {
        console.error('❌ Erro no dashboard:', error);
        renderDashboardError();
    }
}

function renderDashboardModerno(data) {
    const dashboardModule = document.getElementById('dashboardModule');
    
    dashboardModule.innerHTML = `
        <div class="dashboard-modern">
            <!-- Header do Dashboard -->
            <div class="dashboard-header">
                <h3><i class="fas fa-tachometer-alt"></i> Dashboard - Visão Geral</h3>
                <p>Estatísticas e atividades recentes do sistema</p>
            </div>
            
            <!-- Cards de Estatísticas -->
            <div class="stats-grid">
                <!-- Total de Vagas -->
                <div class="stat-card primary">
                    <div class="stat-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Total de Vagas</h4>
                        <div class="stat-number">${data.totalVagas}</div>
                        <div class="stat-trend">
                            <span class="trend-up">${data.vagasAprovadas} aprovadas</span>
                        </div>
                    </div>
                </div>
                
                <!-- Vagas Pendentes -->
                <div class="stat-card warning">
                    <div class="stat-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Pendentes</h4>
                        <div class="stat-number">${data.vagasPendentes}</div>
                        <div class="stat-trend">
                            <span class="trend-warning">Aguardando aprovação</span>
                        </div>
                    </div>
                </div>
                
                <!-- Contratantes -->
                <div class="stat-card info">
                    <div class="stat-icon">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Contratantes</h4>
                        <div class="stat-number">${data.totalContratantes}</div>
                        <div class="stat-trend">
                            <span class="trend-up">Empresas ativas</span>
                        </div>
                    </div>
                </div>
                
                <!-- Colaboradores -->
                <div class="stat-card success">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <h4>Colaboradores</h4>
                        <div class="stat-number">${data.totalColaboradores}</div>
                        <div class="stat-trend">
                            <span class="trend-up">Candidatos ativos</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Grid Principal -->
            <div class="dashboard-grid">
                <!-- Vagas Recentes -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h4><i class="fas fa-list-alt"></i> Vagas Recentes</h4>
                        <span class="badge">${data.vagasRecentes.length}</span>
                    </div>
                    <div class="card-content">
                        ${data.vagasRecentes.length > 0 ? `
                            <div class="recent-list">
                                ${data.vagasRecentes.map(vaga => `
                                    <div class="recent-item">
                                        <div class="item-main">
                                            <strong>${vaga.title || 'Sem título'}</strong>
                                            <span class="status-badge ${vaga.status === 'aprovada' ? 'status-aprovada' : 'status-pendente'}">
                                                ${vaga.status === 'aprovada' ? 'Aprovada' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div class="item-meta">
                                            <span><i class="fas fa-building"></i> ${vaga.empresa || 'N/I'}</span>
                                            <span><i class="fas fa-calendar"></i> ${vaga.date || 'Data não informada'}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-inbox"></i>
                                <p>Nenhuma vaga recente</p>
                            </div>
                        `}
                    </div>
                    <div class="card-footer">
                        <button onclick="showModule('vagas', this)" class="btn-link">
                            <i class="fas fa-arrow-right"></i> Ver todas as vagas
                        </button>
                    </div>
                </div>
                
                <!-- Usuários Recentes -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h4><i class="fas fa-user-plus"></i> Usuários Recentes</h4>
                        <span class="badge">${data.usuariosRecentes.length}</span>
                    </div>
                    <div class="card-content">
                        ${data.usuariosRecentes.length > 0 ? `
                            <div class="recent-list">
                                ${data.usuariosRecentes.map(usuario => `
                                    <div class="recent-item">
                                        <div class="item-main">
                                            <strong>${usuario.nome || usuario.email.split('@')[0]}</strong>
                                            <span class="role-badge ${usuario.role}">
                                                ${usuario.role === 'admin' ? 'Admin' : usuario.role === 'contratante' ? 'Contratante' : 'Colaborador'}
                                            </span>
                                        </div>
                                        <div class="item-meta">
                                            <span><i class="fas fa-envelope"></i> ${usuario.email}</span>
                                            <span class="status-indicator ${usuario.ativo ? 'active' : 'inactive'}">
                                                ${usuario.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="empty-state">
                                <i class="fas fa-users"></i>
                                <p>Nenhum usuário recente</p>
                            </div>
                        `}
                    </div>
                    <div class="card-footer">
                        <button onclick="showModule('usuarios', this)" class="btn-link">
                            <i class="fas fa-arrow-right"></i> Gerenciar usuários
                        </button>
                    </div>
                </div>
                
                <!-- Estatísticas Rápidas -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h4><i class="fas fa-chart-pie"></i> Estatísticas Rápidas</h4>
                    </div>
                    <div class="card-content">
                        <div class="stats-mini">
                            <div class="mini-stat">
                                <div class="mini-icon success">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="mini-content">
                                    <span class="mini-value">${data.vagasAprovadas}</span>
                                    <span class="mini-label">Vagas Aprovadas</span>
                                </div>
                            </div>
                            <div class="mini-stat">
                                <div class="mini-icon warning">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="mini-content">
                                    <span class="mini-value">${data.vagasPendentes}</span>
                                    <span class="mini-label">Aguardando</span>
                                </div>
                            </div>
                            <div class="mini-stat">
                                <div class="mini-icon info">
                                    <i class="fas fa-user-check"></i>
                                </div>
                                <div class="mini-content">
                                    <span class="mini-value">${data.usuariosAtivos}</span>
                                    <span class="mini-label">Usuários Ativos</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Gráfico de Distribuição -->
                        <div class="distribution-chart">
                            <h5>Distribuição de Vagas</h5>
                            <div class="chart-bars">
                                <div class="chart-bar">
                                    <div class="bar-label">Aprovadas</div>
                                    <div class="bar-container">
                                        <div class="bar-fill success" style="width: ${data.totalVagas > 0 ? (data.vagasAprovadas / data.totalVagas) * 100 : 0}%"></div>
                                    </div>
                                    <div class="bar-value">${data.vagasAprovadas}</div>
                                </div>
                                <div class="chart-bar">
                                    <div class="bar-label">Pendentes</div>
                                    <div class="bar-container">
                                        <div class="bar-fill warning" style="width: ${data.totalVagas > 0 ? (data.vagasPendentes / data.totalVagas) * 100 : 0}%"></div>
                                    </div>
                                    <div class="bar-value">${data.vagasPendentes}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Ações Rápidas -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h4><i class="fas fa-bolt"></i> Ações Rápidas</h4>
                    </div>
                    <div class="card-content">
                        <div class="quick-actions">
                            <button class="quick-action primary" onclick="adicionarVaga()">
                                <i class="fas fa-plus"></i>
                                <span>Nova Vaga</span>
                            </button>
                            <button class="quick-action success" onclick="showModule('vagas', this)">
                                <i class="fas fa-check-circle"></i>
                                <span>Aprovar Vagas</span>
                                ${data.vagasPendentes > 0 ? `<span class="action-badge">${data.vagasPendentes}</span>` : ''}
                            </button>
                            <button class="quick-action info" onclick="adicionarUsuario()">
                                <i class="fas fa-user-plus"></i>
                                <span>Novo Usuário</span>
                            </button>
                            <button class="quick-action warning" onclick="debugSistema()">
                                <i class="fas fa-chart-bar"></i>
                                <span>Relatório</span>
                            </button>
                        </div>
                        
                        <!-- Sistema Status -->
                        <div class="system-status">
                            <h5>Status do Sistema</h5>
                            <div class="status-item">
                                <i class="fas fa-database status-ok"></i>
                                <span>Backend Conectado</span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-server status-ok"></i>
                                <span>Sistema Online</span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-shield-alt status-ok"></i>
                                <span>Segurança Ativa</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderDashboardError() {
    const dashboardModule = document.getElementById('dashboardModule');
    dashboardModule.innerHTML = `
        <div class="dashboard-modern">
            <div class="dashboard-header">
                <h3><i class="fas fa-tachometer-alt"></i> Dashboard - Visão Geral</h3>
            </div>
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Erro ao carregar dados</h4>
                <p>Não foi possível conectar ao servidor. Verifique se o JSON Server está rodando.</p>
                <button onclick="loadDashboardData()" class="btn-retry">
                    <i class="fas fa-redo"></i> Tentar Novamente
                </button>
            </div>
        </div>
    `;
}

// ==================== GERENCIAR VAGAS ====================
async function loadVagasData() {
    console.log('📋 Carregando vagas...');
    try {
        const response = await fetch(`${API_URL}/vagas`);
        if (!response.ok) throw new Error('Erro ao buscar vagas');
        
        const vagas = await response.json();
        const tbody = document.getElementById('vagasAdminTable');
        tbody.innerHTML = '';
        
        console.log('📦 Vagas recebidas:', vagas);
        
        if (vagas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: #666;">Nenhuma vaga cadastrada</td></tr>';
            return;
        }
        
        // Ordena: pendentes primeiro
        vagas.sort((a, b) => {
            if (a.status === 'pendente' && b.status !== 'pendente') return -1;
            if (a.status !== 'pendente' && b.status === 'pendente') return 1;
            return 0;
        });
        
        vagas.forEach(vaga => {
            const status = vaga.status || 'pendente';
            const statusFormatado = status.charAt(0).toUpperCase() + status.slice(1);
            const isPendente = status === 'pendente';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vaga.id}</td>
                <td><strong>${vaga.title || vaga.titulo || 'Sem título'}</strong></td>
                <td>${vaga.empresa || 'Empresa não informada'}</td>
                <td>
                    <span class="status-badge ${status === 'aprovada' ? 'status-aprovada' : 'status-pendente'}">
                        ${statusFormatado}
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    ${isPendente ? 
                        `<button class="action-btn btn-approve" onclick="aprovarVaga(${vaga.id})" title="Aprovar Vaga">
                            <i class="fas fa-check"></i> Aprovar
                        </button>` : ''
                    }
                    <button class="action-btn btn-edit" onclick="editarVaga(${vaga.id})" title="Editar Vaga">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn btn-delete" onclick="excluirVaga(${vaga.id})" title="Excluir Vaga">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ ${vagas.length} vagas carregadas`);
    } catch (error) {
        console.error('❌ Erro ao carregar vagas:', error);
        document.getElementById('vagasAdminTable').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: red; padding: 30px;">❌ Erro ao carregar vagas. Verifique se o JSON Server está rodando.</td></tr>';
    }
}

// ==================== FUNÇÕES DE VAGAS ====================
async function aprovarVaga(id) {
    console.log(`✅ Tentando aprovar vaga ID: ${id}`);
    
    if (!confirm('Deseja aprovar esta vaga?\n\nEla ficará visível no mural público.')) {
        console.log('❌ Aprovação cancelada pelo usuário');
        return;
    }
    
    try {
        // Busca a vaga atual primeiro
        console.log(`🔍 Buscando vaga ${id}...`);
        const responseGet = await fetch(`${API_URL}/vagas/${id}`);
        if (!responseGet.ok) throw new Error('Erro ao buscar vaga');
        
        const vagaAtual = await responseGet.json();
        console.log('📦 Vaga encontrada:', vagaAtual);
        
        // Atualiza apenas o status
        console.log(`🔄 Atualizando status para "aprovada"...`);
        const response = await fetch(`${API_URL}/vagas/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: 'aprovada'
            })
        });
        
        if (!response.ok) throw new Error('Erro ao aprovar vaga');
        
        console.log('✅ Vaga aprovada com sucesso');
        alert(`🎉 Vaga "${vagaAtual.title}" aprovada com sucesso!\n\nAgora ela está visível no mural público.`);
        
        // Recarrega os dados
        loadVagasData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao aprovar vaga:', error);
        alert('❌ Erro ao aprovar vaga. Verifique se o JSON Server está rodando.');
    }
}

async function excluirVaga(id) {
    console.log(`🗑️ Excluindo vaga ID: ${id}`);
    
    if (!confirm('⚠️ TEM CERTEZA que deseja EXCLUIR esta vaga?\n\nEsta ação não pode ser desfeita.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vagas/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao excluir vaga');
        
        alert('✅ Vaga excluída com sucesso!');
        loadVagasData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao excluir vaga:', error);
        alert('❌ Erro ao excluir vaga. Verifique se o JSON Server está rodando.');
    }
}

async function editarVaga(id) {
    console.log(`✏️ Editando vaga ID: ${id}`);
    
    try {
        const response = await fetch(`${API_URL}/vagas/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar vaga');
        
        vagaEditando = await response.json();
        abrirFormularioVaga();
        
    } catch (error) {
        console.error('❌ Erro ao carregar vaga para edição:', error);
        alert('❌ Erro ao carregar vaga para edição.');
    }
}

// ==================== ADICIONAR VAGA ====================
function adicionarVaga() {
    console.log('📝 Abrindo formulário para nova vaga');
    vagaEditando = null;
    abrirFormularioVaga();
}

function abrirFormularioVaga() {
    const isEditando = !!vagaEditando;
    const titulo = vagaEditando?.title || vagaEditando?.titulo || '';
    const empresa = vagaEditando?.empresa || '';
    const local = vagaEditando?.local || '';
    const descricao = vagaEditando?.description || '';
    const status = vagaEditando?.status || 'pendente';
    
    const formHTML = `
        <div id="formModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                <h3 style="color: #1a4369; margin-bottom: 20px;">
                    <i class="fas ${isEditando ? 'fa-edit' : 'fa-plus'}"></i>
                    ${isEditando ? 'Editar Vaga' : 'Adicionar Nova Vaga'}
                </h3>
                
                <form id="modalForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Título da Vaga *</label>
                        <input type="text" id="vagaTitulo" required value="${titulo}"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;"
                               placeholder="Ex: Desenvolvedor Front-end">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Empresa *</label>
                        <input type="text" id="vagaEmpresa" required value="${empresa}"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;"
                               placeholder="Ex: Tech Solutions">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Localização *</label>
                        <input type="text" id="vagaLocal" required value="${local}"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;"
                               placeholder="Ex: Floriano - PI">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Descrição *</label>
                        <textarea id="vagaDescricao" required 
                                  style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px; height: 100px; resize: vertical;"
                                  placeholder="Descreva as responsabilidades e requisitos...">${descricao}</textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Status</label>
                        <select id="vagaStatus" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;">
                            <option value="pendente" ${status === 'pendente' ? 'selected' : ''}>⏳ Pendente</option>
                            <option value="aprovada" ${status === 'aprovada' ? 'selected' : ''}>✅ Aprovada</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 25px;">
                        <button type="submit" class="action-btn btn-approve" style="flex: 1; padding: 12px;">
                            <i class="fas fa-save"></i> ${isEditando ? 'Atualizar' : 'Salvar'}
                        </button>
                        <button type="button" onclick="fecharFormulario()" class="action-btn btn-delete" style="flex: 1; padding: 12px;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    abrirModal(formHTML, salvarVaga);
}

async function salvarVaga() {
    const titulo = document.getElementById('vagaTitulo').value.trim();
    const empresa = document.getElementById('vagaEmpresa').value.trim();
    const local = document.getElementById('vagaLocal').value.trim();
    const descricao = document.getElementById('vagaDescricao').value.trim();
    const status = document.getElementById('vagaStatus').value;

    if (!titulo || !empresa || !local || !descricao) {
        alert('❌ Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    try {
        if (vagaEditando) {
            const statusFinal = vagaEditando.status === 'aprovada' ? 'aprovada' : status;
            const vagaAtualizada = {
                ...vagaEditando,
                title: titulo,
                empresa: empresa,
                local: local,
                description: descricao,
                status: statusFinal
            };
            
            const response = await fetch(`${API_URL}/vagas/${vagaEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vagaAtualizada)
            });
            
            if (!response.ok) throw new Error('Erro ao atualizar vaga');
            
            alert('✅ Vaga atualizada com sucesso!');
            
        } else {
            const novaVaga = {
                title: titulo,
                empresa: empresa,
                local: local,
                description: descricao,
                status: status,
                date: new Date().toLocaleDateString('pt-BR'),
                isBico: false,
                contact: "Contato via perfil"
            };
            
            const response = await fetch(`${API_URL}/vagas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novaVaga)
            });
            
            if (!response.ok) throw new Error('Erro ao criar vaga');
            
            alert('✅ Vaga adicionada com sucesso!');
        }
        
        fecharFormulario();
        loadVagasData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao salvar vaga:', error);
        alert('❌ Erro ao salvar vaga. Verifique se o JSON Server está rodando.');
    }
}

// ==================== GERENCIAR USUÁRIOS ====================
async function loadUsuariosData() {
    console.log('👥 Carregando usuários...');
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        if (!response.ok) throw new Error('Erro ao buscar usuários');
        
        const usuarios = await response.json();
        const tbody = document.getElementById('usersAdminTable');
        tbody.innerHTML = '';
        
        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #666;">
                        <i class="fas fa-users" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                        Nenhum usuário cadastrado
                    </td>
                </tr>
            `;
            return;
        }
        
        usuarios.forEach(usuario => {
            const roleText = usuario.role === 'admin' ? 'Administrador' : 
                           usuario.role === 'contratante' ? 'Contratante' : 'Colaborador';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>
                    <strong>${usuario.email}</strong>
                    ${usuario.nome ? `<br><small>${usuario.nome}</small>` : ''}
                </td>
                <td>
                    <span class="status-badge ${usuario.role === 'admin' ? 'status-aprovada' : 'status-pendente'}">
                        ${roleText}
                    </span>
                </td>
                <td>
                    <span class="status-badge ${usuario.ativo ? 'status-aprovada' : 'status-pendente'}">
                        ${usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td style="white-space: nowrap;">
                    <button class="action-btn btn-edit" onclick="editarUsuario(${usuario.id})" title="Editar Usuário">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="action-btn ${usuario.ativo ? 'btn-delete' : 'btn-approve'}" 
                            onclick="${usuario.ativo ? 'desativarUsuario' : 'ativarUsuario'}(${usuario.id})" 
                            title="${usuario.ativo ? 'Desativar Usuário' : 'Ativar Usuário'}">
                        <i class="fas ${usuario.ativo ? 'fa-ban' : 'fa-check'}"></i> 
                        ${usuario.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    ${usuario.role !== 'admin' ? `
                        <button class="action-btn btn-delete" onclick="excluirUsuario(${usuario.id})" title="Excluir Usuário" style="background: #dc3545;">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ ${usuarios.length} usuários carregados`);
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
        document.getElementById('usersAdminTable').innerHTML = 
            '<tr><td colspan="5" style="text-align: center; color: red; padding: 30px;">❌ Erro ao carregar usuários. Verifique se o JSON Server está rodando.</td></tr>';
    }
}

// ==================== FUNÇÕES DE USUÁRIOS ====================
async function editarUsuario(id) {
    console.log(`✏️ Editando usuário ID: ${id}`);
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`);
        if (!response.ok) throw new Error('Erro ao buscar usuário');
        
        usuarioEditando = await response.json();
        abrirFormularioUsuario();
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuário para edição:', error);
        alert('❌ Erro ao carregar usuário para edição.');
    }
}

async function ativarUsuario(id) {
    console.log(`✅ Ativando usuário ID: ${id}`);
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: true })
        });
        
        if (!response.ok) throw new Error('Erro ao ativar usuário');
        
        alert('✅ Usuário ativado com sucesso!');
        loadUsuariosData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao ativar usuário:', error);
        alert('❌ Erro ao ativar usuário.');
    }
}

async function desativarUsuario(id) {
    console.log(`❌ Desativando usuário ID: ${id}`);
    
    if (!confirm('Deseja desativar este usuário?\n\nEle não poderá fazer login enquanto estiver desativado.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: false })
        });
        
        if (!response.ok) throw new Error('Erro ao desativar usuário');
        
        alert('✅ Usuário desativado com sucesso!');
        loadUsuariosData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao desativar usuário:', error);
        alert('❌ Erro ao desativar usuário.');
    }
}

async function excluirUsuario(id) {
    console.log(`🗑️ Excluindo usuário ID: ${id}`);
    
    if (!confirm('⚠️ TEM CERTEZA que deseja EXCLUIR este usuário?\n\nTodas as vagas associadas a ele serão mantidas, mas o usuário será removido permanentemente.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, { method: 'DELETE' });
        
        if (!response.ok) throw new Error('Erro ao excluir usuário');
        
        alert('✅ Usuário excluído com sucesso!');
        loadUsuariosData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao excluir usuário:', error);
        alert('❌ Erro ao excluir usuário.');
    }
}

function adicionarUsuario() {
    console.log('👤 Adicionando novo usuário');
    usuarioEditando = null;
    abrirFormularioUsuario();
}

function abrirFormularioUsuario() {
    const isEditando = !!usuarioEditando;
    const email = usuarioEditando?.email || '';
    const nome = usuarioEditando?.nome || '';
    const role = usuarioEditando?.role || 'colaborador';
    const ativo = usuarioEditando?.ativo !== false;
    
    const formHTML = `
        <div id="formModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;">
            <div style="background: white; padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto;">
                <h3 style="color: #1a4369; margin-bottom: 20px;">
                    <i class="fas ${isEditando ? 'fa-edit' : 'fa-user-plus'}"></i>
                    ${isEditando ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
                </h3>
                
                <form id="modalForm">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email *</label>
                        <input type="email" id="usuarioEmail" required value="${email}"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;"
                               placeholder="exemplo@email.com" ${isEditando ? 'readonly' : ''}>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome</label>
                        <input type="text" id="usuarioNome" value="${nome}"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;"
                               placeholder="Nome completo">
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Tipo de Usuário *</label>
                        <select id="usuarioRole" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;">
                            <option value="colaborador" ${role === 'colaborador' ? 'selected' : ''}>👤 Colaborador</option>
                            <option value="contratante" ${role === 'contratante' ? 'selected' : ''}>🏢 Contratante</option>
                            <option value="admin" ${role === 'admin' ? 'selected' : ''}>🔧 Administrador</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Status</label>
                        <select id="usuarioAtivo" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 6px;">
                            <option value="true" ${ativo ? 'selected' : ''}>✅ Ativo</option>
                            <option value="false" ${!ativo ? 'selected' : ''}>❌ Inativo</option>
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 25px;">
                        <button type="submit" class="action-btn btn-approve" style="flex: 1; padding: 12px;">
                            <i class="fas fa-save"></i> ${isEditando ? 'Atualizar' : 'Salvar'}
                        </button>
                        <button type="button" onclick="fecharFormulario()" class="action-btn btn-delete" style="flex: 1; padding: 12px;">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    abrirModal(formHTML, salvarUsuario);
}

async function salvarUsuario() {
    const email = document.getElementById('usuarioEmail').value.trim();
    const nome = document.getElementById('usuarioNome').value.trim();
    const role = document.getElementById('usuarioRole').value;
    const ativo = document.getElementById('usuarioAtivo').value === 'true';

    if (!email) {
        alert('❌ Por favor, informe o email.');
        return;
    }

    try {
        if (usuarioEditando) {
            const usuarioAtualizado = {
                ...usuarioEditando,
                nome: nome,
                role: role,
                ativo: ativo
            };
            
            const response = await fetch(`${API_URL}/usuarios/${usuarioEditando.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuarioAtualizado)
            });
            
            if (!response.ok) throw new Error('Erro ao atualizar usuário');
            
            alert('✅ Usuário atualizado com sucesso!');
            
        } else {
            // Verifica se usuário já existe
            const checkResponse = await fetch(`${API_URL}/usuarios?email=${email}`);
            const usuariosExistentes = await checkResponse.json();
            
            if (usuariosExistentes.length > 0) {
                alert('❌ Já existe um usuário com este email.');
                return;
            }
            
            const novoUsuario = {
                email: email,
                nome: nome,
                role: role,
                ativo: ativo,
                dataCadastro: new Date().toISOString().split('T')[0]
            };
            
            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoUsuario)
            });
            
            if (!response.ok) throw new Error('Erro ao criar usuário');
            
            alert('✅ Usuário adicionada com sucesso!');
        }
        
        fecharFormulario();
        loadUsuariosData();
        loadDashboardData();
        
    } catch (error) {
        console.error('❌ Erro ao salvar usuário:', error);
        alert('❌ Erro ao salvar usuário. Verifique se o JSON Server está rodando.');
    }
}

// ==================== FUNÇÕES AUXILIARES ====================
function abrirModal(html, submitHandler) {
    // Remove modal existente se houver
    const modalExistente = document.getElementById('formModal');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Adiciona event listener ao formulário
    document.getElementById('modalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitHandler();
    });
}

function fecharFormulario() {
    const modal = document.getElementById('formModal');
    if (modal) {
        modal.remove();
    }
    vagaEditando = null;
    usuarioEditando = null;
}

function adminLogout() {
    if (confirm('Deseja sair do painel administrativo?')) {
        window.location.href = 'index.html';
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Painel Admin Moderno Iniciado');
    
    // Carrega o dashboard inicial
    loadDashboardData();
    
    // Adiciona botão de adicionar usuário
    const usuariosModule = document.getElementById('usuariosModule');
    const btnAdicionarUsuario = document.createElement('button');
    btnAdicionarUsuario.className = 'action-btn btn-approve';
    btnAdicionarUsuario.style.marginBottom = '20px';
    btnAdicionarUsuario.style.marginLeft = '10px';
    btnAdicionarUsuario.innerHTML = '<i class="fas fa-user-plus"></i> Adicionar Usuário';
    btnAdicionarUsuario.onclick = adicionarUsuario;
    
    const h3Usuarios = usuariosModule.querySelector('h3');
    h3Usuarios.appendChild(btnAdicionarUsuario);
});

// ==================== FUNÇÕES DE DEBUG ====================
window.debugSistema = async function() {
    console.group('🔧 DEBUG DO SISTEMA');
    try {
        const [vagas, usuarios] = await Promise.all([
            fetch(`${API_URL}/vagas`).then(r => r.json()),
            fetch(`${API_URL}/usuarios`).then(r => r.json())
        ]);
        
        console.log('📊 Vagas no sistema:', vagas);
        console.log('👥 Usuários no sistema:', usuarios);
        
        const vagasPendentes = vagas.filter(v => v.status === 'pendente');
        const vagasAprovadas = vagas.filter(v => v.status === 'aprovada');
        
        console.log(`📈 Estatísticas: ${vagas.length} vagas total, ${vagasPendentes.length} pendentes, ${vagasAprovadas.length} aprovadas`);
        console.log(`👥 ${usuarios.length} usuários total`);
        
        alert(`🔍 DEBUG DO SISTEMA:\n\nVagas: ${vagas.length}\n- Pendentes: ${vagasPendentes.length}\n- Aprovadas: ${vagasAprovadas.length}\n\nUsuários: ${usuarios.length}\n\nVerifique o console para detalhes.`);
        
    } catch (error) {
        console.error('❌ Erro no debug:', error);
        alert('❌ Erro ao conectar com o backend. Verifique se o JSON Server está rodando.');
    }
    console.groupEnd();
};