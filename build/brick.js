/****************************************************************************************
 *                        litRead: Template literal parser                              *
 * **************************************************************************************
 * Concatenates placeholder ${ } that contains string or arrays of strings with the text
 * Extract <template> from placeholder ${ } (mainly for <styles> import).
 * Insert automatic ID in text if placeholder contain a string starting with '#'
 * Extract config information in placeholders that contains '|* *|' signature .
 *
 * Returns an object of the type:
 * {template: "...", props:{"...",...}, IDs:["..",...], imports:[<template>,...]}
 */
function inputError(input) {
    console.log('LitRead does not accept the following ${ } as input in string literal:');
    console.log(input);
    throw Error('Invalid input.');
}
export function litRead(strings, ...keys) {
    let output;
    output = { template: "", props: {}, imports: [], IDs: [] };
    if (strings.length <= keys.length)
        throw Error('Improper parameter size.');
    if (strings.length === 1) {
        output.template = `${strings[0]}`;
        return output;
    }
    // from here there is at least one key
    let temp_str = "";
    strings.forEach((str_val, index) => {
        temp_str += str_val;
        if (index === keys.length)
            return;
        let key = keys[index];
        // cases:
        if (typeof (key) === 'string') {
            let trimmed = key;
            trimmed.trim();
            // case of and ID
            if (trimmed[0] === "#" && trimmed[1] === "-") {
                temp_str += ` id="${trimmed.substring(2)}" `;
                output.IDs.push(trimmed.substring(2));
            }
            // case of an attribute
            else if (trimmed.slice(0, 2) === '|*' && trimmed.slice(-2) === '*|') {
                let no_space = trimmed.replace(/\s/g, '');
                let properties = no_space.slice(2, -2).split('|');
                for (let p of properties) {
                    if (p.includes('-b'))
                        output.props[p.replace(/\-b/g, '')] = 'bool';
                    else
                        output.props[p] = 'string';
                }
            }
            // case of expression or string
            else
                temp_str += key;
        }
        else if (typeof (key) === 'object') {
            // case of a list of strings or templates
            if (Array.isArray(key)) {
                for (let val of key) {
                    if (typeof (val) === 'string')
                        temp_str += ' ' + val;
                    else if (typeof (val) === 'object' && 'tagName' in val && val.tagName === 'TEMPLATE') {
                        output.imports.push(val);
                    }
                    else
                        inputError(val);
                }
            }
            // case of a template
            else if ('tagName' in key && key.tagName === 'TEMPLATE') {
                output.imports.push(key);
            }
            /*else if(Object.values(key).length > 0){
                // whitelisting, props should be like:    { key : ['string', 'string'], ... } or { key : "string"}
                for( let v of Object.values(key)){
                        if(typeof(v) === 'string' &&(v !== 'string' && v !== 'bool'))
                            inputError(v);
               
                        else if ( Array.isArray(v) &&
                            ( v.length !== 2 || typeof(v[0]) !== 'string' ||
                            ( typeof(v[1]) !== 'string' && typeof(v[1]) !== 'boolean')
                            || (v[0] !=='string' && v[0] !== 'bool')))
                                inputError(v);
                        
                        else if( typeof(v) !== 'string' && !Array.isArray(v))
                            inputError(v);
                }
                output.props = key ;
            }*/
            else
                inputError(key);
        }
        else
            inputError(key);
    });
    output.template = temp_str;
    return output;
}
/****************************************************************************************
 *                        templateme: Templates generator                               *
 * **************************************************************************************
 * Using litRead creates an instance of template in the document.
 * To be used as a tag for a string literal.
 * Returns a <template>.
*/
export function templateme(strings, ...keys) {
    // NOTE on performance: it is a bit faster this way using insertBefore instead of appendChild,
    // because in that case there is an additional document.createElement for the additional appended child.
    let read_inputs = litRead(strings, ...keys);
    let out_template = document.createElement('template');
    out_template.innerHTML = read_inputs.template;
    /*
    // THIS DOES NOT WORK
    for (let tmpl of read_inputs.imports) {
        //out_template.insertBefore(tmpl.content.cloneNode(true), out_template.childNodes[0] || null);
        out_template.appendChild(tmpl.content.cloneNode(true)); // FIXME: cannot add child totemplate

    }
    */
    Object.defineProperty(out_template, '_props', read_inputs.props);
    Object.defineProperty(out_template, '_IDs', read_inputs.IDs);
    return out_template;
}
export function brick(strings, ...keys) {
    let litOut = litRead(strings, ...keys);
    let tmpl = document.createElement('template');
    tmpl.innerHTML = litOut.template;
    litOut.imports.push(tmpl);
    return (BaseClass) => class extends BaseClass {
        static get observedAttributes() {
            return Object.keys(litOut.props);
        }
        constructor() {
            super();
            this._props = litOut.props;
            let shadowRoot = this.attachShadow({ mode: 'open' });
            for (let tmpl of litOut.imports) {
                shadowRoot.appendChild(tmpl.content.cloneNode(true));
            }
            let ids; // FIXME: wtf is this ts error?
            ids = {};
            for (let id of litOut.IDs) {
                ids[id] = shadowRoot.getElementById(id);
            }
            this['ids'] = ids;
            this.shadowRoot.qs = this.shadowRoot.querySelector;
            this.swr = this.shadowRoot;
            this.setProps();
        }
        setProps() {
            // define getters and setters for list of properties
            for (let prop in this._props) {
                Object.defineProperty(this, prop, {
                    set: (val) => { this.setAttribute(prop, val); },
                    get: () => { return this.getAttribute(prop); }
                });
            }
        }
        /*
        /// SUPPORT FOR DEFAULT values on attributes REVOKED. Attributes are behaviours, defaults make no sense.
            connectedCallback() {
                if(super['connectedCallback'] !==  undefined ) super.connectedCallback();
    
                for (let prop in this._props) {
                    if (!this.hasAttribute(prop) && Array.isArray(this._props[prop]) ) this.setAttribute(prop, this._props[prop][1]);
                }
            }
        */
        attributeChangedCallback(name, oldVal, newVal) {
            const hasValue = (newVal !== null);
            const updateMe = (!hasValue || oldVal !== newVal);
            if (updateMe && this._props.hasOwnProperty(name) && this['update_' + name] !== undefined) {
                this['update_' + name](newVal);
            }
        }
    };
}
// some shortcuts:
export let dfn = customElements.define;
