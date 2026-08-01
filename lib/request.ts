export async function readJsonBody(request: Request, maxBytes = 32_000): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error('REQUEST_TOO_LARGE')
  }

  const text = await request.text()
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error('REQUEST_TOO_LARGE')
  }
  return JSON.parse(text)
}

export function invalidJsonResponse(error: unknown) {
  return Response.json(
    { error: error instanceof Error && error.message === 'REQUEST_TOO_LARGE' ? 'Het verzoek is te groot.' : 'Ongeldig verzoek.' },
    { status: error instanceof Error && error.message === 'REQUEST_TOO_LARGE' ? 413 : 400 },
  )
}
