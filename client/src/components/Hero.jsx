import { useState } from 'react'
import styled, { keyframes } from 'styled-components'

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
`

const Wrap = styled.div`
  text-align: center;
  padding: 88px 0 56px;

  @media (max-width: 600px) {
    padding: 56px 0 40px;
  }
`

const Tag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${p => p.theme.colors.green};
  background: ${p => p.theme.colors.greenGlow};
  border: 1px solid rgba(0,214,143,0.2);
  padding: 6px 14px;
  border-radius: ${p => p.theme.radius.full};
  margin-bottom: 28px;
`

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${p => p.theme.colors.green};
  animation: ${pulse} 2s infinite;
  display: inline-block;
`

const H1 = styled.h1`
  font-family: ${p => p.theme.fonts.heading};
  font-size: clamp(38px, 6vw, 68px);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -2px;
  color: ${p => p.theme.colors.text};
  margin-bottom: 20px;

  .acc { color: ${p => p.theme.colors.green}; }
  .dw { color: ${p => p.theme.colors.dim}; }

  @media (max-width: 600px) {
    letter-spacing: -1px;
  }
`

const Sub = styled.p`
  font-size: 17px;
  font-weight: 300;
  color: ${p => p.theme.colors.muted};
  max-width: 520px;
  margin: 0 auto 48px;
  line-height: 1.6;

  strong {
    color: ${p => p.theme.colors.text};
    font-weight: 500;
  }
`

const StatsStrip = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 48px;
`

const StatItem = styled.div`
  text-align: center;
  padding: 0 28px;
  border-right: 1px solid ${p => p.theme.colors.border};

  &:last-child { border-right: none; }

  @media (max-width: 600px) {
    padding: 0 16px;
  }
`

const StatNum = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 22px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  line-height: 1;
  margin-bottom: 4px;

  span { color: ${p => p.theme.colors.green}; }
`

const StatLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.colors.muted};
  letter-spacing: 0.05em;
`

const PlatformRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`

const PlatformPill = styled.div`
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: ${p => p.theme.radius.full};
  border: 1px solid ${p => p.live ? 'rgba(0,214,143,0.25)' : p.theme.colors.border};
  color: ${p => p.live ? p.theme.colors.green : p.theme.colors.muted};
  background: ${p => p.live ? p.theme.colors.greenGlow : 'transparent'};
  opacity: ${p => p.soon ? 0.35 : 1};
  font-size: ${p => p.soon ? '11px' : '12px'};
`

const InputWrap = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.focused ? 'rgba(0,214,143,0.4)' : p.theme.colors.border2};
  border-radius: ${p => p.theme.radius.xl};
  padding: 6px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
`

const UrlRow = styled.div`
  display: flex;
  align-items: center;
`

const UrlIcon = styled.div`
  padding: 0 16px;
  color: ${p => p.theme.colors.dim};
  font-size: 16px;
  flex-shrink: 0;
`

const UrlInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  font-family: ${p => p.theme.fonts.body};
  color: ${p => p.theme.colors.text};
  padding: 14px 0;

  &::placeholder { color: ${p => p.theme.colors.dim}; }
`

const AnalyzeBtn = styled.button`
  background: ${p => p.theme.colors.green};
  color: #060608;
  border: none;
  border-radius: 14px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: ${p => p.theme.fonts.body};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  flex-shrink: 0;

  &:hover { background: #00f0a0; transform: scale(1.02); }
  &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
`

const Hint = styled.div`
  text-align: center;
  font-size: 12px;
  color: ${p => p.theme.colors.dim};
`

const ErrorBox = styled.div`
  background: rgba(255,95,95,0.08);
  border: 1px solid rgba(255,95,95,0.25);
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 13px;
  color: #ff9090;
  margin-top: 10px;
  text-align: center;
`

export default function Hero({ onAnalyze, loading, error }) {
  const [url, setUrl] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSubmit = () => {
    if (url.trim()) onAnalyze(url.trim())
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <Wrap>
      <Tag><Dot />Audience intelligence engine</Tag>

      <H1>
        Stop <span className="dw">guessing</span> what<br />
        your audience <span className="acc">wants</span>
      </H1>

      <Sub>
        Paste any URL. Leadsieve reads every comment and gives you{' '}
        <strong>exact signals, themes, and actions</strong> — in seconds. Locally. Free. Forever.
      </Sub>

      <StatsStrip>
        <StatItem><StatNum><span>500</span>+</StatNum><StatLabel>comments per scan</StatLabel></StatItem>
        <StatItem><StatNum><span>5</span></StatNum><StatLabel>platforms live</StatLabel></StatItem>
        <StatItem><StatNum><span>0</span></StatNum><StatLabel>API cost. ever.</StatLabel></StatItem>
      </StatsStrip>

      <PlatformRow>
        <PlatformPill live>YouTube</PlatformPill>
        <PlatformPill live>Reddit</PlatformPill>
        <PlatformPill live>Play Store</PlatformPill>
        <PlatformPill live>App Store</PlatformPill>
        <PlatformPill live>Kick</PlatformPill>
        <PlatformPill soon>Instagram — soon</PlatformPill>
        <PlatformPill soon>LinkedIn — soon</PlatformPill>
      </PlatformRow>

      <InputWrap focused={focused}>
        <UrlRow>
          <UrlIcon>↗</UrlIcon>
          <UrlInput
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            placeholder="Paste any YouTube, Reddit, Play Store, App Store or Kick URL..."
          />
          <AnalyzeBtn onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze'}
          </AnalyzeBtn>
        </UrlRow>
      </InputWrap>

      <Hint>Press Enter or click Analyze — platform is auto-detected</Hint>

      {error && <ErrorBox>⚠ {error}</ErrorBox>}
    </Wrap>
  )
}