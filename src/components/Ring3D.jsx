import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Ring3D() {
  const mount = useRef(null)

  useEffect(() => {
    const el = mount.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    const ring = new THREE.Group()
    const gold = new THREE.MeshStandardMaterial({ color: '#c5984d', metalness: 0.8, roughness: 0.34 })
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: '#fff8e8',
      roughness: 0.18,
      metalness: 0,
      clearcoat: 0.5,
      flatShading: true,
    })
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.055, 24, 64), gold)
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.1), gemMat)
    gem.position.y = 0.37
    gem.scale.set(1, 1.25, 1)
    ring.add(band, gem)
    scene.add(ring)

    scene.add(new THREE.AmbientLight('#f6d9d1', 0.2))
    const key = new THREE.DirectionalLight('#fff0d8', 1.15)
    key.position.set(2, 6, 4)
    scene.add(key)
    const rim = new THREE.DirectionalLight('#b83d61', 0.35)
    rim.position.set(-4, 2, -3)
    scene.add(rim)

    const resize = () => {
      const width = el.clientWidth
      const height = el.clientHeight
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.position.set(0, 0.25, 2.65)
      camera.lookAt(0, 0.15, 0)
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    let frame
    const animate = () => {
      frame = requestAnimationFrame(animate)
      ring.rotation.y += 0.008
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      band.geometry.dispose()
      gem.geometry.dispose()
      gold.dispose()
      gemMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div className="arrived-ring" ref={mount} aria-hidden="true" />
}
