import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();


router.get('/products', async (req, res) => {
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

    res.render('products', {
      title: 'Productos',
      products: result.docs,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      totalPages: result.totalPages,
      prevLink: result.hasPrevPage 
        ? `/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
        : null,
      nextLink: result.hasNextPage 
        ? `/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
        : null,
      sort,
      query
    });
  } catch (error) {
    res.status(500).render('products', {
      title: 'Error',
      error: 'Error al cargar los productos',
      products: []
    });
  }
});


router.get('/products/:pid', async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await ProductModel.findById(pid).lean();
    
    if (!product) {
      return res.status(404).render('productDetail', {
        title: 'Producto no encontrado',
        error: 'El producto solicitado no existe'
      });
    }

    res.render('productDetail', {
      title: product.title,
      product
    });
  } catch (error) {
    res.status(500).render('productDetail', {
      title: 'Error',
      error: 'Error al cargar el producto'
    });
  }
});


router.get('/carts/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid).populate('products.product').lean();
    
    if (!cart) {
      return res.status(404).render('cart', {
        title: 'Carrito no encontrado',
        error: 'El carrito solicitado no existe'
      });
    }


    const total = cart.products.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);

    res.render('cart', {
      title: 'Mi Carrito',
      cart,
      products: cart.products,
      total: total.toFixed(2),
      hasProducts: cart.products.length > 0
    });
  } catch (error) {
    res.status(500).render('cart', {
      title: 'Error',
      error: 'Error al cargar el carrito'
    });
  }
});


router.get('/', (req, res) => {
  res.redirect('/products');
});


router.get('/realtimeproducts', async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
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