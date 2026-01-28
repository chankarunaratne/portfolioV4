// Sky Configuration
const SKY_CONFIG = {
  // Feature flag: set to false to freeze the sky (no time progression / no continuous rendering)
  // Useful for debugging Chrome scroll jank.
  motionEnabled: false,
  cloudSpeed: 0.15,
  cloudDensity: 0.6,
  cloudScale: 1.5,
  colorTint: { r: 1.0, g: 1.0, b: 1.0 },
  parallaxStrength: 0.002,
  grainIntensity: 0.03,
  chromaticAberration: 0.0015,
  // Soft central clearing parameters
  clearRadius: 0.33,
  clearFeather: 0.22,
  clearStrength: 0.6,
  clearEllipse: { x: 1.6, y: 1.0 },
  // Cloud placement: two soft "blobs" (scattered clouds) in UV space
  // NOTE: These only affect cloud visibility, not the sky gradient/glare.
  cloudBlob1Center: { x: 0.08, y: 0.86 }, // top-left
  cloudBlob1Radius: 0.29,
  cloudBlob1Feather: 0.22,
  cloudBlob1Ellipse: { x: 1.25, y: 1.0 },
  cloudBlob2Center: { x: 0.88, y: 0.4 }, // mid-low right
  cloudBlob2Radius: 0.3,
  cloudBlob2Feather: 0.24,
  cloudBlob2Ellipse: { x: 1.0, y: 1.1 },
};

class SkyRenderer {
  constructor() {
    this.canvas = document.getElementById('skyCanvas');
    this.mouse = { x: 0, y: 0 };
    this.time = 0;

    this._motionEnabled = SKY_CONFIG.motionEnabled !== false;

    // Animation loop state (so we can pause rendering while modals are open)
    this._rafId = null;
    this._isRunning = false;
    this._pauseTokens = new Set();
    this._tick = this._tick.bind(this);

    this.init();
    this.setupEventListeners();

    // Always render at least one frame so the canvas looks correct even if motion is disabled.
    this._renderFrame(false);

    if (this._motionEnabled) {
      this.start();
    } else {
      // Keep all code intact, but disable continuous rendering.
      this.pause('motionFreeze');
    }
  }

  start() {
    if (this._isRunning) return;
    if (this._pauseTokens.size > 0) return;
    this._isRunning = true;
    this._rafId = requestAnimationFrame(this._tick);
  }

