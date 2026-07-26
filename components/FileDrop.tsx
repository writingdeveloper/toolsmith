"use client";

import { useCallback, useId, useRef, useState } from "react";

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
