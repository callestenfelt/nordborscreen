// Object Rail Component
// Horizontal scrolling rail for secondary objects

export function createObjectRail(objects, onObjectClick) {
  const container = document.createElement('div');
  container.className = 'object-rail-container';

  const rail = document.createElement('div');
  rail.className = 'object-rail';

  objects.forEach(obj => {
    const card = createRailCard(obj, onObjectClick);
    rail.appendChild(card);
  });

  // Create navigation arrows
  const leftArrow = createArrow('left', () => scrollRail(rail, -1));
  const rightArrow = createArrow('right', () => scrollRail(rail, 1));

  container.appendChild(leftArrow);
  container.appendChild(rail);
  container.appendChild(rightArrow);

  // Update arrow states on scroll
  rail.addEventListener('scroll', () => updateArrowStates(rail, leftArrow, rightArrow));
  updateArrowStates(rail, leftArrow, rightArrow);

  return container;
}

function createRailCard(obj, onClick) {
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

function createArrow(direction, onClick) {
  const button = document.createElement('button');
  button.className = `rail-arrow rail-arrow--${direction}`;
  button.setAttribute('aria-label', direction === 'left' ? 'Scroll left' : 'Scroll right');
  button.innerHTML = direction === 'left' ? '&#8249;' : '&#8250;';
  button.addEventListener('click', onClick);
  return button;
}

function scrollRail(rail, direction) {
  const scrollAmount = 440; // 2 cards + gap
  rail.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

function updateArrowStates(rail, leftArrow, rightArrow) {
  const isAtStart = rail.scrollLeft <= 0;
  const isAtEnd = rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 1;

  leftArrow.disabled = isAtStart;
  rightArrow.disabled = isAtEnd;
}
