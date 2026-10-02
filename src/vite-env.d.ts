/// <reference types="vite/client" />
// CHANGE_REQUEST_015 section A — the virtual module useRegisterSW comes from.
/// <reference types="vite-plugin-pwa/react" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_REQUIRE_GOOGLE_AUTH?: string;
  readonly VITE_GARMIN_BRIDGE_URL?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
