// Theme Page Component
// Displays the main theme with primary and secondary objects

import { createObjectGrid } from './object-grid.js';
import { createObjectRail } from './object-rail.js';

export function createThemePage(themeData, onObjectClick) {
  const page = document.createElement('div');
  page.className = 'page theme-page';

  // Header
  const header = document.createElement('header');
  header.className = 'theme-header';
  header.innerHTML = `
    <h1 class="title">${themeData.title}</h1>
    <p class="ingress">${themeData.ingress}</p>
  `;
  page.appendChild(header);

  // Primary Objects Section
  if (themeData.primaryObjects && themeData.primaryObjects.length > 0) {
    const primarySection = document.createElement('section');
    primarySection.innerHTML = `<h2 class="section-header">Nyckelforemål</h2>`;

    const grid = createObjectGrid(themeData.primaryObjects, onObjectClick);
    primarySection.appendChild(grid);
    page.appendChild(primarySection);
  }

  // Secondary Objects Section
  if (themeData.secondaryObjects && themeData.secondaryObjects.length > 0) {
    const secondarySection = document.createElement('section');
    secondarySection.innerHTML = `<h2 class="section-header">Ovriga foremål</h2>`;

    const rail = createObjectRail(themeData.secondaryObjects, onObjectClick);
    secondarySection.appendChild(rail);
    page.appendChild(secondarySection);
  }

  return page;
}
