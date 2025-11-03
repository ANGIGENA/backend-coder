import express from 'express';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';

const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de E-commerce',
    endpoints: {
      products: '/api/products',
      carts: '/api/carts'
    }
  });
});


app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`  - GET    /api/products`);
  console.log(`  - GET    /api/products/:pid`);
  console.log(`  - POST   /api/products`);
  console.log(`  - PUT    /api/products/:pid`);
  console.log(`  - DELETE /api/products/:pid`);
  console.log(`  - POST   /api/carts`);
  console.log(`  - GET    /api/carts/:cid`);
  console.log(`  - POST   /api/carts/:cid/product/:pid`);
});

export default app;