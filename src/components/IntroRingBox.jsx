import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import gsap from 'gsap'

const BOX_SCALE = 0.82 // تصغير العلبة والخاتم معًا

// ملمس مخمل إجرائي (ضوضاء خفيفة) يُستخدم كـ bump لإحساس قماشي واقعي
function makeVelvetBump() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.random() * 34
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

// علبة خاتم مخملية 3D واقعية: تلف وهي تنفتح ببطء، وبعد الضغط الخاتم ترتفع ثم تنزل لمنتصف الشاشة وتتوهج
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
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    el.appendChild(renderer.domElement)
    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(renderer), envRT = pm.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = envRT.texture
    const cam = new THREE.PerspectiveCamera(36, 1, 0.1, 100)

    const bump = makeVelvetBump()
    // مواد العلبة شفافة-قابلة للتلاشي (opacity يتغير في اللقطة السينمائية)
    const velvet = new THREE.MeshPhysicalMaterial({ color: '#4a0d20', roughness: 0.88, sheen: 0.55, sheenRoughness: 0.75, sheenColor: new THREE.Color('#a23a5c'), envMapIntensity: 0.3, transparent: true, bumpMap: bump, bumpScale: 0.025 })
    const cushionMat = new THREE.MeshPhysicalMaterial({ color: '#68152f', roughness: 0.92, sheen: 0.45, sheenColor: new THREE.Color('#b04a6b'), transparent: true, bumpMap: bump, bumpScale: 0.03 })
    const innerVelvet = new THREE.MeshStandardMaterial({ color: '#250814', roughness: 1, metalness: 0, side: THREE.DoubleSide, transparent: true, bumpMap: bump, bumpScale: 0.02 })
    const innerRim = new THREE.MeshStandardMaterial({ color: '#3d0f1d', roughness: 1, metalness: 0, side: THREE.DoubleSide, transparent: true })
    // بطانة قاع الحوض: أغمق ليعمق إحساس التجويف بالظلال دون أي إطار بارز
    const recessDark = new THREE.MeshStandardMaterial({ color: '#15040b', roughness: 1, metalness: 0, side: THREE.DoubleSide, transparent: true, bumpMap: bump, bumpScale: 0.015 })
    // ذهب خاص بزخرفة العلبة (منفصل عن ذهب الخاتم حتى لا يتلاشى معها)
    const trimGold = new THREE.MeshStandardMaterial({ color: '#d4a95c', metalness: 0.9, roughness: 0.28, envMapIntensity: 0.5, transparent: true })
    const gold = new THREE.MeshStandardMaterial({ color: '#d4a95c', metalness: 0.9, roughness: 0.25, envMapIntensity: 0.6 })
    // حجر ألماس: لمعان قزحي خفيف مع سطح صافٍ يستفيد من انعكاسات البيئة
    const gemMat = new THREE.MeshPhysicalMaterial({ color: '#fdf7ee', roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.15, flatShading: true, iridescence: 0.35, iridescenceIOR: 1.3, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0 })

    const disposables = [bump]
    const geo = (g) => { disposables.push(g); return g }
    const geos = [
      geo(new RoundedBoxGeometry(2.2, 1, 1.8, 4, 0.08)),       // 0 القاعدة
      geo(new RoundedBoxGeometry(2, 0.2, 1.6, 3, 0.05)),        // 1 الوسادة
      geo(new THREE.BoxGeometry(2.24, 0.04, 1.84)),             // 2 إطار ذهبي علوي
      geo(new THREE.TorusGeometry(0.3, 0.055, 24, 64)),         // 3 حلقة الخاتم
    ]
    const box = new THREE.Group(); box.scale.setScalar(BOX_SCALE); scene.add(box)
    const boxCasters = [] // كل أجزاء العلبة التي تُلقي ظلًا (تُوقف لحظة تلاشيها)
    const base = new THREE.Mesh(geos[0], velvet); base.position.y = 0.5
    const cushion = new THREE.Mesh(geos[1], cushionMat); cushion.position.y = 0.98
    const rimTrim = new THREE.Mesh(geos[2], trimGold); rimTrim.position.y = 1.0
    // زوايا ذهبية على القاعدة
    const cornerGeo = geo(new RoundedBoxGeometry(0.15, 0.06, 0.15, 2, 0.02))
    ;[[-1.0, 1.03, -0.8], [1.0, 1.03, -0.8], [-1.0, 1.03, 0.8], [1.0, 1.03, 0.8]].forEach(([x, y, z]) => {
      const c = new THREE.Mesh(cornerGeo, trimGold); c.position.set(x, y, z); box.add(c); c.castShadow = true; boxCasters.push(c)
    })
    // مشبك أمامي ذهبي
    const clasp = new THREE.Mesh(geo(new RoundedBoxGeometry(0.22, 0.26, 0.08, 2, 0.02)), trimGold)
    clasp.position.set(0, 0.72, 0.92); box.add(clasp); clasp.castShadow = true; boxCasters.push(clasp)
    // مفصلات خلفية
    const hingeGeo = geo(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 16))
    ;[-0.7, 0.7].forEach((x) => {
      const h = new THREE.Mesh(hingeGeo, trimGold); h.rotation.z = Math.PI / 2; h.position.set(x, 1.02, -0.93); box.add(h); h.castShadow = true; boxCasters.push(h)
    })
    const lid = new THREE.Group(); lid.position.set(0, 1.02, -0.9)
    const lidParts = []
    const addLid = (mesh) => { lid.add(mesh); lidParts.push(mesh); return mesh }
    // هيكل الغطاء: صفيحة علوية وأربع جدران، والوجه السفلي مفتوح (تجويف حقيقي لا لوحة ملصقة)
    const lidTop = addLid(new THREE.Mesh(geo(new RoundedBoxGeometry(2.2, 0.1, 1.8, 2, 0.04)), velvet))
    lidTop.position.set(0, 0.5, 0.9)
    const wallFB = geo(new THREE.BoxGeometry(2.04, 0.42, 0.08))
    const wallFront = addLid(new THREE.Mesh(wallFB, velvet)); wallFront.position.set(0, 0.29, 1.76)
    const wallBack = addLid(new THREE.Mesh(wallFB, velvet)); wallBack.position.set(0, 0.29, 0.04)
    const wallSideGeo = geo(new THREE.BoxGeometry(0.08, 0.42, 1.64))
    const wallL = addLid(new THREE.Mesh(wallSideGeo, velvet)); wallL.position.set(-1.06, 0.29, 0.9)
    const wallR = addLid(new THREE.Mesh(wallSideGeo, velvet)); wallR.position.set(1.06, 0.29, 0.9)
    // الحوض الغائر فعليًا: أرضية عميقة مظللة وأربع جدران مبطنة، بلا أي حافة ذهبية
    const recessFloor = addLid(new THREE.Mesh(geo(new RoundedBoxGeometry(1.76, 0.05, 1.36, 2, 0.02)), recessDark))
    recessFloor.position.set(0, 0.3, 0.9)
    const innerFB = geo(new THREE.BoxGeometry(1.76, 0.26, 0.04))
    const recessFront = addLid(new THREE.Mesh(innerFB, innerRim)); recessFront.position.set(0, 0.2, 1.56)
    const recessBack = addLid(new THREE.Mesh(innerFB, innerRim)); recessBack.position.set(0, 0.2, 0.24)
    const innerSide = geo(new THREE.BoxGeometry(0.04, 0.26, 1.28))
    const recessL = addLid(new THREE.Mesh(innerSide, innerRim)); recessL.position.set(-0.86, 0.2, 0.9)
    const recessR = addLid(new THREE.Mesh(innerSide, innerRim)); recessR.position.set(0.86, 0.2, 0.9)
    // صفائح ذهبية خارجية: حافة علوية ولوحة أمامية
    const lidCap = addLid(new THREE.Mesh(geo(new RoundedBoxGeometry(2.26, 0.035, 1.86, 2, 0.015)), trimGold))
    lidCap.position.set(0, 0.565, 0.9)
    const lidPlate = addLid(new THREE.Mesh(geo(new THREE.BoxGeometry(0.72, 0.11, 0.03)), trimGold))
    lidPlate.position.set(0, 0.3, 1.81)
    const ring = new THREE.Group(); ring.position.set(0, 1.45, 0)
    const band = new THREE.Mesh(geos[3], gold)
    // ألماسة: تاج لامع مركّب داخل الحلقة فقط — بلا أي جزء مدبب تحتها
    const gem = new THREE.Group()
    const crownGeo = geo(new THREE.CylinderGeometry(0.085, 0.132, 0.085, 8, 1))
    const crown = new THREE.Mesh(crownGeo, gemMat); crown.position.y = 0.045
    gem.add(crown)
    // حامل ذهبي مسطّح يخفي قاعدة الحجر داخل الحلقة (بدون طرف مدبب)
    const seat = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.105, 0.105, 0.045, 8)), gold)
    seat.position.y = -0.012
    gem.add(seat)
    // الحجر منخفض قليلًا حتى يستوي حزامه مع قمة الحلقة ويبدو مركّبًا فيها
    gem.position.y = 0.34
    ring.add(band, gem)
    const gemCasters = [crown, seat]
    const ringGlow = new THREE.PointLight('#ffe8ad', 0, 3.2)
    ringGlow.position.set(0, 0.35, 0.18); ring.add(ringGlow)
    box.add(base, cushion, rimTrim, lid, ring)
    ;[base, cushion, rimTrim, band, ...lidParts, ...gemCasters].forEach((m) => { m.castShadow = true; m.receiveShadow = true; boxCasters.push(m) })

    // إضاءة وظل أرضي ناعم
    scene.add(new THREE.AmbientLight('#f6d9d1', 0.22))
    const key = new THREE.DirectionalLight('#fff0d8', 1.25); key.position.set(2.5, 6, 4); scene.add(key)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    key.shadow.camera.left = key.shadow.camera.bottom = -4
    key.shadow.camera.right = key.shadow.camera.top = 4
    key.shadow.camera.near = 1; key.shadow.camera.far = 16; key.shadow.bias = -0.0004
    const rimL = new THREE.DirectionalLight('#b83d61', 0.4); rimL.position.set(-4, 2, -3); scene.add(rimL)
    const fill = new THREE.PointLight('#ffd9c2', 0.35, 9); fill.position.set(-2.5, 2.4, 3.2); scene.add(fill)
    const ground = new THREE.Mesh(geo(new THREE.PlaneGeometry(24, 24)), new THREE.ShadowMaterial({ opacity: 0.3 }))
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground)
    disposables.push(ground.material)

    // spin: دوران العلبة أثناء الفتح | boxFade: تلاشي العلبة | flash: توهج الخاتم الأبيض
    const st = { open: 0, spin: 1, ringRise: 0.55, ringDepth: 0, scale: 1, spark: 0, boxFade: 0, flash: 0 }
    const boxMats = [velvet, cushionMat, innerVelvet, innerRim, recessDark, trimGold]
    const camBase = new THREE.Vector3()
    const look = new THREE.Vector3(0, 1.05, 0)
    let w = 1, h = 1, shadowsOff = false
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight; renderer.setSize(w, h); cam.aspect = w / h
      const d = Math.max(7, 3.6 / (2 * Math.tan((cam.fov * Math.PI) / 360) * cam.aspect))
      camBase.set(0, d * 0.42, d * 0.9); cam.updateProjectionMatrix()
    }
    resize(); window.addEventListener('resize', resize)

    const tmp = new THREE.Vector3()
    let raf
    const frame = () => {
      raf = requestAnimationFrame(frame)
      lid.rotation.x = -st.open * 1.95
      box.rotation.y = st.spin * Math.PI * 2
      boxMats.forEach((m) => { m.opacity = 1 - st.boxFade })
      ring.scale.setScalar(st.scale)
      ring.position.y = 0.82 + st.ringRise * 0.55
      ring.position.z = st.ringDepth
      gemMat.envMapIntensity = 0.7 + st.spark * 0.5
      gemMat.emissiveIntensity = st.flash * 0.9
      ringGlow.intensity = st.spark * 1.8 + st.flash * 3.4
      cam.position.copy(camBase)
      cam.lookAt(look)
      renderer.render(scene, cam)
      ring.getWorldPosition(tmp); tmp.y += 0.12
      const dist = cam.position.distanceTo(tmp)
      const px = (0.9 * st.scale * BOX_SCALE / (2 * Math.tan((cam.fov * Math.PI) / 360) * dist)) * h
      tmp.project(cam)
      b.style.transform = `translate(${(tmp.x * 0.5 + 0.5) * w}px,${(-tmp.y * 0.5 + 0.5) * h}px) translate(-50%,-50%)`
      b.style.width = b.style.height = `${Math.max(72, px)}px`
    }
    frame()

    const open = gsap.timeline({ delay: reduce ? 0.2 : 1.1 })
    open.to(st, { open: 1, duration: reduce ? 0.8 : 3.4, ease: 'power2.inOut' }, 0)
    if (!reduce) open.to(st, { spin: 0, duration: 3.4, ease: 'power2.inOut' }, 0)
    else st.spin = 0
    open.add(() => setPhase('ready'))

    const killShadows = () => {
      if (shadowsOff) return
      shadowsOff = true
      boxCasters.forEach((m) => { m.castShadow = false })
    }
    let zoom
    go.current = () => {
      zoom = gsap.timeline({ onComplete: onDone })
      if (reduce) {
        // ١) الخاتم ترتفع من العلبة
        zoom.to(st, { ringRise: 3.1, ringDepth: 0.5, duration: 0.5, ease: 'power2.out' }, 0)
        // ٢) العلبة تتلاشى بسرعة مع إيقاف ظلها
        zoom.add(killShadows, 0.15).to(st, { boxFade: 1, duration: 0.3, ease: 'power1.in' }, 0.15)
        // ٣) الخاتم تنزل لمنتصف الشاشة
        zoom.to(st, { ringRise: 0.95, ringDepth: 0.25, duration: 0.45, ease: 'power2.inOut' }, 0.55)
        // ٤) توهج أبيض
        zoom.to(st, { flash: 1, spark: 1, duration: 0.4, ease: 'power2.out' }, 0.85)
        zoom.to(ringGlow.color, { r: 1, g: 1, b: 1, duration: 0.35 }, 0.85)
        // ٥) ستارة بيضاء ثم فتح الصفحة
        zoom.to(veilRef.current, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 1.1)
      } else {
        zoom.to(st, { ringRise: 3.1, ringDepth: 0.5, duration: 1.0, ease: 'power2.out' }, 0)
        zoom.add(killShadows, 0.35).to(st, { boxFade: 1, duration: 0.5, ease: 'power1.in' }, 0.35)
        zoom.to(st, { ringRise: 0.95, ringDepth: 0.25, duration: 0.9, ease: 'power2.inOut' }, 1.05)
        zoom.to(st, { flash: 1, spark: 1, duration: 0.6, ease: 'power2.out' }, 1.6)
        zoom.to(ringGlow.color, { r: 1, g: 1, b: 1, duration: 0.5 }, 1.65)
        zoom.to(veilRef.current, { opacity: 1, duration: 0.7, ease: 'power2.inOut' }, 2.1)
      }
    }

    return () => {
      open.kill(); zoom && zoom.kill(); cancelAnimationFrame(raf); window.removeEventListener('resize', resize)
      disposables.forEach((o) => o.dispose && o.dispose())
      ;[velvet, cushionMat, innerVelvet, innerRim, recessDark, trimGold, gold, gemMat, envRT, pm].forEach((o) => o.dispose && o.dispose())
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
      <button ref={btn} className={`ring-hit ${phase}`} onClick={click} disabled={phase === 'closed' || phase === 'going'} aria-label="اضغطوا على الخاتم لفتح الدعوة" />
      <p className={`intro-hint ${phase === 'ready' || phase === 'fallback' ? 'show' : ''}`} aria-live="polite">اضغطوا على الخاتم</p>
    </section>
  )
}