  pause(token = 'default') {
    this._pauseTokens.add(token);
    if (!this._isRunning) return;
    this._isRunning = false;
    if (this._rafId != null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  resume(token = 'default') {
    this._pauseTokens.delete(token);
    if (this._pauseTokens.size > 0) return;
    if (this._isRunning) return;

    // Render a frame immediately so the sky feels instant on close,
    // then continue on the next rAF.
    this._isRunning = true;
    this._renderFrame(this._motionEnabled);
    this._rafId = requestAnimationFrame(this._tick);
  }

  _renderFrame(advanceTime = true) {
    if (advanceTime) {
      this.time += 0.016; // 60fps delta (intentionally fixed for the aesthetic)
    }
    this.material.uniforms.uTime.value = this.time;
    this.renderer.render(this.scene, this.camera);
  }

  _tick() {
    if (!this._isRunning) return;
    this._renderFrame(this._motionEnabled);
    this._rafId = requestAnimationFrame(this._tick);
  }

  // Debug/feature-flag helper: freeze/unfreeze motion without removing code.
  setMotionEnabled(enabled) {
    const nextEnabled = !!enabled;
    SKY_CONFIG.motionEnabled = nextEnabled;
    this._motionEnabled = nextEnabled;

    if (nextEnabled) {
      this.resume('motionFreeze');
    } else {
      this.pause('motionFreeze');
      // Render once (without advancing time) to lock the final visual state.
      this._renderFrame(false);
    }
  }

  init() {
    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Match renderer size to actual CSS size of the canvas to avoid stretching
    const rect = this.canvas.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height, false);

    // Create shader material
    this.createShaderMaterial();

    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    // Apply initial responsive tuning (mobile vs desktop)
    this.applyResponsiveConfig();
  }

  createShaderMaterial() {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uCloudSpeed;
      uniform float uCloudDensity;
      uniform float uCloudScale;
      uniform vec3 uColorTint;
      uniform float uParallaxStrength;
      uniform float uGrainIntensity;
      uniform float uChromaticAberration;
      // Central clearing controls
      uniform float uClearRadius;
      uniform float uClearFeather;
      uniform float uClearStrength;
      uniform vec2 uClearEllipse;
      // Cloud placement blobs
      uniform vec2 uCloudBlob1Center;
      uniform float uCloudBlob1Radius;
      uniform float uCloudBlob1Feather;
      uniform vec2 uCloudBlob1Ellipse;
      uniform vec2 uCloudBlob2Center;
      uniform float uCloudBlob2Radius;
      uniform float uCloudBlob2Feather;
      uniform vec2 uCloudBlob2Ellipse;
      
      varying vec2 vUv;

      // Noise functions
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      // Fractal Brownian Motion for clouds
      float fbm(vec2 p, float time) {
        float f = 0.0;
        float amplitude = 0.5;
        float frequency = 1.0;
        
        for (int i = 0; i < 6; i++) {
          vec2 offset = vec2(time * uCloudSpeed * 0.1, 0.0);
          f += amplitude * snoise((p + offset) * frequency * uCloudScale);
          amplitude *= 0.5;
          frequency *= 2.0;
        }
        
        return f;
      }

      // Film grain
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      // Sky gradient
      vec3 getSkyColor(vec2 uv) {
        float horizon = 1.0 - uv.y;
        vec3 topColor = vec3(0.227, 0.502, 0.769);
        vec3 horizonColor = vec3(0.627, 0.784, 0.922);
        return mix(topColor, horizonColor, horizon * horizon);
      }

      // Soft cloud "blob" mask (1 inside, 0 outside with feathered edge)
      float blobMask(vec2 uv, vec2 center, vec2 ellipse, float radius, float feather) {
        // Allow disabling a blob by setting radius <= 0
        if (radius <= 0.0) return 0.0;
        vec2 d = uv - center;
        d.x /= max(ellipse.x, 0.001);
        d.y /= max(ellipse.y, 0.001);
        float dist = length(d);
        float m = smoothstep(radius, radius - feather, dist);
        // Slight easing to feel more "roundish"
        return pow(m, 1.2);
      }

      void main() {
        vec2 uv = vUv;
        vec2 st = uv * uResolution.xy / min(uResolution.x, uResolution.y);
        
        // Apply parallax based on mouse position
        vec2 parallaxOffset = (uMouse - 0.5) * uParallaxStrength;
        st += parallaxOffset;
        
        // Base sky gradient
        vec3 skyColor = getSkyColor(uv);
        
        // Generate clouds using FBM
        float cloudNoise = fbm(st * 2.0, uTime);
        cloudNoise = smoothstep(-uCloudDensity, uCloudDensity, cloudNoise);
        
        // Add multiple cloud layers for depth
        float cloudLayer1 = fbm(st * 1.5 + vec2(uTime * 0.01, 0.0), uTime);
        cloudLayer1 = smoothstep(-0.3, 0.7, cloudLayer1) * 0.8;
        
        float cloudLayer2 = fbm(st * 3.0 + vec2(uTime * 0.0075, 0.0), uTime);
        cloudLayer2 = smoothstep(-0.2, 0.5, cloudLayer2) * 0.6;
        
        // Combine cloud layers
        float totalClouds = max(cloudNoise, max(cloudLayer1 * 0.7, cloudLayer2 * 0.5));
        totalClouds = clamp(totalClouds, 0.0, 1.0);
        
        // Apply a soft central clearing (elliptical, feathered)
        vec2 centerUv = vUv - 0.5;
        centerUv.x /= uClearEllipse.x;
        centerUv.y /= uClearEllipse.y;
        float centerDist = length(centerUv);
        float clearMask = smoothstep(uClearRadius, uClearRadius - uClearFeather, centerDist);
        totalClouds *= 1.0 - (clearMask * uClearStrength);

        // Cloud placement: keep clouds in two scattered areas (top-left + mid-low right)
        float blob1 = blobMask(vUv, uCloudBlob1Center, uCloudBlob1Ellipse, uCloudBlob1Radius, uCloudBlob1Feather);
        float blob2 = blobMask(vUv, uCloudBlob2Center, uCloudBlob2Ellipse, uCloudBlob2Radius, uCloudBlob2Feather);
        float cloudPlacement = max(blob1, blob2);
        totalClouds *= cloudPlacement;
        
        // Cloud color (white with slight blue tint)
        vec3 cloudColor = vec3(1.0, 1.0, 1.0) * 0.95;
        
        // Mix sky and clouds
        vec3 finalColor = mix(skyColor, cloudColor, totalClouds * 0.8);
        
        // Apply color tint
        finalColor *= uColorTint;
        
        // Add film grain
        float grain = random(uv + uTime * 0.1) * uGrainIntensity;
        finalColor += grain;
        
        // Chromatic aberration effect
        vec2 aberrationOffset = (uv - 0.5) * uChromaticAberration;
        float r = finalColor.r;
        float g = mix(finalColor.g, getSkyColor(uv + aberrationOffset).g, 0.3);
        float b = mix(finalColor.b, getSkyColor(uv - aberrationOffset).b, 0.3);
        
        finalColor = vec3(r, g, b);
        
        // Subtle vignette
        float vignette = 1.0 - length(uv - 0.5) * 0.3;
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(
            this.canvas.getBoundingClientRect().width,
            this.canvas.getBoundingClientRect().height,
          ),
        },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uCloudSpeed: { value: SKY_CONFIG.cloudSpeed },
        uCloudDensity: { value: SKY_CONFIG.cloudDensity },
        uCloudScale: { value: SKY_CONFIG.cloudScale },
        uColorTint: {
          value: new THREE.Vector3(
            SKY_CONFIG.colorTint.r,
            SKY_CONFIG.colorTint.g,
            SKY_CONFIG.colorTint.b,
          ),
        },
        uParallaxStrength: { value: SKY_CONFIG.parallaxStrength },
        uGrainIntensity: { value: SKY_CONFIG.grainIntensity },
        uChromaticAberration: { value: SKY_CONFIG.chromaticAberration },
        uClearRadius: { value: SKY_CONFIG.clearRadius },
        uClearFeather: { value: SKY_CONFIG.clearFeather },
        uClearStrength: { value: SKY_CONFIG.clearStrength },
        uClearEllipse: {
          value: new THREE.Vector2(
            SKY_CONFIG.clearEllipse.x,
            SKY_CONFIG.clearEllipse.y,
          ),
        },
        uCloudBlob1Center: {
          value: new THREE.Vector2(
            SKY_CONFIG.cloudBlob1Center.x,
            SKY_CONFIG.cloudBlob1Center.y,
          ),
        },
        uCloudBlob1Radius: { value: SKY_CONFIG.cloudBlob1Radius },
        uCloudBlob1Feather: { value: SKY_CONFIG.cloudBlob1Feather },
        uCloudBlob1Ellipse: {
          value: new THREE.Vector2(
            SKY_CONFIG.cloudBlob1Ellipse.x,
            SKY_CONFIG.cloudBlob1Ellipse.y,
          ),
        },
        uCloudBlob2Center: {
          value: new THREE.Vector2(
            SKY_CONFIG.cloudBlob2Center.x,
            SKY_CONFIG.cloudBlob2Center.y,
          ),
        },
        uCloudBlob2Radius: { value: SKY_CONFIG.cloudBlob2Radius },
        uCloudBlob2Feather: { value: SKY_CONFIG.cloudBlob2Feather },
        uCloudBlob2Ellipse: {
          value: new THREE.Vector2(
            SKY_CONFIG.cloudBlob2Ellipse.x,
            SKY_CONFIG.cloudBlob2Ellipse.y,
          ),
        },
      },
    });
  }

  setupEventListeners() {
    // Mouse movement for parallax
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = 1.0 - e.clientY / window.innerHeight;

      this.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
    });

    // Window resize
    window.addEventListener('resize', () => {
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      this.renderer.setSize(width, height, false);
      this.material.uniforms.uResolution.value.set(width, height);
      // Re-apply responsive tuning on resize (e.g., device rotation)
      this.applyResponsiveConfig();
    });

    // Touch support for mobile parallax
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        this.mouse.x = touch.clientX / window.innerWidth;
        this.mouse.y = 1.0 - touch.clientY / window.innerHeight;

        this.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
      }
    });
  }

  // Tweak central clearing on mobile so side clouds appear along the whole hero
  applyResponsiveConfig() {
    const viewportWidth =
      window.innerWidth || document.documentElement.clientWidth;
    if (viewportWidth <= 768) {
      // Reduce the central ellipse impact on mobile so clouds appear beside the hero
      const mobileClearRadius = 0.22; // smaller center
      const mobileClearStrength = 0.25; // much weaker clearing
      const mobileClearEllipseX = 1.2; // narrower horizontally (less clearing across width)
      const mobileClearEllipseY = 0.9; // slightly narrower vertically
      // Slightly increase cloud coverage on mobile so sides feel fuller
      const mobileCloudDensity = 0.7;
      SKY_CONFIG.clearRadius = mobileClearRadius;
      SKY_CONFIG.clearStrength = mobileClearStrength;
      SKY_CONFIG.clearEllipse.x = mobileClearEllipseX;
      SKY_CONFIG.clearEllipse.y = mobileClearEllipseY;
      SKY_CONFIG.cloudDensity = mobileCloudDensity;
      this.material.uniforms.uClearRadius.value = mobileClearRadius;
      this.material.uniforms.uClearStrength.value = mobileClearStrength;
      this.material.uniforms.uClearEllipse.value.set(
        mobileClearEllipseX,
        mobileClearEllipseY,
      );
      this.material.uniforms.uCloudDensity.value = mobileCloudDensity;

      // Nudge blob positions/sizes for mobile proportions (keep same intent)
      // Mobile: a wider "cloud" around the logo area (top-left). Remove the right cloud entirely.
      // Note: This is used as a soft mask for cloud visibility in the shader (not a DOM element).
      const blob1Center = { x: 0.22, y: 0.92 };
      const blob2Center = { x: 0.86, y: 0.42 };
      // Slightly larger and wider than before (more rectangular on mobile)
      const blob1Radius = 0.185;
      const blob2Radius = 0.0; // disabled
      const blob1Feather = 0.12;
      const blob2Feather = 0.0;
      // Make the mobile cloud more rectangular (wider than tall)
      // Slightly compress height so it reads more like a horizontal "cloud band"
      const blob1Ellipse = { x: 2.35, y: 0.72 };
      SKY_CONFIG.cloudBlob1Center = blob1Center;
      SKY_CONFIG.cloudBlob2Center = blob2Center;
      SKY_CONFIG.cloudBlob1Radius = blob1Radius;
      SKY_CONFIG.cloudBlob2Radius = blob2Radius;
      SKY_CONFIG.cloudBlob1Feather = blob1Feather;
      SKY_CONFIG.cloudBlob2Feather = blob2Feather;
      SKY_CONFIG.cloudBlob1Ellipse = blob1Ellipse;
      this.material.uniforms.uCloudBlob1Center.value.set(
        blob1Center.x,
        blob1Center.y,
      );
      this.material.uniforms.uCloudBlob2Center.value.set(
        blob2Center.x,
        blob2Center.y,
      );
      this.material.uniforms.uCloudBlob1Radius.value = blob1Radius;
      this.material.uniforms.uCloudBlob2Radius.value = blob2Radius;
      this.material.uniforms.uCloudBlob1Feather.value = blob1Feather;
      this.material.uniforms.uCloudBlob2Feather.value = blob2Feather;
      this.material.uniforms.uCloudBlob1Ellipse.value.set(
        blob1Ellipse.x,
        blob1Ellipse.y,
      );
    } else {
      // Restore desktop defaults
      const desktopClearRadius = 0.33;
      const desktopClearStrength = 0.6;
      const desktopClearEllipseX = 1.6;
      const desktopClearEllipseY = 1.0;
      const desktopCloudDensity = 0.6;
      SKY_CONFIG.clearRadius = desktopClearRadius;
      SKY_CONFIG.clearStrength = desktopClearStrength;
      SKY_CONFIG.clearEllipse.x = desktopClearEllipseX;
      SKY_CONFIG.clearEllipse.y = desktopClearEllipseY;
      SKY_CONFIG.cloudDensity = desktopCloudDensity;
      this.material.uniforms.uClearRadius.value = desktopClearRadius;
      this.material.uniforms.uClearStrength.value = desktopClearStrength;
      this.material.uniforms.uClearEllipse.value.set(
        desktopClearEllipseX,
        desktopClearEllipseY,
      );
      this.material.uniforms.uCloudDensity.value = desktopCloudDensity;

      // Restore desktop blob defaults
      const blob1Center = { x: 0.08, y: 0.86 };
      const blob2Center = { x: 0.88, y: 0.4 };
      const blob1Radius = 0.29;
      const blob2Radius = 0.3;
      const blob1Feather = 0.22;
      const blob2Feather = 0.24;
      const blob1Ellipse = { x: 1.25, y: 1.0 };
      SKY_CONFIG.cloudBlob1Center = blob1Center;
      SKY_CONFIG.cloudBlob2Center = blob2Center;
      SKY_CONFIG.cloudBlob1Radius = blob1Radius;
      SKY_CONFIG.cloudBlob2Radius = blob2Radius;
      SKY_CONFIG.cloudBlob1Feather = blob1Feather;
      SKY_CONFIG.cloudBlob2Feather = blob2Feather;
      SKY_CONFIG.cloudBlob1Ellipse = blob1Ellipse;
      this.material.uniforms.uCloudBlob1Center.value.set(
        blob1Center.x,
        blob1Center.y,
      );
      this.material.uniforms.uCloudBlob2Center.value.set(
        blob2Center.x,
        blob2Center.y,
      );
      this.material.uniforms.uCloudBlob1Radius.value = blob1Radius;
      this.material.uniforms.uCloudBlob2Radius.value = blob2Radius;
      this.material.uniforms.uCloudBlob1Feather.value = blob1Feather;
      this.material.uniforms.uCloudBlob2Feather.value = blob2Feather;
      this.material.uniforms.uCloudBlob1Ellipse.value.set(
        blob1Ellipse.x,
        blob1Ellipse.y,
      );
    }
  }

  animate() {
    // Backwards-compatible alias (some external code may call animate()).
    // Prefer pause()/resume()/start() for lifecycle control.
    this.start();
  }

  // Public methods to update configuration
  updateCloudSpeed(speed) {
    SKY_CONFIG.cloudSpeed = speed;
    this.material.uniforms.uCloudSpeed.value = speed;
  }

  updateCloudDensity(density) {
    SKY_CONFIG.cloudDensity = density;
    this.material.uniforms.uCloudDensity.value = density;
  }

  updateColorTint(r, g, b) {
    SKY_CONFIG.colorTint = { r, g, b };
    this.material.uniforms.uColorTint.value.set(r, g, b);
  }

  updateParallaxStrength(strength) {
    SKY_CONFIG.parallaxStrength = strength;
    this.material.uniforms.uParallaxStrength.value = strength;
  }
}

// Initialize the sky renderer when the page loads
window.addEventListener('DOMContentLoaded', () => {
  window.skyRenderer = new SkyRenderer();
});

// Ensure final layout (after fonts/images) also updates the clear band
window.addEventListener('load', () => {
  // No-op: keep for future layout-tied tuning hooks if needed.
});

// Export configuration for external access
window.SKY_CONFIG = SKY_CONFIG;
