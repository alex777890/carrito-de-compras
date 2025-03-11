
const productos = [
    { id: 1, nombre: "Laptop", precio: 12000, imagen: "img/laptop.jpg", stock: 5, categoria: "Electrónica" },
    { id: 2, nombre: "Teléfono", precio: 8000, imagen: "img/telefono.jpg", stock: 10, categoria: "Electrónica" },
    { id: 3, nombre: "Auriculares", precio: 1500, imagen: "img/auriculares.jpg", stock: 20, categoria: "Accesorios" }
];

const listaProductos = document.getElementById("lista-productos");
const listaCarrito = document.getElementById("lista-carrito");
const listaHistorial = document.getElementById("lista-historial");
const subtotalElement = document.getElementById("subtotal");
const taxElement = document.getElementById("tax");
const totalElement = document.getElementById("total");
const cartCount = document.getElementById("cart-count");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let historialCompras = JSON.parse(localStorage.getItem("historialCompras")) || [];

function mostrarProductos(products = productos) {
    listaProductos.innerHTML = "";
    products.forEach(producto => {
        const li = document.createElement("li");
        li.className = "producto";
        li.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p class="price">$${producto.precio.toLocaleString()}</p>
                <p class="stock">Stock: ${producto.stock}</p>
                <button ${producto.stock === 0 ? 'disabled' : ''} 
                        onclick="agregarAlCarrito(${producto.id})">
                    ${producto.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
            </div>
        `;
        listaProductos.appendChild(li);
    });
}

function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    if (producto.stock <= 0) return;

    const productoEnCarrito = carrito.find(p => p.id === id);
    if (productoEnCarrito) {
        if (productoEnCarrito.cantidad < producto.stock) {
            productoEnCarrito.cantidad++;
        }
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarCarrito();
    guardarCarrito();
}

function actualizarCarrito() {
    listaCarrito.innerHTML = "";
    let subtotal = 0;

    carrito.forEach((producto, index) => {
        const totalProducto = producto.precio * producto.cantidad;
        subtotal += totalProducto;
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <div class="item-info">
                <h4>${producto.nombre}</h4>
                <p>$${producto.precio.toLocaleString()} x ${producto.cantidad}</p>
                <div class="quantity-control">
                    <button onclick="cambiarCantidad(${index}, -1)">-</button>
                    <input type="number" value="${producto.cantidad}" min="1" max="${producto.stock}" 
                           onchange="editarCantidad(${index}, this.value)">
                    <button onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="eliminarDelCarrito(${index})">
                    <i class="material-icons">delete</i>
                </button>
            </div>
        `;
        listaCarrito.appendChild(li);
    });

    const tax = subtotal * 0.16;
    const total = subtotal + tax;
    
    subtotalElement.textContent = subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 });
    taxElement.textContent = tax.toLocaleString("es-MX", { minimumFractionDigits: 2 });
    totalElement.textContent = total.toLocaleString("es-MX", { minimumFractionDigits: 2 });
    cartCount.textContent = carrito.reduce((sum, item) => sum + item.cantidad, 0);
}

function mostrarHistorial() {
    listaHistorial.innerHTML = "";
    historialCompras.forEach((compra, index) => {
        const li = document.createElement("li");
        li.className = "history-item";
        const fecha = new Date(compra.fecha).toLocaleString();
        let total = 0;
        let itemsHTML = '<ul class="history-items">';
        
        compra.items.forEach(item => {
            const subtotalItem = item.precio * item.cantidad;
            total += subtotalItem;
            itemsHTML += `
                <li>
                    ${item.nombre} - $${item.precio.toLocaleString()} x ${item.cantidad} = 
                    $${subtotalItem.toLocaleString()}
                </li>
            `;
        });
        
        const tax = total * 0.16;
        const totalConTax = total + tax;
        
        itemsHTML += '</ul>';
        li.innerHTML = `
            <div class="history-info">
                <h4>Compra #${index + 1} - ${fecha}</h4>
                ${itemsHTML}
                <p>Subtotal: $${total.toLocaleString()}</p>
                <p>IVA (16%): $${tax.toLocaleString()}</p>
                <p class="history-total">Total: $${totalConTax.toLocaleString()}</p>
            </div>
        `;
        listaHistorial.appendChild(li);
    });
}

function cambiarCantidad(index, cambio) {
    const nuevoValor = carrito[index].cantidad + cambio;
    if (nuevoValor >= 1 && nuevoValor <= productos.find(p => p.id === carrito[index].id).stock) {
        carrito[index].cantidad = nuevoValor;
        actualizarCarrito();
        guardarCarrito();
    }
}

function editarCantidad(index, cantidad) {
    const num = parseInt(cantidad);
    const maxStock = productos.find(p => p.id === carrito[index].id).stock;
    if (num >= 1 && num <= maxStock) {
        carrito[index].cantidad = num;
        actualizarCarrito();
        guardarCarrito();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
    guardarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    actualizarCarrito();
    guardarCarrito();
}

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function guardarHistorial() {
    localStorage.setItem("historialCompras", JSON.stringify(historialCompras));
}

function procesarCompra() {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        producto.stock -= item.cantidad;
    });

  
    const compra = {
        items: [...carrito],
        fecha: new Date().toISOString(),
        total: parseFloat(totalElement.textContent.replace(/[^0-9.]/g, ''))
    };
    
    historialCompras.push(compra);
    guardarHistorial();
    
    
    vaciarCarrito();
    
    alert("Compra procesada con éxito. Total: $" + compra.total.toLocaleString());
    mostrarProductos();
    mostrarHistorial();
}

function borrarHistorial() {
    if (confirm("¿Estás seguro de que quieres borrar el historial de compras?")) {
        historialCompras = [];
        guardarHistorial();
        mostrarHistorial();
    }
}

searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = productos.filter(p => p.nombre.toLowerCase().includes(term));
    mostrarProductos(filtered);
});

sortSelect.addEventListener("change", () => {
    let sorted = [...productos];
    switch(sortSelect.value) {
        case "name":
            sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case "price-asc":
            sorted.sort((a, b) => a.precio - b.precio);
            break;
        case "price-desc":
            sorted.sort((a, b) => b.precio - b.precio);
            break;
    }
    mostrarProductos(sorted);
});

mostrarProductos();
actualizarCarrito();
mostrarHistorial();