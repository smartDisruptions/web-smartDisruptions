'use client';

import { useEffect, useRef } from 'react';

/**
 * StormSky — Market Storm's sky. One raw WebGL1 fragment shader, no library.
 *
 * WHAT IT DRAWS
 * -------------
 * Domain-warped fbm storm clouds that boil and drift with the wind, three
 * sheets of slanted rain, and every few seconds a lightning strike: a
 * procedural branching channel that grows down from the cloud base, flashes
 * twice (the return stroke and one restrike), and lights the cloud undersides
 * for a few frames. By day it is a pale ink wash on washi and the bolt is
 * vermilion, after Hokusai's red lightning; by night it is deep indigo under a
 * hidden moon whose light silvers the cloud edges.
 *
 * Thunder arrives a moment after the flash. The host element (the hero or
 * band this sits in) gets `data-flash` while the sky is lit and
 * `data-thunder` when the rumble lands, so CSS can flare the page kanji and
 * shake the headline. A click on the sky (not on anything interactive) calls
 * a strike down where you clicked.
 *
 * WHY IT COSTS ALMOST NOTHING
 * ---------------------------
 * - It starts after `load`, in an idle callback. First paint is the CSS
 *   gradient underneath, which is also the fallback when WebGL is missing,
 *   software-rendered (failIfMajorPerformanceCaveat, plus a renderer-name
 *   check for SwiftShader and friends) or its context is lost.
 * - It renders to a pixel budget, not to the screen: at most 0.75 internal
 *   pixels per CSS pixel and usually ~0.5 on a laptop. They are soft clouds;
 *   the compositor's upscale is invisible. If frames run slow the budget
 *   shrinks until they don't, and the loop never runs faster than ~60fps on
 *   high-refresh screens.
 * - It runs only while on screen and while the tab is visible.
 * - Under prefers-reduced-motion it draws one still frame — a painting of a
 *   storm, rain mid-fall — with no lightning, and stops.
 *
 * It is decoration: the wrapper is aria-hidden and ignores the pointer, so it
 * can never take a tap away from the content on top of it.
 */

type Variant = 'hero' | 'band';

const VERT = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;    // drawing buffer, px
uniform vec2 uCss;    // the same box in CSS px
uniform float uTime;  // storm seconds (stops while paused)
uniform float uNight; // 0 washi day, 1 moonlit night
uniform float uFlash; // lightning light on the clouds, 0..1
uniform vec4 uBolt;   // strike x (css px), tip depth (css px from top), seed, leader growth 0..1
uniform float uBoltA; // channel brightness, 0 = no bolt
uniform vec2 uShape;  // depth of the storm ceiling, bottom fade height (css px)

float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}
// Five octaves, each rotated so the lattice never lines up.
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}

// One sheet of rain: a column of drops per cell in a sheared frame, so every
// streak leans down-left with the wind. Bright head, fading tail.
float rain(vec2 c,float colW,float period,float len,float speed,float seed,float px){
  vec2 s=vec2(c.x-c.y*.24,c.y);
  float col=floor(s.x/colW),h1=hash(vec2(col,seed)),h2=hash(vec2(col+.5,seed*1.7));
  float x=(fract(s.x/colW)-.5-(h2-.5)*.6)*colW;
  float f=fract(s.y/period+uTime*speed*(.7+.6*h1)+h1*9.7);
  float streak=smoothstep(0.,.02,f)*(1.-smoothstep(0.,len,f));
  return streak*(1.-smoothstep(.35*px,1.1*px+.5,abs(x)))*step(.3,h2);
}

// A lightning channel kinks: a fractal walk of straight segments.
float walk(float y,float seed){float s=0.,a=1.;
  for(int i=0;i<4;i++){float i0=floor(y);s+=a*(mix(hash(vec2(i0,seed)),hash(vec2(i0+1.,seed)),fract(y))-.5);y=y*2.6+3.1;a*=.42;}
  return s;}

