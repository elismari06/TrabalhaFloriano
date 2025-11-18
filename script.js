// script.js - Portal Trabalha Floriano (Integrado com JSON Server)

const API_URL = 'http://localhost:3000'; // ENDPOINT DO SEU BACKEND SIMULADO (JSON SERVER)

// Estado global de autenticação (Simulação)
let currentUser = {
    isLoggedIn: false,
    role: null // 'colaborador', 'contratante', 'admin'
};

// -----------------------------------------------------------------
// 1. Funções de Comunicação com a API (fetch)
// -----------------------------------------------------------------

/**
 * Busca todas as vagas ativas no backend (status=aprovada).
 * @returns {Array} - Lista de vagas.
 */
async function fetchVagas() {
    try {
        // Busca apenas vagas com status 'aprovada' para o mural público
        const response = await fetch(`${API_URL}/vagas?status=aprovada`);
        if (!response.ok) {
            console.error(`Erro ao buscar vagas: ${response.status}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error("Erro na conexão com o backend (JSON Server). Certifique-se de que está rodando na porta 3000.", error);
        return [];
    }
}


// -----------------------------------------------------------------
// 2. Funções de Renderização do Mural
// -----------------------------------------------------------------

/**
 * Cria o HTML para um card de vaga
 */
function createJobCardHTML(vaga) {
    const typeLabel = vaga.isBico ? 
        '<span class="job-type bico-tag"><i class="fas fa-handshake"></i> Bico</span>' : 
        '<span class="job-type emprego-tag"><i class="fas fa-user-tie"></i> Emprego</span>';

    // Ação de contato é simulada
    const applyAction = `alert('Entre em contato com a empresa: ${vaga.contact}')`;

    // Botão de Candidatar-se
    let buttonText = '<i class="fas fa-paper-plane"></i> Candidatar / Ver Contato';
    let buttonAction = applyAction;

    // Se for contratante logado, não pode se candidatar
    if (currentUser.isLoggedIn && currentUser.role === 'contratante') {
        buttonText = '<i class="fas fa-eye"></i> Visualizar Detalhes';
        buttonAction = `alert('Você está logado como Contratante. Use o Painel Admin para gerenciar.');`;
    }
    
    // Se não estiver logado
    if (!currentUser.isLoggedIn) {
        buttonText = '<i class="fas fa-lock"></i> Login para Candidatar';
        // Simula o direcionamento para a tela de login
        buttonAction = `window.location.href = 'cadastro.html'`; 
    }

    return `
        <div class="job-card" data-area="${vaga.area}" data-vaga-id="${vaga.id}">
            <div class="card-header">
                <h3>${vaga.title}</h3>
                ${typeLabel}
            </div>
            <div class="job-details">
                <p class="job-company"><i class="fas fa-building"></i> ${vaga.empresa}</p>
                <p class="job-location"><i class="fas fa-map-marker-alt"></i> ${vaga.local}</p>
                <p class="job-description">${vaga.description}</p>
                <p class="job-date"><i class="fas fa-clock"></i> ${vaga.date}</p>
            </div>
            <button class="btn-apply" onclick="${buttonAction}">
                ${buttonText}
            </button>
        </div>
    `;
}

/**
 * Renderiza a lista de vagas no DOM (busca da API e aplica filtro local).
 */
async function renderVagas(searchTerm = '') {
    const listaVagasElement = document.getElementById('listaVagas');
    // feedback de carregamento
    listaVagasElement.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 30px;">Carregando vagas...</p>'; 

    let vagas = await fetchVagas();
    
    // Aplica o filtro local
    if (searchTerm.trim() !== '') {
        const lowerSearchTerm = searchTerm.toLowerCase();
        vagas = vagas.filter(vaga => {
            const fullText = `${vaga.title} ${vaga.area} ${vaga.empresa} ${vaga.description}`.toLowerCase();
            return fullText.includes(lowerSearchTerm);
        });
    }

    // Renderiza o resultado
    listaVagasElement.innerHTML = '';
    if (vagas.length === 0) {
        listaVagasElement.innerHTML = '<p style="text-align: center; color: var(--secondary-color); padding: 30px;">Nenhuma oportunidade encontrada ou o backend não está ativo.</p>';
        return;
    }

    vagas.forEach(vaga => {
        listaVagasElement.innerHTML += createJobCardHTML(vaga);
    });
}


// -----------------------------------------------------------------
// 3. FUNÇÃO DE FILTRAGEM (Chamada pelo onkeyup)
// -----------------------------------------------------------------

/**
 * Filtra as vagas com base no texto digitado na barra de busca.
 */
function filtrarVagas() {
    const searchInput = document.getElementById('searchInput');
    renderVagas(searchInput.value);
}


// -----------------------------------------------------------------
// 4. LÓGICA DE AUTENTICAÇÃO E BARRA LATERAL (AUTH-SIDEBAR)
// -----------------------------------------------------------------

const authSidebar = document.getElementById('authStatus');
const vagaFormSection = document.getElementById('vagaFormSection');

/**
 * Renderiza o conteúdo da barra lateral (Estado Logado)
 */
function renderAuthStatus(role) {
    currentUser.isLoggedIn = true;
    currentUser.role = role;
    
    authSidebar.innerHTML = ''; // Limpa o conteúdo

    let roleText = role.charAt(0).toUpperCase() + role.slice(1);
    
    authSidebar.innerHTML = `
        <h3>Bem-Vindo(a)!</h3>
        <p>Você está logado como **${roleText}**.</p>
        ${role === 'contratante' 
            ? '<button onclick="toggleVagaForm()" class="auth-button" style="background-color: var(--primary-color);"><i class="fas fa-plus-circle"></i> Cadastrar Nova Vaga</button>' 
            : '<p style="margin-top: 15px;">Use a lista abaixo para se candidatar às vagas.</p>'
        }
        <button onclick="logout()" class="auth-button secondary">
            <i class="fas fa-sign-out-alt"></i> Sair
        </button>
    `;
    
    // Exibe o formulário de vaga se for contratante
    vagaFormSection.classList.toggle('hidden', role !== 'contratante');
    
    // Garante que o mural de vagas reflita o estado de login (mudando o botão de candidatar)
    renderVagas(); 
}

/**
 * Simula a ação de deslogar.
 */
function logout() {
    currentUser.isLoggedIn = false;
    currentUser.role = null;
    alert("Você foi desconectado.");
    vagaFormSection.classList.add('hidden'); // Esconde o formulário de vaga
    // Redireciona para o login ou simplesmente recarrega a página
    window.location.href = 'index.html'; 
}


// -----------------------------------------------------------------
// 5. LÓGICA DE CADASTRO DE VAGA (Contratante)
// -----------------------------------------------------------------

/**
 * Cria o formulário de cadastro de vaga (Contratante)
 */
function createVagaForm() {
    const vagaFormSection = document.getElementById('vagaFormSection');
    vagaFormSection.innerHTML = `
        <h3>Cadastrar Nova Vaga</h3>
        <form id="vagaForm">
            <label for="vagaTitle">Título da Vaga</label>
            <input type="text" id="vagaTitle" required placeholder="Ex: Desenvolvedor Front-end Pleno">

            <label for="vagaArea">Área</label>
            <input type="text" id="vagaArea" required placeholder="Ex: Tecnologia, Administrativo, etc">

            <label for="vagaLocal">Localização</label>
            <input type="text" id="vagaLocal" required placeholder="Ex: Floriano - PI, Remoto, etc">
            
            <div style="margin: 15px 0;">
                <input type="checkbox" id="vagaIsBico">
                <label for="vagaIsBico" style="display: inline; font-weight: normal;">Esta vaga é um Bico / Serviço Avulso?</label>
            </div>

            <label for="vagaDescription">Descrição Detalhada</label>
            <textarea id="vagaDescription" required placeholder="Descreva os requisitos e responsabilidades..."></textarea>

            <button type="submit" style="background-color: var(--primary-color);">
                <i class="fas fa-plus"></i> Publicar Vaga
            </button>
        </form>
    `;
    // Anexa o manipulador de eventos
    document.getElementById('vagaForm').addEventListener('submit', handleVagaSubmit);
}

/**
 * Envia a nova vaga para o backend (JSON Server).
 */
async function createVaga(newVagaData) {
    try {
        const response = await fetch(`${API_URL}/vagas`, {
            method: 'POST', // Método POST para criar um novo recurso
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newVagaData)
        });
        
        if (!response.ok) throw new Error('Falha ao publicar vaga. Erro do servidor.');
        
        const vagaCriada = await response.json();
        
        if (vagaCriada.status === 'pendente') {
            alert(`Vaga "${vagaCriada.title}" enviada com sucesso! Ela está PENDENTE DE APROVAÇÃO pelo Administrador no Painel Admin.`);
        } else {
            alert(`Vaga "${vagaCriada.title}" publicada com sucesso!`);
        }
        
        document.getElementById('vagaForm').reset(); 
        toggleVagaForm(); // Esconde o formulário
        renderVagas(); // Recarrega o mural (que só mostrará a vaga se for aprovada no JSON)

    } catch (error) {
        console.error("Erro ao publicar vaga:", error);
        alert(`Erro ao publicar vaga. Verifique se o JSON Server está ativo. Detalhe: ${error.message}`);
    }
}

/**
 * Processa a submissão do formulário de vaga e chama a API.
 */
function handleVagaSubmit(e) {
    e.preventDefault();
    
    // Nota: O nome da empresa é simulado, mas você usaria o ID real do usuário logado.
    const empresaContratante = "Contratante Logado (Simulado)"; 
    
    const newVaga = {
        title: document.getElementById('vagaTitle').value,
        area: document.getElementById('vagaArea').value,
        empresa: empresaContratante, 
        description: document.getElementById('vagaDescription').value,
        local: document.getElementById('vagaLocal').value,
        date: `Publicado agora (${new Date().toLocaleDateString('pt-BR')})`,
        contact: "Contato via Perfil do Contratante", 
        isBico: document.getElementById('vagaIsBico').checked, 
        
        // Toda vaga nova entra como 'pendente'
        status: 'pendente' 
    };

    createVaga(newVaga);
}

/**
 * Alterna a visibilidade do formulário de vaga.
 */
function toggleVagaForm() {
    const isHidden = vagaFormSection.classList.contains('hidden');
    vagaFormSection.classList.toggle('hidden', !isHidden);
}


// -----------------------------------------------------------------
// 6. Funções de Segurança e Inicialização
// -----------------------------------------------------------------

/**
 * Checa o parâmetro 'logged' na URL (vindo do cadastro.html) e simula o login.
 * Também redireciona se o papel for 'admin'.
 */
function checkLoginStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('logged');
    
    if (role) {
        // Remove o parâmetro 'logged' da URL para limpar
        history.replaceState(null, '', window.location.pathname);
        
        // Acesso de Admin (prioridade)
        if (role === 'admin') {
            alert("Acesso de Administrador concedido. Redirecionando para o Painel.");
            window.location.href = 'admin.html';
            return true;
        }
        
        // Login de Colaborador ou Contratante
        renderAuthStatus(role);
    }
    return false;
}


// -----------------------------------------------------------------
// 7. Inicialização Principal
// -----------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cria o formulário de vaga no DOM (para ser exibido se for contratante)
    createVagaForm();
    
    // 2. Tenta verificar se há um status de login na URL e redireciona (se for admin)
    const isAdmin = checkLoginStatus();

    // 3. Se não for admin, carrega o mural (buscando da API)
    if (!isAdmin) {
        renderVagas();
    }
});