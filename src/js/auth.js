// Sistema de Autenticação

let currentUser = null;

// Elementos DOM
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userEmail = document.getElementById('userEmail');
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Mostrar/esconder modais
const showLogin = () => {
    loginModal.style.display = 'block';
    signupModal.style.display = 'none';
};

const showSignup = () => {
    signupModal.style.display = 'block';
    loginModal.style.display = 'none';
};

const hideModals = () => {
    loginModal.style.display = 'none';
    signupModal.style.display = 'none';
};

// Event listeners para os modais
document.getElementById('showSignup').addEventListener('click', (e) => {
    e.preventDefault();
    showSignup();
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
});

// Fechar modais
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', hideModals);
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal || e.target === signupModal) {
        hideModals();
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log('Login bem-sucedido!', data);
        hideModals();
        updateAuthUI(data.user);
    } catch (error) {
        alert('Erro ao fazer login: ' + error.message);
    }
});

// Signup
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        alert('Conta criada! Verifica o teu email para confirmares a conta.');
        hideModals();
        showLogin();
    } catch (error) {
        alert('Erro ao criar conta: ' + error.message);
    }
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        updateAuthUI(null);
    } catch (error) {
        alert('Erro ao fazer logout: ' + error.message);
    }
});

// Atualizar UI baseado no estado de autenticação
function updateAuthUI(user) {
    currentUser = user;
    
    if (user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        userEmail.style.display = 'inline-block';
        userEmail.textContent = user.email;
        
        // Mostrar secções autenticadas
        document.getElementById('addLinkSection').style.display = 'block';
        document.getElementById('filtersSection').style.display = 'block';
        document.getElementById('linksSection').style.display = 'block';
        
        // Carregar links do utilizador
        if (window.loadLinks) window.loadLinks();
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        userEmail.style.display = 'none';
        
        // Esconder secções autenticadas
        document.getElementById('addLinkSection').style.display = 'none';
        document.getElementById('filtersSection').style.display = 'none';
        document.getElementById('linksSection').style.display = 'none';
    }
}

// Verificar sessão ao carregar
supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthUI(session?.user || null);
});

// Listener para mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    updateAuthUI(session?.user || null);
});

// Event listener para o botão de login
loginBtn.addEventListener('click', showLogin);
