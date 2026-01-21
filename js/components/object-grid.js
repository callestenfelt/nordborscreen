// Object Grid Component
// Displays primary objects in a 4-column grid

export function createObjectGrid(objects, onObjectClick) {
  const grid = document.createElement('div');
  grid.className = 'object-grid';

  objects.forEach(obj => {
    const card = createObjectCard(obj, onObjectClick);
    grid.appendChild(card);
  });

  return grid;
}

function createObjectCard(obj, onClick) {
  const card = document.createElement('article');
  card.className = 'object-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', obj.title);

  card.innerHTML = `
    <img
      class="object-card__image"
      src="${obj.thumbnail}"
      alt="${obj.title}"
      loading="lazy"
    >
    <div class="object-card__title">${obj.title}</div>
  `;

  const handleClick = () => onClick(obj.id);

  card.addEventListener('click', handleClick);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  });

  return card;
}
