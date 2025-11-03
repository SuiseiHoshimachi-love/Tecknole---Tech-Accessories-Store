// ============= SEARCH & FILTER FUNCTIONALITY =============
// Sử dụng dữ liệu từ product-detail.js

// Kiểm tra xem productsData đã được load chưa
if (typeof productsData === 'undefined') {
    console.error('productsData chưa được load từ product-detail.js');
}

// Biến lưu trữ sản phẩm hiện tại sau khi lọc
let currentProducts = [];

// ============= KHỞI TẠO KHI TRANG LOAD =============
document.addEventListener('DOMContentLoaded', function() {
    // Lấy tham số từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const typeParam = urlParams.get('type');
    const brandParam = urlParams.get('brand');
    
    // Cập nhật filter theo URL
    if (typeParam) {
        document.getElementById('filter-type').value = typeParam;
    }
    if (brandParam) {
        document.getElementById('filter-brand').value = brandParam;
    }
    
    // Cập nhật tiêu đề trang
    updatePageTitle(typeParam, brandParam);
    
    // Load và hiển thị sản phẩm
    loadProducts();
    
    // Gắn sự kiện cho các bộ lọc
    document.getElementById('filter-type').addEventListener('change', applyFilters);
    document.getElementById('filter-brand').addEventListener('change', applyFilters);
    document.getElementById('filter-sort').addEventListener('change', applyFilters);
    
    // Gắn sự kiện cho thanh tìm kiếm
    setupSearchFunctionality();
});

// ============= CẬP NHẬT TIÊU ĐỀ TRANG =============
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

// ============= LOAD VÀ HIỂN THỊ SẢN PHẨM =============
function loadProducts() {
    currentProducts = [...productsData]; // Copy dữ liệu gốc
    applyFilters();
}

// ============= ÁP DỤNG BỘ LỌC =============
function applyFilters() {
    const filterType = document.getElementById('filter-type').value;
    const filterBrand = document.getElementById('filter-brand').value;
    const filterSort = document.getElementById('filter-sort').value;
    
    // Lọc theo loại sản phẩm
    let filtered = productsData.filter(product => {
        const typeMatch = !filterType || product.type === filterType;
        const brandMatch = !filterBrand || product.brand.toLowerCase() === filterBrand.toLowerCase();
        return typeMatch && brandMatch;
    });
    
    // Sắp xếp
    filtered = sortProducts(filtered, filterSort);
    
    // Hiển thị sản phẩm
    displayProducts(filtered);
}

// ============= SẮP XẾP SẢN PHẨM =============
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

// ============= HIỂN THỊ SẢN PHẨM =============
function displayProducts(products) {
    const container = document.getElementById('products-container');
    const noProducts = document.getElementById('no-products');
    
    // Xóa nội dung cũ
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.style.display = 'none';
        noProducts.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    noProducts.style.display = 'none';
    
    // Tạo HTML cho mỗi sản phẩm
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
    
    // Gắn sự kiện cho nút "Thêm vào giỏ"
    attachAddToCartEvents();
}

// ============= TẠO CARD SẢN PHẨM =============
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

// ============= FORMAT GIÁ =============
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// ============= THÊM VÀO GIỎ HÀNG =============
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
    
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Kiểm tra sản phẩm đã có trong giỏ chưa
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
    
    // Lưu lại vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật số lượng trên badge
    updateCartBadge();
    
    // Hiển thị thông báo
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`);
}

// ============= CẬP NHẬT BADGE GIỎ HÀNG =============
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.querySelector('.cart-badge span');
    if (badge) {
        badge.textContent = totalItems;
    }
}

// ============= HIỂN THỊ THÔNG BÁO =============
function showNotification(message) {
    // Tạo element thông báo
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
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============= TÌM KIẾM SẢN PHẨM =============
function setupSearchFunctionality() {
    const searchInput = document.getElementById('js-search');
    const searchForm = document.querySelector('.search-form');
    const autocompleteList = document.getElementById('autocomplete-list');
    
    if (!searchInput) return;
    
    // Xử lý khi người dùng gõ
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
    
    // Xử lý khi submit form
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            searchProducts(query);
            hideAutocomplete();
        }
    });
    
    // Ẩn autocomplete khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

// ============= HIỂN THỊ GỢI Ý TÌM KIẾM =============
function showAutocomplete(query) {
    const autocompleteList = document.getElementById('autocomplete-list');
    const ul = autocompleteList.querySelector('ul');
    
    // Tìm sản phẩm phù hợp
    const matches = productsData.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query)
    ).slice(0, 5); // Giới hạn 5 kết quả
    
    if (matches.length === 0) {
        hideAutocomplete();
        return;
    }
    
    // Tạo HTML cho danh sách gợi ý
    ul.innerHTML = matches.map(product => `
        <li class="autocomplete-item" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
            <div class="autocomplete-info">
                <div class="autocomplete-name">${highlightMatch(product.name, query)}</div>
                <div class="autocomplete-price">${formatPrice(product.price)}</div>
            </div>
        </li>
    `).join('');
    
    // Hiển thị autocomplete
    autocompleteList.style.display = 'block';
    autocompleteList.setAttribute('aria-hidden', 'false');
    
    // Gắn sự kiện click cho các item
    ul.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            window.location.href = `detail.html?id=${productId}`;
        });
    });
}

// ============= ẨN GỢI Ý TÌM KIẾM =============
function hideAutocomplete() {
    const autocompleteList = document.getElementById('autocomplete-list');
    autocompleteList.style.display = 'none';
    autocompleteList.setAttribute('aria-hidden', 'true');
}

// ============= HIGHLIGHT KẾT QUẢ TÌM KIẾM =============
function highlightMatch(text, query) {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<strong>$1</strong>');
}

// ============= TÌM KIẾM VÀ LỌC =============
function searchProducts(query) {
    const searchResults = productsData.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.type.toLowerCase().includes(query)
    );
    
    // Cập nhật tiêu đề
    document.getElementById('category-title').textContent = `Kết quả tìm kiếm: "${query}"`;
    
    // Hiển thị kết quả
    displayProducts(searchResults);
    
    // Reset bộ lọc
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-brand').value = '';
}

// ============= KHỞI TẠO CART BADGE KHI LOAD =============
updateCartBadge();

// Thêm CSS cho animation
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
