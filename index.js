import { directive, AsyncDirective } from 'lit-html/async-directive.js';
import { listenKeys, getPath } from 'nanostores';

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