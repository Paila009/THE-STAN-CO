const scenes = [
  {
    slug: 'fire-flood',
    theme: 'fire',
    film: 'RRR',
    telugu: 'రౌద్రం రణం రుధిరం',
    song: 'Naatu Naatu',
    product: 'Fire & Flood Tee',
    description: 'Two forces collide. Fire and flood meet in a print that moves to the rhythm of the dance floor.',
    track: 'https://www.youtube.com/watch?v=4_eEgJhsBMo',
  },
  {
    slug: 'small-fury',
    theme: 'fly',
    film: 'Eega',
    telugu: 'ఈగ',
    song: 'Ne Ne Nani Ne',
    product: 'Small Fury Tee',
    description: 'A microscopic point of view, blown up to poster scale. Look closer for the details hidden in the wings.',
    track: 'https://www.youtube.com/watch?v=DT3VrvQUS3M',
  },
  {
    slug: 'home-turf',
    theme: 'city',
    film: 'Okkadu',
    telugu: 'ఒక్కడు',
    song: 'Cheppave Chirugali',
    product: 'Home Turf Tee',
    description: 'An old-city skyline and the lines of a kabaddi court bring the streets back into frame.',
    track: 'https://www.youtube.com/watch?v=mYle5wJ_W-0',
  },
]

const arrow = '<span aria-hidden="true">↗</span>'

function sceneMarkup(scene, index) {
  const number = String(index + 1).padStart(2, '0')

  return `
    <article class="cinema__scene cinema__scene--${scene.theme}" aria-labelledby="cinema-film-${index}">
      <div class="cinema__art" data-cinema-reveal aria-hidden="true">
        <div class="cinema__title-card" lang="te">${scene.telugu}</div>
        <div class="cinema__volume">
          <div class="cinema__back"></div>
          <div class="cinema__edge cinema__edge--left"></div>
          <div class="cinema__edge cinema__edge--right"></div>
          <div class="cinema__edge cinema__edge--top"></div>
          <div class="cinema__edge cinema__edge--bottom"></div>
          <div class="cinema__poster">
            <canvas class="cinema__canvas" width="640" height="720" data-art="${scene.theme}"></canvas>
            <div class="cinema__poster-top"><span>THE STAN CO.</span><span>FRAME ${number} / 03</span></div>
            <div class="cinema__poster-type"><span>${scene.film}</span><small lang="te">${scene.telugu}</small></div>
            <div class="cinema__poster-bottom"><span>${scene.song}</span><span>✳</span></div>
          </div>
        </div>
      </div>
      <div class="cinema__copy">
        <p class="cinema__index">${number} / Film &amp; soundtrack</p>
        <h3 id="cinema-film-${index}">${scene.film}</h3>
        <p class="cinema__song">${scene.song}</p>
        <p class="cinema__description">${scene.description}</p>
        <div class="cinema__actions">
          <a class="cinema__product" href="#product/${scene.slug}" data-product="${scene.slug}">${scene.product}${arrow}</a>
          <a class="cinema__track" href="${scene.track}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${scene.song} on YouTube (opens in a new tab)">Watch the song${arrow}</a>
        </div>
      </div>
    </article>`
}

function circle(context, x, y, radius, color) {
  context.fillStyle = color
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.fill()
}

function trace(context, path, color, width = 1) {
  context.strokeStyle = color
  context.lineWidth = width
  context.stroke(new Path2D(path))
}

function fill(context, path, color) {
  context.fillStyle = color
  context.fill(new Path2D(path))
}

function fireArtwork(context) {
  const blue = '#1638b8'
  const orange = '#ff6b35'
  const cream = '#f4eddf'
  const yellow = '#ffc574'

  context.fillStyle = orange
  context.fillRect(0, 0, 640, 720)

  for (let ray = 0; ray < 48; ray += 1) {
    const angle = ray * Math.PI / 24
    const innerX = 314 + 66 * Math.cos(angle)
    const innerY = 380 + 66 * Math.sin(angle)
    const outerX = 314 + 620 * Math.cos(angle)
    const outerY = 380 + 620 * Math.sin(angle)
    trace(context, `M${innerX} ${innerY} L${outerX} ${outerY}`, '#e54722', ray % 3 === 0 ? 3 : 1)
  }

  circle(context, 314, 380, 154, yellow)
  circle(context, 314, 380, 123, orange)
  circle(context, 314, 380, 104, yellow)
  trace(context, 'M69 485 C138 264 336 204 532 282 M117 541 C151 356 333 230 540 276', cream, 2)

  fill(context, 'M-10 611 C119 469 199 530 286 551 C420 583 503 451 651 471 L655 740 H-10 Z', blue)
  for (let line = 0; line < 13; line += 1) {
    const y = line * 14
    trace(context, `M-15 ${628 + y} C113 ${501 + y} 202 ${545 + y} 300 ${571 + y} C431 ${600 + y} 516 ${468 + y} 659 ${489 + y}`, '#7294e5', line % 4 === 0 ? 3 : 1)
  }

  context.lineCap = 'round'
  context.lineJoin = 'round'
  trace(context, 'M272 341 L248 392 L195 414 L157 377 M263 363 L308 405 L331 375 M246 392 L270 471 L320 496 L309 546 M248 393 L223 474 L171 513 L132 506', cream, 32)
  trace(context, 'M375 331 L414 374 L463 376 L492 333 M390 354 L367 390 L326 404 M412 371 L397 459 L437 496 L474 490 M413 372 L454 449 L484 462 L513 442', blue, 36)
  trace(context, 'M375 331 L414 374 L463 376 L492 333 M390 354 L367 390 L326 404 M412 371 L397 459 L437 496 L474 490 M413 372 L454 449 L484 462 L513 442', cream, 2)
  circle(context, 276, 311, 21, cream)
  circle(context, 363, 308, 23, blue)
}

