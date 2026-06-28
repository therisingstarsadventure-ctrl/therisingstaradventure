// The Rising Stars - Canvas Particle Engine (Hero Floating Dust/Snow)
class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = window.innerWidth < 768 ? 40 : 100;
    this.isActive = true;

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    this.resizeCanvas();
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle(true));
    }
  }

  createParticle(randomY = false) {
    return {
      x: Math.random() * this.canvas.width,
      y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 10,
      size: Math.random() * 2.5 + 0.5,
      speedX: Math.random() * 0.4 - 0.2,
      speedY: -(Math.random() * 0.8 + 0.2), // Float upwards
      opacity: Math.random() * 0.5 + 0.2,
      fadeSpeed: Math.random() * 0.005 + 0.002
    };
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.parentElement.offsetWidth;
    this.canvas.height = this.canvas.parentElement.offsetHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.maxParticles = window.innerWidth < 768 ? 40 : 100;
    });

    // Performance optimization: Pause execution when canvas scrolls out of view
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isActive = entry.isIntersecting;
          if (this.isActive) {
            this.animate();
          }
        });
      }, { threshold: 0.1 });
      observer.observe(this.canvas);
    }
  }

  animate() {
    if (!this.isActive) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap-around or regenerate
      if (p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
        this.particles[i] = this.createParticle(false);
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 140, 0, ${p.opacity})`; // Warm amber glow
      this.ctx.shadowBlur = 4;
      this.ctx.shadowColor = 'rgba(255, 110, 0, 0.4)';
      this.ctx.fill();
    }

    // Reset shadow
    this.ctx.shadowBlur = 0;

    requestAnimationFrame(() => this.animate());
  }
}

// Instantiate particles when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ParticleSystem('hero-particles');
});
