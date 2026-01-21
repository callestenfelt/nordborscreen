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

  periods.forEach(period => {
    const marker = document.createElement('div');
    marker.className = `timeline-marker${period.active ? ' timeline-marker--active' : ''}`;
    marker.innerHTML = `
      <span class="timeline-period${period.active ? ' timeline-period--active' : ''}">${period.label}</span>
    `;
    container.appendChild(marker);
  });

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
