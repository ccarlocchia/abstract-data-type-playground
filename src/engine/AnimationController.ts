import type { AnimationStep } from '../core/types';

export interface PlaybackState {
  index: number;
  total: number;
  playing: boolean;
}

export class AnimationController {
  private steps: AnimationStep[] = [];
  private currentStepIndex = 0;
  private playing = false;
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly onStateChange: (step: AnimationStep | null, state: PlaybackState) => void
  ) {}

  get state(): PlaybackState {
    return {
      index: this.currentStepIndex,
      total: this.steps.length,
      playing: this.playing
    };
  }

  loadSteps(steps: readonly AnimationStep[]): void {
    this.pause();
    this.steps = [...steps];
    this.currentStepIndex = 0;
    this.notify();
  }

  stepForward(): void {
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.pause();
      return;
    }
    this.currentStepIndex += 1;
    this.notify();
  }

  stepBackward(): void {
    if (this.currentStepIndex <= 0) return;
    this.pause();
    this.currentStepIndex -= 1;
    this.notify();
  }

  seek(index: number): void {
    if (this.steps.length === 0) return;
    this.pause();
    this.currentStepIndex = Math.max(0, Math.min(Math.trunc(index), this.steps.length - 1));
    this.notify();
  }

  play(speedMs = 600): void {
    if (this.playing || this.steps.length === 0 || this.currentStepIndex >= this.steps.length - 1) {
      return;
    }
    this.playing = true;
    this.notify();
    this.timerId = setInterval(() => {
      this.stepForward();
      if (this.currentStepIndex >= this.steps.length - 1) this.pause();
    }, speedMs);
  }

  pause(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (!this.playing) return;
    this.playing = false;
    this.notify();
  }

  private notify(): void {
    this.onStateChange(this.steps[this.currentStepIndex] ?? null, this.state);
  }
}
