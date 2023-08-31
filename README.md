# adobo
Use lit-html with nanostores. Exports `useNanostore` directive and `html` tag function that automatically wraps atoms with `useNanostore` directive.

## Example
```js
import { html, render } from 'lit-html';
import { map, atom } from 'nanostores';

import { useNanostore } from 'adobo';

const count = atom(0);

const Example1 = html`<button @click=${() => count.set(count.get() + 1)}>${useNanostore(count)}</button>`;

render(Example1, document.querySelector('#example1'));

// Also works with maps, even deep ones!

const state = map({ count: 0 });

const Example2 = html`<button @click=${() => {state.setKey('count', state.get().count + 1)}}>${useNanostore(state, 'count')}</button>`;

render(Example2, document.querySelector('#example2'));

import { html as aHTML } from 'adobo';
const Example3 = aHTML`<button @click=${() => count.set(count.get() + 1)}>${count}</button>`;

render(Example3, document.querySelector('#example3'));
```