import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.routes.js';
import downloadRoutes from './routes/download.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Seguridad de encabezados HTTP con Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Habilitar CORS
app.use(cors());

// Parseo de payloads JSON con límite amplio para fotos de móviles (50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir frontend público y recursos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Montaje de rutas
app.use('/api', apiRoutes);
app.use('/', downloadRoutes);

// Fallback a index.html para rutas que no sean API, tarjetas o recursos
app.get('*', (req, res, next) => {
  if (
    req.path.startsWith('/api') ||
    req.path.startsWith('/p') ||
    req.path.startsWith('/v') ||
    req.path.startsWith('/audio') ||
    req.path.startsWith('/download') ||
    req.path.startsWith('/view')
  ) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;
