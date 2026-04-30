import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export default function ScreenshotCapture() {
  const { gl, scene, camera } = useThree()

  useEffect(() => {
    const handler = () => {
      // Force render to ensure latest frame
      gl.render(scene, camera)

      // Capture from the WebGL renderer's canvas
      const link = document.createElement('a')
      link.download = `modelviz-${Date.now()}.png`
      link.href = gl.domElement.toDataURL('image/png')
      link.click()
    }

    window.addEventListener('modelviz:capture', handler)
    return () => window.removeEventListener('modelviz:capture', handler)
  }, [gl, scene, camera])

  return null
}
