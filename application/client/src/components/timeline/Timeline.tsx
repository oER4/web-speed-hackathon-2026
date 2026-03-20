import { memo } from "react";

import { TimelineItem } from "@web-speed-hackathon-2026/client/src/components/timeline/TimelineItem";

interface Props {
  timeline: Models.Post[];
}

export const Timeline = memo(({ timeline }: Props) => {
  return (
    <section>
      {timeline.map((post, idx) => (
        // 先頭投稿は LCP 候補: eager ロード・fetchpriority=high
        <TimelineItem key={post.id} post={post} priority={idx === 0} />
      ))}
    </section>
  );
});
