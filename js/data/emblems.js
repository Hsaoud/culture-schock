// Emblèmes vectoriels des trois branches (style aplat + contour encré, lisibles en petit).
// Remplacés automatiquement par assets/art/branches.png (3 cases de 512 px) si ce fichier existe.
const INK = 'stroke="#07141a" stroke-linejoin="round"';

export const EMBLEMS = {
  spread: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="29" cy="35" r="22" fill="#1d6f8c" ${INK} stroke-width="3"/>
    <path d="M29 13A22 22 0 0 1 29 57Z" fill="#165a72"/>
    <circle cx="29" cy="35" r="22" fill="none" ${INK} stroke-width="3"/>
    <path d="M13 28c5-7 12-8 15-4 2 4-3 6-6 7-4 1-4 6-1 9-6-1-10-6-8-12z" fill="#57d38c" ${INK} stroke-width="2.2"/>
    <path d="M33 19c6-1 12 2 14 8-4 1-7-1-9 2 1 4 5 5 4 9-5 1-9-3-9-8 0-4-4-6 0-11z" fill="#57d38c" ${INK} stroke-width="2.2"/>
    <path d="M7 52C15 27 33 11 54 12" fill="none" stroke="#ffd76a" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="1 6"/>
    <g transform="translate(51 13) rotate(-14)">
      <path d="M-1-2-8-12h4l9 9zM-1 2-8 12h4l9-9zM-11-1-15-7h3l5 5z" fill="#ff7a59" ${INK} stroke-width="2"/>
      <path d="M-13 0 9-3c4 0 6 1.5 6 3s-2 3-6 3z" fill="#f4f8fb" ${INK} stroke-width="2"/>
    </g>
  </svg>`,
  cliche: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <path d="M46 2h12a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-5l-6 6v-6a4 4 0 0 1-5-4V6a4 4 0 0 1 4-4z" fill="#fff6e0" ${INK} stroke-width="2.5"/>
    <rect x="51" y="5" width="3" height="8" rx="1.3" fill="#ff5a48"/><circle cx="52.5" cy="16" r="1.8" fill="#ff5a48"/>
    <path d="M8 24c8-6 32-6 40 0 0 18-8 30-20 34C16 54 8 42 8 24z" fill="#ffe0b5"/>
    <path d="M28 19.5c8 0 15 1.7 20 4.5 0 18-8 30-20 34z" fill="#f0b07c"/>
    <path d="M8 24c8-6 32-6 40 0 0 18-8 30-20 34C16 54 8 42 8 24z" fill="none" ${INK} stroke-width="3"/>
    <path d="M14 33c3-4 8-4 11 0-3 2-8 2-11 0zM31 33c3-4 8-4 11 0-3 2-8 2-11 0z" fill="#07141a"/>
    <circle cx="17" cy="41" r="2.6" fill="#ff8a7a" opacity=".75"/><circle cx="39" cy="41" r="2.6" fill="#ff8a7a" opacity=".75"/>
    <path d="M28 43c-3-3-8-3-11 1 2 0 3 2 1 3 4 1 7-1 10-3 3 2 6 4 10 3-2-1-1-3 1-3-3-4-8-4-11-1z" fill="#2a1a12" ${INK} stroke-width="1.5"/>
    <path d="M22 50c4 3 8 3 12 0" fill="none" stroke="#07141a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M5 25c1-9 10-15 24-15s23 6 23 13c-10-4-35-5-47 2z" fill="#22223a" ${INK} stroke-width="2.5"/>
    <path d="M12 19c4-3 10-5 16-5" fill="none" stroke="#4d4d78" stroke-width="2" stroke-linecap="round"/>
    <path d="M29 10l1-5" stroke="#07141a" stroke-width="3" stroke-linecap="round"/>
  </svg>`,
  guard: `<svg viewBox="0 0 64 64" aria-hidden="true">
    <g ${INK} stroke-width="2.2">
      <path d="M6 9l4-3 41 41-3 4z" fill="#dbeef3"/><path d="M58 9l-4-3-41 41 3 4z" fill="#dbeef3"/>
      <path d="M43 50l7-7 4 4-7 7zM21 50l-7-7-4 4 7 7z" fill="#ffcf5a"/>
    </g>
    <path d="M32 8l19 6v15c0 15-8 24-19 29C21 53 13 44 13 29V14z" fill="#ffcf5a" ${INK} stroke-width="3"/>
    <path d="M32 13l14 4.5V29c0 12-6 19-14 23-8-4-14-11-14-23V17.5z" fill="#1b8a8f"/>
    <path d="M32 13v39c-8-4-14-11-14-23V17.5z" fill="#26aaa7"/>
    <path d="M32 26v-8l6 2.4-6 2.4" fill="#ff5a48" ${INK} stroke-width="1.5"/>
    <path d="M25 46V32h-2v-6h4v3h3v-3h4v3h3v-3h4v6h-2v14z" fill="#f6eedb" ${INK} stroke-width="2"/>
    <path d="M30 46v-5a2 2 0 0 1 4 0v5z" fill="#07141a"/>
  </svg>`,
};
