import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Descomentar y ajustar la siguiente línea con el nombre de tu repo si el CSS no carga en GitHub Pages
  // base: '/nombre-de-tu-repositorio',
  integrations: [react(), tailwind()]
});
