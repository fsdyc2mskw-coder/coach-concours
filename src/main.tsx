import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import CoachConcoursApp from './CoachConcoursApp';
import './coach.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CoachConcoursApp />
  </StrictMode>
);
