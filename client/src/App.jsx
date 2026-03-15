import { useState, useEffect } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import GlobalStyles from './GlobalStyles'
import { theme } from './theme'
import { analyzeUrl } from './api'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Loading from './components/Loading'
import Report from './components/Report'

const Wrap = styled.div`
  max-width: 880px;
  margin: 0 auto;
  padding: 0 28px;

  @media (max-width: 600px) {
    padding: 0 20px;
  }
`

const Footer = styled.footer`
  text-align: center;
  padding: 40px 0;
  font-size: 12px;
  color: ${p => p.theme.colors.dim};
  border-top: 1px solid ${p => p.theme.colors.border};
  margin-top: 80px;
  letter-spacing: 0.05em;

  span { color: ${p => p.theme.colors.green}; }

  @media print { display: none; }
`

const STEP_DELAYS = [0, 2000, 5000]

export default function App() {
  const [state, setState] = useState('idle') // idle | loading | done
  const [loadStep, setLoadStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let timers = []
    if (state === 'loading') {
      setLoadStep(0)
      timers = STEP_DELAYS.map((delay, i) =>
        setTimeout(() => setLoadStep(i), delay)
      )
    }
    return () => timers.forEach(clearTimeout)
  }, [state])

  async function handleAnalyze(url) {
    setError(null)
    setState('loading')
    try {
      const data = await analyzeUrl(url)
      setResult(data)
      setState('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err.message)
      setState('idle')
    }
  }

  function handleReset() {
    setState('idle')
    setResult(null)
    setError(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Nav />
      <Wrap>
        {state === 'idle' && (
          <Hero
            onAnalyze={handleAnalyze}
            loading={false}
            error={error}
          />
        )}

        {state === 'loading' && (
          <Loading step={loadStep} />
        )}

        {state === 'done' && result && (
          <Report data={result} onReset={handleReset} />
        )}
      </Wrap>
      <Footer>
        leadsieve &nbsp;·&nbsp; built by one person &nbsp;·&nbsp; <span>india → world</span>
      </Footer>
    </ThemeProvider>
  )
}