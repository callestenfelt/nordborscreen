// Main Application
// Hash-based routing for kiosk navigation

import { loadTheme, loadObject } from './utils/content.js';
import { createThemePage } from './components/theme-page.js';
import { createObjectPage } from './components/object-page.js';

// Theme data organized by century
const THEMES_BY_CENTURY = {
  '1500-tal': [
    { id: 'samerna-handlar-med-dyra-palsverk', title: 'Samerna handlar med dyra pälsverk', active: true }
  ],
  '1600-tal': [
    { id: 'example-1600', title: 'Exempel 1600-tal', active: false }
  ],
  '1700-tal': [
    { id: 'example-1700', title: 'Exempel 1700-tal', active: false }
  ],
  '1800-tal': [
    { id: 'example-1800', title: 'Exempel 1800-tal', active: false }
  ],
  '1900-tal': [
    { id: 'example-1900', title: 'Exempel 1900-tal', active: false }
  ],
  '2000-tal': [
    { id: 'example-2000', title: 'Exempel 2000-tal', active: false }
  ]
};

class KioskApp {
  constructor() {
    this.container = document.getElementById('app');
    this.currentPage = null;
    this.themeData = null;
    this.menuOverlay = null;

    // Bind methods
    this.handleHashChange = this.handleHashChange.bind(this);
    this.navigateToObject = this.navigateToObject.bind(this);
    this.navigateToTheme = this.navigateToTheme.bind(this);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  async init() {
    this.showLoading();

    try {
      // Load theme data
      this.themeData = await loadTheme();

      // Create hidden menu trigger and overlay
      this.createMenu();

      // Set up routing
      window.addEventListener('hashchange', this.handleHashChange);

      // Initial route
      this.handleHashChange();
    } catch (error) {
      this.showError('Kunde inte ladda innehall. Forsok igen senare.');
      console.error('Failed to initialize app:', error);
    }
  }

  createMenu() {
    // Hidden trigger in upper right corner
    const trigger = document.createElement('button');
    trigger.className = 'menu-trigger';
    trigger.setAttribute('aria-label', 'Öppna meny');
    trigger.addEventListener('click', this.openMenu);
    document.body.appendChild(trigger);

    // Menu overlay
    this.menuOverlay = document.createElement('div');
    this.menuOverlay.className = 'menu-overlay';
    this.menuOverlay.innerHTML = `
      <header class="menu-overlay__header">
        <h2 class="menu-overlay__title">Välj tema</h2>
        <button class="menu-overlay__close" aria-label="Stäng meny">×</button>
      </header>
      <div class="menu-overlay__content">
        ${this.renderMenuContent()}
      </div>
    `;

    // Close button handler
    this.menuOverlay.querySelector('.menu-overlay__close').addEventListener('click', this.closeMenu);

    // Close on backdrop click
    this.menuOverlay.addEventListener('click', (e) => {
      if (e.target === this.menuOverlay) {
        this.closeMenu();
      }
    });

    document.body.appendChild(this.menuOverlay);
  }

  renderMenuContent() {
    let html = '';

    for (const [century, themes] of Object.entries(THEMES_BY_CENTURY)) {
      html += `
        <section class="menu-century">
          <h3 class="menu-century__header">${century}</h3>
          <ul class="menu-century__list">
            ${themes.map(theme => `
              <li class="menu-century__item">
                <a href="#/" class="menu-century__link${theme.active ? ' is-active' : ''}" data-theme="${theme.id}">
                  ${theme.title}
                </a>
              </li>
            `).join('')}
          </ul>
        </section>
      `;
    }

    return html;
  }

  openMenu() {
    this.menuOverlay.classList.add('is-open');
  }

  closeMenu() {
    this.menuOverlay.classList.remove('is-open');
  }

  handleHashChange() {
    const hash = window.location.hash || '#/';
    const [, route, objectId] = hash.match(/^#\/(object\/)?(.*)$/) || [];

    if (route === 'object/' && objectId) {
      this.showObjectPage(objectId);
    } else {
      this.showThemePage();
    }
  }

  showThemePage() {
    const page = createThemePage(this.themeData, this.navigateToObject);
    this.setPage(page);
  }

  async showObjectPage(objectId) {
    this.showLoading();

    try {
      const objectData = await loadObject(objectId);
      const page = createObjectPage(objectData, this.navigateToTheme);
      this.setPage(page);
    } catch (error) {
      this.showError('Kunde inte ladda foremal.');
      console.error('Failed to load object:', error);
    }
  }

  navigateToObject(objectId) {
    window.location.hash = `#/object/${objectId}`;
  }

  navigateToTheme() {
    window.location.hash = '#/';
  }

  setPage(pageElement) {
    // Remove current page
    if (this.currentPage) {
      this.container.removeChild(this.currentPage);
    }

    // Add new page
    this.container.appendChild(pageElement);
    this.currentPage = pageElement;

    // Scroll to top
    pageElement.scrollTop = 0;
  }

  showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Laddar';
    this.setPage(loading);
  }

  showError(message) {
    const error = document.createElement('div');
    error.className = 'page';
    error.innerHTML = `
      <div class="heading" style="text-align: center; margin-top: 200px;">
        ${message}
      </div>
    `;
    this.setPage(error);
  }
}

// Initialize app
const app = new KioskApp();
app.init();
