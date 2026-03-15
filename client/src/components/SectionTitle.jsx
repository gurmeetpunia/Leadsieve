import styled from 'styled-components'

const Heading = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${p => p.theme.colors.dim};
  margin-bottom: ${p => p.$mb || '14px'};
  display: flex;
  align-items: center;
  gap: 10px;

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${p => p.theme.colors.border};
  }
`

export default function SectionTitle({ children, mb }) {
  return <Heading $mb={mb}>{children}</Heading>
}