
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


interface propObject {
    [key: string]: string
}

interface litRead_out {
    template: string, props: propObject, imports: HTMLTemplateElement[], IDs: string[] 
}

function inputError(input : any ):void{
    console.log('LitRead does not accept the following ${ } as input in string literal:');
    console.log(input);
    throw Error('Invalid input.');
}

export function litRead(strings:TemplateStringsArray, ...keys:Array<any>):litRead_out{

    let output : {template: string, props: propObject, imports: HTMLTemplateElement[], IDs: string[] };
    output = {template: "", props:{}, imports: [], IDs: [] };

    if(strings.length <= keys.length) 
        throw Error('Improper parameter size.');
    
    if(strings.length === 1) {
        output.template = `${strings[0]}`;
        return output;
    }

    // from here there is at least one key
    let temp_str = "";
    strings.forEach( (str_val, index)=>{
        temp_str += str_val;

        if(index === keys.length) return;
        let key = keys[index];

        // cases:
        if (typeof(key) === 'string'){ 
            let trimmed = key ;
            trimmed.trim();
            // case of and ID
            if( trimmed[0] === "#" && trimmed[1] ==="-") {
                temp_str += ` id="${trimmed.substring(2)}" `;
                output.IDs.push(trimmed.substring(2));
            }
            // case of an attribute
            else if(trimmed.slice(0,2) === '|*' && trimmed.slice(-2) === '*|'){
                let no_space = trimmed.replace(/\s/g,'');

                let properties = no_space.slice(2,-2).split('|');

                for (let p of properties) {

                    if(p.includes('-b'))
                        output.props[p.replace(/\-b/g,'')] = 'bool';
                    else 
                        output.props[p] = 'string';
                }
            }
            // case of expression or string
            else temp_str += key;            
        }
        
        else if(typeof(key) === 'object') {
            // case of a list of strings or templates
            if(Array.isArray(key)) {

                for(let val of key) {
                    if(typeof(val) === 'string') temp_str += ' ' + val ; 
                    else if( typeof(val) === 'object' && 'tagName' in val && val.tagName === 'TEMPLATE') {
                        output.imports.push(val);
                    }
                    else inputError(val);
                }
            }
            // case of a template
            else if('tagName' in key && key.tagName === 'TEMPLATE'){
                output.imports.push(key);
                // in case template is from templateme import IDs and props
                if(key.hasOwnProperty("_props") && key._props != null && key._props != undefined)
                    for(let p_name in key._props){
                        this._props[p_name] = key._props[p_name];
                    }
                if(key.hasOwnProperty("_IDs") && key._IDs != null && key._IDs != undefined)
                    output.IDs.concat(key._IDs);
            }
            else inputError(key);
        }
        else if( typeof(key) === 'number'){
            temp_str += key.toString(10);
        }
        else inputError(key);
                
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
export function templateme(strings:TemplateStringsArray, ...keys:Array<any>) : HTMLTemplateElement {
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
    Object.defineProperty(out_template,'_props', read_inputs.props);
    Object.defineProperty(out_template,'_IDs', read_inputs.IDs);

    return out_template;
}   


interface configs{
    shadowRoot?:{mode:string,delegatesFocus:boolean }
    inherit?:boolean
}
/**
 * Custom-element mixing generator, to be used as a tagged literal. It returns a mixin function that takes two arguments.
 * @param class - the base class to which apply the mixin, can be HTMLElement or can inherit from a custom element  
 * @param configs - object with structure {inherit:boolean, shadowRoot: { mode:string, delegatesFocus:boolean } }
 * default values of configs are inherit:false, mode:open, delegatesFocus:false.
 */
export function brick(strings:TemplateStringsArray, ...keys:Array<any>) : Function {

    let litOut = litRead(strings,...keys);
    let tmpl = document.createElement('template');
    tmpl.innerHTML = litOut.template;
    litOut.imports.push(tmpl);

    // Typescript: FIXME, would be nice to return at least an HTMLElement, 
    // but cannot make it work
    return (BaseClass:any,config:configs) : any => class extends BaseClass {

        ids:{[key:string]: Element};
        swr:ShadowRoot;
        _props:propObject;

        static get observedAttributes() {
            let arr = [];
            if(super.observedAttributes){
                arr = super.observedAttributes;
            }
            return arr.concat(Object.keys(litOut.props));
        }

        constructor(){
            super();

            // copy props, this works also in case of inheritance
            if(!this._props) this._props = {};
            for (let key in  litOut.props){
                this._props[key] = litOut.props[key];
            }
            
            // attach shadow or inherit shadow
            let conf = (config && config.shadowRoot) ? config.shadowRoot : {mode:'open', delegatesFocus:false} ;
            let shadowRoot = (config && config.inherit) ? this.shadowRoot : this.attachShadow(conf);

            for (let tmpl of litOut.imports) {
                shadowRoot.appendChild(tmpl.content.cloneNode(true));
            }

            // attach elements IDs
            if(!this.ids) this.ids  =  {};
            for (let id of litOut.IDs){
                this.ids[id] = shadowRoot.getElementById(id);
            }

            this.shadowRoot.qs = this.shadowRoot.querySelector;
            this.swr = this.shadowRoot;

            // set the attribute-property reflection, does not re-define props in case of inheritance
            this.setProps();

        }
        


        setProps() {
            // define getters and setters for list of properties
            // in case of inheritance does not re-define props
            for (let prop in this._props) { 
                if(!this.hasOwnProperty(prop)){
                    Object.defineProperty(this, prop, {
                        set: (val) => { this.setAttribute(prop, val); },
                        get: () => { return this.getAttribute(prop); }
                    });
                }
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
        attributeChangedCallback(name:string, oldVal:any, newVal:any) {
            const hasValue = (newVal !== null);
            const updateMe = (!hasValue || oldVal !== newVal);
            if (updateMe && this._props.hasOwnProperty(name) && this['update_'+name] !== undefined) {
              this['update_'+name](newVal);
            }
        }
        

    };
        
}
    
// some shortcuts:
export let dfn = customElements.define.bind(customElements);

