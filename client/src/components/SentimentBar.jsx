import styled from 'styled-components'
import SectionTitle from './SectionTitle'

const Wrap = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.lg};
  padding: 20px 24px;
  margin-bottom: 20px;

  @media print { border: 1px solid #ddd; background: white; }
`

const Bar = styled.div`
  height: 10px;
  border-radius: 5px;
  display: flex;
  overflow: hidden;
  margin-bottom: 14px;
`

const Seg = styled.div`
  width: ${p => p.pct}%;
  background: ${p => p.color};
  transition: width 0.6s ease;
`

const Legend = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`

const LegItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${p => p.theme.colors.muted};
`

const LegDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: ${p => p.color};
`

export default function SentimentBar({ sentiment }) {
  const { positive = 0, neutral = 0, negative = 0 } = sentiment || {}

  return (
    <>
      <SectionTitle>Sentiment breakdown</SectionTitle>
      <Wrap>
        <Bar>
          <Seg pct={positive} color="#00d68f" />
          <Seg pct={neutral} color="#f5a623" />
          <Seg pct={negative} color="#ff5f5f" />
        </Bar>
        <Legend>
          <LegItem><LegDot color="#00d68f" />Positive {positive}%</LegItem>
          <LegItem><LegDot color="#f5a623" />Neutral {neutral}%</LegItem>
          <LegItem><LegDot color="#ff5f5f" />Negative {negative}%</LegItem>
        </Legend>
      </Wrap>
    </>
  )
}