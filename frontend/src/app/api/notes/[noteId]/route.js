import { callBackendWithAutoRefresh } from '../../../../lib/server/backendAuth'
import { buildProxyResponse } from '../../../../lib/server/proxyResponse'

async function handle(request, noteId, method) {
  const body = method === 'PUT' ? await request.json() : undefined

  const { backendResponse, payload, refreshedTokens, clearAuth, requestId } =
    await callBackendWithAutoRefresh({
      request,
      path: `/notes/${noteId}/`,
      method,
      body,
    })

  return buildProxyResponse({
    status: backendResponse.status,
    payload,
    requestId,
    refreshedTokens,
    clearAuth,
  })
}

export async function GET(request, { params }) {
  const { noteId } = await params
  return handle(request, noteId, 'GET')
}

export async function PUT(request, { params }) {
  const { noteId } = await params
  return handle(request, noteId, 'PUT')
}

export async function DELETE(request, { params }) {
  const { noteId } = await params
  return handle(request, noteId, 'DELETE')
}
