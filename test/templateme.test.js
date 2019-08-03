import {templateme} from '../brick-element.js';

document.templateme = templateme;


export default function (){

    describe('templateme',()=>{

        describe('Ouput Validation',()=>{
            it('correct output',()=>{
                let temp = document.createElement('template');
                temp.innerHTML=`<style> div{color:blue;} span{color:blue;} h1{color:blue;} h2{color:blue;} h3{color:blue;} </style>`;
                
                let template = templateme`<h1>${'ciao'}</h1> ${""} <h2${'#-cocco'}> </h2> <h1>ciao</h1> ${temp} ${'|*ciao*|'}`;
                let innerhtml = `<h1>ciao</h1>  <h2 id="cocco"> </h2> <h1>ciao</h1>  `;
                                 
                chai.assert.equal(template.innerHTML,innerhtml, 'inner html');

            });
        });
        describe('performance',()=>{

            it('performs 1 cycle in less than 30 mus',()=>{
                let n_cycles = 10000;
                let temp = document.createElement('template');
                temp.innerHTML=`<style> 
                .div{color:blue;} .span{color:blue;} .h1{color:blue;} .h2{color:blue;} .h3{color:blue;} 
                </style>

                `;
                let start = performance.now();
                for(let k=0; k < n_cycles; k++){
                    let template = templateme`<h1>${'ciao'}</h1> ${""}
                                <h2${'#-cocco'}> </h2>
                                <h1>ciao</h1>
                                ${temp}                
                                ${'|*ciao*|'}`;
                }
                let tot = performance.now() - start;
                chai.assert.isBelow(tot / n_cycles *1000, 30, 'takes too much time');
            });

        });
    });
}
