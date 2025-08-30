export abstract class BaseRepository {
  constructor(protected tableName: string) {}

  protected handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('An unknown error occurred')
  }
}
