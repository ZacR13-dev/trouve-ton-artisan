import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuration de Vite (serveur de développement et construction).
 * https://vite.dev/config/
 */
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // Échoue plutôt que de basculer sur un autre port : l'API n'autorise
    // que cette origine dans sa configuration CORS.
    strictPort: true
  },

  css: {
    preprocessorOptions: {
      scss: {
        /**
         * Bootstrap 5.3 utilise encore l'ancienne syntaxe @import de Sass,
         * dépréciée depuis Sass 1.80. Ces avertissements proviennent du
         * code de Bootstrap et non du nôtre : ils sont masqués pour
         * garder une sortie de compilation lisible.
         */
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function']
      }
    }
  }
});
