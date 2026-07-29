import NoteEditorPage from '../../../components/NoteEditorPage'
import { requireAuthPage } from '../../../lib/server/pageAuth'

export default async function NoteDetailRoute({ params }) {
  const { noteId } = await params
  await requireAuthPage()
  return <NoteEditorPage noteId={noteId} />
}
