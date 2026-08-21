const starButtons = document.querySelectorAll('[data-github-stars]');

if (starButtons.length) {
  fetch('https://api.github.com/repos/harrisjose/easyhn', {
    headers: { Accept: 'application/vnd.github+json' }
  })
    .then((response) => {
      if (!response.ok) throw new Error('GitHub stars unavailable');
      return response.json();
    })
    .then(({ stargazers_count: count }) => {
      if (!Number.isInteger(count)) return;

      const compactCount = new Intl.NumberFormat('en', {
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(count);
      const fullCount = new Intl.NumberFormat('en').format(count);

      for (const button of starButtons) {
        button.querySelector('[data-github-star-number]').textContent = compactCount;
        button.querySelector('[data-github-star-count]').hidden = false;
        button.setAttribute(
          'aria-label',
          `Star Easy for Hacker News on GitHub (${fullCount} ${count === 1 ? 'star' : 'stars'})`
        );
      }
    })
    .catch(() => {
      // The link remains fully usable if GitHub is unavailable or rate-limited.
    });
}
