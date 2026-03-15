import styled from 'styled-components'
import SectionTitle from './SectionTitle'

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 10px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  transition: border-color 0.15s;

  &:hover { border-color: ${p => p.theme.colors.border2}; }
  @media print { border: 1px solid #ddd; background: white; }
`

const Badge = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: ${p => p.theme.radius.full};
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 3px;
  text-transform: uppercase;
  background: ${p =>
    p.priority === 'high' ? 'rgba(255,95,95,0.1)' :
    p.priority === 'medium' ? 'rgba(245,166,35,0.1)' :
    'rgba(0,214,143,0.1)'};
  color: ${p =>
    p.priority === 'high' ? '#ff9090' :
    p.priority === 'medium' ? '#f5a623' :
    '#00d68f'};
`

const Action = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${p => p.theme.colors.text};
  margin-bottom: 4px;

  @media print { color: black; }
`

const Why = styled.div`
  font-size: 12px;
  color: ${p => p.theme.colors.muted};
  line-height: 1.5;

  @media print { color: #555; }
`

export default function InsightCards({ insights = [] }) {
  return (
    <>
      <SectionTitle>Actionable insights</SectionTitle>
      {insights.map((i, idx) => (
        <Card key={idx}>
          <Badge priority={i.priority}>{i.priority}</Badge>
          <div>
            <Action>{i.action}</Action>
            <Why>{i.why}</Why>
          </div>
        </Card>
      ))}
    </>
  )
}