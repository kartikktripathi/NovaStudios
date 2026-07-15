document.addEventListener('DOMContentLoaded', function() {
  const filterContainer = document.querySelector('.gallery-filter');
  const galleryGrid = document.querySelector('.gallery-grid');
  
  if (!filterContainer || !galleryGrid) return;
  
  // Category mapping matching the order of buttons in the HTML/translation
  const categories = ['all', 'films', 'animation', 'theme-parks', 'behind-the-scenes', 'concept-art'];
  const items = galleryGrid.querySelectorAll('.gallery-item');
  
  filterContainer.addEventListener('click', function(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    
    // Remove active class from all buttons
    filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    // Add active class to the clicked button
    btn.classList.add('active');
    
    // Find the index of the clicked button to get the category
    const buttons = Array.from(filterContainer.querySelectorAll('.filter-btn'));
    const index = buttons.indexOf(btn);
    if (index === -1) return;
    
    const selectedCategory = categories[index];
    
    // Show/hide gallery items based on their category
    items.forEach(item => {
      const itemCategory = item.getAttribute('data-category');
      if (selectedCategory === 'all' || itemCategory === selectedCategory) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
});
