import { Lesson, LessonChapter } from "./types";

/**
 * Découpe une leçon en chapitres.
 *
 * Chaque bloc `heading` ouvre un nouveau chapitre et lui donne son titre. Les
 * blocs situés avant le premier titre forment un chapitre d'introduction, qui
 * reprend le titre de la leçon.
 *
 * Une leçon sans aucun `heading` produit donc un chapitre unique.
 */
export function toChapters(lesson: Lesson): LessonChapter[] {
  const chapters: LessonChapter[] = [];
  let current: LessonChapter | null = null;

  for (const block of lesson.blocks) {
    if (block.type === "heading") {
      current = { title: block.text, blocks: [] };
      chapters.push(current);
      continue;
    }
    if (current === null) {
      current = { title: lesson.title, blocks: [] };
      chapters.push(current);
    }
    current.blocks.push(block);
  }

  // Un `heading` en dernière position produirait un chapitre vide.
  return chapters.filter((c) => c.blocks.length > 0);
}
