import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'

// علبة خاتم مخملية 3D: تنفتح تلقائيًا، ثم الضغط على الخاتم يقرّبنا منه ويدخل على الدعوة
export default function IntroRingBox({ onDone, veilRef, reduce }) {
  const mount = useRef(null), btn = useRef(null), go = useRef(() => {})
  const [phase, setPhase] = useState('closed') // closed | ready | going | fallback

  useEffect(() => {
    const el = mount.current, b = btn.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }) }
    catch { setPhase('fallback'); go.current = () => gsap.to(veilRef.current, { opacity: 1, duration: 1.2, onComplete: onDone }); return }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(renderer), envRT = pm.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 100)

    const velvet = new THREE.MeshPhysicalMaterial({ color: '#4a0d20', roughness: 0.92, sheen: 0.35, sheenRoughness: 0.8, sheenColor: new THREE.Color('#8f304d'), envMapIntensity: 0.25 })
    const cushionMat = new THREE.MeshPhysicalMaterial({ color: '#68152f', roughness: 0.95, sheen: 0.3, sheenColor: new THREE.Color('#9d4260') })
    const innerVelvet = new THREE.MeshStandardMaterial({ color: '#250814', roughness: 1, metalness: 0, side: THREE.DoubleSide })
    const innerRim = new THREE.MeshStandardMaterial({ color: '#5b1730', roughness: 1, metalness: 0, side: THREE.DoubleSide })
    const gold = new THREE.MeshStandardMaterial({ color: '#c5984d', metalness: 0.8, roughness: 0.34, envMapIntensity: 0.35 })
    const gemMat = new THREE.MeshPhysicalMaterial({ color: '#fff8e8', roughness: 0.18, metalness: 0, clearcoat: 0.5, envMapIntensity: 0.45, flatShading: true })

    const geos = [new RoundedBoxGeometry(2.2, 1, 1.8, 4, 0.08), new RoundedBoxGeometry(2, 0.2, 1.6, 3, 0.05), new THREE.BoxGeometry(2.24, 0.04, 1.84),
      new RoundedBoxGeometry(2.2, 0.55, 1.8, 4, 0.08), new THREE.TorusGeometry(0.3, 0.055, 24, 64), new THREE.ConeGeometry(0.14, 0.3, 8, 1, false)]
    const box = new THREE.Group(); scene.add(box)
    const base = new THREE.Mesh(geos[0], velvet); base.position.y = 0.5
    const cushion = new THREE.Mesh(geos[1], cushionMat); cushion.position.y = 0.98
    const rimTrim = new THREE.Mesh(geos[2], gold); rimTrim.position.y = 1.0
    const lid = new THREE.Group(); lid.position.set(0, 1.02, -0.9)
    const lidMesh = new THREE.Mesh(geos[3], velvet); lidMesh.position.set(0, 0.275, 0.9)
    const lidCavity = new THREE.Mesh(new RoundedBoxGeometry(1.72, 0.025, 1.3, 6, 0.08), innerVelvet)
    lidCavity.position.set(0, -0.018, 0.9)
    const cavityRim = new THREE.Mesh(new RoundedBoxGeometry(1.84, 0.018, 1.42, 6, 0.08), innerRim)
    cavityRim.position.set(0, -0.009, 0.9)
    lid.add(lidMesh, lidCavity, cavityRim)
    const ring = new THREE.Group(); ring.position.set(0, 1.45, 0)
    const band = new THREE.Mesh(geos[4], gold), gem = new THREE.Mesh(geos[5], gemMat)
    gem.position.y = 0.28; gem.rotation.z = Math.PI; gem.scale.set(0.72, 0.45, 0.72); ring.add(band, gem)
    const ringGlow = new THREE.PointLight('#ffe8ad', 0, 2.8)
    ringGlow.position.set(0, 0.35, 0.18); ring.add(ringGlow)
    box.add(base, cushion, rimTrim, lid, ring)

    scene.add(new THREE.AmbientLight('#f6d9d1', 0.2))
    const key = new THREE.DirectionalLight('#fff0d8', 1.15); key.position.set(2, 6, 4); scene.add(key)
    const rimL = new THREE.DirectionalLight('#b83d61', 0.35); rimL.position.set(-4, 2, -3); scene.add(rimL)

    const st = { open: 0, ringRise: 0.55, ringDepth: 0, scale: 1, spark: 0 }
    const camBase = new THREE.Vector3()
    const look = new THREE.Vector3(0, 1.1, 0)
    let w = 1, h = 1
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight; renderer.setSize(w, h); cam.aspect = w / h
      const d = Math.max(7, 3.6 / (2 * Math.tan((cam.fov * Math.PI) / 360) * cam.aspect))
      camBase.set(0, d * 0.42, d * 0.9); cam.updateProjectionMatrix()
    }
    resize(); window.addEventListener('resize', resize)

    const clock = new THREE.Clock(), tmp = new THREE.Vector3()
    let raf
    const frame = () => {
      raf = requestAnimationFrame(frame)
      const t = clock.getElapsedTime()
      lid.rotation.x = -st.open * 1.95
      ring.scale.setScalar(st.scale)
      ring.position.y = 0.82 + st.ringRise * 0.55
      ring.position.z = st.ringDepth
      gemMat.envMapIntensity = 0.45 + st.spark * 0.55
      ringGlow.intensity = st.spark * 1.8
      cam.position.copy(camBase)
      cam.lookAt(look)
      renderer.render(scene, cam)
      ring.getWorldPosition(tmp); tmp.y += 0.12
      const dist = cam.position.distanceTo(tmp)
      const px = (0.9 * st.scale / (2 * Math.tan((cam.fov * Math.PI) / 360) * dist)) * h
      tmp.project(cam)
      b.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px,${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`
      b.style.width = b.style.height = `${Math.max(72, px)}px`
    }
    frame()

    const open = gsap.timeline({ delay: reduce ? 0.2 : 0.9 })
    open.to(st, { open: 1, duration: reduce ? 0.8 : 2.8, ease: 'power2.inOut' })
      .add(() => setPhase('ready'))

    let zoom
    go.current = () => {
      const d = reduce ? 0.9 : 2.4
      zoom = gsap.timeline({ onComplete: onDone })
      zoom.to(st, { ringDepth: 2.8, ringRise: 4.2, scale: 6.5, duration: d, ease: 'power2.in' }, 0)
        .to(st, { spark: 1, duration: d * 0.55, ease: 'power1.in' }, 0)
        .to(veilRef.current, { opacity: 1, duration: d * 0.45, ease: 'power1.in' }, d * 0.55)
    }

    return () => {
      open.kill(); zoom && zoom.kill(); cancelAnimationFrame(raf); window.removeEventListener('resize', resize)
      ;[...geos, lidCavity.geometry, cavityRim.geometry, velvet, cushionMat, innerVelvet, innerRim, gold, gemMat, envRT, pm].forEach((o) => o.dispose && o.dispose())
      renderer.dispose(); renderer.domElement.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const click = () => { if (phase !== 'ready' && phase !== 'fallback') return; setPhase('going'); go.current() }

  return (
    <section className="intro" aria-label="افتتاحية الدعوة">
      <div className="intro-canvas" ref={mount} aria-hidden="true" />
      <div className="floating-petals" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <button ref={btn} className={`ring-hit ${phase}`} onClick={click} disabled={phase === 'closed' || phase === 'going'} aria-label="اضغطي على الخاتم لفتح الدعوة" />
      <p className={`intro-hint ${phase === 'ready' || phase === 'fallback' ? 'show' : ''}`} aria-live="polite">اضغطي على الخاتم</p>
    </section>
  )
}
