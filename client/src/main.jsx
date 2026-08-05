/**
 * Point d'entrée de l'application React.
 *
 * L'ordre des fournisseurs a son importance : le routeur enveloppe le
 * reste, et les catégories sont chargées au-dessus de l'application pour
 * être disponibles dans l'en-tête comme dans les pages.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App.jsx';
import { FournisseurCategories } from './contexts/CategoriesContext.jsx';

// Feuille de style unique : elle importe Bootstrap configuré aux
// couleurs de la Région, puis les styles du projet.
import './styles/main.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurCategories>
        <App />
      </FournisseurCategories>
    </BrowserRouter>
  </StrictMode>
);
