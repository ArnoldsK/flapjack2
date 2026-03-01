declare module "gif-encoder-2" {
  interface ByteArray {
    getData(): Buffer;
  }

  interface GIFEncoderInstance {
    start(): void;
    setRepeat(n: number): void;
    setDelay(ms: number): void;
    setQuality(n: number): void;
    setTransparent(hex: number): void;
    addFrame(ctx: {
      getImageData(
        x: number,
        y: number,
        w: number,
        h: number,
      ): { data: Uint8ClampedArray };
    }): void;
    finish(): void;
    out: ByteArray;
  }

  interface GIFEncoderConstructor {
    new (
      width: number,
      height: number,
      algorithm?: string,
      useOptimizer?: boolean,
      totalFrames?: number,
    ): GIFEncoderInstance;
  }

  const GIFEncoder: GIFEncoderConstructor;
  export default GIFEncoder;
}
