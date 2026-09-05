/**
 * Scroll geometry for the story: the hero and the feature tour, which share
 * one phone.
 *
 * The two chapters are separate pinned panels, so the phone cannot live in
 * either of them: it sits in a layer that is sticky across both (see
 * `Story`). That layer reads its position off the two chapters' scroll
 * progress, so the chapter heights are fixed here, in one place, rather than
 * in the stylesheet and the components separately.
 */

/**
 * Hero height, and the length of the phone's move. The first screen is
 * pinned: the copy leaves and the phone sets off. The second is the release,
 * during which the phone lands in the middle and the tour arrives under it.
 * Mirrored by `.hero-chapter` in `globals.css`.
 */
export const HERO_SVH = 200;

/**
 * How far you scroll to move the tour on by one step, and the run-out at the
 * end that lets the last step hold before the privacy chapter takes over.
 *
 * A step is deliberately longer than a screen. The sequence is four screens of
 * reading compressed into one pinned panel, and matching it one to one made
 * the whole chapter go by in a flick.
 */
export const STEP_SVH = 150;
export const RUN_OUT_SVH = 60;
export const STEP_COUNT = 4;
export const TRACK_SVH = STEP_COUNT * STEP_SVH + RUN_OUT_SVH;

/** The slice of the tour's scroll that the four steps actually occupy. */
export const JOURNEY_ENTER = 0.06;
export const JOURNEY_FINISH = 0.88;

/**
 * Where each step is settled, as a fraction of the panel's scroll travel.
 *
 * `stagePresence` gives step k the slice of progress from k/n to (k+1)/n, so
 * the middle of that slice is where its copy is fully opaque and nothing is
 * handing over. That is the position both the snap points and the step buttons
 * aim at, so clicking a step and scrolling to it come to rest in one place.
 */
export const settledAt = (index: number) =>
  JOURNEY_ENTER +
  ((index + 0.5) / STEP_COUNT) * (JOURNEY_FINISH - JOURNEY_ENTER);
