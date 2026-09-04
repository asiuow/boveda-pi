import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
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

// Resolución inteligente de tarjetas (soporta carpetas /cards y /public/img/cards, y nombres card-1.png, 01.png, 1.png)
app.get(['/img/cards/:file', '/cards/:file'], (req, res, next) => {
  const file = req.params.file;
  const possiblePaths = [
    path.join(__dirname, '../public/img/cards', file),
    path.join(__dirname, '../cards', file)
  ];

  const match = file.match(/^(?:card-)?0?(\d+)(\.[a-zA-Z0-9]+)$/i);
  if (match) {
    const num = match[1];
    const ext = match[2];
    const padNum = num.padStart(2, '0');
    possiblePaths.push(
      path.join(__dirname, '../public/img/cards', `card-${num}${ext}`),
      path.join(__dirname, '../cards', `card-${num}${ext}`),
      path.join(__dirname, '../public/img/cards', `${padNum}${ext}`),
      path.join(__dirname, '../cards', `${padNum}${ext}`),
      path.join(__dirname, '../public/img/cards', `${num}${ext}`),
      path.join(__dirname, '../cards', `${num}${ext}`)
    );
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) {
      return res.sendFile(p);
    }
  }
  next();
});

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
