/**
 * Entrada serverless para Vercel. Exporta la instancia Express de Nest.
 */
import { AppFactory } from '../src/app.factory';

export default AppFactory.create().expressApp;
