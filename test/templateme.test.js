import {templateme} from '../build/brick.js';

document.templateme = templateme;


export default function (){

    describe('templateme',()=>{
        describe('performance',()=>{

            it('performs 1 cycle in less than 25 mus',()=>{
                let n_cycles = 10000;
                let temp = document.createElement('template');
                //temp.innerHTML=`<style> .div{color:blue;} </style>`;
                let start = performance.now();
                for(let k=0; k < n_cycles; k++){
                    let template = templateme`<h1>${'ciao'}</h1> ${""}
                                <h2${'#cocco'}> </h2>
                                ${temp}
                                ${{
                                    'ciao': 'string'
                                }}`;
                }
                let tot = performance.now() - start;
                chai.assert.isBelow(tot / n_cycles *1000, 25, 'takes too much time');
            });
        });
    });
}
