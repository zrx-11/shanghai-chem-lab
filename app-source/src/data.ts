export type SubjectId =
  | 'chinese'
  | 'math'
  | 'english'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'politics'
  | 'history'
  | 'geography'
  | 'information'

export type Subject = {
  id: SubjectId
  name: string
  label: string
}

export const subjects: Subject[] = [
  { id: 'chemistry', name: '化学', label: 'CHEMISTRY' },
]
