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

// Seguridad de encabezados HTTP con Helmet (Blindaje de servidor)
app.use(
  helmet({
    contentSecurityPolicy: false, // Permitir estilos inline en frontend moderno
    crossOriginEmbedderPolicy: false
  })
);

// Habilitar CORS
app.use(cors());

// Parseo de payloads JSON y URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir ÚNICAMENTE el frontend público (La carpeta vault NUNCA se expone públicamente)
app.use(express.static(path.join(__dirname, '../public')));

// Montaje de rutas
app.use('/api', apiRoutes);
app.use('/', downloadRoutes);

// Fallback a index.html para SPA/Mobile view
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/download') || req.path.startsWith('/view')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

export default app;
