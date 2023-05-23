/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    // eslint-disable-next-line no-undef
    plugins: [
        require("@headlessui/tailwindcss"),
        require("@tailwindcss/typography"),
        require('daisyui'),
    ],
    daisyui: {
        logs: false,
        themes: [
            {
                light: {
                    'primary': '#65c3c8',
                    'primary-focus': '#42b2b8',
                    'primary-content': '#ffffff',
                    'secondary': '#ef9fbc',
                    'secondary-focus': '#e7739e',
                    'secondary-content': '#ffffff',
                    'accent': '#eeaf3a',
                    'accent-focus': '#e09915',
                    'accent-content': '#ffffff',
                    'neutral': '#4E5969',
                    'neutral-focus': '#6B7785',
                    'neutral-content': '#ffffff',
                    'base-100': '#faf7f5',
                    'base-200': '#efeae6',
                    'base-300': '#e7e2df',
                    'base-content': '#261230',
                    'info': '#1c92f2',
                    'success': '#009485',
                    'warning': '#ff9900',
                    'error': '#ff5724',
                    '--rounded-box': '0.2rem',
                    '--rounded-btn': '0.2rem',
                    '--rounded-badge': '0.2rem',
                    '--animation-btn': '.05s',
                    '--animation-input': '.05s',
                    '--btn-text-case': 'uppercase',
                    '--navbar-padding': '.2rem',
                    '--border-btn': '1px'
                }
            }
        ]
    }
}

