// This file is not needed for a Vite SPA - styled-components works out of the box
// Keeping as empty export for compatibility
export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
