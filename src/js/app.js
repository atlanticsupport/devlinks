// Aplicação Principal - Gestão de Links

let allLinks = [];
let categories = new Set();

// Elementos DOM
const addLinkForm = document.getElementById('addLinkForm');
const linksList = document.getElementById('linksList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const favoritesOnly = document.getElementById('favoritesOnly');

// Carregar links do utilizador
async function loadLinks() {
    if (!currentUser) return;

    try {
        const { data, error } = await supabase
            .from('links')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allLinks = data || [];
        updateCategories();
        renderLinks(allLinks);
    } catch (error) {
        console.error('Erro ao carregar links:', error);
        alert('Erro ao carregar os teus links: ' + error.message);
    }
}

// Adicionar novo link
addLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    const category = document.getElementById('linkCategory').value;
    const tags = document.getElementById('linkTags').value.split(',').map(t => t.trim()).filter(t => t);
    const description = document.getElementById('linkDescription').value;
    const favorite = document.getElementById('linkFavorite').checked;

    try {
        const { data, error } = await supabase
            .from('links')
            .insert([{
                user_id: currentUser.id,
                title,
                url,
                category,
                tags,
                description,
                favorite
            }])
            .select();

        if (error) throw error;

        // Adicionar à lista local
        allLinks.unshift(data[0]);
        updateCategories();
        renderLinks(getFilteredLinks());

        // Limpar formulário
        addLinkForm.reset();
        alert('✅ Link adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar link:', error);
        alert('Erro ao adicionar link: ' + error.message);
    }
});

// Atualizar categorias disponíveis
function updateCategories() {
    categories.clear();
    allLinks.forEach(link => {
        if (link.category) categories.add(link.category);
    });

    // Atualizar dropdown de filtro
    categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
    Array.from(categories).sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

// Obter links filtrados
function getFilteredLinks() {
    let filtered = [...allLinks];

    // Filtro de pesquisa
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(link =>
            link.title.toLowerCase().includes(searchTerm) ||
            link.url.toLowerCase().includes(searchTerm) ||
            (link.description && link.description.toLowerCase().includes(searchTerm))
        );
    }

    // Filtro de categoria
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filtered = filtered.filter(link => link.category === selectedCategory);
    }

    // Filtro de favoritos
    if (favoritesOnly.checked) {
        filtered = filtered.filter(link => link.favorite);
    }

    return filtered;
}

// Renderizar links na grid
function renderLinks(links) {
    if (!links || links.length === 0) {
        linksList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    linksList.innerHTML = links.map(link => `
        <div class="link-card ${link.favorite ? 'favorite' : ''}" data-id="${link.id}">
            <h3>${escapeHtml(link.title)}</h3>
            <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${escapeHtml(link.url)}</a>
            ${link.description ? `<p>${escapeHtml(link.description)}</p>` : ''}
            <div class="link-meta">
                <span class="category-tag">${escapeHtml(link.category)}</span>
                ${link.tags && link.tags.length > 0 ? 
                    link.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('') 
                    : ''
                }
            </div>
            <div class="link-actions">
                <button class="btn btn-secondary btn-favorite" onclick="toggleFavorite(${link.id})">
                    ${link.favorite ? '⭐ Remover Favorito' : '☆ Adicionar Favorito'}
                </button>
                <button class="btn btn-secondary" onclick="deleteLink(${link.id})">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle favorito
window.toggleFavorite = async function(linkId) {
    const link = allLinks.find(l => l.id === linkId);
    if (!link) return;

    try {
        const { error } = await supabase
            .from('links')
            .update({ favorite: !link.favorite })
            .eq('id', linkId);

        if (error) throw error;

        link.favorite = !link.favorite;
        renderLinks(getFilteredLinks());
    } catch (error) {
        alert('Erro ao atualizar favorito: ' + error.message);
    }
};

// Eliminar link
window.deleteLink = async function(linkId) {
    if (!confirm('Tens a certeza que queres eliminar este link?')) return;

    try {
        const { error } = await supabase
            .from('links')
            .delete()
            .eq('id', linkId);

        if (error) throw error;

        allLinks = allLinks.filter(l => l.id !== linkId);
        updateCategories();
        renderLinks(getFilteredLinks());
        alert('✅ Link eliminado!');
    } catch (error) {
        alert('Erro ao eliminar link: ' + error.message);
    }
};

// Escape HTML para segurança
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners para filtros
searchInput.addEventListener('input', () => {
    renderLinks(getFilteredLinks());
});

categoryFilter.addEventListener('change', () => {
    renderLinks(getFilteredLinks());
});

favoritesOnly.addEventListener('change', () => {
    renderLinks(getFilteredLinks());
});

// Exportar função loadLinks para uso no auth.js
window.loadLinks = loadLinks;
