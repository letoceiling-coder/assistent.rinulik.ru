/**
 * Russian typography for STATIC marketing copy: binds short prepositions, conjunctions and particles to the
 * next word with a non-breaking space, so «в», «на», «с», «и»… never hang at the end of a line.
 * Never apply to user input or AI responses.
 */
const SHORT_WORDS = 'в|во|на|с|со|к|ко|у|о|об|и|а|но|за|по|из|от|до|для|не|ни|без|под|над|при|про|или|что|как|же|ли|бы|то|это|мы|вы|он|она|их|ваш|вам';
const BIND = new RegExp(`(^|[\\s(«„"—–-])(${SHORT_WORDS})\\s+`, 'giu');
const NBSP = ' ';

export function typo(text: string): string {
  // Two passes handle chains like «и в сайт».
  return text.replace(BIND, `$1$2${NBSP}`).replace(BIND, `$1$2${NBSP}`)
    // Keep a dash with the word before it: «ответ — сразу».
    .replace(/\s+([—–])\s/g, `${NBSP}$1 `)
    // Keep numbers with their units: «2 490 ₽», «7 дней».
    .replace(/(\d)\s(?=[\d₽%]|дн|мес|сообщ|диалог)/g, `$1${NBSP}`);
}
