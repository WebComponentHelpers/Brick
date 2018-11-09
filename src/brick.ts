
/****************************************************************************************
 *                                    Template generator
 * **************************************************************************************
 * Composes a string literal into a template element.
 * Concatenates placeholder ${ } that contains arrays of string with the text (mainly for <styles> import).
 * Extract config information in placeholders that contains objects: these can be ${{ID:"something"}} or ${{props:[strings]}}.
 * Can also be used as a tag for string literals directly.
 * 
 * Returns an object of the type:  {template: "...", props:["...",...], IDs:["..",...]}
 */


export function litRead(strings:Array<string>, ...keys:Array<any>):object{

    let output : {template: string, props: object, imports: object[], IDs: string[] };
    output = {template: "", props:{}, imports: [], IDs: [] };

    if(strings.length <= keys.length) throw 'litRead impossible error: you got strings >= keys, this is probably a bug.';
    
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
        // it was an evaluated expression, just add it, otherwise if is an ID add to IDs
        if (typeof(key) === 'string'){ 
            if( key[0] === "#") {
                temp_str += ` id="${key.substring(1)}" `;
                output.IDs.push(key.substring(1));
            }
            else temp_str += key;            
        }
        
        if(typeof(key) === 'object') {
            if(Array.isArray(key)) {

                for(let val of key) { 
                    if(typeof(val) === 'string') temp_str += ' ' + val ; 
                    else if( 'tagName' in val && val.tagName === 'TEMPLATE') {
                        output.imports.push(val);
                    }
                    else throw 'litRead supports only Arrays of string or <template>. '
                }
            }
            else if('tagName' in key && key.tagName === 'TEMPLATE'){
                output.imports.push(key);
            }
            else {
                // whitelisting, props should be like:    { key : ['string', 'string'], ... }
                for( let v of Object.values(key)){
                    if(typeof(v) !== 'object' || !(Array.isArray(v)) || !(v.length !== 2) ||
                       typeof(v[0]) !== 'string' || typeof(v[1] !== 'string')) 
                        throw "Supports only object of the type '<template>' or 'litRead-Props'={ key : ['string', 'string'], ... } ";
                }
                output.props = key ; 
            }
        }
                
    });

    output.template = `${temp_str}`;
    return output;
}


export function brick(strings:Array<string>, ...keys:Array<any>) : Function {

    return (BaseClass:any) : any => class extends BaseClass {
        constructor(){
            super();
    
        }
    };
        
}

// - rename tGen as litRead
// - add import of styles trough template
 /// check that skipps array of non strings and that sanitize objetcs
     // add trows

  