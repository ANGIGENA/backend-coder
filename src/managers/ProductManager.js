import fs from 'fs';
import path from 'path';

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.init();
  }


  async init() {
    try {
      if (!fs.existsSync(this.path)) {
        await fs.promises.writeFile(this.path, JSON.stringify([], null, 2));
      }
      await this.loadProducts();
    } catch (error) {
      console.error('Error al inicializar ProductManager:', error);
    }
  }

  async loadProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      this.products = [];
    }
  }


  async saveProducts() {
    try {
      await fs.promises.writeFile(
        this.path,
        JSON.stringify(this.products, null, 2)
      );
    } catch (error) {
      console.error('Error al guardar productos:', error);
      throw error;
    }
  }

  generateId() {
    if (this.products.length === 0) return 1;
    const maxId = Math.max(...this.products.map(p => p.id));
    return maxId + 1;
  }


  async getProducts() {
    await this.loadProducts();
    return this.products;
  }


  async getProductById(id) {
    await this.loadProducts();
    const product = this.products.find(p => p.id === parseInt(id));
    return product || null;
  }


  async addProduct(productData) {
    await this.loadProducts();


    const requiredFields = ['title', 'description', 'code', 'price', 'stock', 'category'];
    for (const field of requiredFields) {
      if (!productData[field]) {
        throw new Error(`El campo ${field} es obligatorio`);
      }
    }


    const codeExists = this.products.some(p => p.code === productData.code);
    if (codeExists) {
      throw new Error(`Ya existe un producto con el código ${productData.code}`);
    }


    const newProduct = {
      id: this.generateId(),
      title: productData.title,
      description: productData.description,
      code: productData.code,
      price: parseFloat(productData.price),
      status: productData.status !== undefined ? productData.status : true,
      stock: parseInt(productData.stock),
      category: productData.category,
      thumbnails: productData.thumbnails || []
    };

    this.products.push(newProduct);
    await this.saveProducts();
    return newProduct;
  }


  async updateProduct(id, updates) {
    await this.loadProducts();

    const index = this.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }


    if (updates.id) {
      delete updates.id;
    }


    this.products[index] = {
      ...this.products[index],
      ...updates
    };

    await this.saveProducts();
    return this.products[index];
  }


  async deleteProduct(id) {
    await this.loadProducts();

    const index = this.products.findIndex(p => p.id === parseInt(id));
    if (index === -1) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    const deletedProduct = this.products.splice(index, 1)[0];
    await this.saveProducts();
    return deletedProduct;
  }
}

export default ProductManager;