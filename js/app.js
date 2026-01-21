// Main Application
// Hash-based routing for kiosk navigation

import { loadTheme, loadObject } from './utils/content.js';
import { createThemePage } from './components/theme-page.js';
import { createObjectPage } from './components/object-page.js';

// Theme data: Century → Room → Themes
const THEMES_DATA = {
  '1500': {
    'Skogen': [
      { id: 'samerna-handlar-med-dyra-palsverk', title: 'Samerna handlar med dyra pälsverk', active: true },
      { id: 'trygghet-och-oro-i-skogen', title: 'Trygghet och oro i skogen' },
      { id: 'samuel-kiechels-resa-i-norden', title: 'Samuel Kiechels resa i Norden' }
    ],
    'Finngården': [
      { id: 'en-magisk-varld', title: 'En magisk värld' },
      { id: 'leva-och-overleva-i-vinterskogen', title: 'Leva och överleva i vinterskogen' },
      { id: 'skogsfinnarnas-resa', title: 'Skogsfinnarnas resa' }
    ],
    'Kyrkbacken': [
      { id: 'nya-stromningar-nar-norden', title: 'Nya strömningar når Norden' },
      { id: 'den-langa-reformationen', title: 'Den långa reformationen' },
      { id: 'varldsbild-och-vetande', title: 'Världsbild och vetande' }
    ]
  },
  '1600': {
    'Adelsgodset': [
      { id: 'jord-och-makt', title: 'Jord och makt' },
      { id: 'varldsbild-och-sjalvbild', title: 'Världsbild och självbild' }
    ],
    'Staden': [
      { id: 'staden-som-statens-verktyg', title: 'Staden som statens verktyg' },
      { id: 'stadsliv', title: 'Stadsliv' },
      { id: 'uppstader-stapelstader-och-kolonier', title: 'Uppstäder, stapelstäder och kolonier' },
      { id: 'skra-och-hantverk', title: 'Skrå och hantverk' }
    ],
    'Dygd och död': [
      { id: 'den-dygdiga-manniskan', title: 'Den dygdiga människan' },
      { id: 'en-hedersam-dod', title: 'En hedersam död' },
      { id: 'begravningar-i-bondbyarna', title: 'Begravningar i bondbyarna' },
      { id: 'aktenskapet-bevarar-ordningen', title: 'Äktenskapet bevarar ordningen' }
    ]
  },
  '1700': {
    'Trädgården': [
      { id: 'naturen-som-ymnighetshorn-i', title: 'Naturen som ymnighetshorn I' },
      { id: 'naturen-som-ymnighetshorn-ii', title: 'Naturen som ymnighetshorn II' },
      { id: 'en-globaliserad-varuvarld-i', title: 'En globaliserad varuvärld I' },
      { id: 'en-globaliserad-varuvarld-ii', title: 'En globaliserad varuvärld II' },
      { id: 'en-ny-sorts-lyx-i', title: 'En ny sorts lyx I' },
      { id: 'en-ny-sorts-lyx-ii', title: 'En ny sorts lyx II' }
    ],
    'Hemmet': [
      { id: 'ett-nytt-satt-att-bo', title: 'Ett nytt sätt att bo' },
      { id: 'modrar-barn-och-familjeliv', title: 'Mödrar, barn och familjeliv' }
    ],
    'Tryckeriet': [
      { id: 'friheten-och-ordets-makt', title: 'Friheten och ordets makt' },
      { id: 'konst-kultur-och-politisk-dramatik', title: 'Konst, kultur och politisk dramatik' }
    ]
  },
  '1800': {
    'Byn': [
      { id: 'bondbrollop', title: 'Bondbröllop' },
      { id: 'laga-skiftet-och-mattande-potatis', title: 'Laga skiftet och mättande potatis' },
      { id: 'landsbygdens-nya-underklass', title: 'Landsbygdens nya underklass' },
      { id: 'slojd-och-hantverk-i-byn', title: 'Slöjd och hantverk i byn' },
      { id: 'hemgiften', title: 'Hemgiften' },
      { id: 'till-amerika', title: 'Till Amerika' }
    ],
    'Marknaden': [
      { id: 'antligen-marknad', title: 'Äntligen marknad' },
      { id: 'dalfolkets-langa-vandringar', title: 'Dalfolkets långa vandringar' },
      { id: 'varor-fran-nar-och-fjarran', title: 'Varor från när och fjärran' },
      { id: 'marknaden-blir-ett-nojesfalt', title: 'Marknaden blir ett nöjesfält' }
    ],
    'Framtidslandet': [
      { id: 'samisk-renskotsel-och-undantrangning', title: 'Samisk renskötsel och undanträngning' },
      { id: 'johan-turi-och-samernas-liv', title: 'Johan Turi och samernas liv' },
      { id: 'rorelser-i-norr', title: 'Rörelser i norr' },
      { id: 'norrlands-slumrande-skatter', title: 'Norrlands slumrande skatter' },
      { id: 'fran-byn-till-industriorten', title: 'Från byn till industriorten' },
      { id: 'trapatroner-sagverk-och-arbetarrorelse', title: 'Träpatroner, sågverk och arbetarrörelse' }
    ],
    'Bönehuset': [
      { id: 'bibeln-utspelar-sig-i-bondens-hem', title: 'Bibeln utspelar sig i bondens hem' },
      { id: 'religionsfrihet-i-norden', title: 'Religionsfrihet i Norden' },
      { id: 'ratten-till-en-egen-tro', title: 'Rätten till en egen tro' },
      { id: 'gemensam-kamp-mot-fylleriet', title: 'Gemensam kamp mot fylleriet' }
    ],
    'Kaféet': [
      { id: 'en-publik-salong', title: 'En publik salong' },
      { id: 'bonbons-bakelser-och-raffinerade-drycker', title: 'Bonbons, bakelser och raffinerade drycker' }
    ],
    'Fosterlandet': [
      { id: 'nationen-och-naturen', title: 'Nationen och naturen' },
      { id: 'folklig-kultur-och-rattvisa', title: 'Folklig kultur och rättvisa' },
      { id: 'raslaran-och-folket', title: 'Rasläran och folket' }
    ]
  },
  '1900': {
    'Ritbordet': [
      { id: 'bostadsfragan-pa-agendan', title: 'Bostadsfrågan på agendan' },
      { id: 'vita-rockar-stoppur-och-linjaler', title: 'Vita rockar, stoppur och linjaler' },
      { id: 'befolkningspolitik', title: 'Befolkningspolitik' }
    ],
    'Kriget': [
      { id: 'civilsamhallets-vardag', title: 'Civilsamhällets vardag' },
      { id: 'flykt-motstand-och-diplomati', title: 'Flykt, motstånd och diplomati' }
    ],
    'Rekordåren': [
      { id: 'tonaringen-och-den-lyckliga-ungdomstiden', title: 'Tonåringen och den lyckliga ungdomstiden' },
      { id: 'karnfamiljen-i-valfardssverige', title: 'Kärnfamiljen i välfärdssverige' },
      { id: 'konsrollerna-i-familjen', title: 'Könsrollerna i familjen' }
    ],
    'Välfärdslandet': [
      { id: 'tre-rum-och-kok', title: 'Tre rum och kök' },
      { id: 'tillsammans-for-en-battre-varld', title: 'Tillsammans för en bättre värld' },
      { id: 'slalom-sameslojd-oljekris', title: 'Slalom, sameslöjd, oljekris' },
      { id: 'mot-nya-aventyr', title: 'Mot nya äventyr' }
    ]
  },
  '2000': {
    'Samtiden': [
      { id: 'vilse-i-ett-forandrat-klimat', title: 'Vilse i ett förändrat klimat' },
      { id: 'leva-tillsammans-i-norden', title: 'Leva tillsammans i Norden' },
      { id: 'varldlig-tro-och-andlig-frihet', title: 'Världslig tro och andlig frihet' }
    ]
  }
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

    for (const [century, rooms] of Object.entries(THEMES_DATA)) {
      html += `
        <section class="menu-century">
          <h3 class="menu-century__header">${century}-tal</h3>
          ${Object.entries(rooms).map(([roomName, themes]) => `
            <div class="menu-room">
              <h4 class="menu-room__header">${roomName}</h4>
              <ul class="menu-room__list">
                ${themes.map(theme => `
                  <li class="menu-room__item">
                    <a href="#/" class="menu-room__link${theme.active ? ' is-active' : ''}" data-theme="${theme.id}">
                      ${theme.title}
                    </a>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
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
