import { createGlobalStyle } from 'styled-components'

const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: ${p => p.theme.colors.bg};
    color: ${p => p.theme.colors.text};
    font-family: ${p => p.theme.fonts.body};
    min-height: 100vh;
    overflow-x: hidden;
    line-height: 1.6;
  }

  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 64px 64px;
    pointer-events: none;
    z-index: 0;
  }

  #root {
    position: relative;
    z-index: 1;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes countUp {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @media print {
    body::before { display: none; }
    body { background: white; color: black; }
  }
`

export default GlobalStyles