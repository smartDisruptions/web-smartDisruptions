import ArmoryWall from '@/components/built/ArmoryWall';
import { WORK_IDS, wall } from '@/components/about/work/data';

/** STUB — everything on one wall. Replaced by the wall builder. */
export default function WorkWall() {
  return (
    <section
      id={WORK_IDS.wall}
      aria-labelledby="wk-wall-h"
      className="scroll-mt-16 overflow-x-clip pt-24 pb-10"
    >
      <div className="mx-auto max-w-6xl px-5 text-center sm:px-6">
        <p className="sd-kicker">All of it at once</p>
        <h2
          id="wk-wall-h"
          className="font-display sd-brush-under mt-3 text-4xl sm:text-5xl"
        >
          Everything on one wall
        </h2>
        <div className="mt-6">
          <ArmoryWall items={wall} label="Everything I built, on one ring" />
        </div>
      </div>
    </section>
  );
}
