/**
 * CSV·Parquet 을 SQL 로 조회한다. DuckDB-wasm(MIT).
 *
 * **파일을 읽어 올리지 않는다.** `registerFileHandle` 로 File 핸들만 넘기면 DuckDB 가
 * 필요한 조각만 읽어 간다 — 수백 MB Parquet 도 통째로 메모리에 올리지 않는다.
 *
 * 지켜야 할 것:
 *
 * 1. **`coi` 번들을 쓰지 않는다**(규칙 4). 그쪽이 빠르지만 SharedArrayBuffer 가 필요해
 *    COOP/COEP 를 켜야 하고, 그러면 교차 출처가 전부 막힌다. `eh` 만 후보에 올린다.
 * 2. **wasm 은 jsDelivr 에서 온다**(규칙 5). 비압축 35.6MB, 브로틀리 전송 6.2MB 다.
 *    Vercel 에서 서빙하면 방문 1만 회에 62GB 다.
 * 3. **버튼을 누르기 전에는 받지 않는다**(규칙 2). 동적 import 로 미룬다.
 *
 * window / document 를 참조하지 않는다.
 */

export type DataFormat = "csv" | "parquet" | "json";

/** 브로틀리 전송 실측(2026-07-26): wasm 6,205,060 + 워커 185,783. */
export const ENGINE_BYTES = 6_390_843;

/** 화면에 그리는 최대 행. 질의 자체는 제한하지 않는다 — 세는 것과 보는 것은 다르다. */
export const MAX_DISPLAY_ROWS = 200;

export interface Column {
  name: string;
  type: string;
}

export interface TableInfo {
  format: DataFormat;
  rows: number;
  columns: Column[];
}

export interface QueryResult {
  columns: string[];
  rows: string[][];
  /** 실제 결과 행 수. rows 는 MAX_DISPLAY_ROWS 에서 잘려 있을 수 있다. */
  total: number;
  truncated: boolean;
  elapsedMs: number;
}

export class DataError extends Error {
  constructor(
    message: "ENGINE_FAILED" | "UNSUPPORTED_FORMAT" | "READ_FAILED",
    readonly detail?: string,
  ) {
    super(message);
    this.name = "DataError";
  }
}

/** SQL 이 틀렸을 때는 DuckDB 가 준 문장을 그대로 보여 준다 — 우리가 요약하면 못 고친다. */
export class SqlError extends Error {
  constructor(readonly detail: string) {
    super("SQL_ERROR");
    this.name = "SqlError";
  }
}

const VERSION = "1.29.0";
const CDN = `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@${VERSION}/dist`;

export function formatOf(name: string): DataFormat | null {
  if (/\.csv$/i.test(name) || /\.tsv$/i.test(name) || /\.txt$/i.test(name)) return "csv";
  if (/\.parquet$/i.test(name)) return "parquet";
  if (/\.jsonl?$/i.test(name) || /\.ndjson$/i.test(name)) return "json";
  return null;
}

/** DuckDB 가 이 파일을 여는 함수. 형식마다 다르다. */
function readerFor(format: DataFormat, path: string): string {
  if (format === "parquet") return `read_parquet('${path}')`;
  if (format === "json") return `read_json_auto('${path}')`;
  return `read_csv_auto('${path}', SAMPLE_SIZE=-1)`;
}

/* duckdb-wasm 의 타입을 우리가 쓰는 만큼만 좁혀 적는다. */
interface Conn {
  query(sql: string): Promise<ArrowTable>;
  close(): Promise<void>;
}
interface ArrowTable {
  numRows: number;
  schema: { fields: { name: string; type: { toString(): string } }[] };
  toArray(): Record<string, unknown>[];
}
interface Db {
  instantiate(module: string, pthread?: string | null): Promise<void>;
  registerFileHandle(name: string, handle: File, protocol: number, direct: boolean): Promise<void>;
  connect(): Promise<Conn>;
  terminate(): Promise<void>;
}

/** 열린 데이터 한 벌. 질의를 여러 번 던지는 동안 살아 있어야 한다. */
export interface Session {
  info: TableInfo;
  run(sql: string): Promise<QueryResult>;
  close(): Promise<void>;
}

