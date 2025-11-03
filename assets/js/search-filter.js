// Hàm tìm kiếm sản phẩm
function timKiem() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        alert('Vui lòng nhập từ khóa tìm kiếm!');
        return;
    }
    
    // Chuyển đến trang products.html với từ khóa tìm kiếm
    window.location.href = `products.html?search=${encodeURIComponent(searchTerm)}`;
}

// Hàm lọc và hiển thị kết quả tìm kiếm
function hienThiKetQuaTimKiem() {
    // Lấy từ khóa từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (!searchTerm) return;
    
    // Đặt lại giá trị cho ô tìm kiếm
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = searchTerm;
    }
    
    // Kiểm tra xem có dữ liệu sản phẩm không
    if (typeof products === 'undefined') {
        console.error('Không tìm thấy dữ liệu sản phẩm từ product-detail.js');
        return;
    }
    
    // Lọc sản phẩm theo từ khóa
    const ketQua = products.filter(product => {
        const tenSP = product.name.toLowerCase();
        const moTa = product.description ? product.description.toLowerCase() : '';
        const danhMuc = product.category ? product.category.toLowerCase() : '';
        
        return tenSP.includes(searchTerm.toLowerCase()) || 
               moTa.includes(searchTerm.toLowerCase()) ||
               danhMuc.includes(searchTerm.toLowerCase());
    });
    
    // Hiển thị kết quả
    hienThiSanPham(ketQua, searchTerm);
}

// Hàm hiển thị sản phẩm lên trang
function hienThiSanPham(danhSachSP, tuKhoa) {
    const container = document.getElementById('productsContainer') || 
                     document.querySelector('.products-grid') ||
                     document.querySelector('.products-container');
    
    if (!container) {
        console.error('Không tìm thấy container để hiển thị sản phẩm');
        return;
    }
    
    // Xóa nội dung cũ
    container.innerHTML = '';
    
    // Hiển thị tiêu đề kết quả
    const titleDiv = document.createElement('div');
    titleDiv.className = 'search-result-title';
    titleDiv.innerHTML = `
        <h2>Kết quả tìm kiếm cho: "${tuKhoa}"</h2>
        <p>Tìm thấy ${danhSachSP.length} sản phẩm</p>
    `;
    container.before(titleDiv);
    
    // Nếu không có kết quả
    if (danhSachSP.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy sản phẩm nào!</h3>
                <p>Vui lòng thử lại với từ khóa khác</p>
                <button onclick="window.location.href='products.html'">Xem tất cả sản phẩm</button>
            </div>
        `;
        return;
    }
    
    // Hiển thị từng sản phẩm
    danhSachSP.forEach(product => {
        const productCard = taoTheSanPham(product);
        container.appendChild(productCard);
    });
}

// Hàm tạo thẻ sản phẩm
function taoTheSanPham(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    
    const gia = product.price ? product.price.toLocaleString('vi-VN') : '0';
    const giaGiam = product.salePrice ? product.salePrice.toLocaleString('vi-VN') : '';
    const phanTramGiam = product.price && product.salePrice ? 
                         Math.round((1 - product.salePrice / product.price) * 100) : 0;
    
    div.innerHTML = `
        ${phanTramGiam > 0 ? `<div class="sale-badge">-${phanTramGiam}%</div>` : ''}
        <div class="product-image">
            <img src="${product.image || 'assets/images/placeholder.jpg'}" 
                 alt="${product.name}"
                 onerror="this.src='assets/images/placeholder.jpg'">
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description || ''}</p>
            <div class="product-price">
                ${giaGiam ? `
                    <span class="old-price">${gia}đ</span>
                    <span class="new-price">${giaGiam}đ</span>
                ` : `
                    <span class="price">${gia}đ</span>
                `}
            </div>
            <button class="btn-detail" onclick="xemChiTiet('${product.id}')">
                Xem chi tiết
            </button>
        </div>
    `;
    
    return div;
}

// Hàm xem chi tiết sản phẩm
function xemChiTiet(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

// Hàm tìm kiếm theo danh mục
function timKiemTheoDanhMuc(category) {
    window.location.href = `products.html?category=${encodeURIComponent(category)}`;
}

// Hàm lọc theo danh mục
function locTheoDanhMuc() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (!category || typeof products === 'undefined') return;
    
    const ketQua = products.filter(product => 
        product.category && product.category.toLowerCase() === category.toLowerCase()
    );
    
    hienThiSanPham(ketQua, `Danh mục: ${category}`);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Tìm kiếm bằng phím Enter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                timKiem();
            }
        });
    }
    
    // Tự động hiển thị kết quả khi vào trang products.html
    if (window.location.pathname.includes('products.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.get('search')) {
            hienThiKetQuaTimKiem();
        } else if (urlParams.get('category')) {
            locTheoDanhMuc();
        }
    }
    
    // Xử lý nút tìm kiếm
    const searchBtn = document.querySelector('.search-box button');
    if (searchBtn) {
        searchBtn.addEventListener('click', timKiem);
    }
});

// Export functions để sử dụng ở file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        timKiem,
        hienThiKetQuaTimKiem,
        timKiemTheoDanhMuc
    };
}
