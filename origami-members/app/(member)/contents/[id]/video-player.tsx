"use client";

import { useEffect, useState, useTransition } from "react";
import { recordViewAction, recordDownloadAction } from "./track-actions";

const VIEW_THRESHOLD_MS = 180_000; // 3分

export function VideoPlayer({
  videoId,
  embedUrl,
  learningMaterialUrl,
  practiceCheckUrl,
}: {
  videoId: string;
  embedUrl: string;
  learningMaterialUrl: string | null;
  practiceCheckUrl: string | null;
}) {
  const [recorded, setRecorded] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (recorded) return;
    const timer = setTimeout(() => {
      startTransition(() => {
        recordViewAction(videoId).then(() => setRecorded(true));
      });
    }, VIEW_THRESHOLD_MS);
    return () => clearTimeout(timer);
  }, [videoId, recorded]);

  const handleDownload = (
    materialType: "learning_materials" | "practice_checks"
  ) => {
    startTransition(() => {
      recordDownloadAction(videoId, materialType);
    });
  };

  return (
    <>
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
        <iframe
          src={embedUrl}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {(learningMaterialUrl || practiceCheckUrl) && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {learningMaterialUrl && (
            <a
              href={learningMaterialUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleDownload("learning_materials")}
              className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 text-sm font-bold transition hover:border-primary hover:bg-primary-light/30"
            >
              <span>📥</span>
              <span>講義スライド (PDF) を開く</span>
            </a>
          )}
          {practiceCheckUrl && (
            <a
              href={practiceCheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleDownload("practice_checks")}
              className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 text-sm font-bold transition hover:border-primary hover:bg-primary-light/30"
            >
              <span>📝</span>
              <span>実践チェックシート を開く</span>
            </a>
          )}
        </div>
      )}
    </>
  );
}
