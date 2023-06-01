import { SentryConfig } from '@ioc:Adonis/Addons/Sentry'
import Env from '@ioc:Adonis/Core/Env'

const sentryConfig: SentryConfig = {
  dsn: Env.get('SENTRY_DSN', ''),
  tracesSampleRate: parseFloat(Env.get('SENTRY_TRACES_SAMPLE_RATE', '0.2')),
  enabled: true,
  debug: Env.get('SENTRY_DEBUG', false),
}
export default sentryConfig
