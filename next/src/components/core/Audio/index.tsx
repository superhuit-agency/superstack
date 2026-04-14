import block from "./block.json";

import "./styles.css";

export default function Audio({
  src,
  autoplay = false,
  loop = false,
  preload,
}: AudioProps) {
  return (
    <figure className="supt-audio">
      <audio
        src={src}
        controls
        autoPlay={autoplay}
        loop={loop}
        preload={preload ? preload : undefined}
      />
    </figure>
  );
}

Audio.slug = block.slug;
Audio.title = block.title;
