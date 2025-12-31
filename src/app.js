import express from 'express';
import { create } from 'express-handlebars';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { connectDB } from './config/database.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { ProductModel } from './models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;


connectDB();


const hbs = create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts',
  helpers: {
    multiply: (a, b) => a * b,
    eq: (a, b) => a === b,
    or: (a, b) => a || b
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);


app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de E-commerce',
    endpoints: {
      products: '/api/products',
      carts: '/api/carts',
      views: {
        products: '/products',
        productDetail: '/products/:pid',
        cart: '/carts/:cid',
        realTimeProducts: '/realtimeproducts'
      }
    }
  });
});


app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});


const httpServer = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Endpoints disponibles:`);
  console.log(`\n  API REST:`);
  console.log(`    - GET    /api/products`);
  console.log(`    - GET    /api/products/:pid`);
  console.log(`    - POST   /api/products`);
  console.log(`    - PUT    /api/products/:pid`);
  console.log(`    - DELETE /api/products/:pid`);
  console.log(`    - POST   /api/carts`);
  console.log(`    - GET    /api/carts/:cid`);
  console.log(`    - POST   /api/carts/:cid/product/:pid`);
  console.log(`    - DELETE /api/carts/:cid/products/:pid`);
  console.log(`    - PUT    /api/carts/:cid`);
  console.log(`    - PUT    /api/carts/:cid/products/:pid`);
  console.log(`    - DELETE /api/carts/:cid`);
  console.log(`\n  Vistas:`);
  console.log(`    - GET    /products (con paginación)`);
  console.log(`    - GET    /products/:pid (detalle)`);
  console.log(`    - GET    /carts/:cid (carrito)`);
  console.log(`    - GET    /realtimeproducts`);
});


const io = new Server(httpServer);


app.set('io', io);


io.on('connection', (socket) => {
  console.log('✅ Nuevo cliente conectado:', socket.id);


  ProductModel.find().lean().then(products => {
    socket.emit('updateProducts', products);
  });


  socket.on('addProduct', async (productData) => {
    try {
      const newProduct = await ProductModel.create(productData);
      
      const products = await ProductModel.find().lean();
      io.emit('updateProducts', products);
      
      socket.emit('productAdded', {
        success: true,
        message: 'Producto agregado exitosamente',
        product: newProduct
      });
    } catch (error) {
      socket.emit('productError', {
        success: false,
        message: error.message
      });
    }
  });


  socket.on('deleteProduct', async (productId) => {
    try {
      await ProductModel.findByIdAndDelete(productId);
      
      const products = await ProductModel.find().lean();
      io.emit('updateProducts', products);
      
      socket.emit('productDeleted', {
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      socket.emit('productError', {
        success: false,
        message: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

export default app;