function flyArtwork(context) {
  const black = '#171410'
  const green = '#e1e9c5'
  const moss = '#a9b774'
  const cream = '#f4eddf'

  context.fillStyle = green
  context.fillRect(0, 0, 640, 720)

  for (let radius = 55; radius < 330; radius += 24) {
    context.beginPath()
    context.strokeStyle = '#8a9d58'
    context.lineWidth = 1
    context.arc(320, 436, radius, 0, Math.PI * 2)
    context.stroke()
  }

  trace(context, 'M0 436 H640 M320 190 V696 M65 181 L565 689 M575 181 L75 689', '#9aa96e', 1)
  context.save()
  context.translate(320, 445)
  context.rotate(-0.28)

  for (const side of [-1, 1]) {
    context.save()
    context.scale(side, 1)
    const wing = 'M11 -24 C53 -85 119 -119 197 -114 C255 -111 270 -71 235 -32 C182 24 82 35 14 20 Z'
    const lowerWing = 'M11 19 C97 14 194 37 199 80 C200 117 152 130 110 119 C56 103 35 61 11 19 Z'
    fill(context, lowerWing, moss)
    trace(context, lowerWing, black, 4)
    fill(context, wing, cream)
    trace(context, wing, black, 5)
    trace(context, 'M17 4 C75 -24 158 -89 240 -95 M22 11 C99 -10 193 -20 252 -68 M41 2 C91 -52 96 -78 150 -108 M53 12 C121 9 166 -15 179 -48 M105 26 C145 13 169 6 194 -6 M23 26 C92 65 139 96 190 98 M39 39 C61 77 100 105 124 121 M66 50 C111 55 160 58 189 66', black, 2)
    trace(context, 'M10 4 L74 78 L133 89 M11 9 L66 129 L95 158 M10 -8 L70 -40 L118 -24 M-1 -65 L39 -102 L52 -135', black, 4)
    context.restore()
  }

  fill(context, 'M0 -98 C35 -97 42 -45 22 -25 C53 14 29 39 27 69 C23 117 14 145 0 151 C-14 145 -23 117 -27 69 C-29 39 -53 14 -22 -25 C-42 -45 -35 -97 0 -98 Z', black)
  circle(context, -15, -64, 10, green)
  circle(context, 15, -64, 10, green)
  trace(context, 'M-21 60 Q0 71 21 60 M-19 80 Q0 91 19 80 M-14 102 Q0 111 14 102', green, 1.5)
  context.restore()
}

function minaret(context, x, y, scale) {
  context.save()
  context.translate(x, y)
  context.scale(scale, scale)
  fill(context, 'M-27 0 H27 L24 -192 H32 V-206 H19 V-227 H28 V-239 H15 C15 -262 8 -265 0 -280 C-8 -265 -15 -262 -15 -239 H-28 V-227 H-19 V-206 H-32 V-192 H-24 Z', '#171410')
  trace(context, 'M-15 -170 H15 M-15 -154 H15 M-15 -127 H15 M-15 -111 H15 M-15 -84 H15 M-15 -68 H15 M-15 -41 H15 M-15 -25 H15', '#80b8bb', 2)
  context.restore()
}

