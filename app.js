/**
 * BinaryShop - Prototipo Web Vanilla JS (Fase II)
 */

// ================= ESTADO DE LA APLICACIÓN =================
const state = {
  currentUser: null,
  users: [
    { nickname: 'comprador', password: '123', role: 'Cliente', nombre: 'Juan Pérez' },
    { nickname: 'vendedor', password: '123', role: 'Vendedor', nombre: 'María Gómez' },
    { nickname: 'admin', password: '123', role: 'Administrador', nombre: 'Admin Sistema' }
  ],
  products: [
    { 
      id: 1, 
      nombre: 'Laptop Gamer XYZ', 
      precio: 850.00, 
      desc: 'Procesador i7, 16GB RAM, SSD 512GB', 
      img: 'imagenes/LaptopEjemplo.jpg', // <--- Aquí la ruta local
      vendedor: 'vendedor' 
    },
    { 
      id: 2, 
      nombre: 'Mouse Inalámbrico', 
      precio: 25.50, 
      desc: 'Sensor óptico 16000 DPI', 
      img: 'imagenes/MouseEjemplo.jpg', // <--- Aquí la ruta local
      vendedor: 'vendedor' 
    },
    { 
      id: 3, 
      nombre: 'Teclado Mecánico RGB', 
      precio: 65.00, 
      desc: 'Switches Red, retroiluminado', 
      img: 'imagenes/TecladoEjemplo.jpg', // <--- Aquí la ruta local
      vendedor: 'vendedor' 
    }
  ],
  cart: [],
  salesHistory: []
};

// ================= REFERENCIAS DOM =================
const elements = {
  // Navegación
  navCatalogo: document.getElementById('nav-catalogo'),
  navVendedor: document.getElementById('nav-vendedor'),
  navAdmin: document.getElementById('nav-admin'),
  userDisplay: document.getElementById('user-display'),
  btnAuth: document.getElementById('btn-auth'),
  btnCartToggle: document.getElementById('btn-cart-toggle'),
  cartCount: document.getElementById('cart-count'),
  carritoDropdown: document.getElementById('carrito-dropdown'),
  listaCarrito: document.querySelector('#lista-carrito tbody'),
  cartTotal: document.getElementById('cart-total'),
  vaciarCarritoBtn: document.getElementById('vaciar-carrito'),
  btnCheckout: document.getElementById('btn-checkout'),

  // Vistas
  secAuth: document.getElementById('sec-auth'),
  secCatalogo: document.getElementById('sec-catalogo'),
  secCheckout: document.getElementById('sec-checkout'),
  secVendedor: document.getElementById('sec-vendedor'),
  secAdmin: document.getElementById('sec-admin'),

  // Formularios
  tabLogin: document.getElementById('tab-login'),
  tabRegister: document.getElementById('tab-register'),
  formLogin: document.getElementById('form-login'),
  formRegister: document.getElementById('form-register'),
  gridProductos: document.getElementById('grid-productos'),
  formCheckout: document.getElementById('form-checkout'),
  checkoutMonto: document.getElementById('checkout-monto'),
  btnCancelCheckout: document.getElementById('btn-cancel-checkout'),
  formPublicar: document.getElementById('form-publicar'),
  listaVentas: document.getElementById('lista-ventas-historial'),
  tablaAdminUsuarios: document.getElementById('tabla-admin-usuarios'),
  tablaAdminProductos: document.getElementById('tabla-admin-productos')
};

// ================= INICIALIZACIÓN Y EVENTOS =================
document.addEventListener('DOMContentLoaded', () => {
  initEvents();
  renderProducts();
  updateCartUI();
});

