import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css';

/** Read-only Scalar reference (Decisions #2): no Try-it client, dark mode forced to match the city. */
export default function ScalarView({ spec }: { readonly spec: Record<string, unknown> }) {
  return (
    <ApiReferenceReact
      configuration={{
        content: spec,
        hideTestRequestButton: true,
        hideClientButton: true,
        hideDarkModeToggle: true,
        forceDarkModeState: 'dark',
        withDefaultFonts: false,
        layout: 'classic',
      }}
    />
  );
}
