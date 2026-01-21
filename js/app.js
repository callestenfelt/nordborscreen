// Main Application
// Hash-based routing for kiosk navigation

import { loadTheme, loadObject } from './utils/content.js';
import { createThemePage } from './components/theme-page.js';
import { createObjectPage } from './components/object-page.js';

class KioskApp {
  constructor() {
    this.container = document.getElementById('app');
    this.currentPage = null;
    this.themeData = null;

    // Bind methods
    this.handleHashChange = this.handleHashChange.bind(this);
    this.navigateToObject = this.navigateToObject.bind(this);
    this.navigateToTheme = this.navigateToTheme.bind(this);
  }

  async init() {
    this.showLoading();

    try {
      // Load theme data
      this.themeData = await loadTheme();

      // Set up routing
      window.addEventListener('hashchange', this.handleHashChange);

      // Initial route
      this.handleHashChange();
    } catch (error) {
      this.showError('Kunde inte ladda innehall. Forsok igen senare.');
      console.error('Failed to initialize app:', error);
    }
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
