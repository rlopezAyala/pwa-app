import { LifeCycles } from "single-spa"
import { Apis, HostMode, OpenIdConfig, CookieSettings, CodeStatus, MfaConfigurations } from "types/models/envConfig"
import { type Faro } from "@grafana/faro-react"
import type { AnyValue } from "types/common"

interface PwaApp {
  apiToken: string
}

declare global {
  interface Window {
    [k: string]: LifeCycles
    env: {
      pwaApp: PwaApp
    }
  }
}
