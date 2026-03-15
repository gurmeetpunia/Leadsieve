import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { scoreColor, scoreLabel } from '../utils'
import { useTheme } from 'styled-components'

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border2};
  border-radius: ${p => p.theme.radius.xl};
  padding: 24px 32px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 600px) {
    flex-direction: column;
  }

  @media print {
    border: 1px solid #ddd;
    background: white;
  }
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`

const RingSvg = styled.svg`
  width: 72px;
  height: 72px;
  flex-shrink: 0;
`

const ScoreInfo = styled.div``

const ScoreLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
`

const ScoreTitle = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 22px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  line-height: 1.2;

  @media print { color: black; }
`

const ScoreSub = styled.div`
  font-size: 13px;
  color: ${p => p.theme.colors.muted};
  margin-top: 4px;

  @media print { color: #555; }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    width: 100%;
  }

  @media print { display: none; }
`

const ActionBtn = styled.button`
  font-size: 12px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: ${p => p.theme.radius.sm};
  border: 1px solid ${p => p.theme.colors.border2};
  background: ${p => p.primary ? p.theme.colors.green : 'transparent'};
  color: ${p => p.primary ? '#060608' : p.theme.colors.text};
  cursor: pointer;
  transition: all 0.15s;
  font-family: ${p => p.theme.fonts.body};

  &:hover {
    background: ${p => p.primary ? '#00f0a0' : p.theme.colors.surface2};
  }

  @media (max-width: 600px) {
    flex: 1;
    text-align: center;
  }
`

const CIRCUMFERENCE = 188.5

export default function ScoreRing({ score, onShare }) {
  const theme = useTheme()
  const [displayScore, setDisplayScore] = useState(0)
  const [offset, setOffset] = useState(CIRCUMFERENCE)
  const [copied, setCopied] = useState(false)

  const color = scoreColor(score, theme)
  const info = scoreLabel(score)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE)
      let cur = 0
      const step = score / 40
      const iv = setInterval(() => {
        cur = Math.min(score, cur + step)
        setDisplayScore(Math.round(cur))
        if (cur >= score) clearInterval(iv)
      }, 30)
      return () => clearInterval(iv)
    }, 200)
    return () => clearTimeout(timer)
  }, [score])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Banner>
      <Left>
        <RingSvg viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke={theme.colors.surface3} strokeWidth="6" />
          <circle
            cx="36" cy="36" r="30"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 36 36)"
            style={{ transition: 'stroke-dashoffset 1.2s ease, stroke 0.3s' }}
          />
          <text
            x="36" y="41"
            textAnchor="middle"
            fill={theme.colors.text}
            fontFamily="Syne, sans-serif"
            fontSize="16"
            fontWeight="800"
          >
            {displayScore || '—'}
          </text>
        </RingSvg>
        <ScoreInfo>
          <ScoreLabel>Leadsieve score</ScoreLabel>
          <ScoreTitle>{info.title}</ScoreTitle>
          <ScoreSub>{info.sub}</ScoreSub>
        </ScoreInfo>
      </Left>
      <Actions>
        <ActionBtn onClick={handleShare}>
          {copied ? 'Link copied!' : 'Share report'}
        </ActionBtn>
        <ActionBtn primary onClick={() => window.print()}>Export PDF</ActionBtn>
      </Actions>
    </Banner>
  )
}