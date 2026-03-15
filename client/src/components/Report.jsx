import styled from 'styled-components'
import ScoreRing from './ScoreRing'
import SentimentBar from './SentimentBar'
import ThemeGrid from './ThemeGrid'
import ListCard from './ListCard'
import InsightCards from './InsightCard'
import CommentCards from './CommentCard'
import SectionTitle from './SectionTitle'
import { calcScore, formatDate } from '../utils'

const Wrap = styled.div`
  animation: fadeUp 0.4s ease;

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
`

const TitleBlock = styled.div``

const Eyebrow = styled.div`
  font-size: 11px;
  color: ${p => p.theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
`

const VideoTitle = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.theme.colors.text};
  line-height: 1.3;
  max-width: 540px;

  @media print { color: black; }
`

const Chips = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
`

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: ${p => p.theme.colors.muted};
`

const ChipDot = styled.div`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${p => p.color || p.theme.colors.green};
`

const BackBtn = styled.button`
  font-size: 12px;
  font-weight: 500;
  background: transparent;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.sm};
  padding: 8px 14px;
  color: ${p => p.theme.colors.muted};
  cursor: pointer;
  font-family: ${p => p.theme.fonts.body};
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: ${p => p.theme.colors.border2};
    color: ${p => p.theme.colors.text};
  }

  @media print { display: none; }
`

const Trio = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 600px) { grid-template-columns: 1fr; }
`

const TrioCard = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: ${p => p.theme.radius.lg};
  padding: 20px;
  text-align: center;
  transition: border-color 0.2s;

  &:hover { border-color: ${p => p.theme.colors.border2}; }
  @media print { border: 1px solid #ddd; background: white; }
`

const TrioNum = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 36px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
  color: ${p => p.color};

  @media print { color: black !important; }
`

const TrioLabel = styled.div`
  font-size: 11px;
  color: ${p => p.theme.colors.muted};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

const Summary = styled.div`
  background: ${p => p.theme.colors.surface};
  border: 1px solid ${p => p.theme.colors.border};
  border-left: 3px solid ${p => p.theme.colors.green};
  border-radius: 0 ${p => p.theme.radius.lg} ${p => p.theme.radius.lg} 0;
  padding: 20px 24px;
  margin-bottom: 20px;
  font-size: 15px;
  color: ${p => p.theme.colors.muted};
  line-height: 1.7;

  @media print { border: 1px solid #ddd; background: white; color: #555; }
`

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 600px) { grid-template-columns: 1fr; }
`

const Section = styled.div`
  margin-bottom: 20px;
`

export default function Report({ data, onReset }) {
  const { videoTitle, totalComments, platform, report: r } = data
  const score = calcScore(r)

  return (
    <Wrap>
      <TopRow>
        <TitleBlock>
          <Eyebrow>Analysis report</Eyebrow>
          <VideoTitle>{videoTitle}</VideoTitle>
          <Chips>
            <Chip><ChipDot />{totalComments?.toLocaleString()} comments</Chip>
            <Chip><ChipDot color="#5b9cf6" />{platform}</Chip>
            <Chip><ChipDot color="#f5a623" />{formatDate()}</Chip>
          </Chips>
        </TitleBlock>
        <BackBtn onClick={onReset}>← New analysis</BackBtn>
      </TopRow>

      <ScoreRing score={score} />

      <Trio>
        <TrioCard>
          <TrioNum color="#00d68f">{r.sentiment?.positive}%</TrioNum>
          <TrioLabel>Positive</TrioLabel>
        </TrioCard>
        <TrioCard>
          <TrioNum color="#f5a623">{r.sentiment?.neutral}%</TrioNum>
          <TrioLabel>Neutral</TrioLabel>
        </TrioCard>
        <TrioCard>
          <TrioNum color="#ff5f5f">{r.sentiment?.negative}%</TrioNum>
          <TrioLabel>Negative</TrioLabel>
        </TrioCard>
      </Trio>

      <Summary>{r.summary}</Summary>

      <SentimentBar sentiment={r.sentiment} />
      <ThemeGrid themes={r.topThemes} />

      <TwoCol>
        <ListCard title="Top questions" items={r.topQuestions} type="question" />
        <ListCard title="Pain points" items={r.painPoints} type="pain" />
      </TwoCol>

      <Section>
        <ListCard title="What they love" items={r.praises} type="praise" mb="0" />
      </Section>

      <Section>
        <InsightCards insights={r.actionableInsights} />
      </Section>

      <Section>
        <CommentCards comments={r.notableComments} />
      </Section>
    </Wrap>
  )
}