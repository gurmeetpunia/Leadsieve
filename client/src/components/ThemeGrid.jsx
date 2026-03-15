import styled from 'styled-components'
import SectionTitle from './SectionTitle'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;

  @media (max-width: 600px) { grid-template-columns: 1fr; }
`

const Card = styled.div`
  background: \${p => p.theme.colors.surface};
  border: 1px solid \${p => p.theme.colors.border};
  border-radius: 14px;
  padding: 16px;
  transition: border-color 0.15s;

  &:hover { border-color: \${p => p.theme.colors.border2}; }
  @media print { border: 1px solid #ddd; background: white; }
`

const ThemeName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: \${p => p.theme.colors.text};
  margin-bottom: 4px;
  @media print { color: black; }
`

const Desc = styled.div`
  font-size: 12px;
  color: \${p => p.theme.colors.muted};
  line-height: 1.5;
  margin-bottom: 10px;
  @media print { color: #555; }
`

const BarWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const BarBg = styled.div`
  flex: 1;
  height: 3px;
  background: \${p => p.theme.colors.surface3};
  border-radius: 2px;
`

const BarFill = styled.div`
  height: 3px;
  border-radius: 2px;
  width: \${p => p.pct}%;
  background: \${p =>
    p.sentiment === 'positive' ? '#00d68f' :
    p.sentiment === 'negative' ? '#ff5f5f' : '#f5a623'};
  transition: width 0.6s ease;
`

const Count = styled.div`
  font-size: 11px;
  color: \${p => p.theme.colors.dim};
  font-family: \${p => p.theme.fonts.mono};
`

export default function ThemeGrid({ themes = [] }) {
  const maxCount = Math.max(...themes.map(t => t.count), 1)

  return (
    <>
      <SectionTitle>Top themes</SectionTitle>
      <Grid>
        {themes.map((t, i) => (
          <Card key={i}>
            <ThemeName>{t.theme}</ThemeName>
            <Desc>{t.description}</Desc>
            <BarWrap>
              <BarBg>
                <BarFill pct={Math.round((t.count / maxCount) * 100)} sentiment={t.sentiment} />
              </BarBg>
              <Count>{t.count}</Count>
            </BarWrap>
          </Card>
        ))}
      </Grid>
    </>
  )
}