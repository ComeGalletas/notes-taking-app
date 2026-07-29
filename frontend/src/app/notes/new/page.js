import NoteEditorPage from '../../../components/NoteEditorPage'
import { requireAuthPage } from '../../../lib/server/pageAuth'

export default async function NewNoteRoute() {
  await requireAuthPage()
  return <NoteEditorPage />
}
