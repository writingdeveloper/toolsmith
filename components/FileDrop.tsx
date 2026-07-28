"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HANDOFF_PARAM, acceptsFile, claimHandoff } from "@/lib/handoff";

interface FileDropProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label: string;
  hint: string;
  /** 파일 선택 버튼 문구 */
  cta: string;
  disabled?: boolean;
}

export function FileDrop({
  accept,
  multiple = true,
  onFiles,
  label,
  hint,
  cta,
  disabled,
}: FileDropProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const emit = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  /*
   * 다른 도구가 넘긴 결과를 집어 든다.
   *
   * **받는 쪽이 여기 하나뿐인 것이 이 설계의 전부다.** 스물한 개 도구가 전부
   * `<FileDrop onFiles={…}>` 로 파일을 받으므로, 여기서 한 번 집으면 전부가 이어진다.
   * 도구마다 붙였으면 스물한 곳에 같은 판단이 흩어졌을 것이다.
   *
   * 지키는 것 셋:
   * - **`?from=` 이 없으면 열어 보지도 않는다.** 그냥 도구를 연 사람에게 예전 파일이
   *   되살아나면 안 된다.
   * - **`accept` 에 안 걸리면 안 받는다.** 보내는 쪽이 이미 거르지만, 주소창에
   *   `?from=` 을 손으로 붙여 오는 길이 있다.
   * - **`disabled` 면 안 받는다.** 이 브라우저가 못 하는 도구다(요약의 WebGPU).
   */
  useEffect(() => {
    if (disabled) return;
    if (!new URLSearchParams(window.location.search).has(HANDOFF_PARAM)) return;

    void claimHandoff()
      .then((entry) => {
        if (!entry) return;
        const files = entry.files
          .map((item) => new File([item.blob], item.name, { type: item.type }))
          .filter((file) => acceptsFile(accept, file));
        // 여러 장을 넘겼는데 이 도구가 한 장만 받는다면 첫 장만 준다 — 도구 쪽 규칙이
        // 이미 그것을 안다(`multiple` 이 false 면 나머지는 어차피 버려진다).
        if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1));
      })
      // IndexedDB 가 막힌 브라우저(시크릿 모드의 일부 설정)에서도 도구 자체는 멀쩡히
      // 돌아야 한다 — 넘겨받기만 안 되는 것이다.
      .catch(() => {});
    // 한 번만 집는다. `onFiles` 는 도구마다 의존성이 달라 다시 돌면 같은 파일이 두 번 들어간다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) emit(event.dataTransfer.files);
      }}
      className={`rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
        dragging ? "border-accent bg-panel" : "border-border"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          emit(event.target.files);
          // 같은 파일을 다시 선택해도 change 가 발생하도록 비운다
          event.target.value = "";
        }}
      />
      <p className="text-lg font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <label
        htmlFor={inputId}
        className="mt-5 inline-block cursor-pointer rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg"
      >
        {cta}
      </label>
    </div>
  );
}
