import styled from 'styled-components'
import SectionTitle from './SectionTitle'

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.lg};
  overflow: hidden;
  margin-bottom: ${p => p.mb || '0'};

  @media print { border: 1px solid #ddd; background: white; }
`

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 18px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  font-size: 13px;
  color: ${p => p.theme.colors.muted};
  line-height: 1.5;
  transition: background 0.15s;

  &:last-child { border-bottom: none; }
  &:hover { background: ${p => p.theme.colors.surface2}; }

  @media print { color: #555; }
`

const Icon = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
  background: ${p =>
    p.type === 'question' ? 'rgba(91,156,246,0.12)' :
    p.type === 'pain' ? 'rgba(255,95,95,0.1)' :
    'rgba(0,214,143,0.1)'};
  color: ${p =>
    p.type === 'question' ? '#5b9cf6' :
    p.type === 'pain' ? '#ff5f5f' :
    '#00d68f'};
`

const ICONS = { question: '?', pain: '!', praise: '+' }

export default function ListCard({ title, items = [], type = 'question', mb }) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Card mb={mb}>
        {items.map((text, i) => (
          <Item key={i}>
            <Icon type={type}>{ICONS[type]}</Icon>
            <div>{text}</div>
          </Item>
        ))}
      </Card>
    </>
  )
}