// Glow of the main channel plus three forks. Distance is a capsule: past the
// leader's front the glow rounds off instead of being sliced flat.
float bolt(vec2 c,float depth){
  float seed=uBolt.z,tip=uBolt.y,reach=tip*uBolt.w;
  float lean=(hash(vec2(seed,2.))-.5)*.5;
  float dx=c.x-(uBolt.x+lean*depth+walk(depth/70.,seed)*64.);
  float d=length(vec2(dx,max(depth-reach,0.)*1.5));
  float g=exp(-d*.9)+.45*exp(-d*.16)+.16*exp(-d*.035);
  for(int k=0;k<3;k++){
    float fk=float(k),hk=hash(vec2(seed,fk*7.3+1.));
    float y0=tip*(.12+.55*hk),len=tip*(.16+.28*hash(vec2(fk,seed+4.))),u=depth-y0;
    if(u>0.&&u<len&&depth<reach){
      float side=hash(vec2(fk+2.,seed))>.5?1.:-1.;
      float x0=uBolt.x+lean*y0+walk(y0/70.,seed)*64.;
      float db=abs(c.x-(x0+side*u*(.45+.5*hk)+walk(depth/34.,seed+fk+1.)*26.*(u/len)));
      g+=(1.-u/len)*(.8*exp(-db*1.2)+.3*exp(-db*.2));
    }
  }
  return g;
}

