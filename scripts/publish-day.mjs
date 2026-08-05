/**
 * What day is it, for publishing purposes?
 *
 * Every article carries a `publishDate` as a bare calendar date with no zone,
 * and two different things need to agree on what "today" means: the scheduler
 * that stamps the date, and the test that checks it. If they disagree the
 * check produces phantom failures, and worse, an article can publish dated
 * tomorrow.
 *
 * `new Date().toISOString()` is the obvious answer and it is wrong. It is UTC,
 * so from 5pm Pacific onward it returns the NEXT day — an evening publish gets
 * dated tomorrow, and a test run after dinner flags every correctly-dated
 * draft as stale. That is not hypothetical: it fired the first time this check
 * ran, at 17:43 PDT.
 *
 * So the whole system anchors to Pacific, which is where the publishing
 * routine runs (~6am PT) and where the person pressing publish lives. `en-CA`
 * is the locale trick for a YYYY-MM-DD format string out of Intl.
 */
export const PUBLISH_TZ = 'America/Los_Angeles';

/** Today's calendar date in the publishing timezone, as YYYY-MM-DD. */
export function publishDay(at = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: PUBLISH_TZ }).format(at);
}
