declare module "canvas-confetti" {
  type ConfettiOptions = Record<string, unknown>;
  interface ConfettiInstance {
    (options?: ConfettiOptions): Promise<null> | null;
    reset(): void;
  }
  function confetti(options?: ConfettiOptions): Promise<null> | null;
  namespace confetti {
    function create(
      canvas: HTMLCanvasElement,
      options?: { resize?: boolean; useWorker?: boolean }
    ): ConfettiInstance;
  }
  export default confetti;
}
