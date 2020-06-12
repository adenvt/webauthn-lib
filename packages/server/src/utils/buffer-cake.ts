export default class BufferCake {
  protected buffer: Buffer

  constructor (buffer: Buffer) {
    this.buffer = buffer.slice()
  }

  /**
   * get buffer without mutate internal buffer
   */
  get (): Buffer {
    return this.buffer
  }

  /**
   * Take & cut buffer by length, it mutate internal buffer (splice)
   * @param length how many buffer want to take
   */
  take (length: number): Buffer {
    const result = this.buffer.slice(0, length)

    if (length)
      this.buffer = this.buffer.slice(length)

    return result
  }

  /**
   * Show buffer size left
   */
  left (): number {
    return this.buffer.byteLength
  }
}
