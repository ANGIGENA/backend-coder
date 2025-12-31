import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';

const router = Router();


router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;


    const filter = {};
    if (query) {

      if (query === 'available') {
        filter.stock = { $gt: 0 };
      } else {
        filter.category = query;
      }
    }


    const sortOption = {};
    if (sort === 'asc') {
      sortOption.price = 1;
    } else if (sort === 'desc') {
      sortOption.price = -1;
    }


    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOption,
      lean: true
    };


    const result = await ProductModel.paginate(filter, options);


    const response = {
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage 
        ? `/api/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
        : null,
      nextLink: result.hasNextPage 
        ? `/api/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
        : null
    };

    res.json(response);
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
    const product = await ProductModel.findById(pid);
    
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
    const newProduct = await ProductModel.create(productData);
    

    const io = req.app.get('io');
    const products = await ProductModel.find().lean();
    io.emit('updateProducts', products);
    
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
    

    delete updates._id;
    
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      pid,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con id ${pid} no encontrado`
      });
    }
    

    const io = req.app.get('io');
    const products = await ProductModel.find().lean();
    io.emit('updateProducts', products);
    
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
    const deletedProduct = await ProductModel.findByIdAndDelete(pid);
    
    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: `Producto con id ${pid} no encontrado`
      });
    }
    

    const io = req.app.get('io');
    const products = await ProductModel.find().lean();
    io.emit('updateProducts', products);
    
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