/* The products the home page shows: up to HOME_SHELF_MAX, in this order.

   Put the slugs of the analyses you want here (the part of a product page's address after /analysis/, for example
   "cosrx-bha-blackhead-power-liquid"). While the list is empty, or none of its slugs has a stored analysis, the home page shows the newest analyses instead,
   so every new analysis appears there on its own until you choose. A slug with no analysis yet is skipped, not shown as a gap. */
export const HOME_PICK_SLUGS: readonly string[] = [];

/** The most products the home page shows. */
export const HOME_SHELF_MAX = 5;
