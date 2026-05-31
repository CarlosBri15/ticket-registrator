/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Mobile NativeWind config — aligned with the web kit
 * (`packages/frontend/src/index.css`, Chromatic v2): grafito brand, cream
 * surface, Manrope, stone-warm palette, soft shadows.
 *
 * Legacy `font-space-*` aliases are kept so callsites that still reference them
 * map to Manrope until the screen migration is complete.
 */

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:              ['Manrope-Regular'],
        'sans-medium':     ['Manrope-Medium'],
        'sans-semibold':   ['Manrope-SemiBold'],
        'sans-bold':       ['Manrope-Bold'],
        // Backward-compat aliases (legacy class names map to Manrope).
        space:             ['Manrope-Regular'],
        'space-medium':    ['Manrope-Medium'],
        'space-semibold':  ['Manrope-SemiBold'],
        'space-bold':      ['Manrope-Bold'],
        manrope:           ['Manrope-Regular'],
        'manrope-medium':  ['Manrope-Medium'],
        'manrope-semibold':['Manrope-SemiBold'],
        'manrope-bold':    ['Manrope-Bold'],
      },
      colors: {
        brand: {
          DEFAULT: '#1C1917',
          hover:   '#2A2724',
          light:   '#F5F4F0',
        },
        accent: {
          DEFAULT: '#F5C842',
          hover:   '#E8B82A',
          soft:    '#FBEFC1',
          faint:   '#FDF7E1',
        },
        stone: {
          50:  '#FAFAF8',
          100: '#F7F6F3',
          150: '#F5F4F0',
          200: '#ECEAE7',
          300: '#E5E4E0',
          400: '#D6D3CD',
          500: '#A8A29E',
          600: '#78716C',
          700: '#57534E',
          800: '#3D3935',
          900: '#1C1917',
        },
        sol:   '#F5C842',
        olive: '#8A8B3A',
        sage:  '#5C8A6E',
        sky:   '#5E81A8',
        plum:  '#8A5E89',
        clay:  '#B66B4A',

        dark:     '#1C1917',
        surface:  '#FFFDF8',
        sidebar:  '#1C1917',
        secondary:'#F5F4F0',
        success:  '#16A34A',
        warning:  '#D97706',
        danger:   '#DC2626',
        info:     '#2563EB',
        white:    '#FFFFFF',

        'surface-card':   '#FFFFFF',
        'surface-sunken': '#F7F6F3',
        'border-main':    '#E5E4E0',
        'border-strong':  '#D6D3CD',
      },
      boxShadow: {
        // Soft kit-aligned elevations (replaces the legacy hard pixel shadows).
        hard:      '0px 1px 3px rgba(28,25,23,0.06)',
        'hard-sm': '0px 1px 2px rgba(28,25,23,0.04)',
        'hard-lg': '0px 4px 16px rgba(28,25,23,0.08)',
        soft:      '0px 1px 3px rgba(28,25,23,0.06)',
        none:      'none',
      },
      borderWidth: {
        // Kit borders are 1px; 4 retained for any callsite still in flight.
        DEFAULT: '1px',
        3: '3px',
        4: '4px',
      },
      borderRadius: {
        card: '14px',
        kit:  '6px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
}
