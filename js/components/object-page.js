// Object Page Component
// Displays detailed view of a single object

export function createObjectPage(objectData, onBack) {
  const page = document.createElement('div');
  page.className = 'page object-page';

  // Back button
  const backButton = document.createElement('button');
  backButton.className = 'back-button';
  backButton.innerHTML = `
    <span class="back-button__icon">&#8249;</span>
    <span>Tillbaka</span>
  `;
  backButton.addEventListener('click', onBack);
  page.appendChild(backButton);

  // Object header
  const header = document.createElement('header');
  header.className = 'object-header';
  header.innerHTML = `<h1 class="object-title">${objectData.title}</h1>`;
  page.appendChild(header);

  // Media section (image + timeline)
  const media = document.createElement('div');
  media.className = 'object-media';

  // Image
  const imageContainer = document.createElement('div');
  imageContainer.className = 'object-image-container';
  if (objectData.images && objectData.images.length > 0) {
    imageContainer.innerHTML = `
      <img
        class="object-image"
        src="${objectData.images[0]}"
        alt="${objectData.title}"
      >
    `;
  }
  media.appendChild(imageContainer);

  // Timeline
  const timelineContainer = document.createElement('div');
  timelineContainer.className = 'object-timeline';
  timelineContainer.appendChild(createTimeline(objectData.timeline));
  media.appendChild(timelineContainer);

  page.appendChild(media);

  // Meta information
  const meta = document.createElement('div');
  meta.className = 'object-meta';

  if (objectData.caption) {
    meta.innerHTML += `
      <div class="object-meta__item">
        <span class="object-meta__label">Bildtext</span>
        <span class="object-meta__value">${objectData.caption}</span>
      </div>
    `;
  }

  if (objectData.objectNumber) {
    meta.innerHTML += `
      <div class="object-meta__item">
        <span class="object-meta__label">Foremalsnummer</span>
        <span class="object-meta__value">${objectData.objectNumber}</span>
      </div>
    `;
  }

  if (meta.innerHTML) {
    page.appendChild(meta);
  }

  // Intro text
  if (objectData.intro) {
    const intro = document.createElement('p');
    intro.className = 'paragraph';
    intro.textContent = objectData.intro;
    page.appendChild(intro);
  }

  // Full description
  if (objectData.description && objectData.description.sections) {
    const description = document.createElement('div');
    description.className = 'object-description';

    objectData.description.sections.forEach(section => {
      const element = createDescriptionElement(section);
      if (element) {
        description.appendChild(element);
      }
    });

    page.appendChild(description);
  }

  return page;
}

function createTimeline(timeline) {
  const container = document.createElement('div');
  container.className = 'timeline';

  // Default periods if no timeline data
  const periods = timeline?.periods || [
    { label: '1500-tal', active: true },
    { label: '1600-tal', active: false },
    { label: '1700-tal', active: false },
    { label: '1800-tal', active: false },
    { label: '1900-tal', active: false },
    { label: '2000-tal', active: false }
  ];

  // Find active period index
  const activeIndex = periods.findIndex(p => p.active);

  // Create ruler with 10 segments (representing ~50 years each across 500 years)
  const ruler = document.createElement('div');
  ruler.className = 'timeline-ruler';

  for (let i = 0; i < 10; i++) {
    const segment = document.createElement('div');
    segment.className = 'timeline-ruler__segment';
    ruler.appendChild(segment);
  }

  // Add marker for active period
  if (activeIndex >= 0) {
    const marker = document.createElement('div');
    marker.className = 'timeline-ruler__marker';
    // Position marker based on which century is active (each century = ~16.67% width)
    const leftPos = (activeIndex * 100 / 6);
    const width = (100 / 6);
    marker.style.left = `${leftPos}%`;
    marker.style.width = `${width}%`;
    ruler.appendChild(marker);
  }

  container.appendChild(ruler);

  // Create legend
  const legend = document.createElement('div');
  legend.className = 'timeline-legend';

  // Show first and last labels only for cleaner look
  const firstPeriod = document.createElement('span');
  firstPeriod.className = `timeline-period${periods[0].active ? ' timeline-period--active' : ''}`;
  firstPeriod.textContent = '1500';
  legend.appendChild(firstPeriod);

  const lastPeriod = document.createElement('span');
  lastPeriod.className = `timeline-period${periods[periods.length - 1].active ? ' timeline-period--active' : ''}`;
  lastPeriod.textContent = '2000';
  legend.appendChild(lastPeriod);

  container.appendChild(legend);

  return container;
}

function createDescriptionElement(section) {
  switch (section.type) {
    case 'heading':
      const heading = document.createElement('h2');
      heading.className = 'heading';
      heading.textContent = section.text;
      return heading;

    case 'subheading':
      const subheading = document.createElement('h3');
      subheading.className = 'subheading';
      subheading.textContent = section.text;
      return subheading;

    case 'paragraph':
      const paragraph = document.createElement('p');
      paragraph.className = 'paragraph';
      paragraph.textContent = section.text;
      return paragraph;

    default:
      return null;
  }
}
