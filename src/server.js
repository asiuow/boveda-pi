import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Bóveda Digital Activo en Puerto: ${PORT}`);
  console.log(`🌐 URL Local: http://localhost:${PORT}`);
  console.log(`📦 Bóveda Blindada: /src/vault (Aislamiento Total)`);
  console.log(`🔑 Entorno: ${config.nodeEnv}`);
  console.log(`====================================================`);
});
