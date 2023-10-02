import { directive, AsyncDirective } from 'lit-html/async-directive.js';
import { listenKeys, getPath } from 'nanostores';
import { html as litHTML } from 'lit-html';
/**
 * @template {import('nanostores').Store<unknown>} T
 * @param {import('nanostores').Store<T>} store
 * @param {string | undefined} path
 * @function
*/
export const useNanostore = directive(class extends AsyncDirective {
    /** @type {(() => void) | undefined} */
    dispose;
    /**
     * 
     * @param {T} store 
     * @param {import('nanostores').MapStoreKeys<T> | undefined} path 
     * @returns 
     */
    render(store, path) {
        if (path === undefined) {
            return store.get();
        } else {
            return getPath(/** @type {import('nanostores').BaseDeepMap} */(store.get()), /** @type {string} */(path));
        }
    }

    /**
     * 
     * @param {*} _part 
     * @param {Parameters<typeof this['render']>} param1
     */
    update(_part, [store, path = undefined]) {
        if (!this.dispose) {
            if (path === undefined) {
                this.dispose = store.listen((value) => {this.setValue(value)});
            } else {
                this.dispose = listenKeys(/** @type {import('nanostores').MapStore<import('nanostores').StoreValue<T> & {}>}*/(store),
                // @ts-ignore Expects AllKeys<Object> shape but I can't satisfy that for whatever reason. Nanostores doesn't export AllKeys type, but does AllPaths
                    [path],
                    (value) => {this.setValue(getPath(/** @type {import('nanostores').BaseDeepMap} */(value), /** @type {string} */(path)))})
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
});

/**
 * Checks to see if value is store-like
 * @param {unknown} value 
 * @returns { value is import('nanostores').Store<unknown> }
 */
function isStore(value) {
    return !!value && typeof value === 'object' &&
    'get' in value && 'set' in value &&
    'subscribe' in value && 'listen' in value
}

/**
 * 
 * @param {TemplateStringsArray} strings 
 * @param {unknown[]} values 
 */
export function html(strings, ...values) {
    /** @type {unknown[]} */
    const subValues = [];
    values.forEach(value => {
        if (isStore(value)) {
            // @ts-ignore I'm not quite sure what it wants here
            subValues.push(useNanostore(value));
        } else {
            subValues.push(value);
        }
    });

    return litHTML(strings, ...subValues);
}

/*
{
    setup() {} => render() {}
    methods {

    }
}
*/

/**
 * @template T
 * @template {Object} [U={}]
 * @typedef {Object} Component
 * @property { () => U } setup
 * @property { (this: U, props: T) => import('lit-html').TemplateResult } render
 * @property {Record<string, (...args: any[]) => any>} methods
 */

/**
 * @template T
 * @template {Object} U
 */
export const useComponent = directive(class extends AsyncDirective {
    /** @type {Component<T, U> | undefined} */
    component;
    /** @type {U | undefined} */
    instance;
    /** @type {*} */
    proxy;
    /**
     * @param {Component<T, U>} component
     * @param {T & {ref?: import('lit-html/directives/ref.js').Ref<*> | import('nanostores').WritableAtom<*>}} props
     */
    render(component, props) {
        if (component !== this.component || !this.instance) {
            this.component = component;
            this.instance = component.setup();
            this.proxy = new Proxy(this.component.methods, {
                get: (..._) => {
                    return Reflect.get(..._).bind(this.instance)
                }
            })
        }

        if (props.ref) {
            if (props.ref.hasOwnProperty('value')) {
                // lit-html ref
                // @ts-ignore ref#value is readonly in type but not in implementation... plus this otherwise wouldn't work
                if (props.ref.value !== this.proxy) props.ref.value = this.proxy;
            } else if (isStore(props.ref) && !props.ref.hasOwnProperty('setKey')) {
                // Nanostores atom
                if (props.ref.get() !== this.proxy) /** @type {import('nanostores').WritableAtom<*>} */(props.ref).set(this.proxy);
            } else {
                // Uh oh
                throw new Error('Ref should be lit-html/lit ref or Nanostores atom')
            }
        }

        return this.component.render.call(this.instance, props);
    }

    disconnected() {
        this.instance = undefined;
        this.proxy = undefined;
    }
})

/**
 * Curry of useComponent
 * @template T
 * @param {Component<T>} component
 * @returns {(props: T) => ReturnType<typeof useComponent>}
 */
// @ts-ignore Will fix types
export const defineComponent = (component) => (props) => useComponent(component, props)