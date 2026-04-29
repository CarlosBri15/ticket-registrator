module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        space: ['SpaceGrotesk-Regular'],
        'space-medium': ['SpaceGrotesk-Medium'],
        'space-semibold': ['SpaceGrotesk-SemiBold'],
        'space-bold': ['SpaceGrotesk-Bold'],
      },
      colors: {
        brand: {
          DEFAULT: '#4D4DFF',
          hover: '#3A3AC2',
          light: '#7575FF',
        },
        dark: '#1A1A1A',
        surface: '#F5F5F5',
        success: '#00C896',
        danger: '#FF4B4B',
        white: '#FFFFFF',
      },
      boxShadow: {
        hard: '4px 4px 0px #1A1A1A',
        'hard-sm': '2px 2px 0px #1A1A1A',
        'hard-lg': '6px 6px 0px #1A1A1A',
      },
      borderWidth: {
        3: '3px',
        4: '4px',
        b: '0', // Reset if needed
      },
    },
  },
  plugins: [],
}