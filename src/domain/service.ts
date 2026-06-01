export interface Service {
  list?(...args: object[]): object;
  findById?(id: string): object;
  create?(input: object): object;
  update?(input: object): object;
  summary?(): object;
}
