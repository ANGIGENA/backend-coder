import { Router } from 'express';
import CartManager from '../managers/CartManager.js';

const router = Router();
const cartManager = new CartManager('./src/data/carts.json');


router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    
    res.status(201).json({
      status: 'success',
      message: 'Carrito creado exitosamente',
      payload: newCart
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});


router.get('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartManager.getCartById(cid);
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      payload: cart.products
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});


router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.addProductToCart(cid, pid);
    
    res.json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;