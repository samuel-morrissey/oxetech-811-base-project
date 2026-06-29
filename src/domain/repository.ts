export interface Repository<TEntity, TId = string> {
  findAll(): TEntity[];
  findById(id: TId): TEntity | undefined;
  create?(entity: TEntity): TEntity;
  save?(entity: TEntity): TEntity;
}
