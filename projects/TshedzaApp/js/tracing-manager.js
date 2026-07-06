/**
 * ============================================================================
 * Tshedza Playground - Reusable Canvas Tracing Engine
 * ============================================================================
 */

export class TracingManager {
  /**
   * @param {HTMLCanvasElement} canvas - The target trace canvas element.
   * @param {function} onSuccess - Callback when trace succeeds.
   * @param {function} onFail - Callback when trace fails.
   */
  constructor(canvas, onSuccess, onFail) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.onSuccess = onSuccess;
    this.onFail = onFail;

    this.dotRadius = 4;
    this.dotSpacing = 15;
    this.traceTolerance = 25;
    this.requiredCoverage = 0.82; // Must cover 82% of dots
    this.maxScribbleRatio = 0.30; // Max 30% points outside path

    this.isDrawing = false;
    this.hasStartedTracing = false;
    this.drawnPoints = [];
    this.traceTimeout = null;
    this.startX = 0;
    this.startY = 0;
    this.currentPathData = null;
    this.isActive = false;

    this.initEvents();
  }

  /**
   * Set active path coordinates and reset trace state.
   * Path data is in the format: [[x, y, isMoveTo], ...]
   */
  setPath(pathData) {
    this.currentPathData = pathData;
    this.reset();
  }

  /**
   * Clear drawing canvas and draw target dotted outline.
   */
  reset() {
    if (this.traceTimeout) clearTimeout(this.traceTimeout);
    this.isDrawing = false;
    this.hasStartedTracing = false;
    this.drawnPoints = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.currentPathData) {
      this.drawDottedPath();
    }
  }

  /**
   * Toggle drawing interaction.
   */
  setActive(active) {
    this.isActive = active;
    if (!active) {
      this.reset();
    }
  }

  /**
   * Generate interpolated ideal dots based on path lines.
   */
  getIdealPoints() {
    const points = [];
    if (!this.currentPathData) return points;

    let currentX = 0, currentY = 0;
    for (let i = 0; i < this.currentPathData.length; i++) {
      const [x, y, isMoveTo] = this.currentPathData[i];
      if (isMoveTo) {
        currentX = x;
        currentY = y;
        points.push({ x, y });
      } else {
        const dx = x - currentX;
        const dy = y - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance / this.dotSpacing);

        for (let j = 1; j <= steps; j++) {
          points.push({
            x: currentX + (dx * j) / steps,
            y: currentY + (dy * j) / steps
          });
        }
        currentX = x;
        currentY = y;
      }
    }
    return points;
  }

  /**
   * Render dotted letters or shapes on canvas.
   */
  drawDottedPath() {
    const idealPoints = this.getIdealPoints();
    this.ctx.fillStyle = '#ccc';
    this.ctx.beginPath();
    idealPoints.forEach(point => {
      this.ctx.moveTo(point.x, point.y);
      this.ctx.arc(point.x, point.y, this.dotRadius, 0, Math.PI * 2);
    });
    this.ctx.fill();
  }

  /**
   * Score the tracing performance.
   */
  evaluateTrace() {
    const idealPoints = this.getIdealPoints();
    if (idealPoints.length === 0 || this.drawnPoints.length === 0) return false;

    let matchedIdealCount = 0;

    // 1. Coverage check
    for (const ideal of idealPoints) {
      let isMatched = false;
      for (const drawn of this.drawnPoints) {
        const dx = ideal.x - drawn.x;
        const dy = ideal.y - drawn.y;
        if (dx * dx + dy * dy <= this.traceTolerance * this.traceTolerance) {
          isMatched = true;
          break;
        }
      }
      if (isMatched) matchedIdealCount++;
    }

    const coverage = matchedIdealCount / idealPoints.length;

    // 2. Scribbling penalty check
    let outOfBoundsCount = 0;
    for (const drawn of this.drawnPoints) {
      let isNearIdeal = false;
      for (const ideal of idealPoints) {
        const dx = drawn.x - ideal.x;
        const dy = drawn.y - ideal.y;
        if (dx * dx + dy * dy <= this.traceTolerance * this.traceTolerance) {
          isNearIdeal = true;
          break;
        }
      }
      if (!isNearIdeal) outOfBoundsCount++;
    }

    const scribbleRatio = outOfBoundsCount / this.drawnPoints.length;

    console.log(`Trace Evaluation -> Coverage: ${Math.round(coverage * 100)}%, Scribble: ${Math.round(scribbleRatio * 100)}%`);

    return coverage >= this.requiredCoverage && scribbleRatio < this.maxScribbleRatio;
  }

  /**
   * Bind event handlers for Mouse & Touch.
   */
  initEvents() {
    this.lastRecordedX = 0;
    this.lastRecordedY = 0;

    const start = (e) => {
      if (!this.isActive || !this.currentPathData) return;
      this.isDrawing = true;
      this.hasStartedTracing = true;

      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      this.startX = clientX - rect.left;
      this.startY = clientY - rect.top;

      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);

      this.drawnPoints.push({ x: this.startX, y: this.startY });
      this.lastRecordedX = this.startX;
      this.lastRecordedY = this.startY;

      if (this.traceTimeout) clearTimeout(this.traceTimeout);
    };

    const move = (e) => {
      if (!this.isDrawing || !this.isActive) return;

      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const currentX = clientX - rect.left;
      const currentY = clientY - rect.top;

      // Draw the visible line feedback instantly
      this.ctx.lineWidth = 15;
      this.ctx.lineCap = 'round';
      this.ctx.strokeStyle = '#4a90e2';
      this.ctx.lineTo(currentX, currentY);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(currentX, currentY);

      // Accumulate distance between the last recorded point and the current point.
      // This guarantees that even if the user draws extremely slowly (generating
      // sub-pixel events), points are correctly recorded once they traverse 5px.
      const dx = currentX - this.lastRecordedX;
      const dy = currentY - this.lastRecordedY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= 5) {
        const steps = Math.floor(distance / 5);
        for (let i = 1; i <= steps; i++) {
          this.drawnPoints.push({
            x: this.lastRecordedX + (dx * i) / steps,
            y: this.lastRecordedY + (dy * i) / steps
          });
        }
        this.lastRecordedX = currentX;
        this.lastRecordedY = currentY;
      }

      if (this.traceTimeout) clearTimeout(this.traceTimeout);
    };

    const stop = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.ctx.beginPath();

      if (this.hasStartedTracing) {
        this.traceTimeout = setTimeout(() => {
          if (this.evaluateTrace()) {
            if (this.onSuccess) this.onSuccess();
          } else {
            console.log("Trace failed. Retrying...");
            if (this.onFail) this.onFail();
            this.reset();
          }
        }, 2500); // 2.5 seconds timeout as requested
      }
    };

    // Mouse listeners
    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('mousemove', move);
    this.canvas.addEventListener('mouseup', stop);
    this.canvas.addEventListener('mouseout', stop);

    // Touch listeners
    this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); start(e); }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); move(e); }, { passive: false });
    this.canvas.addEventListener('touchend', stop);
  }
}