/**
 * 어떤 값이든 화면에 그릴 수 있는 문자열로 만든다.
 *
 * Arrow 는 정수를 **BigInt** 로 준다. 그대로 JSON 이나 React 에 넘기면 던진다.
 * 날짜는 ms 숫자로 오기도 해서, 우리가 결정해 주지 않으면 열마다 다르게 보인다.
 */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace("T", " ");
  if (typeof value === "object") return JSON.stringify(value, (_, v) =>
    typeof v === "bigint" ? v.toString() : v,
  );
  return String(value);
}

export async function openData(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<Session> {
  const format = formatOf(file.name);
  if (!format) throw new DataError("UNSUPPORTED_FORMAT");

  const duckdb = await import("@duckdb/duckdb-wasm");

  /*
   * `coi` 를 일부러 목록에서 뺐다. selectBundle 은 준 것 중에서만 고르므로,
   * 여기에 없으면 SharedArrayBuffer 경로로 갈 방법이 없다. 규칙 4 를 코드로 못 박는 자리다.
   */
  const bundle = await duckdb.selectBundle({
    mvp: {
      mainModule: `${CDN}/duckdb-mvp.wasm`,
      mainWorker: `${CDN}/duckdb-browser-mvp.worker.js`,
    },
    eh: {
      mainModule: `${CDN}/duckdb-eh.wasm`,
      mainWorker: `${CDN}/duckdb-browser-eh.worker.js`,
    },
  });

  let db: Db;
  let workerUrl = "";
  try {
    // 교차 출처 스크립트로는 Worker 를 만들 수 없다. importScripts 로 감싸면 된다.
    workerUrl = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], { type: "text/javascript" }),
    );
    const worker = new Worker(workerUrl);
    db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker) as unknown as Db;
    onProgress?.(0.1);
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
    onProgress?.(1);
  } catch {
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    throw new DataError("ENGINE_FAILED");
  }

  const path = `data.${format}`;
  const conn = await db.connect();

  try {
    await db.registerFileHandle(path, file, duckdb.DuckDBDataProtocol.BROWSER_FILEREADER, true);
    // 뷰로 걸어 둔다 — 사용자가 `SELECT * FROM data` 라고 쓸 수 있어야 한다.
    await conn.query(`CREATE OR REPLACE VIEW data AS SELECT * FROM ${readerFor(format, path)}`);
  } catch (error) {
    await conn.close();
    await db.terminate();
    URL.revokeObjectURL(workerUrl);
    throw new DataError("READ_FAILED", error instanceof Error ? error.message : undefined);
  }

  const described = await conn.query("DESCRIBE data");
  const counted = await conn.query("SELECT count(*) AS n FROM data");

  const info: TableInfo = {
    format,
    rows: Number(counted.toArray()[0]?.n ?? 0),
    columns: described.toArray().map((row) => ({
      name: String(row.column_name),
      type: String(row.column_type),
    })),
  };

  return {
    info,
    async run(sql: string): Promise<QueryResult> {
      const started = performance.now();
      let table: ArrowTable;
      try {
        table = await conn.query(sql);
      } catch (error) {
        throw new SqlError(error instanceof Error ? error.message : String(error));
      }
      const elapsedMs = performance.now() - started;

      const columns = table.schema.fields.map((field) => field.name);
      const all = table.toArray();
      const shown = all.slice(0, MAX_DISPLAY_ROWS);
      return {
        columns,
        rows: shown.map((row) => columns.map((name) => cell(row[name]))),
        total: all.length,
        truncated: all.length > shown.length,
        elapsedMs,
      };
    },
    async close() {
      await conn.close();
      await db.terminate();
      URL.revokeObjectURL(workerUrl);
    },
  };
}

/** 결과를 CSV 로 되돌린다. 값에 쉼표·따옴표·줄바꿈이 있으면 감싼다. */
export function toCsv(result: QueryResult): string {
  const escape = (value: string) =>
    /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  return [
    result.columns.map(escape).join(","),
    ...result.rows.map((row) => row.map(escape).join(",")),
  ].join("\n");
}
