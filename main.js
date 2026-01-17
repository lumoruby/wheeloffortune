// Wheel of Fortune - Main JavaScript

class WheelOfFortune {
  constructor() {
    this.canvas = document.getElementById('wheel');
    this.ctx = this.canvas.getContext('2d');
    this.spinBtn = document.getElementById('spin-btn');
    this.resultDiv = document.getElementById('result');
    this.segmentCountInput = document.getElementById('segment-count');
    this.applyCountBtn = document.getElementById('apply-count');
    this.updateWheelBtn = document.getElementById('update-wheel');
    this.segmentInputsDiv = document.getElementById('segment-inputs');

    // Wheel state
    this.segments = ['항목 1', '항목 2', '항목 3', '항목 4', '항목 5', '항목 6'];
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
    ];
    this.currentRotation = 0;
    this.isSpinning = false;

    // Audio context for sound effects
    this.audioContext = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.generateSegmentInputs();
    this.drawWheel();
    this.setupPresets();
  }

  setupEventListeners() {
    this.spinBtn.addEventListener('click', () => this.spin());
    this.applyCountBtn.addEventListener('click', () => this.applySegmentCount());
    this.updateWheelBtn.addEventListener('click', () => this.updateWheel());
  }

  setupPresets() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const preset = btn.dataset.preset;
        this.applyPreset(preset);
      });
    });
  }

  applyPreset(preset) {
    let items = [];
    switch (preset) {
      case 'lunch':
        items = ['치킨', '피자', '짜장면', '떡볶이', '김밥', '햄버거', '초밥', '삼겹살'];
        break;
      case 'yesno':
        items = ['예!', '아니오'];
        break;
      case 'numbers':
        items = ['1', '2', '3', '4', '5', '6', '7', '8'];
        break;
    }

    this.segments = items;
    this.segmentCountInput.value = items.length;
    this.generateSegmentInputs();
    this.drawWheel();

    // Show feedback
    this.showTemporaryMessage('프리셋이 적용되었습니다!');
  }

  showTemporaryMessage(message) {
    this.resultDiv.textContent = message;
    this.resultDiv.classList.add('show');
    setTimeout(() => {
      this.resultDiv.classList.remove('show');
    }, 2000);
  }

  applySegmentCount() {
    let count = parseInt(this.segmentCountInput.value);
    count = Math.max(2, Math.min(12, count));
    this.segmentCountInput.value = count;

    // Adjust segments array
    while (this.segments.length < count) {
      this.segments.push(`항목 ${this.segments.length + 1}`);
    }
    while (this.segments.length > count) {
      this.segments.pop();
    }

    this.generateSegmentInputs();
    this.drawWheel();
  }

  generateSegmentInputs() {
    this.segmentInputsDiv.innerHTML = '';

    this.segments.forEach((segment, index) => {
      const row = document.createElement('div');
      row.className = 'segment-input-row';

      const label = document.createElement('span');
      label.textContent = `${index + 1}.`;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = segment;
      input.placeholder = `항목 ${index + 1}`;
      input.dataset.index = index;

      row.appendChild(label);
      row.appendChild(input);
      this.segmentInputsDiv.appendChild(row);
    });
  }

  updateWheel() {
    const inputs = this.segmentInputsDiv.querySelectorAll('input');
    inputs.forEach((input, index) => {
      this.segments[index] = input.value || `항목 ${index + 1}`;
    });
    this.drawWheel();
    this.showTemporaryMessage('바퀴가 업데이트되었습니다!');
  }

  drawWheel() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save the current state
    this.ctx.save();

    // Translate to center and rotate
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.currentRotation);

    const segmentAngle = (2 * Math.PI) / this.segments.length;

    // Draw segments
    this.segments.forEach((segment, index) => {
      const startAngle = index * segmentAngle;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, startAngle, endAngle);
      this.ctx.closePath();

      // Gradient fill for each segment
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      const baseColor = this.colors[index % this.colors.length];
      gradient.addColorStop(0, this.lightenColor(baseColor, 30));
      gradient.addColorStop(0.7, baseColor);
      gradient.addColorStop(1, this.darkenColor(baseColor, 20));

      this.ctx.fillStyle = gradient;
      this.ctx.fill();

      // Draw segment border
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Draw text
      this.ctx.save();
      this.ctx.rotate(startAngle + segmentAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.fillStyle = '#fff';
      this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      this.ctx.lineWidth = 3;

      // Adjust font size based on text length and number of segments
      const maxTextLength = 8;
      let fontSize = Math.min(24, (radius * 0.15) / (this.segments.length / 6));
      if (segment.length > maxTextLength) {
        fontSize *= maxTextLength / segment.length;
      }
      fontSize = Math.max(12, fontSize);

      this.ctx.font = `bold ${fontSize}px 'Jua', sans-serif`;

      // Truncate text if too long
      let displayText = segment;
      if (segment.length > 12) {
        displayText = segment.substring(0, 10) + '...';
      }

      this.ctx.strokeText(displayText, radius - 20, 6);
      this.ctx.fillText(displayText, radius - 20, 6);
      this.ctx.restore();
    });

    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 40, 0, 2 * Math.PI);
    const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
    centerGradient.addColorStop(0, '#fff');
    centerGradient.addColorStop(1, '#ddd');
    this.ctx.fillStyle = centerGradient;
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 5;
    this.ctx.stroke();

    // Draw outer ring
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 8;
    this.ctx.stroke();

    // Draw decorative dots around the wheel
    const dotCount = 24;
    const dotRadius = 6;
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * 2 * Math.PI;
      const x = Math.cos(angle) * (radius + 2);
      const y = Math.sin(angle) * (radius + 2);

      this.ctx.beginPath();
      this.ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
      this.ctx.fillStyle = i % 2 === 0 ? '#ff0040' : '#ffd700';
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  }

  spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.spinBtn.disabled = true;
    this.resultDiv.classList.remove('show');

    // Random number of full rotations (5-10) plus random segment
    const fullRotations = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 2 * Math.PI;
    const targetRotation = this.currentRotation + (fullRotations * 2 * Math.PI) + randomAngle;

    const duration = 5000; // 5 seconds
    const startTime = Date.now();
    const startRotation = this.currentRotation;

    // Play tick sounds
    this.playTickSound();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      this.currentRotation = startRotation + (targetRotation - startRotation) * easeOut;
      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.announceResult();
      }
    };

    requestAnimationFrame(animate);
  }

  playTickSound() {
    // Create audio context for tick sounds during spin
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      let lastSegment = -1;
      const tickInterval = setInterval(() => {
        if (!this.isSpinning) {
          clearInterval(tickInterval);
          return;
        }

        // Calculate current segment
        const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        // The pointer is at the top (270 degrees or 3π/2)
        const pointerAngle = (3 * Math.PI / 2 - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
        const currentSegment = Math.floor(pointerAngle / segmentAngle) % this.segments.length;

        if (currentSegment !== lastSegment) {
          this.playTick();
          lastSegment = currentSegment;
        }
      }, 50);
    } catch (e) {
      // Audio not supported, continue without sound
    }
  }

  playTick() {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = 800 + Math.random() * 200;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.05);
    } catch (e) {
      // Ignore audio errors
    }
  }

  announceResult() {
    // Calculate the winning segment
    // The pointer is at the top (270 degrees)
    const normalizedRotation = ((this.currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const segmentAngle = (2 * Math.PI) / this.segments.length;

    // Pointer at top = 3π/2 (270°)
    // We need to find which segment is at the top
    const pointerAngle = (3 * Math.PI / 2 - normalizedRotation + 2 * Math.PI) % (2 * Math.PI);
    const winningIndex = Math.floor(pointerAngle / segmentAngle) % this.segments.length;

    const winner = this.segments[winningIndex];

    // Play winning sound
    this.playWinSound();

    // Show result with animation
    this.resultDiv.innerHTML = `🎉 <strong>${winner}</strong> 🎉`;
    this.resultDiv.classList.add('show');

    // Create confetti
    this.createConfetti();
  }

  playWinSound() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Play a fanfare-like sound
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          oscillator.frequency.value = freq;
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

          oscillator.start();
          oscillator.stop(this.audioContext.currentTime + 0.3);
        }, i * 100);
      });
    } catch (e) {
      // Ignore audio errors
    }
  }

  createConfetti() {
    const colors = ['#ff0040', '#ffd700', '#00ffff', '#ff00de', '#00ff88', '#ff6b6b'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.width = (Math.random() * 10 + 5) + 'px';
        confetti.style.height = (Math.random() * 10 + 5) + 'px';
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

        document.body.appendChild(confetti);

        // Remove confetti after animation
        setTimeout(() => {
          confetti.remove();
        }, 4000);
      }, Math.random() * 500);
    }
  }
}

// Initialize the wheel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new WheelOfFortune();
});
