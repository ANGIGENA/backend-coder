import fs from 'fs';

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = [];
    this.init();
  }


  async init() {
    try {
      if (!fs.existsSync(this.path)) {
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
      }
      await this.loadCarts();
    } catch (error) {
      console.error('Error al inicializar CartManager:', error);
    }
  }


  async loadCarts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      this.carts = JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar carritos:', error);
      this.carts = [];
    }
  }


  async saveCarts() {
    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.carts, null, 2)
      );
    } catch (error) {
      console.error('Error al guardar carritos:', error);
      throw error;
    }
  }

  generateId() {
    if (this.carts.length === 0) return 1;
    const maxId = Math.max(...this.carts.map(c => c.id));
    return maxId + 1;
  }


  async createCart() {
    await this.loadCarts();

    const newCart = {
      id: this.generateId(),
      products: []
    };

    this.carts.push(newCart);
    await this.saveCarts();
    return newCart;
  }

  async getCartById(id) {
    await this.loadCarts();
    const cart = this.carts.find(c => c.id === parseInt(id));
    return cart || null;
  }


  async addProductToCart(cartId, productId) {
    await this.loadCarts();

    const cartIndex = this.carts.findIndex(c => c.id === parseInt(cartId));
    if (cartIndex === -1) {
      throw new Error(`Carrito con id ${cartId} no encontrado`);
    }

    const cart = this.carts[cartIndex];
    

    const productIndex = cart.products.findIndex(
      p => p.product === parseInt(productId)
    );

    if (productIndex !== -1) {

      cart.products[productIndex].quantity += 1;
    } else {

      cart.products.push({
        product: parseInt(productId),
        quantity: 1
      });
    }

    await this.saveCarts();
    return cart;
  }
}

export default CartManager;