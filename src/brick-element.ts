
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

interface autosetProp {
    [key:string] :  { [key:string] : string }
}
interface litRead_out {
    template: string, props: propObject, imports: HTMLTemplateElement[], IDs: string[], autoset: autosetProp
}

function inputError(input : any ):void{
    console.log('LitRead does not accept the following ${ } as input in string literal:');
    console.log(input);
    throw Error('Invalid input.');
}

export function litRead(strings:TemplateStringsArray, ...keys:Array<any>):litRead_out{

    let output : litRead_out
    output = {template: "", props:{}, imports: [], IDs: [], autoset:{} };

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
            // case of and ID and prop autoassign
            if( trimmed[0] === "#" && trimmed[1] ==="-") {
                let id = trimmed.substring(2);
                if(trimmed.includes("|")){
                    let auto_set_props = trimmed.split("|");
                    id = auto_set_props[0].trim().substring(2);

                    for(let i=1; i < auto_set_props.length; i++){
                        let prop = auto_set_props[i].split("=");
                        if(prop.length !== 2 || prop[0].trim() === "" || prop[1].trim() ==="" ) continue;
                        // setting pattern: {root_prop : { id : target_prop }
                        if(!output.autoset.hasOwnProperty(prop[1].trim()))  output.autoset[prop[1].trim()] = {};
                        output.autoset[prop[1].trim()][id] = prop[0].trim();
                    }
                }
                temp_str += ` id="${id}" `;
                output.IDs.push(id);
            }
            // case of an attribute or property
            else if(trimmed.slice(0,2) === '|*' && trimmed.slice(-2) === '*|'){
                let no_space = trimmed.replace(/\s/g,'');

                let properties = no_space.slice(2,-2).split('|');

                for (let p of properties) {

                    if(p.includes('!')) 
                        output.props[p.replace(/!/g,'')] = 'property';
                    else 
                        output.props[p] = 'attribute';
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
    shadowRoot?:{mode:ShadowRootMode,delegatesFocus?:boolean }
    inherit?:boolean
}


type Constructor<T = HTMLElement> = new (...args: any[]) => T;
type TBrick = Constructor & {observedAttributes?:string[] };
/**
 * Custom-element mixing generator, to be used as a tagged literal. It returns a mixin function that takes two arguments.
 * @param class - the base class to which apply the mixin, can be HTMLElement or can inherit from a custom element  
 * @param configs - object with structure {inherit:boolean, shadowRoot: { mode:string, delegatesFocus:boolean } }
 * default values of configs are inherit:false, mode:open, delegatesFocus:false.
 */
export function brick<InputData>(strings:TemplateStringsArray, ...keys:Array<any>) {

    let litOut = litRead(strings,...keys);
    let tmpl = document.createElement('template');
    tmpl.innerHTML = litOut.template;
    litOut.imports.push(tmpl);

    // Typescript: FIXME, would be nice to return at least an HTMLElement, 
    // but cannot make it work
    return function <TBase extends TBrick>(BaseClass:TBase,config?:configs) { 
        return class extends BaseClass {

        ids:{[key:string]: HTMLElement};
        swr:ShadowRoot;
        _props:propObject;
        _autoset:autosetProp;
        qs:ParentNode["querySelector"];
        // maybe not best solution FIXME, but otherwise complain with this['update_'+name]
        [key:string]:any; 

        static get observedAttributes() {
            let arr:string[] = [];
            if(super.observedAttributes){
                arr = super.observedAttributes;
            }

            return arr.concat( Object.keys(litOut.props).filter(x => litOut.props[x] === "attribute") );
        }

        constructor(...args:any[]){
            super();

            // copy props, this works also in case of inheritance
            if(!this._props) this._props = {};
            for (let key in  litOut.props){
                this._props[key] = litOut.props[key];
            }
            
            // copy autosets, this works also in case of inheritance
            if(!this._autoset) this._autoset = {};
            for (let key in  litOut.autoset){
                this._autoset[key] = litOut.autoset[key];
            }
            
            // attach shadow or inherit shadow
            let conf = (config && config.shadowRoot) ? config.shadowRoot : {mode:<ShadowRootMode>'open', delegatesFocus:false} ;
            let shadowRoot = (config && config.inherit) ? this.shadowRoot : this.attachShadow(conf);

            for (let tmpl of litOut.imports) {
                shadowRoot.appendChild(tmpl.content.cloneNode(true));
            }

            // attach elements IDs
            if(!this.ids) this.ids  =  {};
            for (let id of litOut.IDs){
                this.ids[id] = shadowRoot.getElementById(id);
            }

            this.qs = this.shadowRoot.querySelector;
            this.swr = this.shadowRoot;

            // set the attribute-property reflection and local setters, does not re-define attributes in case of inheritance
            this.setProps();
            // set Automatic bind to functions
            this.setFuncBind();
            // define getters and setters for brick-slots, in case of inheritance does not re-define 
            this.acquireSlots();
            this.setRootToChilds();
        }
        

        setProps() {
            // define getters and setters for list of properties
            // in case of inheritance does not re-define props
            for (const [prop, type] of Object.entries(this._props)) { 
                if(!this.hasOwnProperty(prop) && !this.hasOwnProperty("_"+ prop) ){
                    if(type === "attribute"){
                        Object.defineProperty(this, prop, {
                            set: (val) => { this.setAttribute(prop, val); },
                            get: () => { return this.getAttribute(prop); }
                        });
                    }
                    else if(type === "property"){
                        this["_"+prop] = undefined;
                        Object.defineProperty(this, prop, {
                            set: (val) => {  
                                    this["_"+prop] = val;
                                    this.autosetTargetProps(prop,val);
                            },
                            get: () => { return this["_"+prop]; }
                        });
                    }
                }
            }
        }
        
        setFuncBind(){
            for(const [prop, obj] of Object.entries(this._autoset)){
                if(!this._props.hasOwnProperty(prop) && typeof(this[prop]) === "function") {
                    for(const [id, target] of Object.entries(obj)){
                        // @ts-ignore
                        if(this.ids.hasOwnProperty(id)) this.ids[id][target] = this[prop].bind(this);
                    }
                }
            }
        }

        acquireSlots(){
            let slots = this.swr.querySelectorAll("slot");
            for(let s of slots){
                if(s.hasAttribute("type")){
                    let name = s.getAttribute("name");
                    let type = s.getAttribute("type");
                    // NOTE: does not re-define in case of inheritace
                    if(name ==="" || type==="" || name === null || this.hasOwnProperty(name)) continue;
                    Object.defineProperty(this, name, {
                        set: (data:object[]|object) => { 
                            let temp  = this.querySelectorAll(`[slot=${name}]`);
                            // empty all
                            for(let t of temp){
                                this.removeChild(t);
                            }
                            // re-create
                            let array_data = [];
                            if(Array.isArray(data)) array_data = data;
                            else array_data.push(data);
                            for(let obj of array_data){
                                let el = document.createElement(type)
                                el.setAttribute("slot",name);
                                for(let key in obj){
                                    // @ts-ignore  FIXME
                                    if(typeof(el[key]) !== "undefined"){
                                        // @ts-ignore  FIXME
                                        el[key] = obj[key];
                                    }
                                    else {
                                        console.log("EROR: key '",key,"' not assignable to class ", el.tagName); 
                                    }
                                }
                                this.appendChild(el);
                            } 
                        },
                        get: () => { 
                            let temp  = this.querySelectorAll(`[slot=${name}]`); 
                            if(temp.length === 1) return temp[0];
                            else return temp;
                        }
                    });
                }
            }
        }

        ingestData(input:InputData){
            for(let key in input){
                if(typeof(this[key]) !== "undefined"){
                    //@ts-ignore   // FIXME here not the best... would be nice to have typescript recognice keys and their types
                    this[key] = input[key];
                }
                else{
                    console.log("EROR: key '",key,"' not assignable to class ", this.className);
                }
            }
        }

        setRootToChilds(){
            let all = this.swr.querySelectorAll("*");
            for(let el of all){
                // @ts-ignore
                el["root"] = this;
            }
        }
   

        attributeChangedCallback(name:string, oldVal:any, newVal:any) {
            const hasValue = (newVal !== null);
            const updateMe = (!hasValue || oldVal !== newVal);

            if (updateMe && this._props.hasOwnProperty(name)) {
                this.autosetTargetProps(name,newVal);
                if(this['update_'+name] !== undefined) this['update_'+name](newVal);
            }
        }
        
        autosetTargetProps(name:string, newVal:any){
            if(this._autoset.hasOwnProperty(name)){
                for( const [id, prop] of Object.entries(this._autoset[name]) ) {
                    //@ts-ignore
                    if(this.ids.hasOwnProperty(id) && typeof(this.ids[id][prop]) !== "undefined" ){
                        //@ts-ignore
                        this.ids[id][prop] = newVal;
                    }
                }
            }
        }

    };
}
        
}
    
// some shortcuts:
export let dfn = customElements.define.bind(customElements);
export function ifNdef(name:string,cls:any){
    if(!customElements.get(name)) customElements.define(name,cls);

}

