import { useEffect } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Фон-canvas (плавающие «блобы» + сеть частиц), параллакс элементов [data-mx]/[data-sy]
 * по мыши и скроллу. Один раз на маунт. Перенесено из componentDidMount исходного экспорта.
 */
export function useBackground() {
  useEffect(() => {
    const cleanup = []
    // mx/my — значения параллакса (-0.5..0.5), которые читает loop.
    // tmx/tmy — целевые значения от гироскопа, к ним плавно тянемся; tilt — режим наклона активен.
    const state = { mx: 0, my: 0, sy: 0, tmx: 0, tmy: 0, tilt: false }
    const reduce = prefersReduced()

    const onMove = (e) => { state.mx = e.clientX / window.innerWidth - 0.5; state.my = e.clientY / window.innerHeight - 0.5 }
    const onScroll = () => { state.sy = window.scrollY || window.pageYOffset || 0 }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    cleanup.push(() => window.removeEventListener('mousemove', onMove))
    cleanup.push(() => window.removeEventListener('scroll', onScroll))

    // ===== Параллакс по гироскопу (акселерометр) на телефонах =====
    // gamma — наклон влево-вправо, beta — вперёд-назад. Маппим в тот же диапазон, что и мышь.
    const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    if (coarse && !reduce && typeof window.DeviceOrientationEvent !== 'undefined') {
      const CLAMP = 14              // ±14° наклона = полный размах (чувствительность как у мыши)
      let base = null              // авто-калибровка нуля по первому замеру (как держат телефон)
      const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v)
      const onTilt = (e) => {
        if (e.gamma == null && e.beta == null) return
        if (base == null) base = e.beta || 0
        state.tilt = true
        // учёт ориентации экрана (портрет/ландшафт): оси gamma/beta меняются местами
        const ang = (window.screen && window.screen.orientation && window.screen.orientation.angle) || window.orientation || 0
        const g = e.gamma || 0
        const b = (e.beta || 0) - base
        let x, y
        if (ang === 90) { x = b; y = -g }
        else if (ang === -90 || ang === 270) { x = -b; y = g }
        else { x = g; y = b }       // портрет
        state.tmx = clamp(x, -CLAMP, CLAMP) / CLAMP * 0.5
        state.tmy = clamp(y, -CLAMP, CLAMP) / CLAMP * 0.5
      }
      const addTilt = () => window.addEventListener('deviceorientation', onTilt, { passive: true })
      cleanup.push(() => window.removeEventListener('deviceorientation', onTilt))

      // iOS 13+: доступ к датчику только после явного разрешения по жесту пользователя.
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        const ask = () => {
          window.DeviceOrientationEvent.requestPermission()
            .then((res) => { if (res === 'granted') addTilt() })
            .catch(() => {})
          window.removeEventListener('touchend', ask)
          window.removeEventListener('click', ask)
        }
        window.addEventListener('touchend', ask, { passive: true })
        window.addEventListener('click', ask)
        cleanup.push(() => { window.removeEventListener('touchend', ask); window.removeEventListener('click', ask) })
      } else {
        // Android/остальные — разрешение не требуется.
        addTilt()
      }
    }

    const cv = document.getElementById('ds-bg')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let ctx = null, W = 0, H = 0
    const parts = []
    const blobs = [
      { x: 0.74, y: 0.34, r: 0.55, a: 0.17 },
      { x: 0.2, y: 0.72, r: 0.45, a: 0.10 },
      { x: 0.52, y: 0.12, r: 0.32, a: 0.08 },
    ]
    const setup = () => {
      W = cv.width = Math.floor(window.innerWidth * dpr)
      H = cv.height = Math.floor(window.innerHeight * dpr)
      cv.style.width = window.innerWidth + 'px'
      cv.style.height = window.innerHeight + 'px'
      ctx = cv.getContext('2d')
    }
    if (cv) {
      setup()
      const N = Math.max(30, Math.min(72, Math.round(window.innerWidth / 22)))
      for (let i = 0; i < N; i++) parts.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005 })
      const onResize = () => setup()
      window.addEventListener('resize', onResize)
      cleanup.push(() => window.removeEventListener('resize', onResize))
    }

    const md = 150 * dpr
    let raf = 0
    const loop = () => {
      // В режиме наклона плавно тянем mx/my к целям гироскопа (сглаживание шума сенсора).
      if (state.tilt) {
        state.mx += (state.tmx - state.mx) * 0.18
        state.my += (state.tmy - state.my) * 0.18
      }
      const { mx, my, sy } = state
      document.querySelectorAll('[data-mx]').forEach((el) => {
        const d = parseFloat(el.dataset.mx) || 0
        el.style.transform = `translate3d(${(-mx * d).toFixed(1)}px,${(-my * d).toFixed(1)}px,0)`
      })
      document.querySelectorAll('[data-sy]').forEach((el) => {
        const d = parseFloat(el.dataset.sy) || 0
        el.style.transform = `translate3d(0,${(sy * d).toFixed(1)}px,0)`
      })

      if (ctx && !reduce) {
        ctx.clearRect(0, 0, W, H)
        const ox = (-mx * 42 - sy * 0.12) * dpr, oy = -my * 42 * dpr
        const now = Date.now()
        for (let i = 0; i < blobs.length; i++) {
          const b = blobs[i]
          const gx = b.x * W + ox * (1 + i * 0.4)
          const gy = b.y * H + oy * (1 + i * 0.4) + Math.sin(now / 3200 + i) * 22 * dpr
          const rad = b.r * Math.min(W, H)
          const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad)
          g.addColorStop(0, 'rgba(255,106,26,' + b.a + ')')
          g.addColorStop(1, 'rgba(255,106,26,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, W, H)
        }
        ctx.save()
        ctx.translate(ox * 0.5, oy * 0.5)
        for (const p of parts) {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0 || p.x > 1) p.vx *= -1
          if (p.y < 0 || p.y > 1) p.vy *= -1
        }
        const px = parts.map((p) => ({ x: p.x * W, y: p.y * H }))
        for (let i = 0; i < px.length; i++) {
          for (let j = i + 1; j < px.length; j++) {
            const dx = px[i].x - px[j].x, dy = px[i].y - px[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < md) {
              ctx.strokeStyle = 'rgba(255,255,255,' + ((1 - dist / md) * 0.05).toFixed(3) + ')'
              ctx.lineWidth = 1
              ctx.beginPath(); ctx.moveTo(px[i].x, px[i].y); ctx.lineTo(px[j].x, px[j].y); ctx.stroke()
            }
          }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.32)'
        for (const p of px) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.2 * dpr, 0, 7); ctx.fill() }
        ctx.restore()
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); cleanup.forEach((f) => { try { f() } catch {} }) }
  }, [])
}

/**
 * Reveal-on-scroll: элементы [data-reveal] проявляются при попадании во вьюпорт.
 * Пере-наблюдает новые элементы при изменении deps (смена языка / подгрузка кейсов).
 */
export function useReveal(deps) {
  useEffect(() => {
    const reveal = (el) => { el.style.opacity = '1'; el.style.transform = 'none' }
    const noReveal = prefersReduced() || !('IntersectionObserver' in window)
    const els = document.querySelectorAll('[data-reveal]')

    if (noReveal) {
      els.forEach(reveal)
      return
    }
    // Каждый прогон создаёт свежий наблюдатель и заново обрабатывает элементы —
    // это устойчиво к двойному вызову эффектов в StrictMode.
    const io = new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

    els.forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 1.1) { reveal(el); return } // уже во вьюпорте — показать сразу
      io.observe(el)
    })
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
