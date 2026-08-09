import { randomUUID } from 'node:crypto'
import { start } from 'workflow/api'
import { leadEngineDailyWorkflow } from '@/workflows/lead-engine/daily'

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  }
  const jobId = randomUUID()
  const run = await start(leadEngineDailyWorkflow, [jobId])
  return Response.json({ ok: true, jobId, runId: run.runId }, { status: 202 })
}
