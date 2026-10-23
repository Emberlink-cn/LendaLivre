import { atmospheresOf, imageFrameOf } from '../data/cardTraits'
import { supabase } from './supabase'

const IMAGE_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

function fail(error) {
  if (!error) return
  if (error.code === '23505') throw new Error('Já existe um registro com esse nome.')
  const message = String(error.message || '')
  if (message.includes('row-level security') || error.code === '42501') {
    throw new Error('Não publiquei. Entre de novo com a conta de criador.')
  }
  throw new Error('Não publiquei. Tente de novo.')
}

function publishedNow() {
  return new Date().toISOString()
}

export async function storeImage(dataUrl, folder) {
  if (!dataUrl?.startsWith('data:image/')) return null
  const blob = await fetch(dataUrl).then((response) => response.blob())
  const extension = IMAGE_TYPES[blob.type]
  if (!extension) throw new Error('Use uma imagem JPEG, PNG, WebP ou GIF.')
  if (blob.size > MAX_IMAGE_BYTES) throw new Error('A imagem precisa ter menos de 8 MB.')
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const uploaded = await supabase.storage.from('publicacao').upload(path, blob, {
    contentType: blob.type,
    upsert: false,
  })
  fail(uploaded.error)
  const user = await supabase.auth.getUser()
  const media = await supabase
    .from('media')
    .insert({
      bucket: 'publicacao',
      path,
      mime: blob.type,
      bytes: blob.size,
      created_by: user.data.user?.id ?? null,
    })
    .select('id')
    .single()
  fail(media.error)
  return media.data.id
}

async function wrote(query) {
  const result = await query
  fail(result.error)
  if (!result.data?.length) throw new Error('Não publiquei. Entre de novo com a conta de criador.')
  return result.data
}

export async function publishNewWork(work) {
  const coverId = await storeImage(work.cover, `obras/${work.id}`)
  const publishedAt = publishedNow()
  const created = await supabase
    .from('works')
    .insert({
      id: work.id,
      title: work.title,
      line: work.line || '',
      cover_id: coverId,
      published_at: publishedAt,
    })
    .select('id')
  if (created.error?.code === '23505') {
    const updated = await supabase
      .from('works')
      .update({
        title: work.title,
        line: work.line || '',
        cover_id: coverId,
        published_at: publishedAt,
      })
      .eq('id', work.id)
      .select('id')
    await wrote(Promise.resolve(updated))
  } else {
    await wrote(Promise.resolve(created))
  }
  const chapter = work.chapters?.[0]
  if (!chapter) return
  const chapterRow = {
    number: chapter.number || 1,
    name: chapter.name || chapter.title,
    title: chapter.title || chapter.name,
    line: chapter.line || '',
    paragraphs: chapter.paragraphs || [],
    note: chapter.note || '',
    moods: chapter.moods || [],
    published_at: publishedAt,
    ...(coverId ? { cover_id: coverId } : {}),
  }
  const inserted = await supabase.from('chapters').insert({
    work_id: work.id,
    slug: chapter.id,
    source_key: `${work.id}:${chapter.id}`,
    ...chapterRow,
  }).select('id')
  if (inserted.error?.code === '23505') {
    const updated = await supabase.from('chapters').update(chapterRow).eq('source_key', `${work.id}:${chapter.id}`).select('id')
    await wrote(Promise.resolve(updated))
  } else {
    await wrote(Promise.resolve(inserted))
  }
}

export async function saveWorkRecord({ id, title, line, cover }) {
  const row = { title, line: line ?? '', published_at: publishedNow() }
  const coverId = await storeImage(cover, `obras/${id}`)
  if (coverId) row.cover_id = coverId
  const updated = await supabase.from('works').update(row).eq('id', id).select('id')
  fail(updated.error)
  if (updated.data?.length) return
  const inserted = await supabase.from('works').insert({ id, ...row }).select('id')
  await wrote(Promise.resolve(inserted))
}

export async function saveChapterRecord({ dbId, workId, slug, sourceKey, changes }) {
  const row = { published_at: publishedNow() }
  if (changes.number != null) row.number = changes.number
  if (changes.name != null) row.name = changes.name
  if (changes.title != null) row.title = changes.title
  if (changes.line != null) row.line = changes.line
  if (changes.moods != null) row.moods = changes.moods
  if (changes.paragraphs != null) row.paragraphs = changes.paragraphs
  if (changes.note != null) row.note = changes.note
  const coverId = await storeImage(changes.cover, `capitulos/${workId}`)
  if (coverId) row.cover_id = coverId
  if (dbId) {
    const updated = await supabase.from('chapters').update(row).eq('id', dbId).select('id')
    await wrote(Promise.resolve(updated))
    return dbId
  }
  const source = sourceKey || `${workId}:${slug}`
  const existing = await supabase.from('chapters').select('id').eq('source_key', source).maybeSingle()
  fail(existing.error)
  if (existing.data?.id) {
    const updated = await supabase.from('chapters').update(row).eq('id', existing.data.id).select('id')
    await wrote(Promise.resolve(updated))
    return existing.data.id
  }
  const inserted = await supabase
    .from('chapters')
    .insert({
      work_id: workId,
      slug,
      source_key: sourceKey || `${workId}:${slug}`,
      number: changes.number || 1,
      name: changes.name || changes.title || 'Capítulo',
      title: changes.title || changes.name || 'Capítulo',
      line: changes.line || '',
      paragraphs: changes.paragraphs || [],
      note: changes.note || '',
      moods: changes.moods || [],
      cover_id: coverId,
      published_at: row.published_at,
    })
    .select('id')
  const rows = await wrote(Promise.resolve(inserted))
  return rows[0].id
}

