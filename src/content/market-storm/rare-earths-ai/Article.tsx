import Hero from './sections/Hero';
import S01Basics from './sections/S01Basics';
import S02AiSpeed from './sections/S02AiSpeed';
import S03Tech from './sections/S03Tech';
import S04China from './sections/S04China';
import S05Companies from './sections/S05Companies';
import S06AiUse from './sections/S06AiUse';
import S07Bear from './sections/S07Bear';
import S08Dots from './sections/S08Dots';
import S09Missed from './sections/S09Missed';
import S10Ranking from './sections/S10Ranking';
import S11Watch from './sections/S11Watch';
import S12Think from './sections/S12Think';
import End from './sections/End';
import Near from './islands/near';
import KiruHold from './islands/kiru-hold';
import './re.css';

/**
 * Rare earths in the age of AI — a Market Storm article on its own page.
 *
 * Every word and number lives in ./content.ts; each chapter is its own
 * component in ./sections with its own stylesheet; the shared building
 * blocks are in ./ui.tsx. Interactive pieces are small client islands that
 * start after first paint and stop when they leave the screen.
 */
export default function Article() {
  return (
    <div className="re" aria-labelledby="re-title">
      <Near />
      <KiruHold />
      <Hero />
      <div className="re-wrap re-main">
        <S01Basics />
        <S02AiSpeed />
        <S03Tech />
        <S04China />
        <S05Companies />
        <S06AiUse />
        <S07Bear />
        <S08Dots />
        <S09Missed />
        <S10Ranking />
        <S11Watch />
        <S12Think />
        <End />
      </div>
    </div>
  );
}
