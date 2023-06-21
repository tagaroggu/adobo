import { directive, AsyncDirective } from 'lit-html/async-directive.js';
import { listenKeys } from 'nanostores'
import delve from 'dlv';

/**
 * @template T
 * @param {import('nanostores').anyStore<T>} store
 * @param {string | undefined} path
 * @function
*/
export const useNanostore = directive(class extends AsyncDirective {
    dispose;
    render(store, path) {
        if (path === undefined) {
            return store.get();
        } else {
            return delve(store.get(), path);
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
                this.dispose = listenKeys(store, [path], (value) => {this.setValue(delve(value, path))})
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
        if (!this.dispose) {
            this.dispose = store.listen((value) => {this.setValue(value)});
        }
    }
});