function cityArtwork(context) {
  const ink = '#1638b8'
  const mint = '#f4eddf'
  const orange = '#ff6b35'

  context.fillStyle = mint
  context.fillRect(0, 0, 640, 720)
  circle(context, 321, 420, 178, orange)
  circle(context, 321, 420, 154, '#e9a179')
  circle(context, 321, 420, 130, '#eebc95')

  for (let line = 0; line < 16; line += 1) {
    const y = line * 15
    trace(context, `M-30 ${335 + y} C160 ${221 + y} 409 ${525 + y} 665 ${293 + y}`, '#7389db', line % 5 === 0 ? 3 : 1)
  }

  fill(context, 'M0 600 H58 V563 H108 V542 H167 V509 H473 V539 H536 V560 H585 V600 H640 V720 H0 Z', ink)
  minaret(context, 238, 582, 0.68)
  minaret(context, 400, 582, 0.68)
  minaret(context, 164, 646, 1)
  minaret(context, 476, 646, 1)
  fill(context, 'M190 541 H450 V669 H190 Z', ink)
  fill(context, 'M276 668 V623 Q276 591 320 565 Q364 591 364 623 V668 Z', mint)
  trace(context, 'M269 667 V621 Q269 586 320 557 Q371 586 371 621 V667 M193 543 H447 M193 553 H447', mint, 2)

  for (let x = 211; x <= 429; x += 31) {
    fill(context, `M${x} 581 v-12 q5 -8 10 0 v12 Z`, mint)
  }

  trace(context, 'M57 643 H126 M508 643 H585 M48 654 H118 M521 654 H596', '#afbcf3', 2)

  fill(context, 'M202 618 H438 L552 680 H88 Z', orange)
  trace(context, 'M202 618 H438 L552 680 H88 Z M320 618 V680 M257 618 L224 680 M383 618 L416 680 M227 618 L151 680 M413 618 L489 680 M186 627 H454 M117 664 H523', mint, 2)
}

const artwork = { fire: fireArtwork, fly: flyArtwork, city: cityArtwork }

export function mountCinema(container) {
  container.innerHTML = `
    <div class="cinema" aria-labelledby="cinema-heading">
      <header class="cinema__intro">
        <p>Telugu cinema / The soundtrack</p>
        <h2 id="cinema-heading">On the <em>big screen.</em></h2>
        <p>Three films, three songs, three prints from the drop.</p>
      </header>
      ${scenes.map(sceneMarkup).join('')}
    </div>`

  for (const canvas of container.querySelectorAll('[data-art]')) {
    const context = canvas.getContext('2d')
    if (context) artwork[canvas.dataset.art](context)
  }

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (!('IntersectionObserver' in window)) return

  const visibleStages = new Set()
  let frame = 0
  function updatePosterDepth() {
    frame = 0
    if (motion.matches) return
    const distance = innerHeight / 2
    const scale = innerWidth < 741 ? .53 : 1
    for (const stage of visibleStages) {
      const bounds = stage.getBoundingClientRect()
      const position = Math.max(-1, Math.min(1, (distance - bounds.top - bounds.height / 2) / (distance + bounds.height / 2)))
      stage.style.setProperty('--poster-scroll-y', `${position * -26 * scale}px`)
      stage.style.setProperty('--poster-scroll-turn', `${position * 21 * scale}deg`)
    }
  }

  function schedulePosterDepth() {
    if (visibleStages.size && !motion.matches && !frame) frame = requestAnimationFrame(updatePosterDepth)
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const stage = entry.target
      if (entry.isIntersecting) {
        visibleStages.add(stage)
        if (entry.intersectionRatio >= .24 || motion.matches) stage.classList.add('cinema__art--revealed')
      } else {
        visibleStages.delete(stage)
      }
    }
    schedulePosterDepth()
  }, { threshold: [0, .24] })

  const stages = container.querySelectorAll('[data-cinema-reveal]')
  const hover = window.matchMedia('(hover: hover) and (pointer: fine)')
  const pointerEvents = new AbortController()
  window.addEventListener('scroll', schedulePosterDepth, { passive: true, signal: pointerEvents.signal })
  window.addEventListener('resize', schedulePosterDepth, { passive: true, signal: pointerEvents.signal })

  for (const stage of stages) {
    if (motion.matches) stage.classList.add('cinema__art--revealed')
    else stage.classList.add('cinema__art--pending')
    observer.observe(stage)

    if (!hover.matches) continue

    stage.addEventListener('pointermove', (event) => {
      if (motion.matches) return

      const rect = stage.getBoundingClientRect()
      const horizontal = (event.clientX - rect.left) / rect.width - 0.5
      const vertical = (event.clientY - rect.top) / rect.height - 0.5
      stage.style.setProperty('--poster-tilt-x', `${-vertical * 23}deg`)
      stage.style.setProperty('--poster-tilt-y', `${horizontal * 31}deg`)
    }, { signal: pointerEvents.signal })

    stage.addEventListener('pointerleave', () => {
      stage.style.removeProperty('--poster-tilt-x')
      stage.style.removeProperty('--poster-tilt-y')
    }, { signal: pointerEvents.signal })
  }

  return () => {
    observer.disconnect()
    pointerEvents.abort()
    cancelAnimationFrame(frame)
  }
}
