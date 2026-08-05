import { Router } from 'express';
import { listerCategories } from '../controllers/categorie.controller.js';

export const categorieRoutes = Router();

categorieRoutes.get('/', listerCategories);
