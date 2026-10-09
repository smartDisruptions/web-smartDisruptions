import { Fragment, type ReactNode } from 'react';
import { buildRoom, type BuildRoom } from '@/components/build/rooms';
import { Seal } from '@/components/brand/Kanji';
import { Button } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import WebStage from './WebStage';
import AppStage from './AppStage';
import GameStage from './GameStage';
import './build.css';

/**
 * The three Build rooms on /learn, one section each, after the cards that say
 * what the list sends (they were on the home page, after the doors, until
 * October 2026). A trio: the same bones (kicker, headline, a line or two, a
 * stage, a way in) and three personalities — a shoji browser, a lacquered
 * phone, a pixel rooftop. On a desktop the stage alternates sides: right,
 * left, right. The class prefix is still hb- from those days.
 *
 * Each stage previews the interactive header waiting on its page, played by
 * the scroll instead of the reader's hands: zero JavaScript. Everything moves
 * on one view timeline per stage (`--hb-web`, `--hb-app`, `--hb-game`), by
 * transform and opacity only, so the compositor draws it and nothing moves
 * while the stage is off screen. Without scroll timelines, or under reduced
 * motion, each stage is a finished still. Stages are decoration (aria-hidden):
 * the words around them say everything the picture does.
 */
type Section = {
  room: BuildRoom;
  headline: string;
  /** What the page opens on — said plainly, after the room's own line. */
  more: string;
  stage: ReactNode;
  /** Its height on a phone, measured: the space held before it renders. */
  height: number;
  /** Render with the page rather than on approach (no content-visibility).
      The pixel rooftop's first paint, released mid-scroll, cost one ~50ms
      frame at 4x CPU every time; done at load it costs nothing you can
      measure (October 2026). */
  eager?: boolean;
};

const SECTIONS: Section[] = [
  {
    room: buildRoom('websites'),
    headline: 'Sketch it. Ship it.',
    more: 'The page opens on a tiny site you can squeeze from desktop to phone.',
    stage: <WebStage />,
    height: 700,
  },
  {
    room: buildRoom('apps'),
    headline: 'Take an app apart.',
    more: 'The page opens on a phone that comes apart into what you see, what it decides, what it remembers and what it runs on.',
    stage: <AppStage />,
    height: 820,
  },
  {
    room: buildRoom('games'),
    headline: 'Build a level. Kiru runs it.',
    more: 'The page opens on a level editor: raise the roofs, hang the lanterns, and Kiru runs whatever you make.',
    stage: <GameStage />,
    height: 735,
    eager: true,
  },
];

export default function BuildSections() {
  return (
    <>
      {SECTIONS.map((s, i) => (
        <BuildSection key={s.room.key} {...s} flip={i % 2 === 1} />
      ))}
    </>
  );
}

function BuildSection({
  room,
  headline,
  more,
  stage,
  height,
  eager,
  flip,
}: Section & { flip: boolean }) {
  const id = `hb-${room.key}-h`;
  return (
    <section
      aria-labelledby={id}
      className={`hb-sec hb-${room.key}${eager ? '' : ' sd-defer'}`}
      style={eager ? undefined : { containIntrinsicSize: `auto ${height}px` }}
    >
      <div className={`hb-grid${flip ? ' hb-flip' : ''}`}>
        <div className="hb-copy sd-reveal">
          <p className="sd-kicker">{room.title}</p>
          <h2 id={id} className="font-display sd-brush-under hb-h">
            {/* One unbreakable run per sentence, so a narrow column breaks
                "Sketch it. / Ship it.", never "Sketch / it. Ship it." */}
            {headline.split(/(?<=\.)\s+/).map((s, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                <span className="hb-h-s">{s}</span>
              </Fragment>
            ))}
          </h2>
          <p className="font-read hb-lede">
            {room.line} {more}
          </p>
        </div>
        <div className="hb-stage" aria-hidden>
          {stage}
          <Seal char={room.kanji} className="hb-seal" />
        </div>
        <div className="hb-cta sd-reveal">
          <Button href={room.href}>
            Open {room.title}
            <IconArrowRight size={18} />
          </Button>
        </div>
      </div>
    </section>
  );
}
