/** Retained compatibility hook after removal of the custom text-size control. */
window.TechouseReadability = {
  mount() {
    document.documentElement.classList.remove('larger-text');
  },
};
