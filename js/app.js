// Main Application
// Hash-based routing for kiosk navigation

import { loadTheme, loadObject } from './utils/content.js';
import { createThemePage } from './components/theme-page.js';
import { createObjectPage } from './components/object-page.js';

// Theme data organized by century (60 themes total)
const THEMES_BY_CENTURY = {
  '1500-tal': [
    { id: 'skogen', title: 'Den oumbärliga skogen', active: true },
    { id: 'finngarden', title: 'Med eld tämjer de skogen', active: false },
    { id: 'kyrkbacken', title: 'Kyrkan samlar byn', active: false },
    { id: 'familj', title: 'FAMILJ', active: false },
    { id: 'natur', title: 'NATUR', active: false },
    { id: 'tanke', title: 'TANKE', active: false },
    { id: 'elisabet-christoffersdotter', title: 'Elisabet Christoffersdotter', active: false },
    { id: 'inga-fran-tingevaara', title: 'Inga från Tingevaara', active: false },
    { id: 'joen-petri-klint', title: 'Joen Petri Klint', active: false },
    { id: 'samuel-kiechel', title: 'Samuel Kiechel', active: false }
  ],
  '1600-tal': [
    { id: 'adelsgodset', title: 'De adliga familjerna på godsen', active: false },
    { id: 'staden', title: 'Välkommen till staden', active: false },
    { id: 'dygd-och-dod', title: 'Ett dygdigt liv och en festlig begravning', active: false },
    { id: 'familj', title: 'FAMILJ', active: false },
    { id: 'natur', title: 'NATUR', active: false },
    { id: 'tanke', title: 'TANKE', active: false },
    { id: 'lars-nilsson', title: 'Lars Nilsson', active: false },
    { id: 'maria-sofia-de-la-gardie', title: 'Maria Sofia De La Gardie', active: false },
    { id: 'mats-ersson-nohrman', title: 'Mats Ersson Nohrman', active: false }
  ],
  '1700-tal': [
    { id: 'hemmet', title: 'Hemmets trygga tempel', active: false },
    { id: 'tradgarden', title: 'Fjärran lyx eller närproducerade varor', active: false },
    { id: 'tryckeriet', title: 'Orden flyger', active: false },
    { id: 'familj', title: 'FAMILJ', active: false },
    { id: 'natur', title: 'NATUR', active: false },
    { id: 'tanke', title: 'TANKE', active: false },
    { id: 'catharina-koberg', title: 'Catharina Koberg', active: false },
    { id: 'gideon', title: 'Gideon', active: false },
    { id: 'peter-forsskal', title: 'Peter Forsskål', active: false }
  ],
  '1800-tal': [
    { id: 'byn', title: 'Åkerns människor', active: false },
    { id: 'marknaden', title: 'Myllrande marknadsliv', active: false },
    { id: 'kafeet', title: 'Kaféet slår upp dörrarna', active: false },
    { id: 'bonehuset', title: 'En frälst gemenskap', active: false },
    { id: 'fosterlandet', title: 'Klasskamp och fosterlandskärlek', active: false },
    { id: 'framtidslandet', title: 'Framtidslandet i norr', active: false },
    { id: 'familj', title: 'FAMILJ', active: false },
    { id: 'natur', title: 'NATUR', active: false },
    { id: 'tanke', title: 'TANKE', active: false },
    { id: 'amanda-horney', title: 'Amanda Horney', active: false },
    { id: 'anna-karlsson', title: 'Anna Karlsson', active: false },
    { id: 'anna-nilsdotter', title: 'Anna Nilsdotter', active: false },
    { id: 'erik-ekstrom', title: 'Erik Ekström', active: false },
    { id: 'kristoffer-sjulsson', title: 'Kristoffer Sjulsson', active: false },
    { id: 'mathilda', title: 'Mathilda', active: false },
    { id: 'wilhelm-davidsson', title: 'Wilhelm Davidsson', active: false }
  ],
  '1900-tal': [
    { id: 'kriget', title: 'Andra världskriget', active: false },
    { id: 'rekordaren', title: 'Välfärdsrekord i Norden', active: false },
    { id: 'ritbordet', title: 'Framtiden på ritbordet', active: false },
    { id: 'valfardslandet', title: 'Höjd standard och höjda röster', active: false },
    { id: 'familj', title: 'FAMILJ', active: false },
    { id: 'tanke', title: 'TANKE', active: false },
    { id: 'familjen-barsom', title: 'Familjen Barsom', active: false },
    { id: 'hulda-hals', title: 'Hulda Hals', active: false },
    { id: 'lars', title: 'Lars', active: false },
    { id: 'lena-larsson', title: 'Lena Larsson', active: false },
    { id: 'selma-perten', title: 'Selma Pertén', active: false }
  ],
  '2000-tal': [
    { id: 'samtiden', title: 'Samtiden', active: false },
    { id: 'alla-spar', title: 'ALLA SPÅR', active: false },
    { id: 'dilemma-familj', title: 'Dilemma FAMILJ', active: false },
    { id: 'dilemma-natur', title: 'Dilemma NATUR', active: false },
    { id: 'dilemma-tanke', title: 'Dilemma TANKE', active: false }
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
