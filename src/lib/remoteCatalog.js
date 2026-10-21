import { listWorks } from '../data/catalog'
import { supabase } from './supabase'

export function mediaUrl(media) {
  if (!media?.path) return null
  const { data } = supabase.storage.from(media.bucket || 'publicacao').getPublicUrl(media.path)
  return data?.publicUrl || null
}

function asItem(row) {
  const image = mediaUrl(row.image)
  return {
    id: row.id,
    name: row.name,
    word: row.word,
    type: row.type,
    rarity: row.rarity || 'comum',
    atmosphere: row.atmosphere || '',
    ...(row.frame ? { frame: row.frame } : {}),
    ...(image ? { image } : {}),
    passive: row.passive || '',
    stats: {
      energia: row.energia ?? 0,
      ataque: row.ataque ?? 0,
      defesa: row.defesa ?? 0,
      sorte: row.sorte ?? 0,
      azar: row.azar ?? 0,
    },
  }
}

export async function loadRemoteWorks() {
  const [worksRes, chaptersRes, itemsRes, linksRes, tracksRes] = await Promise.all([
    supabase.from('works').select('id, title, line, cover:media!works_cover_id_fkey(bucket, path)'),
    supabase.from('chapters').select('id, work_id, slug, source_key, number, name, title, line, paragraphs, note, moods, cover:media!chapters_cover_id_fkey(bucket, path)'),
    supabase.from('items').select('id, name, word, type, rarity, atmosphere, frame, passive, energia, ataque, defesa, sorte, azar, removed_at, image:media!items_image_id_fkey(bucket, path)'),
    supabase.from('chapter_items').select('chapter_id, item_id, position'),
    supabase.from('tracks').select('id, chapter_id, title, embed_url, position'),
  ])
  if ([worksRes, chaptersRes, itemsRes, linksRes, tracksRes].some((result) => result.error)) return null
  const works = worksRes.data ?? []
  if (!works.length) return null

  const itemsById = new Map(
    (itemsRes.data ?? []).filter((item) => !item.removed_at).map((item) => [item.id, asItem(item)]),
  )
  const links = [...(linksRes.data ?? [])].sort((a, b) => a.position - b.position)
  const tracks = [...(tracksRes.data ?? [])].sort((a, b) => a.position - b.position)
  const localWorks = listWorks()

  return works.map((work) => {
    const local = localWorks.find((entry) => entry.id === work.id)
    const chapters = (chaptersRes.data ?? [])
      .filter((chapter) => chapter.work_id === work.id)
      .sort((a, b) => a.number - b.number)
      .map((chapter) => {
        const localChapter = local?.chapters?.find((entry) => entry.id === chapter.slug)
        return {
          id: chapter.slug,
          dbId: chapter.id,
          sourceKey: chapter.source_key,
          number: chapter.number,
          name: chapter.name,
          title: chapter.title,
          line: chapter.line ?? '',
          paragraphs: Array.isArray(chapter.paragraphs) ? chapter.paragraphs : [],
          note: chapter.note ?? '',
          moods: chapter.moods ?? [],
          file: localChapter?.file || null,
          cover: mediaUrl(chapter.cover),
          fromDatabase: true,
          items: links
            .filter((link) => link.chapter_id === chapter.id)
            .map((link) => itemsById.get(link.item_id))
            .filter(Boolean),
          tracks: tracks
            .filter((track) => track.chapter_id === chapter.id)
            .map((track) => ({ id: track.id, title: track.title, embedUrl: track.embed_url })),
        }
      })
    return {
      id: work.id,
      title: work.title,
      line: work.line ?? '',
      file: local?.file || null,
      cover: mediaUrl(work.cover),
      moods: [],
      chapters,
      fromDatabase: true,
    }
  })
}
