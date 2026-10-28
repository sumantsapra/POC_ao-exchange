const SOCIAL = [
  { href: 'https://www.linkedin.com/company/tennis-australia/', icon: 'linkedin', label: 'Tennis Australia on LinkedIn' },
  { href: 'https://www.instagram.com/australianopen', icon: 'instagram', label: 'Australian Open on Instagram' },
  { href: 'https://www.tiktok.com/@ausopen', icon: 'tiktok', label: 'Australian Open on TikTok' },
  { href: 'https://www.facebook.com/AustralianOpen/', icon: 'facebook', label: 'Australian Open on Facebook' },
];

/**
 * Site footer: wordmark, social links, and the copyright line.
 * @param {Element} block Footer block
 */
export default function decorate(block) {
  const bar = document.createElement('div');
  bar.className = 'footer-bar';

  const brand = document.createElement('a');
  brand.href = 'https://ausopen.com/';
  brand.innerHTML = '<img src="/media/footer-logo.png" alt="Australian Open">';

  const social = document.createElement('div');
  social.className = 'footer-social';
  SOCIAL.forEach((item) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.setAttribute('aria-label', item.label);
    a.innerHTML = `<img src="/icons/${item.icon}.svg" alt="">`;
    social.append(a);
  });

  bar.append(brand, social);

  const legal = document.createElement('p');
  legal.className = 'footer-legal';
  legal.textContent = 'COPYRIGHT|TENNIS AUSTRALIA ALL RIGHTS RESERVED';

  block.replaceChildren(bar, legal);
}
