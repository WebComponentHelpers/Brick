
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


export function tGen(strings:Array<string>, ...keys:Array<any>):object{
    this.__usage = 'bla bla bla ';

    let output : {template: string, props: object, IDs: string[], error: Boolean, error_message: string};
    output = {template: "", props:{}, IDs: [], error: false, error_message: ""};

    if(strings.length <= keys.length) {
        output.error = true; 
        output.error_message = "Key lenght > than strings length.";
        return output; 
    }
    
    if(strings.length === 1) {
        output.template = `${strings[0]}`;
        return output;
    }

    // from here there is at least one key
    let temp_str = "";
    strings.forEach( (str_val, index)=>{
        temp_str += str_val;
        
        if(index === keys.length) return;

        // cases:
        // it was an evaluated expression, just add it, otherwise if is an ID add to IDs
        if (typeof(keys[index]) === 'string'){ 
            if( keys[index][0] === "#") {
                temp_str += ` id="${keys[index].substring(1)}" `;
                output.IDs.push(keys[index].substring(1));
            }
            else temp_str += keys[index];            
        }
        
        if(typeof(keys[index]) === 'object') {
            if(Array.isArray(keys[index])) {
                for(let val of keys[index]) { 
                    if(typeof(val) === 'string') temp_str += ' ' + val ; 
                }
            }
            else output.props = keys[index] ;         
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

  