void main(){
  vec2 c=gl_FragCoord.xy/uRes*uCss;   // css px, origin bottom-left
  float depth=uCss.y-c.y;             // css px down from the top
  float px=uCss.x/uRes.x;             // css px per drawn pixel
  float t=uTime;

  // Clouds: warped fbm (the boil), drifting left with the wind.
  vec2 p=c/560.+vec2(t*.018,0.);
  vec2 q=vec2(fbm(p+vec2(0.,t*.05)),fbm(p+vec2(5.2,1.3)-t*.035));
  vec2 w=p+.9*q;
  float d=fbm(w*1.7);
  // One extra sample toward the light — the hidden moon, or the cloud base
  // during a strike. Density falling toward the light means a lit surface.
  vec2 L=normalize(mix(vec2(.45,.9),vec2(0.,-1.),min(uFlash*3.,1.)));
  float lit=clamp((d-fbm((w+L*.04)*1.7))*8.,0.,1.);
  float ceil=1.-smoothstep(0.,uShape.x,depth);
  float cover=d+.42*ceil-.2;
  float dens=smoothstep(.3,.72,cover);
  vec2 moon=vec2(uCss.x*.8,uCss.y-min(96.,uCss.y*.22));
  float md=length(c-moon);
  float glow=exp(-md/240.);
  float fl=uFlash*(.3+.7*exp(-length(c-vec2(uBolt.x,uCss.y-30.))/420.));

  // Rain: far, mid and near sheets, in gusts.
  float r=(rain(c,9.,140.,.1,4.,3.1,px)*.45+rain(c,17.,210.,.13,3.6,7.7,px)*.75+rain(c,31.,300.,.16,3.2,1.3,px))
         *(.55+.45*noise(vec2(c.x/380.+t*.25,t*.11)));

  // Night: deep indigo; the moon shows only through the gaps and silvers
  // the edges near it; the flash lights the cloud from underneath.
  vec3 sky=mix(vec3(.03,.036,.08),vec3(.055,.068,.16),c.y/uCss.y)+vec3(.12,.14,.28)*glow;
  vec3 cloud=mix(vec3(.05,.06,.13),vec3(.19,.23,.45),lit*.75+glow*.55);
  vec3 night=mix(sky,cloud,dens);
  night+=vec3(.62,.7,1.)*lit*glow*dens*1.05;
  night+=vec3(1.,.96,.86)*(smoothstep(38.,34.,md)*.72+exp(-md/60.)*.3)*(1.-dens*.92);
  night+=vec3(.62,.7,1.)*fl*(.18+dens*(.35+1.1*lit));
  night=mix(night,vec3(.62,.68,.86)+fl*.45,r*.26);

  // Day: an ink wash on washi — sepia where it is thin, sumi-indigo where it
  // is dense, and a darker line where each wash dried, as in sumi-e.
  vec3 paper=vec3(.957,.937,.894);
  vec3 ink=mix(vec3(.6,.58,.56),vec3(.2,.215,.33),smoothstep(.15,.9,dens));
  float pool=smoothstep(.3,.36,cover)-smoothstep(.36,.5,cover);
  vec3 day=mix(paper,ink,min(1.,dens*.62+pool*.2));
  day=mix(day,vec3(1.,.99,.96),lit*glow*dens*.55);
  day=mix(day,vec3(1.,.985,.95),fl*dens*.6)+vec3(.22,.06,0.)*fl*dens*lit*.5;
  day=mix(day,vec3(.23,.245,.36),r*.2);

  vec3 col=mix(day,night,uNight);
  if(uBoltA>0.){
    float b=bolt(c,depth)*uBoltA;
    // Day: a vermilion channel with a white-hot core. Night: blue-white.
    vec3 dayB=mix(vec3(.886,.255,.165),vec3(1.,.96,.9),smoothstep(.7,1.5,b));
    col=mix(col,dayB,clamp(b,0.,1.)*(1.-uNight));
    col+=vec3(.6,.68,1.)*b*.85*uNight;
  }
  float a=smoothstep(0.,uShape.y,c.y); // dissolve into the page at the bottom
  gl_FragColor=vec4(clamp(col,0.,1.)*a,a);
}`;

type Strike = {
  t0: number; // storm seconds
  x: number; // css px
  tip: number; // css px from the top
  seed: number;
  bolt: boolean; // false = sheet lightning: the flash with no visible channel
  thunderAt: number;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const NONE = { flash: 0, boltA: 0, grow: 0 };

export default function StormSky({
  variant = 'hero',
  className = '',
}: {
  variant?: Variant;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const host = wrap.parentElement ?? wrap;
    const hero = variant === 'hero';
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

    // The band over a report is calmer: rarer strikes, a softer flash, and no
    // thunder shaking a page somebody is reading.
    const cfg = hero
      ? { budget: 300_000, first: [1.6, 2.8], every: [5.5, 12], power: 1, thunder: true }
      : { budget: 170_000, first: [2.5, 4], every: [14, 26], power: 0.7, thunder: false };

    // The canvas is made here rather than rendered, so each run of this effect
    // owns a fresh context it can release on the way out — and the server
    // HTML carries only the gradient underneath.
    const canvas = document.createElement('canvas');
    canvas.className = 'ms-sky-canvas';

    let gl: WebGLRenderingContext | null = null;
    let u: Record<string, WebGLUniformLocation | null> = {};
    let disposed = false;
    let raf = 0;
    let onScreen = false;
    let cssW = 0;
    let cssH = 0;
    let budget = cfg.budget;
    let simTime = 0;
    let lastFrame = 0;
    let fastWindows = 0;
    let winSum = 0;
    let winN = 0;
    let strike: Strike | null = null;
    let lastStrikeAt = -10;
    let nextStrike = rand(cfg.first[0], cfg.first[1]);
    let light = NONE;
    let still = false;
    const attrs = new Set<string>();

    /** Host attributes change only on transitions, never every frame. */
    const setAttr = (name: string, on: boolean) => {
      if (on === attrs.has(name)) return;
      if (on) {
        attrs.add(name);
        host.setAttribute(name, '');
      } else {
        attrs.delete(name);
        host.removeAttribute(name);
      }
    };

    const isNight = () => (document.documentElement.dataset.theme === 'dark' ? 1 : 0);

    function setup(): boolean {
      const ctx = canvas.getContext('webgl', {
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false,
        powerPreference: 'low-power',
        // A software-rendered shader would cost more than it is worth.
        failIfMajorPerformanceCaveat: true,
      });
      if (!ctx || ctx.isContextLost()) return false;
      // failIfMajorPerformanceCaveat lets some CPU rasterisers through:
      // SwiftShader (Chrome with no GPU, which is how Lighthouse and
      // PageSpeed Insights run), llvmpipe, Windows' Basic Render Driver.
      // There every pixel of the shader is main-thread-adjacent CPU work, so
      // treat them as no WebGL and keep the CSS sky.
      const info = ctx.getExtension('WEBGL_debug_renderer_info');
      const renderer = String(ctx.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : ctx.RENDERER) ?? '');
      if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
        ctx.getExtension('WEBGL_lose_context')?.loseContext();
        return false;
      }
      const compile = (type: number, src: string) => {
        const sh = ctx.createShader(type)!;
        ctx.shaderSource(sh, src);
        ctx.compileShader(sh);
        return sh;
      };
      const prog = ctx.createProgram()!;
      ctx.attachShader(prog, compile(ctx.VERTEX_SHADER, VERT));
      ctx.attachShader(prog, compile(ctx.FRAGMENT_SHADER, FRAG));
      ctx.linkProgram(prog);
      if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return false;
      ctx.useProgram(prog);
      // One triangle that covers the whole box.
      ctx.bindBuffer(ctx.ARRAY_BUFFER, ctx.createBuffer());
      ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), ctx.STATIC_DRAW);
      const pos = ctx.getAttribLocation(prog, 'a');
      ctx.enableVertexAttribArray(pos);
      ctx.vertexAttribPointer(pos, 2, ctx.FLOAT, false, 0, 0);
      u = {};
      for (const n of ['uRes', 'uCss', 'uTime', 'uNight', 'uFlash', 'uBolt', 'uBoltA', 'uShape']) {
        u[n] = ctx.getUniformLocation(prog, n);
      }
      gl = ctx;
      return true;
    }

    /** Size the drawing buffer to the pixel budget — never above 0.75× CSS. */
    function size() {
      if (!gl || !cssW || !cssH) return;
      const scale = Math.min(0.75, Math.max(0.22, Math.sqrt(budget / (cssW * cssH))));
      const w = Math.max(1, Math.round(cssW * scale));
      const h = Math.max(1, Math.round(cssH * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    /** Where a strike lands: beside the words when there is room, else above them. */
    function aim(): Pick<Strike, 'x' | 'tip' | 'bolt'> {
      const wr = wrap!.getBoundingClientRect();
      const av = host.querySelector('[data-storm-avoid]')?.getBoundingClientRect();
      if (!av) return { x: rand(0.15, 0.85) * cssW, tip: rand(0.45, 0.75) * cssH, bolt: true };
      const left = av.left - wr.left;
      const right = av.right - wr.left;
      const top = av.top - wr.top;
      const ranges: [number, number][] = [];
      if (left > 150) ranges.push([50, left - 50]);
      if (cssW - right > 150) ranges.push([right + 50, cssW - 50]);
      let pick = Math.random() * ranges.reduce((n, [a, b]) => n + (b - a), 0);
      for (const [a, b] of ranges) {
        if (pick <= b - a) return { x: a + pick, tip: rand(0.5, 0.8) * cssH, bolt: true };
        pick -= b - a;
      }
      if (top > 110) return { x: rand(0.1, 0.9) * cssW, tip: rand(0.65, 0.95) * (top - 12), bolt: true };
      // No clear sky anywhere: sheet lightning — the flash, no visible channel.
      return { x: rand(0.2, 0.8) * cssW, tip: 0, bolt: false };
    }

    function fire(at?: Pick<Strike, 'x' | 'tip' | 'bolt'>) {
      strike = {
        ...(at ?? aim()),
        t0: simTime,
        seed: Math.floor(Math.random() * 997) + 1,
        thunderAt: simTime + rand(0.45, 1),
      };
      lastStrikeAt = simTime;
    }

    /**
     * The strike's envelope: a faint leader grows down for 80ms, the return
     * stroke flashes and holds a beat, one restrike follows at 270ms. Two
     * flashes per strike and at least 1.2s between strikes keeps it far under
     * three flashes a second (WCAG 2.3.1).
     */
    function lightning() {
      if (!strike && simTime >= nextStrike) fire();
      if (!strike) return NONE;
      const ms = (simTime - strike.t0) * 1000;
      let grow = 1;
      let flash: number;
      let boltA: number;
      if (ms < 80) {
        // The stepped leader: a faint channel feeling its way down.
        grow = ms / 80;
        flash = 0.1 * grow;
        boltA = 0.3 + 0.25 * grow;
      } else {
        // Return stroke at 80ms, held a beat; one restrike at 270ms.
        const restrike = ms > 270 ? Math.exp(-(ms - 270) / 130) : 0;
        boltA = Math.max(ms < 150 ? 1 : Math.exp(-(ms - 150) / 110), 0.9 * restrike);
        flash = Math.max(Math.exp(-(ms - 80) / 130), 0.75 * restrike);
      }
      setAttr('data-flash', ms >= 80 && ms < 480);
      if (cfg.thunder) {
        setAttr('data-thunder', simTime >= strike.thunderAt && simTime < strike.thunderAt + 0.7);
      }
      if (ms > 950 && simTime > strike.thunderAt + 0.75) {
        strike = null;
        setAttr('data-flash', false);
        setAttr('data-thunder', false);
        nextStrike = simTime + rand(cfg.every[0], cfg.every[1]);
        return NONE;
      }
      return { flash: flash * cfg.power, boltA: strike.bolt ? boltA : 0, grow };
    }

    function draw() {
      if (!gl) return;
      gl.uniform2f(u.uRes, canvas.width, canvas.height);
      gl.uniform2f(u.uCss, cssW, cssH);
      gl.uniform1f(u.uTime, simTime);
      gl.uniform1f(u.uNight, isNight());
      gl.uniform1f(u.uFlash, light.flash);
      gl.uniform4f(u.uBolt, strike?.x ?? 0, strike?.tip ?? 0, strike?.seed ?? 0, light.grow);
      gl.uniform1f(u.uBoltA, light.boltA);
      gl.uniform2f(
        u.uShape,
        hero ? Math.min(420, cssH * 0.62) : cssH * 0.9,
        Math.min(hero ? 190 : 110, cssH * 0.32),
      );
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = lastFrame ? now - lastFrame : 16.7;
      // Clouds don't need 120fps: hold high-refresh screens to ~60.
      if (dt < 14) return;
      lastFrame = now;
      simTime += Math.min(dt, 50) / 1000;

      // Adaptive resolution. Over each 40-frame window: slow frames shrink
      // the pixel budget at once; fast ones earn it back slowly, never past
      // where it started.
      winSum += dt;
      if (++winN === 40) {
        const mean = winSum / winN;
        winSum = winN = 0;
        if (mean > 24 && budget > 50_000) {
          fastWindows = 0;
          budget = Math.max(50_000, budget * 0.7);
          size();
        } else if (mean < 18 && ++fastWindows >= 4 && budget < cfg.budget) {
          fastWindows = 0;
          budget = Math.min(cfg.budget, budget * 1.15);
          size();
        }
      }
      light = lightning();
      draw();
    }

    const shouldRun = () => !!gl && onScreen && !document.hidden && !reduceMq.matches;

    function update() {
      if (disposed) return;
      const run = shouldRun();
      setAttr('data-live', run);
      if (run && !raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        setAttr('data-flash', false);
        setAttr('data-thunder', false);
      }
      // Reduced motion: one still frame — rain mid-fall, no lightning. The
      // canvas keeps it; it is redrawn only if the box or the theme changes.
      if (gl && reduceMq.matches && !still) {
        strike = null;
        light = NONE;
        if (!simTime) simTime = 41.5;
        draw();
        still = true;
      }
    }

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === cssW && height === cssH) return;
      cssW = width;
      cssH = height;
      size();
      if (!raf) draw();
    });
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });

    // Paint the new light at once, even mid-loop, so the theme switch's view
    // transition snapshots a sky that already matches the page.
    const onTheme = () => draw();
    const onVisibility = () => update();
    const onMotionPref = () => {
      still = false;
      update();
    };

    const onClick = (e: MouseEvent) => {
      if (!raf || strike || simTime - lastStrikeAt < 1.2) return;
      const target = e.target as Element | null;
      if (target?.closest('a,button,input,select,textarea,summary,label,[role="button"],[tabindex]')) return;
      if (window.getSelection()?.isCollapsed === false) return;
      const wr = wrap.getBoundingClientRect();
      fire({ x: e.clientX - wr.left, tip: Math.max(40, e.clientY - wr.top), bolt: true });
    };

    const onLost = (e: Event) => {
      e.preventDefault(); // ask the browser to restore it when it can
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      gl = null;
      strike = null;
      light = NONE;
      wrap.dataset.state = 'fallback';
      setAttr('data-live', false);
      setAttr('data-flash', false);
      setAttr('data-thunder', false);
    };
    const onRestored = () => {
      if (!setup()) return;
      nextStrike = simTime + rand(cfg.first[0], cfg.first[1]);
      size();
      draw();
      wrap.dataset.state = 'live';
      update();
    };

    let idleId = 0;
    let timeoutId = 0;
    const start = () => {
      if (disposed) return;
      if (!setup()) {
        wrap.dataset.state = 'fallback';
        return;
      }
      wrap.appendChild(canvas);
      canvas.addEventListener('webglcontextlost', onLost);
      canvas.addEventListener('webglcontextrestored', onRestored);
      const r = wrap.getBoundingClientRect();
      cssW = r.width;
      cssH = r.height;
      size();
      // First frame now; under reduced motion update() draws the one still.
      if (!reduceMq.matches) draw();
      wrap.dataset.state = 'live';
      ro.observe(wrap);
      io.observe(wrap);
      window.addEventListener('themechange', onTheme);
      document.addEventListener('visibilitychange', onVisibility);
      reduceMq.addEventListener('change', onMotionPref);
      host.addEventListener('click', onClick);
    };
    const schedule = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(start, { timeout: 1500 });
      } else {
        timeoutId = window.setTimeout(start, 200);
      }
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener('load', schedule);
      if (idleId) window.cancelIdleCallback?.(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('themechange', onTheme);
      document.removeEventListener('visibilitychange', onVisibility);
      reduceMq.removeEventListener('change', onMotionPref);
      host.removeEventListener('click', onClick);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      for (const a of attrs) host.removeAttribute(a);
      // Hand the GPU context back now rather than whenever GC gets to it —
      // browsers cap live contexts, and every report visit makes one.
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      delete wrap.dataset.state;
    };
  }, [variant]);

  return (
    <div
      ref={wrapRef}
      className={`ms-sky ${className}`.trim()}
      data-variant={variant}
      aria-hidden="true"
    />
  );
}
