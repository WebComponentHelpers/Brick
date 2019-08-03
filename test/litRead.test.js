import {litRead} from '../brick-element.js';

document.litRead = litRead;


export default function (){

    describe('litRead', function () {

        describe('simple string (no place holder) as input ', function () {
            let out = litRead`<h1></h1>`;

            it('Sanity check on output types ', function () {
                chai.assert.typeOf(out.template, 'string', 'template type is a string ');
                chai.assert.isArray(out.IDs, 'IDs are array ');
                chai.assert.typeOf(out.props, 'object', 'props is object ');
            });

            it('Sanity check on output value ', function () {
                chai.assert.equal(out.template,'<h1></h1>', 'template ');
                chai.assert.deepEqual(out.IDs, [] , 'IDs is empty ');
                chai.assert.deepEqual(out.imports,[], 'imports is not empty ');
                chai.assert.deepEqual(out.props,{}, 'props is empty ');
            });
        });

        describe('simple string + place holder as input ', function () {
            let style =` 
            <style> 
            h1   {color: blue;}
            </style>`
            let out = litRead`${style} <h1>ciao</h1>`;

            it('Sanity check on output types ', function () {
                chai.assert.typeOf(out.template, 'string', 'template type is a string ');
                chai.assert.isArray(out.IDs, 'IDs are array ');
                chai.assert.typeOf(out.props, 'object', 'props is object ');

            });

            it('Sanity check on output value ', function () {
                chai.assert.equal(out.template,style+' <h1>ciao</h1>', 'template ');
                chai.assert.deepEqual(out.IDs, [] , 'IDs is empty ');
                chai.assert.deepEqual(out.props,{}, 'props is empty ');
                chai.assert.deepEqual(out.imports,[], 'imports is not empty ');

            });
        });

        describe('simple string + array of string as input ', function () {
            let style ='h1   {color: blue;}';
            let style1 ='h2   {color: yellow;}';
            let style2 ='span   {color: red;}';
            let out = litRead`<style>${[style,style1,style2]} </style><h1>ciao</h1>`;

            it('Sanity check on output types ', function () {
                chai.assert.typeOf(out.template, 'string', 'template type is a string ');
                chai.assert.isArray(out.IDs, 'IDs are array ');
                chai.assert.typeOf(out.props, 'object', 'props is object ');
            });

            it('Sanity check on output value ', function () {
                chai.assert.equal(out.template,'<style> '+style+ ' ' +style1+ ' ' + style2+' </style><h1>ciao</h1>', 'template ');
                chai.assert.deepEqual(out.IDs, [] , 'IDs is empty ');
                chai.assert.deepEqual(out.imports,[], 'imports is not empty ');
                chai.assert.deepEqual(out.props,{}, 'props is empty ');
            });
            
            let div = document.createElement('div');
            div.innerHTML = out.template ;
            document.body.appendChild(div);
            it('Insertion in document: string with injected array of styles', function () {
                //  /!\  This wont work if include and additional css file other than just mocha.css
                let rules = document.styleSheets[1].cssRules;
                chai.assert.include(rules[0], {cssText: "h1 { color: blue; }"},'h1 style failed ');
                chai.assert.include(rules[1], {cssText: "h2 { color: yellow; }"},'h2 style failed ');
                chai.assert.include(rules[2], {cssText: "span { color: red; }"},'span style failed ');
                document.body.removeChild(div);

            });

        });


        describe('Two IDs as input ',()=>{
            let out = litRead`<h1 ${'#-bella'}></h1> <span ${'#-ciao'}> </span>`;

            it('sanity check on output types ',()=>{
                chai.assert.typeOf(out.template, 'string', 'template type is a string ');
                chai.assert.isArray(out.IDs, 'IDs are array ');
                chai.assert.typeOf(out.props, 'object', 'props is object ');
            });
            
            it('Sanity check on output value ', function () {
                chai.assert.equal(out.template,'<h1  id="bella" ></h1> <span  id="ciao" > </span>', 'template ');
                chai.assert.deepEqual(out.IDs, ["bella","ciao"] , 'IDs has two strings ');
                chai.assert.deepEqual(out.imports,[], 'imports is empty ');
                chai.assert.deepEqual(out.props,{}, 'props is empty ');
            });
        });
        
        describe('Imports as input', () => {
            let temp = document.createElement('template');
            temp.innerHTML = '<h2>ciao<h2>';
            let out = litRead`<h1 ${temp}></h1>`;
            let test = document.createElement('template');
            test.innerHTML = '<h2>ciao<h2>';
            let out_list = litRead`${[temp,test]} <h1></h1>`;
            let test2 = document.createElement('template');
            test2.innerHTML = '<h2>ciao<h2>';


            it('Sanity check on output values', function (){
                chai.assert.equal(out.template,'<h1 ></h1>', 'template ');
                chai.assert.deepEqual(out.IDs, [] , 'IDs is empty ');
                chai.assert.deepEqual(out.imports, [test], 'imports ');
                chai.assert.deepEqual(out.props,{}, 'props is empty ');
            });

            it('List of imports',()=>{
                chai.assert.equal(out_list.template,' <h1></h1>', 'template ');
                chai.assert.deepEqual(out_list.IDs, [] , 'IDs is empty ');
                chai.assert.deepEqual(out_list.imports, [temp,test2], 'imports ');
                chai.assert.deepEqual(out_list.props,{}, 'props is empty ');
            });
        });
        describe('Props', ()=>{
            it('Sanity check on values', ()=>{
                let out0 = litRead`<h1></h1> 
                ${'|*ciao*|'}`;
               let out1 = litRead`<h1></h1> 
                ${'|* ciao -b *|'}`;
                let out2 = litRead`<h1></h1> 
                ${'|* ciao | zuzzo -b | peppo *|'}`;
                let out3 = litRead`<h1></h1> 
                ${`|* ciao 
                   | zuzzo - b 
                   | peppo *|`}`;

                
                chai.assert.deepEqual(out0.props, {'ciao':'string'}, 'prop fail identity string' );
                chai.assert.deepEqual(out1.props, {'ciao':'bool'}, 'prop fail identity bool' );
                chai.assert.deepEqual(out2.props,{'ciao': 'string',zuzzo : 'bool',peppo :'string'} , 'prop complex fail identity' );
                chai.assert.deepEqual(out3.props,{'ciao': 'string',zuzzo : 'bool',peppo :'string'} , 'prop multiline fail identity' );
                chai.assert.deepEqual(out2.template, '<h1></h1> \n                ', 'template' );
                chai.assert.deepEqual(out2.IDs, [], 'IDs must be empty' );
                chai.assert.deepEqual(out2.imports, [], 'imports must be empty' );

            });
        });

        describe('Throw', ()=>{
            function number0(){ let b = litRead`<h1> ${9} </h1>`; }
            function number1(){ let b = litRead`<h1> ${[9,8,9]} </h1>`; }
            function of_function(){ let c = litRead`bla ${()=>{console.log('fake function');}}`;}
            function of_function2(){ let c = litRead`bla ${["ciao",number1]}`;}

            it('case of number and list of numbers', ()=>{
                chai.assert.doesNotThrow(number0);
                chai.assert.throws(number1);
            });
 
            it('case of placeholder with function', ()=>{
                chai.assert.throw(of_function, "Invalid input.");
                chai.assert.throw(of_function2, "Invalid input.");
            });

            it('case of object that is not a template', ()=>{
                let obj0 = document.createElement('h1');
                let func_obj0 = ()=>{ let a = litRead`${obj0} ciao `;} 
                let func_obj2 = ()=>{ let z = litRead`${["ciao",obj0]} ciao `;} 
                let func_obj3 = ()=>{ let z = litRead`${{ciao:true}} ciao `;} 
                let func_obj4 = ()=>{ let z = litRead`${{ciao:[7,true]}} ciao `;} 
                let func_obj5 = ()=>{ let z = litRead`${{ciao:[" string",true]}} ciao `;} 
                let func_obj7 = ()=>{ let z = litRead`${{ciao: undefined}} ciao `;} 
                let func_obj8 = ()=>{ let z = litRead`${{ciao: 'polo'}} ciao `;} 
                let func_obj6 = ()=>{ let z = litRead`${{ciao:["object","true"]}} ciao `;} 

                chai.assert.throw(func_obj2,"Invalid input.");
                chai.assert.throw(func_obj0,"Invalid input.");
                chai.assert.throw(func_obj3,"Invalid input.");
                chai.assert.throw(func_obj4,"Invalid input.");
                chai.assert.throw(func_obj5,"Invalid input.");
                chai.assert.throw(func_obj6,"Invalid input.");
                chai.assert.throw(func_obj7,"Invalid input.");
                chai.assert.throw(func_obj8,"Invalid input.");
            });  
        });
        describe('Generic input', ()=>{
            it('sanity check on value, all work in armony',()=>{
                let temp = document.createElement('template');
                let out0 = litRead`
                <h1>${'ciao'}</h1> ${""}
                <h2${'#-cocco'}> </h2>
                ${temp}
                ${'|* ciao *|'}`;

                let str = '\n                <h1>ciao</h1> \n                <h2 id="cocco" > </h2>\n                \n                ';
                chai.assert.equal(out0.template, str,'template');
                chai.assert.deepEqual(out0.IDs, ["cocco"],'IDs');
                chai.assert.deepEqual(out0.props, {ciao:'string'},'props');
                chai.assert.deepEqual(out0.imports, [temp],'props');

            });
        });


        describe('Performance',()=>{
            it('performs 1 cycle in < 3 mus',()=>{
                let temp = document.createElement('template');
                let n_cycles = 100000;
                let start = performance.now();
                for(let k=0 ; k< n_cycles; k++){
                    let out0 = litRead`
                    <h1>${'ciao'}</h1> ${""}
                    <h2${'#-cocco'}> </h2>
                    ${temp}
                    ${'|* ciao *|'}`;
                }
                let tot = performance.now() - start;
                chai.assert.isBelow( tot / n_cycles * 1000 , 3, 'time larger than expected');
                console.log('performs '+ n_cycles + ' in ' + tot + ' ms');
            });
        });
        
    });
    
}