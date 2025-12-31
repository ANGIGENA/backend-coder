import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

const router = Router();


router.post('/', async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    
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
    const cart = await CartModel.findById(cid).populate('products.product');
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }

    res.json({
      status: 'success',
      payload: cart
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
    

    const product = await ProductModel.findById(pid);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con id ${pid} no encontrado`
      });
    }
    

    const cart = await CartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }
    

    const productIndex = cart.products.findIndex(
      item => item.product.toString() === pid
    );
    
    if (productIndex !== -1) {

      cart.products[productIndex].quantity += 1;
    } else {

      cart.products.push({ product: pid, quantity: 1 });
    }
    
    await cart.save();
    

    const updatedCart = await CartModel.findById(cid).populate('products.product');
    
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


router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    
    const cart = await CartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }
    

    cart.products = cart.products.filter(
      item => item.product.toString() !== pid
    );
    
    await cart.save();
    
    const updatedCart = await CartModel.findById(cid).populate('products.product');
    
    res.json({
      status: 'success',
      message: 'Producto eliminado del carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});


router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({
        status: 'error',
        message: 'El campo products debe ser un arreglo'
      });
    }
    

    for (const item of products) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: `Producto con id ${item.product} no encontrado`
        });
      }
    }
    
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true, runValidators: true }
    ).populate('products.product');
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }
    
    res.json({
      status: 'success',
      message: 'Carrito actualizado exitosamente',
      payload: cart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});


router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'La cantidad debe ser un número mayor a 0'
      });
    }
    
    const cart = await CartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }
    
    const productIndex = cart.products.findIndex(
      item => item.product.toString() === pid
    );
    
    if (productIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: `Producto ${pid} no encontrado en el carrito`
      });
    }
    
    cart.products[productIndex].quantity = quantity;
    await cart.save();
    
    const updatedCart = await CartModel.findById(cid).populate('products.product');
    
    res.json({
      status: 'success',
      message: 'Cantidad actualizada exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});


router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    
    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );
    
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: `Carrito con id ${cid} no encontrado`
      });
    }
    
    res.json({
      status: 'success',
      message: 'Todos los productos eliminados del carrito',
      payload: cart
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

export default router;