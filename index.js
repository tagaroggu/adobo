import { directive, AsyncDirective } from 'lit-html/async-directive.js';
import { listenKeys, getPath } from 'nanostores';
import { html as litHTML } from 'lit-html';
/**
 * @template T
 * @param {import('nanostores').Store<T>} store
 * @param {string | undefined} path
 * @function
*/
export const useNanostore = directive(class extends AsyncDirective {
    dispose;
    render(store, path) {
        if (path === undefined) {
            return store.get();
        } else {
            return getPath(store.get(), path);
        }
    }

    /**
     * 
     * @param {*} _part 
     * @param {[import('nanostores').anyStore<T>, string | undefined]} param1 
     * @returns 
     */
    update(_part, [store, path = undefined]) {
        if (!this.dispose) {
            if (path === undefined) {
                this.dispose = store.listen((value) => {this.setValue(value)});
            } else {
                this.dispose = listenKeys(store, [path], (value) => {this.setValue(getPath(value, path))})
            }
        }
        return this.render(store, path);
    }

    disconnected() {
        if (this.dispose) {
            this.dispose();
            this.dispose = undefined;
        }
    }
    
    reconnected() {
        this.update();
    }
});

function isAtom(value) {
    return typeof value === 'object' &&
    'get' in value && 'set' in value &&
    'subscribe' in value && 'listen' in value
}

/**
 * 
 * @param {string[]} strings 
 * @param {unknown[]} values 
 */
export function html(strings, ...values) {
    const subValues = [];
    values.forEach(value => {
        if (isAtom(value)) {
            subValues.push(useNanostore(value));
        } else {
            subValues.push(value);
        }
    });

    return litHTML(strings, ...subValues);
}