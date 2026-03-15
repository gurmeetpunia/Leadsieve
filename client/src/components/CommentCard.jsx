import styled from 'styled-components'
import SectionTitle from './SectionTitle'

const Card = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 10px;
  transition: border-color 0.15s;

  &:hover { border-color: ${p => p.theme.colors.border2}; }
  @media print { border: 1px solid #ddd; background: white; }
`

const Quote = styled.div`
  font-size: 14px;
  font-style: italic;
  color: ${p => p.theme.colors.text};
  line-height: 1.6;
  margin-bottom: 10px;

  @media print { color: black; }
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Likes = styled.div`
  font-size: 11px;
  color: ${p => p.theme.colors.dim};
  font-family: ${p => p.theme.fonts.mono};
`

const TypeBadge = styled.div`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 2px 10px;
  border-radius: ${p => p.theme.radius.full};
  text-transform: uppercase;
  background: ${p =>
    p.type === 'praise' ? 'rgba(0,214,143,0.1)' :
    p.type === 'question' ? 'rgba(91,156,246,0.1)' :
    'rgba(255,95,95,0.1)'};
  color: ${p =>
    p.type === 'praise' ? '#00d68f' :
    p.type === 'question' ? '#5b9cf6' :
    '#ff5f5f'};
`

export default function CommentCards({ comments = [] }) {
  return (
    <>
      <SectionTitle>Notable comments</SectionTitle>
      {comments.map((c, i) => (
        <Card key={i}>
          <Quote>"{c.text}"</Quote>
          <Meta>
            <Likes>▲ {c.likes} likes</Likes>
            <TypeBadge type={c.type}>{c.type}</TypeBadge>
          </Meta>
        </Card>
      ))}
    </>
  )
}