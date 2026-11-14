export function mountLookbook() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (entry.target.matches(':focus-within')) continue;
      entry.target.classList.add('lookbook-arrive');
    }
  }, { threshold: .18 });

  document.querySelectorAll('[data-lookbook-reveal]').forEach(element => observer.observe(element));
}

