import express from 'express';
import { create } from 'express-handlebars';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8080;


const hbs = create({
  extname: '.handlebars',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts',
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
        home: '/',
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
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`  API:`);
  console.log(`    - GET    /api/products`);
  console.log(`    - GET    /api/products/:pid`);
  console.log(`    - POST   /api/products`);
  console.log(`    - PUT    /api/products/:pid`);
  console.log(`    - DELETE /api/products/:pid`);
  console.log(`    - POST   /api/carts`);
  console.log(`    - GET    /api/carts/:cid`);
  console.log(`    - POST   /api/carts/:cid/product/:pid`);
  console.log(`  Vistas:`);
  console.log(`    - GET    / (home)`);
  console.log(`    - GET    /realtimeproducts`);
});


const io = new Server(httpServer);


app.set('io', io);


io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

export default app;