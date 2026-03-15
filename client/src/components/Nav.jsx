import styled from 'styled-components'

const NavBar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 40px;
  border-bottom: 1px solid ${p => p.theme.colors.border};
  position: relative;
  z-index: 10;

  @media (max-width: 600px) {
    padding: 16px 20px;
  }
`

const Logo = styled.div`
  font-family: ${p => p.theme.fonts.heading};
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: ${p => p.theme.colors.text};

  span { color: ${p => p.theme.colors.green}; }
`

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Pill = styled.div`
  font-size: 11px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: ${p => p.theme.radius.full};
  border: 1px solid ${p => p.dim ? p.theme.colors.border : 'rgba(0,214,143,0.2)'};
  color: ${p => p.dim ? p.theme.colors.muted : p.theme.colors.green};
  background: ${p => p.dim ? 'transparent' : p.theme.colors.greenGlow};
`

export default function Nav() {
  return (
    <NavBar>
      <Logo>lead<span>sieve</span></Logo>
      <NavRight>
        <Pill dim>v0.1</Pill>
        <Pill>India → World</Pill>
      </NavRight>
    </NavBar>
  )
}