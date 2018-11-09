import {litRead} from '../build/brick.js';



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
            let out = litRead`<h1 ${'#bella'}></h1> <span ${'#ciao'}> </span>`;

            it('sanity check on output types ',()=>{
                chai.assert.typeOf(out.template, 'string', 'template type is a string ');
                chai.assert.isArray(out.IDs, 'IDs are array ');
                chai.assert.typeOf(out.props, 'object', 'props is object ');
            });
            
            it('Sanity check on output value ', function () {
                chai.assert.equal(out.template,'<h1  id="bella" ></h1> <span  id="ciao" > </span>', 'template ');
                chai.assert.deepEqual(out.IDs, ["bella","ciao"] , 'IDs has two strings ');
                chai.assert.deepEqual(out.props,{}, 'props is empty ');
            });
        });
    });
    
    
    
}