Uso de desarrollo seguro
=======================

Pasos recomendados para evitar fallos por caché o puertos ocupados al trabajar en desarrollo:

1. Iniciar el servidor de desarrollo limpio (elimina `.next` y libera el puerto 3000):

   ```bash
   npm run dev:clean
   ```

2. Si sólo quieres iniciar el dev server sin limpiar: 

   ```bash
   npm run dev
   ```

3. Antes de iniciar el servidor de producción asegúrate de que no hay procesos en el puerto 3000:

   ```bash
   npm run build
   npm run start
   ```

   Nota: `prestart` ya libera el puerto si es necesario.

Buenas prácticas adicionales:
- No ejecutar `npm run dev` y `npm run start` simultáneamente en la misma máquina/puerto.
- Si trabajas con múltiples ramas, usa `npm run dev:clean` tras cambiar de rama cuando notes comportamientos extraños.
- Considera usar un proceso gestor (pm2, systemd) para el servidor de producción para evitar colisiones de puerto accidental.
