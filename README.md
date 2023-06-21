# adobo
Use lit-html with nanostores. Exports one simple function, `useNanostore`

## Example
```js
import { html, render } from 'lit-html';
import { map, atom } from 'nanostores';

import { useNanostore } from 'adobo';

const count = atom(0);

const Example1 = html`<button @click=${() => count.set(count.get() + 1)}>${useNanostore(count)}</button>`;

render(Example1, document.getElementById('example1'));

// Also works with maps, even deep ones!

const state = map({ count: 0 });

const Example2 = html`<button @click=${() => {state.setKey('count', state.get().count + 1)}}>${useNanostore(state, 'count')}</button>`; // Deep access handled by `dlv` package

render(Example2, document.getElementById('example2'));
```