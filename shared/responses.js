export const MAX_ANSWER_LENGTH = 500
export const MAX_RESPONSES = 200
export const RESPONSE_PAGE_SIZE = 12
export const MOMENT_KEYS = ['lilac:comfort', 'carnations:composure', 'carnations:gift', 'roses:love', 'roses:realities']

export function normalizeAnswer(value) {
  return typeof value === 'string' ? value.normalize('NFC').replace(/\r\n?/g, '\n').trim() : ''
}

export function answerError(value) {
  const answer = normalizeAnswer(value)
  if (!answer) return 'Please write an answer first.'
  if ([...answer].length > MAX_ANSWER_LENGTH) return `Please keep your answer within ${MAX_ANSWER_LENGTH} characters.`
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(answer)) return 'Please remove unsupported characters.'
  return null
}

export function isResponse(value) {
  return value && typeof value.id === 'string' && MOMENT_KEYS.includes(value.moment)
    && typeof value.answer === 'string' && !answerError(value.answer)
    && typeof value.createdAt === 'string' && Number.isFinite(Date.parse(value.createdAt))
}
