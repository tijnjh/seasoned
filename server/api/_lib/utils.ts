import type { H3Event } from 'nitro'
import type { EventHandlerRequest } from 'nitro/h3'
import { getQuery } from 'nitro/h3'
import * as v from 'valibot'

export function getSafeQuery<
  TSchema extends v.GenericSchema,
>(
  event: H3Event<EventHandlerRequest>,
  schema: TSchema,
): v.InferOutput<TSchema> {
  const h3Query = getQuery(event)

  const result = v.safeParse(schema, h3Query)

  if (!result.success) {
    throw new Error(v.summarize(result.issues))
  }

  return result.output
}