function initEvents() {
  // Navegación entre pestañas
  elements.navCatalogo.addEventListener('click', () => switchView('catalogo'));
  elements.navVendedor.addEventListener('click', () => switchView('vendedor'));
  elements.navAdmin.addEventListener('click', () => switchView('admin'));
  document.getElementById('btn-home').addEventListener('click', (e) => {
    e.preventDefault();
    switchView('catalogo');
  });

  // Carrito Dropdown Toggle
  elements.btnCartToggle.addEventListener('click', () => {
    elements.carritoDropdown.classList.toggle('hidden');
  });

  // Autenticación Modal / Navegación
  elements.btnAuth.addEventListener('click', () => {
    if (state.currentUser) {
      logout();
    } else {
      switchView('auth');
    }
  });

  elements.tabLogin.addEventListener('click', () => {
    elements.tabLogin.classList.add('active');
    elements.tabRegister.classList.remove('active');
    elements.formLogin.classList.remove('hidden');
    elements.formRegister.classList.add('hidden');
  });

  elements.tabRegister.addEventListener('click', () => {
    elements.tabRegister.classList.add('active');
    elements.tabLogin.classList.remove('active');
    elements.formRegister.classList.remove('hidden');
    elements.formLogin.classList.add('hidden');
  });

  // Formulario Login
  elements.formLogin.addEventListener('submit', handleLogin);
  elements.formRegister.addEventListener('submit', handleRegister);

  // Carrito Acciones
  elements.vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
  elements.btnCheckout.addEventListener('click', () => {
    if (state.cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    if (!state.currentUser) {
      alert('Debes iniciar sesión para procesar la compra.');
      switchView('auth');
      return;
    }
    elements.carritoDropdown.classList.add('hidden');
    switchView('checkout');
  });

  // Checkout Form
  elements.formCheckout.addEventListener('submit', procesarCompra);
  elements.btnCancelCheckout.addEventListener('click', () => switchView('catalogo'));

  // Vendedor Form
  elements.formPublicar.addEventListener('submit', publicarProducto);
}

// ================= CONTROL DE VISTAS =================
function switchView(viewName) {
  // Ocultar todas las secciones
  elements.secAuth.classList.add('hidden');
  elements.secCatalogo.classList.add('hidden');
  elements.secCheckout.classList.add('hidden');
  elements.secVendedor.classList.add('hidden');
  elements.secAdmin.classList.add('hidden');

  // Quitar active de nav
  elements.navCatalogo.classList.remove('active');
  elements.navVendedor.classList.remove('active');
  elements.navAdmin.classList.remove('active');

  if (viewName === 'auth') {
    elements.secAuth.classList.remove('hidden');
  } else if (viewName === 'catalogo') {
    elements.secCatalogo.classList.remove('hidden');
    elements.navCatalogo.classList.add('active');
  } else if (viewName === 'checkout') {
    elements.secCheckout.classList.remove('hidden');
    const total = state.cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);
    elements.checkoutMonto.textContent = total.toFixed(2);
  } else if (viewName === 'vendedor') {
    elements.secVendedor.classList.remove('hidden');
    elements.navVendedor.classList.add('active');
    renderVentasHistorial();
  } else if (viewName === 'admin') {
    elements.secAdmin.classList.remove('hidden');
    elements.navAdmin.classList.add('active');
    renderAdminTables();
  }
}

// ================= MANEJO DE USUARIOS Y AUTENTICACIÓN =================
function handleLogin(e) {
  e.preventDefault();
  const nick = document.getElementById('login-nickname').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const role = document.getElementById('login-role').value;

  const found = state.users.find(u => u.nickname === nick && u.password === pass && u.role === role);

  if (found) {
    state.currentUser = found;
    updateUserNavUI();
    alert(`Bienvenido, ${found.nombre || found.nickname}`);
    elements.formLogin.reset();
    switchView('catalogo');
  } else {
    alert('Credenciales o rol incorrectos. Revisa los datos ingresados.');
  }
}

function handleRegister(e) {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value.trim();
  const nickname = document.getElementById('reg-nickname').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const role = document.getElementById('reg-role').value;

  if (state.users.some(u => u.nickname === nickname)) {
    alert('El nickname ya se encuentra registrado.');
    return;
  }

  const newUser = { nickname, password, role, nombre };
  state.users.push(newUser);
  state.currentUser = newUser;
  
  updateUserNavUI();
  alert('Registro exitoso. Tu cuenta ha sido creada e iniciaste sesión automáticamente.');
  elements.formRegister.reset();
  switchView('catalogo');
}

function logout() {
  state.currentUser = null;
  updateUserNavUI();
  switchView('catalogo');
}

function updateUserNavUI() {
  if (state.currentUser) {
    const role = state.currentUser.role;
    const displayName = state.currentUser.nombre || state.currentUser.nickname;

    // Si es Administrador queda vacío, si es Cliente o Vendedor muestra el nombre
    if (role === 'Administrador') {
      elements.userDisplay.textContent = '';
    } else {
      elements.userDisplay.textContent = `${displayName} (${role})`;
    }

    elements.btnAuth.textContent = 'Cerrar Sesión';

    // Mostrar u ocultar botones del menú según el rol
    if (role === 'Vendedor') {
      elements.navVendedor.classList.remove('hidden');
      elements.navAdmin.classList.add('hidden');
    } else if (role === 'Administrador') {
      elements.navAdmin.classList.remove('hidden');
      elements.navVendedor.classList.add('hidden');
    } else {
      elements.navVendedor.classList.add('hidden');
      elements.navAdmin.classList.add('hidden');
    }
  } else {
    elements.userDisplay.textContent = 'Invitado';
    elements.btnAuth.textContent = 'Iniciar Sesión';
    elements.navVendedor.classList.add('hidden');
    elements.navAdmin.classList.add('hidden');
  }
}

