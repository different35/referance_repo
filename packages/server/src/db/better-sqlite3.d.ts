declare module 'better-sqlite3' {
  class Database {
    constructor(filename: string, options?: any);
    exec(sql: string): this;
    prepare(sql: string): Statement;
    transaction(fn: () => any): () => any;
    close(): void;
  }

  interface Statement {
    run(...params: any[]): RunResult;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  interface RunResult {
    changes: number;
    lastInsertRowid: number;
  }

  export default Database;
}
