import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');


router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json({
      status: 'success',
      payload: products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});


router.get('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con id ${pid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      payload: product
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});


router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await productManager.addProduct(productData);
    
    res.status(201).json({
      status: 'success',
      message: 'Producto creado exitosamente',
      payload: newProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});


router.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const updates = req.body;
    
    const updatedProduct = await productManager.updateProduct(pid, updates);
    
    res.json({
      status: 'success',
      message: 'Producto actualizado exitosamente',
      payload: updatedProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});


router.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const deletedProduct = await productManager.deleteProduct(pid);
    
    res.json({
      status: 'success',
      message: 'Producto eliminado exitosamente',
      payload: deletedProduct
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;