import type { NavMenuItem } from './NavMenu';

/* The two header menus, shared by the desktop bar and the phone drawer.
   Each Community item scrolls to that page's community write-up; the WhatsApp
   join buttons live inside those write-ups. */

export const CONSUMER_MENU: NavMenuItem[] = [
  { label: 'Analyser', href: '/brands' },
  { label: 'Community', href: '/#community' },
  { label: 'Learn', href: '/education' },
];

export const BRAND_MENU: NavMenuItem[] = [
  { label: 'Certification', href: '/for-brands#certification' },
  { label: 'Community', href: '/for-brands#community' },
  { label: 'Directory', href: '/for-brands#directory' },
];
