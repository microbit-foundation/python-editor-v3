export class BoardId {
  private static v1Normalized = new BoardId(0x9900);
  private static v2Normalized = new BoardId(0x9903);

  constructor(public id: number) {
    if (!this.isV1() && !this.isV2()) {
      throw new Error(`Could not recognise the Board ID ${id.toString(16)}`);
    }
  }
  isV1(): boolean {
    return this.id === 0x9900 || this.id === 0x9901;
  }
  isV2(): boolean {
    return this.id === 0x9903 || this.id === 0x9904;
  }
  normalize() {
    return this.isV1() ? BoardId.v1Normalized : BoardId.v2Normalized;
  }
  toString() {
    return this.id.toString(16);
  }
  static parse(value: string): BoardId {
    return new BoardId(parseInt(value, 16));
  }
}