export async function removeChapterRecord(dbId) {
  if (!dbId) return
  const removed = await supabase.from('chapters').delete().eq('id', dbId).select('id')
  await wrote(Promise.resolve(removed))
}

function missingItemColumns(error) {
  const message = String(error?.message || '')
  return /atmospheres|image_zoom|image_x|image_y|schema cache/i.test(message)
}

function itemRow(item, imageId, clearImage, extended) {
  const stats = item.stats || {}
  const moods = atmospheresOf(item)
  const frame = imageFrameOf(item)
  const row = {
    name: item.name,
    word: item.word,
    type: item.type,
    rarity: item.rarity || 'comum',
    atmosphere: moods.join(' · '),
    frame: item.frame || null,
    passive: item.passive || '',
    energia: Number(stats.energia) || 0,
    ataque: Number(stats.ataque) || 0,
    defesa: Number(stats.defesa) || 0,
    sorte: Number(stats.sorte) || 0,
    azar: Number(stats.azar) || 0,
    published_at: publishedNow(),
    removed_at: null,
  }
  if (extended) {
    row.atmospheres = moods
    row.image_zoom = frame.zoom
    row.image_x = frame.x
    row.image_y = frame.y
  }
  if (clearImage) row.image_id = null
  if (imageId) row.image_id = imageId
  return row
}

async function linkItem(chapterDbId, itemId, position) {
  const link = await supabase.from('chapter_items').insert({
    chapter_id: chapterDbId,
    item_id: itemId,
    position,
  })
  if (link.error?.code === '23505') return
  fail(link.error)
}

export async function saveItemRecord({ chapterDbId, item, position }) {
  const imageId = await storeImage(item.image, `itens/${item.id}`)
  const existing = await supabase.from('items').select('id').eq('id', item.id).maybeSingle()
  fail(existing.error)
  const write = (extended) => {
    const row = itemRow(item, imageId, item.image === '', extended)
    if (existing.data) return supabase.from('items').update(row).eq('id', item.id).select('id')
    return supabase.from('items').insert({ id: item.id, ...row }).select('id')
  }
  let saved = await write(true)
  if (saved.error && missingItemColumns(saved.error)) saved = await write(false)
  await wrote(Promise.resolve(saved))
  if (chapterDbId) await linkItem(chapterDbId, item.id, position)
}

export async function removeItemRecord({ chapterDbId, itemId }) {
  const existing = await supabase.from('items').select('id').eq('id', itemId).maybeSingle()
  fail(existing.error)
  if (!existing.data) return
  if (chapterDbId) {
    const link = await supabase.from('chapter_items').delete().eq('chapter_id', chapterDbId).eq('item_id', itemId)
    fail(link.error)
  }
  const removed = await supabase.from('items').update({ removed_at: publishedNow() }).eq('id', itemId).select('id')
  await wrote(Promise.resolve(removed))
}

const TRACK_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function saveTrackRecord({ chapterDbId, track, position }) {
  const row = { title: track.title, embed_url: track.embedUrl, position }
  if (TRACK_ID.test(track.id || '')) {
    const updated = await supabase.from('tracks').update(row).eq('id', track.id).select('id')
    await wrote(Promise.resolve(updated))
    return
  }
  const inserted = await supabase.from('tracks').insert({ ...row, chapter_id: chapterDbId }).select('id')
  await wrote(Promise.resolve(inserted))
}

export async function removeWorkRecord(workId) {
  const chapters = await supabase.from('chapters').select('id').eq('work_id', workId)
  fail(chapters.error)
  const chapterIds = (chapters.data ?? []).map((row) => row.id)
  let itemIds = []
  if (chapterIds.length) {
    const links = await supabase.from('chapter_items').select('item_id').in('chapter_id', chapterIds)
    fail(links.error)
    itemIds = [...new Set((links.data ?? []).map((row) => row.item_id))]
  }
  const removed = await supabase.from('works').delete().eq('id', workId).select('id')
  await wrote(Promise.resolve(removed))
  if (!itemIds.length) return
  const still = await supabase.from('chapter_items').select('item_id').in('item_id', itemIds)
  fail(still.error)
  const kept = new Set((still.data ?? []).map((row) => row.item_id))
  const retire = itemIds.filter((id) => !kept.has(id))
  if (!retire.length) return
  const marked = await supabase
    .from('items')
    .update({ removed_at: publishedNow() })
    .in('id', retire)
    .select('id')
  if (marked.error?.code === '42501' || String(marked.error?.message || '').includes('row-level security')) return
  await wrote(Promise.resolve(marked))
}

export async function removeTrackRecord(trackId) {
  if (!TRACK_ID.test(trackId || '')) return
  const removed = await supabase.from('tracks').delete().eq('id', trackId).select('id')
  await wrote(Promise.resolve(removed))
}
