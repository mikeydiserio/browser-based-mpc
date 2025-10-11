import { Shader } from 'react-shaders'
import code from './example.glsl?raw'

export default function Shaders() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Shader fs={code} />
    </div>
  )
}
