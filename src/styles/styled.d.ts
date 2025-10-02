import 'styled-components'
import type { AppTheme } from './theme'

declare module 'styled-components' {
  // Merge our app theme into styled-components DefaultTheme
  // so theme.colors, theme.radii, etc. are strongly typed.
  // This fixes TS errors in styled files.
  // Add a private optional brand to appease no-empty-interface rules.
  export interface DefaultTheme extends AppTheme { __appThemeBrand__?: never }
}
