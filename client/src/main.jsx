import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { App } from './App.jsx';
import { FournisseurCategories } from './contexts/CategoriesContext.jsx';

// Importe Bootstrap configuré aux couleurs de la Région, puis les styles
// du projet.
import './styles/main.scss';

// Les catégories sont chargées au-dessus de l'application pour être
// disponibles dans l'en-tête comme dans les pages.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FournisseurCategories>
        <App />
      </FournisseurCategories>
    </BrowserRouter>
  </StrictMode>
);
