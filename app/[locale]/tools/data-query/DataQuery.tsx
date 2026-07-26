"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileDrop } from "@/components/FileDrop";
import { trackToolCompleted } from "@/lib/analytics";
import {
  ENGINE_BYTES,
  MAX_DISPLAY_ROWS,
  openData,
  toCsv,
  type QueryResult,
  type Session,
  type TableInfo,
} from "@/lib/data/query-core";
import { fileStem, formatBytes } from "@/lib/format";
import { fill } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type Ui = Dictionary["tools"]["data-query"]["ui"];
type Common = Dictionary["common"];

const DEFAULT_SQL = "SELECT * FROM data LIMIT 50";

export function DataQuery({ ui, common }: { ui: Ui; common: Common }) {
  const [file, setFile] = useState<File | null>(null);
  const [info, setInfo] = useState<TableInfo | null>(null);
  const [sql, setSql] = useState(DEFAULT_SQL);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);
  const [running, setRunning] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    return () => {
      sessionRef.current?.close().catch(() => {});
      sessionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!downloadUrl) return;
    return () => URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const accept = useCallback((files: File[]) => {
    const next = files[0];
    if (!next) return;
    // 엔진은 아직 받지 않는다 — 규칙 2. 여는 것은 버튼을 누른 뒤다.
    setFile(next);
    setInfo(null);
    setResult(null);
    setFailure(null);
    setSqlError(null);
    setSql(DEFAULT_SQL);
    sessionRef.current?.close().catch(() => {});
    sessionRef.current = null;
  }, []);

  const runQuery = useCallback(
    async (session: Session, statement: string) => {
      setSqlError(null);
      setRunning(true);
      try {
        const next = await session.run(statement);
        setResult(next);
        setDownloadUrl(URL.createObjectURL(new Blob([toCsv(next)], { type: "text/csv" })));
        return true;
      } catch (error) {
        // DuckDB 가 준 문장을 그대로 보여 준다 — 우리가 요약하면 어디가 틀렸는지 못 찾는다
        setSqlError(error instanceof Error && "detail" in error ? String(error.detail) : String(error));
        return false;
      } finally {
        setRunning(false);
      }
    },
    [],
  );

  const open = useCallback(async () => {
    if (!file) return;
    setOpening(true);
    setFailure(null);
    try {
      const session = await openData(file);
      sessionRef.current = session;
      setInfo(session.info);
      const ok = await runQuery(session, DEFAULT_SQL);
      if (ok) trackToolCompleted("data-query");
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNKNOWN";
      const detail = error instanceof Error && "detail" in error ? String(error.detail ?? "") : "";
      setFailure(
        code === "UNSUPPORTED_FORMAT"
          ? ui.errFormat
          : code === "READ_FAILED"
            ? `${ui.errRead}${detail ? ` — ${detail}` : ""}`
            : ui.errEngine,
      );
    } finally {
      setOpening(false);
    }
  }, [file, runQuery, ui]);

  const rerun = useCallback(() => {
    const session = sessionRef.current;
    if (session) void runQuery(session, sql);
  }, [runQuery, sql]);

  const busy = opening || running;

  return (
    <div className="space-y-6">
      <FileDrop
        accept=".csv,.tsv,.txt,.parquet,.json,.jsonl,.ndjson"
        multiple={false}
        onFiles={accept}
        label={ui.dropLabel}
        hint={ui.dropHint}
        cta={common.chooseFile}
        disabled={busy}
      />

      {file && (
        <div className="rounded-xl border border-border bg-panel p-5">
          <p className="truncate font-medium">{file.name}</p>
          <p className="mt-1 text-sm text-muted">
            {formatBytes(file.size)}
            {info && ` · ${fill(ui.rowCount, { rows: info.rows.toLocaleString() })} · ${fill(ui.columnCount, { columns: info.columns.length })}`}
          </p>
        </div>
      )}

      {file && !info && (
        <div className="space-y-4 rounded-xl border border-border bg-panel p-5">
          {/* OCR 과 같은 약속 — 몇 MB 를 받는지 누르기 전에 말한다 */}
          <p className="text-sm text-warn">
            {fill(ui.downloadNote, { size: formatBytes(ENGINE_BYTES) })}
          </p>
          <p className="text-sm text-muted">{ui.localNote}</p>
          <button
            type="button"
            onClick={open}
            disabled={busy}
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
          >
            {opening ? ui.opening : ui.open}
          </button>
        </div>
      )}

      {failure && (
        <p className="rounded-xl border border-border bg-panel p-4 text-sm text-err">{failure}</p>
      )}

      {info && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <p className="text-sm text-muted">{ui.schemaLabel}</p>
          <ul className="flex flex-wrap gap-2">
            {info.columns.map((column) => (
              <li
                key={column.name}
                className="rounded-lg border border-border px-3 py-1 text-sm tabular-nums"
              >
                <span className="font-medium">{column.name}</span>{" "}
                <span className="text-muted">{column.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <label className="block space-y-1.5">
            <span className="block text-sm text-muted">{ui.sqlLabel}</span>
            <textarea
              value={sql}
              onChange={(event) => setSql(event.target.value)}
              spellCheck={false}
              rows={4}
              className="w-full resize-y rounded-lg border border-border bg-bg p-3 font-mono text-sm"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={rerun}
              disabled={busy}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              {running ? ui.running : ui.run}
            </button>
            <span className="text-sm text-muted">{ui.sqlHint}</span>
          </div>
          {sqlError && (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-sm text-err">
              {sqlError}
            </pre>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-xl border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="min-w-0 flex-1 text-sm text-muted tabular-nums">
              {fill(ui.resultSummary, {
                rows: result.total.toLocaleString(),
                ms: Math.round(result.elapsedMs),
              })}
              {result.truncated && ` · ${fill(ui.showingFirst, { n: MAX_DISPLAY_ROWS })}`}
            </p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`${fileStem(file?.name ?? "result")}-query.csv`}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
              >
                {ui.downloadCsv}
              </a>
            )}
          </div>

          {/* 넓은 표는 자기 안에서만 가로로 흐른다 — 페이지가 흔들리면 안 된다 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {result.columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="border-b border-border px-3 py-2 text-left font-medium whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, index) => (
                  <tr key={index}>
                    {row.map((value, column) => (
                      <td
                        key={column}
                        className="border-b border-border px-3 py-1.5 tabular-nums whitespace-nowrap"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length === 0 && <p className="text-sm text-muted">{ui.noRows}</p>}
        </div>
      )}
    </div>
  );
}