// ================= CATÁLOGO Y CARRITO =================
function renderProducts() {
  elements.gridProductos.innerHTML = '';
  
  if (state.products.length === 0) {
    elements.gridProductos.innerHTML = '<p>No hay productos disponibles en el catálogo.</p>';
    return;
  }

  state.products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/200?text=Producto'">
      <div class="product-info">
        <h3 class="product-title">${p.nombre}</h3>
        <p class="product-price">$${p.precio.toFixed(2)}</p>
        <p style="font-size: 0.85rem; color: #64748b;">${p.desc}</p>
      </div>
      <div class="card-buttons">
        <button class="btn-secondary" onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>
        <button class="btn-primary" onclick="comprarInmediato(${p.id})">Comprar de inmediato</button>
      </div>
    `;
    elements.gridProductos.appendChild(card);
  });
}

function agregarAlCarrito(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  const inCart = state.cart.find(item => item.id === id);
  if (inCart) {
    inCart.cantidad++;
  } else {
    state.cart.push({ ...prod, cantidad: 1 });
  }

  updateCartUI();
}

function comprarInmediato(id) {
  agregarAlCarrito(id);
  if (!state.currentUser) {
    alert('Debes iniciar sesión para procesar tu compra.');
    switchView('auth');
  } else {
    switchView('checkout');
  }
}

function updateCartUI() {
  elements.listaCarrito.innerHTML = '';
  let count = 0;
  let total = 0;

  state.cart.forEach(item => {
    count += item.cantidad;
    total += item.precio * item.cantidad;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${item.img}" class="cart-img-thumb" alt="img"></td>
      <td>${item.nombre} (x${item.cantidad})</td>
      <td>$${(item.precio * item.cantidad).toFixed(2)}</td>
      <td><button class="btn-danger" onclick="eliminarDelCarrito(${item.id})">X</button></td>
    `;
    elements.listaCarrito.appendChild(tr);
  });

  elements.cartCount.textContent = count;
  elements.cartTotal.textContent = total.toFixed(2);
}

function eliminarDelCarrito(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  updateCartUI();
}

function vaciarCarrito() {
  state.cart = [];
  updateCartUI();
}

function procesarCompra(e) {
  e.preventDefault();
  if (state.cart.length === 0) return;

  // Registrar en historial de ventas del vendedor
  state.cart.forEach(item => {
    state.salesHistory.push({
      producto: item.nombre,
      monto: item.precio * item.cantidad,
      Cliente: state.currentUser.nickname,
      fecha: new Date().toLocaleDateString()
    });
  });

  alert('¡Compra realizada exitosamente! Gracias por su preferencia en BinaryShop.');
  vaciarCarrito();
  switchView('catalogo');
}

// ================= PANEL DE VENDEDOR =================
function publicarProducto(e) {
  e.preventDefault();
  const nombre = document.getElementById('prod-nombre').value.trim();
  const precio = parseFloat(document.getElementById('prod-precio').value);
  const desc = document.getElementById('prod-desc').value.trim();
  const img = document.getElementById('prod-img').value.trim();

  const newProd = {
    id: Date.now(),
    nombre,
    precio,
    desc,
    img,
    vendedor: state.currentUser ? state.currentUser.nickname : 'vendedor'
  };

  state.products.push(newProd);
  renderProducts();
  alert('Producto publicado correctamente en el catálogo.');
  elements.formPublicar.reset();
}

function renderVentasHistorial() {
  elements.listaVentas.innerHTML = '';
  if (state.salesHistory.length === 0) {
    elements.listaVentas.innerHTML = '<li>No se han registrado ventas aún.</li>';
    return;
  }

  state.salesHistory.forEach(v => {
    const li = document.createElement('li');
    li.textContent = `${v.fecha} - ${v.producto} por $${v.monto.toFixed(2)} (Cliente: ${v.Cliente})`;
    elements.listaVentas.appendChild(li);
  });
}

// ================= PANEL DE ADMINISTRADOR =================
function renderAdminTables() {
  // Tabla de Usuarios
  elements.tablaAdminUsuarios.innerHTML = '';
  state.users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.nickname}</td>
      <td>${u.role}</td>
      <td>
        <button class="btn-danger" onclick="adminEliminarUsuario('${u.nickname}')">Eliminar</button>
      </td>
    `;
    elements.tablaAdminUsuarios.appendChild(tr);
  });

  // Tabla de Productos
  elements.tablaAdminProductos.innerHTML = '';
  state.products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombre}</td>
      <td>$${p.precio.toFixed(2)}</td>
      <td>${p.vendedor}</td>
      <td>
        <button class="btn-danger" onclick="adminEliminarProducto(${p.id})">Remover</button>
      </td>
    `;
    elements.tablaAdminProductos.appendChild(tr);
  });
}

function adminEliminarUsuario(nickname) {
  if (confirm(`¿Estás seguro de eliminar al usuario "${nickname}"?`)) {
    state.users = state.users.filter(u => u.nickname !== nickname);
    if (state.currentUser && state.currentUser.nickname === nickname) {
      logout();
    } else {
      renderAdminTables();
    }
  }
}

function adminEliminarProducto(id) {
  if (confirm('¿Estás seguro de remover esta publicación?')) {
    state.products = state.products.filter(p => p.id !== id);
    renderProducts();
    renderAdminTables();
  }
}
