"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChainCopy } from "@/lib/chain";
import { HANDOFF_PARAM, mimeForName, putHandoff } from "@/lib/handoff";
import { chainTargets, type ToolSlug } from "@/lib/tools";

/**
 * "이 결과를 다음 도구로".
 *
 * **왜 링크가 아닌가.** 옆의 `RelatedTools` 는 링크다 — 크롤러가 읽어야 하니까.
 * 이것은 다르다. **만든 파일을 들고 간다.** 눌러 보면 대상 도구에 파일이 이미 올라가
 * 있고, 내려받기·다시 고르기 두 걸음이 사라진다.
 *
 * 파일은 IndexedDB 를 거쳐 넘어간다 — 브라우저 밖으로 나가지 않는다(`lib/handoff.ts`).
 *
 * **못 받는 곳은 아예 안 보여 준다.** 영상 변환이 WebM 을 만들었으면 MP4 만 받는
 * 자르기·압축 버튼이 사라진다. 눌러 보고 나서 "이 파일은 안 됩니다" 를 만나는 것은
 * 규칙 3 위반이다.
 */
export interface SendableFile {
  /** 결과의 object URL. 도구마다 이미 갖고 있는 것을 그대로 쓴다 — 상태 모양을 안 건드린다. */
  url: string;
  name: string;
  /** 아는 도구만 준다. 안 주면 이름의 확장자로 정한다. */
  type?: string;
  /**
   * 화소 수. 그림을 다루는 도구만 준다 — 형식이 맞아도 **크기 때문에** 못 받는
   * 곳이 있다(업스케일 1메가픽셀). 안 주면 크기로는 안 거른다.
   */
  pixels?: number;
}

export function SendTo({
  chain,
  from,
  files,
}: {
  chain: ChainCopy;
  from: ToolSlug;
  files: SendableFile[];
}) {
  const router = useRouter();
  const [sending, setSending] = useState<ToolSlug | null>(null);

  const typed = files.map((file) => ({ ...file, type: file.type || mimeForName(file.name) }));
  // 갈 곳은 **첫 장**으로 정한다. 한 번에 처리한 것들은 형식이 같다 — 출력 형식은
  // 파일마다가 아니라 도구 전체에 한 번 고른다.
  const targets = typed.length > 0 ? chainTargets(from, typed[0]) : [];
  if (targets.length === 0) return null;

  async function send(target: ToolSlug) {
    setSending(target);
    try {
      // object URL 을 되읽어 Blob 을 얻는다. 도구마다 결과 Blob 을 들고 있는 자리가
      // 다른데, URL 은 **전부가 이미 갖고 있다**(내려받기 링크에 쓰므로).
      const loaded = await Promise.all(
        typed.map(async (file) => {
          const blob = await (await fetch(file.url)).blob();
          return { blob, name: file.name, type: file.type || blob.type };
        }),
      );
      await putHandoff({ files: loaded, from });
      router.push(`/${chain.locale}/tools/${target}?${HANDOFF_PARAM}=${from}`);
    } catch {
      // 넘기지 못했으면 그냥 대상 도구로 보낸다 — 파일은 손에 있으니 직접 고르면 된다.
      router.push(`/${chain.locale}/tools/${target}`);
    }
  }

  return (
    <div className="space-y-2 border-t border-border pt-4" data-send-to>
      <p className="text-sm text-muted">{chain.heading}</p>
      <div className="flex flex-wrap gap-2">
        {targets.map((target) => (
          <button
            key={target}
            type="button"
            disabled={sending !== null}
            onClick={() => void send(target)}
            data-send-to-target={target}
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent disabled:opacity-50"
          >
            {chain.names[target]} →
          </button>
        ))}
      </div>
    </div>
  );
}
