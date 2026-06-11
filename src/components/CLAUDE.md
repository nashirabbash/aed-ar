This folder is the home for XR components.

General rules:

- Each component should have its own folder, for example `AED/`.
- `index.tsx` should be the main file for the component.
- `helper.ts` should contain supporting functions or small pieces of logic that do not belong in the main file.
- `type.ts` should contain props definitions, types, and other helper types.

The goal is to keep each component clean, easy to find, and not mix UI code with helpers or types.
