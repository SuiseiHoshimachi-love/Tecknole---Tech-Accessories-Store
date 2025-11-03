if (typeof productsData === 'undefined') {
    console.error('productsData chưa được load từ product-detail.js');
}

let currentProducts = [];

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const brandParam = urlParams.get('brand');
    
    if (typeParam) {
        document.getElementById('filter-type').value = typeParam;
    }
    if (brandParam) {
        document.getElementById('filter-brand').value = brandParam;
    }
    
    updatePageTitle(typeParam, brandParam);
    loadProducts();
    
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('filter-brand').addEventListener('change', applyFilters);
    document.getElementById('filter-sort').addEventListener('change', applyFilters);
    setupSearchFunctionality();
});

function updatePageTitle(type, brand) {
    const categoryTitle = document.getElementById('category-title');
    const typeNames = {
        'manhinh': 'Màn Hình',
        'banphim': 'Bàn Phím',
        'chuot': 'Chuột',
        'tainghe': 'Tai Nghe',
        'loa': 'Loa'
    };
    
    if (type && brand) {
        categoryTitle.textContent = `${typeNames[type]} ${brand.toUpperCase()}`;
    } else if (type) {
        categoryTitle.textContent = typeNames[type];
    } else if (brand) {
        categoryTitle.textContent = `Thương hiệu ${brand.toUpperCase()}`;
    } else {
        categoryTitle.textContent = 'Tất cả sản phẩm';
    }
}

function loadProducts() {
    currentProducts = [...productsData];
    applyFilters();
}

function applyFilters() {
    const filterType = document.getElementById('filter-type').value;
    const filterBrand = document.getElementById('filter-brand').value;
    const filterSort = document.getElementById('filter-sort').value;
    
    let filtered = productsData.filter(product => {
        const typeMatch = !filterType || product.type === filterType;
        const brandMatch = !filterBrand || product.brand.toLowerCase() === filterBrand.toLowerCase();
        return typeMatch && brandMatch;
    });
    
    filtered = sortProducts(filtered, filterSort);
    displayProducts(filtered);
}

function sortProducts(products, sortType) {
    const sorted = [...products];
    
    switch(sortType) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name-asc':
            return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
        case 'name-desc':
            return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
        default:
            return sorted;
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    const noProducts = document.getElementById('no-products');
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.style.display = 'none';
        noProducts.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noProducts.style.display = 'none';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
    
    attachAddToCartEvents();
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <a href="detail.html?id=${product.id}" class="product-link">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-price">${formatPrice(product.price)}</div>
                </div>
            </a>
            <button class="btn-add-cart" data-id="${product.id}">
                🛒 Thêm vào giỏ
            </button>
        </div>
    `;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function attachAddToCartEvents() {
    const buttons = document.querySelectorAll('.btn-add-cart');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
        });
    });
}

function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge span');
    if (badge) {
        badge.textContent = totalItems;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function setupSearchFunctionality() {
    const searchInput = document.getElementById('js-search');
    const searchForm = document.querySelector('.search-form');
    const autocompleteList = document.getElementById('autocomplete-list');
    
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
            hideAutocomplete();
            return;
        }
        
        searchTimeout = setTimeout(() => {
            showAutocomplete(query);
        }, 300);
    });
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            searchProducts(query);
            hideAutocomplete();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

function showAutocomplete(query) {
    const autocompleteList = document.getElementById('autocomplete-list');
    const ul = autocompleteList.querySelector('ul');
    
    const matches = productsData.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
    ).slice(0, 5);
    
    if (matches.length === 0) {
        hideAutocomplete();
        return;
    }
    
    ul.innerHTML = matches.map(product => `
        <li class="autocomplete-item" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="autocomplete-info">
                <div class="autocomplete-name">${highlightMatch(product.name, query)}</div>
                <div class="autocomplete-price">${formatPrice(product.price)}</div>
            </div>
        </li>
    `).join('');
    
    autocompleteList.style.display = 'block';
    autocompleteList.setAttribute('aria-hidden', 'false');
    
    ul.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            window.location.href = `detail.html?id=${productId}`;
        });
    });
}

function hideAutocomplete() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.style.display = 'none';
    autocompleteList.setAttribute('aria-hidden', 'true');
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

function searchProducts(query) {
    const searchResults = productsData.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query)
    );
    
    document.getElementById('category-title').textContent = `Kết quả tìm kiếm: "${query}"`;
    displayProducts(searchResults);
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-brand').value = '';
}

updateCartBadge();

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .autocomplete-item {
        display: flex;
        align-items: center;
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        transition: background 0.2s;
    }
    
    .autocomplete-item:hover {
        background: #f5f5f5;
    }
    
    .autocomplete-item img {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
        margin-right: 10px;
    }
    
    .autocomplete-info {
        flex: 1;
    }
    
    .autocomplete-name {
        font-size: 14px;
        color: #333;
        margin-bottom: 4px;
    }
    
    .autocomplete-name strong {
        color: #ff6b35;
        font-weight: 600;
    }
    
    .autocomplete-price {
        font-size: 13px;
        color: #ff6b35;
        font-weight: 600;
    }
`;
document.head.appendChild(style);
