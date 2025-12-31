const socket = io();


const addProductForm = document.getElementById('addProductForm');
addProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    code: document.getElementById('code').value,
    price: parseFloat(document.getElementById('price').value),
    stock: parseInt(document.getElementById('stock').value),
    category: document.getElementById('category').value,
    status: true
  };


  socket.emit('addProduct', formData);
  addProductForm.reset();
});


function deleteProduct(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    return;
  }

  socket.emit('deleteProduct', id);
}

socket.on('productAdded', (data) => {
  if (data.success) {
    showNotification(data.message, 'success');
  }
});


socket.on('productDeleted', (data) => {
  if (data.success) {
    showNotification(data.message, 'success');
  }
});


socket.on('productError', (data) => {
  showNotification(data.message, 'error');
});


socket.on('updateProducts', (products) => {
  console.log('Productos actualizados:', products);
  renderProducts(products);
});


function renderProducts(products) {
  const productsContainer = document.getElementById('productsContainer');

  if (products.length === 0) {
    productsContainer.innerHTML = `
      <div class="alert alert-info">
        <p>No hay productos disponibles. ¡Agrega el primero usando el formulario!</p>
      </div>
    `;
    return;
  }

  let html = '<div class="products-grid" id="productsGrid">';

  products.forEach(product => {
    html += `
      <div class="product-card" data-id="${product.id}">
        <div class="product-header">
          <h3>${product.title}</h3>
          <span class="product-id">ID: ${product.id}</span>
        </div>
        <p class="product-description">${product.description}</p>
        <div class="product-details">
          <p><strong>Código:</strong> ${product.code}</p>
          <p><strong>Categoría:</strong> ${product.category}</p>
          <p><strong>Precio:</strong> $${product.price}</p>
          <p><strong>Stock:</strong> ${product.stock} unidades</p>
          <p><strong>Estado:</strong> 
            ${product.status 
              ? '<span class="badge badge-success">Disponible</span>'
              : '<span class="badge badge-error">No disponible</span>'
            }
          </p>
        </div>
        <button class="btn btn-danger" onclick="deleteProduct(${product.id})">
          🗑️ Eliminar
        </button>
      </div>
    `;
  });

  html += '</div>';
  productsContainer.innerHTML = html;
}


function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
    ${type === 'success' ? 'background: #10b981;' : 'background: #ef4444;'}
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}


const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
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
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('Socket.IO conectado y listo');