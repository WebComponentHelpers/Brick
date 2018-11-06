
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

 // FIXME put declaration of 'output' non mi ricordo come si fa'... [""] <- creano oggetti con liste piene!
export function tGen(strings:Array<string>, ...keys:Array<any>):object{
    
    let output = {template:"", props: [""], IDs: [""], error: false, error_message: ""};

    if(strings.length <= keys.length) {
        output.error = true; 
        output.error_message = "Key lenght > than strings length.";
        return output; 
    }
    
    if(strings.length === 1) {
        output.template = `<template> ${strings[0]} </template>`;
        return output;
    }

    // from here there is at least one key
    let temp_str = "";
    strings.forEach( (str_val, index)=>{
        temp_str += str_val;
        
        if(index === keys.length) return;

        // cases:
        // it was an evaluated expression, just add it
        if (typeof(keys[index]) === 'string') temp_str += keys[index];
        
        if(typeof(keys[index]) === 'object') {
            
            if(Array.isArray(keys[index])) for(let val of keys[index]) { if(typeof(val) === 'string') temp_str += val; }
            else {
                if(keys[index].hasOwnProperty('props'))
                    output.props.push(keys[index].props);
                
                else if(keys[index].hasOwnProperty('id') && typeof(keys[index].id) ==='string' ) {
                    temp_str += ` id="${keys[index].id}" `;
                    output.IDs.push(keys[index].id);
                }
            }
        }
            
    });

    output.template = `<template> ${temp_str} </template>`;
    return output;
}


export function brick(strings:Array<string>, ...keys:Array<any>) : Function {

    return BaseClass  => class extends BaseClass {
        constructor(){
            super();
    
        }
    };
        
}



  