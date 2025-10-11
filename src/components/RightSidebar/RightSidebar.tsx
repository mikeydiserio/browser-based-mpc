import { Music, Settings, Volume2, Zap } from 'lucide-react'
import { useState } from 'react'
import * as S from './RightSidebar.styles'

interface RightSidebarProps {
  onTB303Open: () => void
  onSequencerOpen: () => void
}

export function RightSidebar({ onTB303Open, onSequencerOpen }: RightSidebarProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null)

  const icons = [
    {
      id: 'tb303',
      icon: Zap,
      label: 'TB-303 Bass Synthesizer',
      color: '#ff6b35',
      onClick: onTB303Open
    },
    {
      id: 'sequencer',
      icon: Music,
      label: 'MPC Sequencer',
      color: '#00ff88',
      onClick: onSequencerOpen
    },
    {
      id: 'master',
      icon: Volume2,
      label: 'Master Controls',
      color: '#00d9ff',
      onClick: () => console.log('Master controls')
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      color: '#888',
      onClick: () => console.log('Settings')
    },
    {
      id: 'presets',
      icon: Music,
      label: 'Presets',
      color: '#f9ca24',
      onClick: () => console.log('Presets')
    }
  ]

  return (
    <S.SidebarContainer>
      <S.IconGrid>
        {icons.map(({ id, icon: Icon, label, color, onClick }) => (
          <S.IconButton
            key={id}
            $color={color}
            $isHovered={hoveredIcon === id}
            onClick={onClick}
            onMouseEnter={() => setHoveredIcon(id)}
            onMouseLeave={() => setHoveredIcon(null)}
            title={label}
          >
            <Icon size={18} />
            {hoveredIcon === id && (
              <S.Tooltip>
                {label}
              </S.Tooltip>
            )}
          </S.IconButton>
        ))}
      </S.IconGrid>
    </S.SidebarContainer>
  )
}
