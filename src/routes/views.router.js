import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');


router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', {
      title: 'Lista de Productos',
      products: products,
      hasProducts: products.length > 0
    });
  } catch (error) {
    res.status(500).render('home', {
      title: 'Error',
      error: 'Error al cargar los productos',
      hasProducts: false
    });
  }
});


router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', {
      title: 'Productos en Tiempo Real',
      products: products,
      hasProducts: products.length > 0
    });
  } catch (error) {
    res.status(500).render('realTimeProducts', {
      title: 'Error',
      error: 'Error al cargar los productos',
      hasProducts: false
    });
  }
});

export default router;