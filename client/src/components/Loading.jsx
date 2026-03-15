import styled, { keyframes } from 'styled-components'

const spin = keyframes`to { transform: rotate(360deg); }`
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`

const Wrap = styled.div`
  text-align: center;
  padding: 80px 0;
`

const Ring = styled.div`
  width: 48px;
  height: 48px;
  border: 2px solid ${p => p.theme.colors.surface3};
  border-top-color: ${p => p.theme.colors.green};
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  margin: 0 auto 24px;
`

const Title = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 18px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  margin-bottom: 20px;
`

const Steps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
`

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${p => p.done ? p.theme.colors.green : p.active ? p.theme.colors.text : p.theme.colors.muted};
  opacity: ${p => (!p.done && !p.active) ? 0.35 : 1};
  transition: all 0.3s;
`

const SDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${p => (p.done || p.active) ? p.theme.colors.green : p.theme.colors.dim};
  flex-shrink: 0;
  animation: ${p => p.active ? pulse : 'none'} 1s infinite;
  transition: background 0.3s;
`

const STEPS = [
  'Fetching comments from source',
  'Running sentiment analysis locally',
  'Extracting themes, questions, insights',
]

export default function Loading({ step = 0 }) {
  return (
    <Wrap>
      <Ring />
      <Title>Sieving the signal...</Title>
      <Steps>
        {STEPS.map((label, i) => (
          <Step key={i} done={i < step} active={i === step}>
            <SDot done={i < step} active={i === step} />
            <span>{label}</span>
          </Step>
        ))}
      </Steps>
    </Wrap>
  )
}