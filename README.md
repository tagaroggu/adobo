# adobo
lit-html helpers

## Features
- `createCustomElement`, to create a custom element from a simple object
- `useReactive`, to use a vue reactive object or ref in a lit-html template without needing to rerender on each value change
- `useComponent`, to use a simple 

## Stateful components
Using `useComponent`, it is possible to create and use components that manage their own state and automatically update and render upon changes without needing to call `render` every time a change happens. These automatically update upon a change to any ref or reactive object used within the component. 