import {brick} from '../build/brick.js'



export default function (){

    describe('Brick',()=>{

        describe('Performance',()=>{
            it('one cycle in less than ...',()=>{

                let str =`<style> div{color:blue;} span{color:blue;} h1{color:blue;} h2{color:red;} h3{color:blue;} </style>`;
                
                let mixin = brick`
                                ${str}                
                                <h1>${'ciao'}</h1> ${""}
                                <h2${'#cocco'}> Ciao</h2>
                                <h1>ciao</h1>
                                ${{
                                    'ciao': 'string'
                                }}`;

                customElements.define('test-element',class extends mixin(HTMLElement){});
                
                let start = performance.now();
                let n_cycles = 1000;
                for (let i =0 ; i < n_cycles; i++){

                    let te = document.createElement('test-element');
                      document.body.appendChild(te);
                }
                let tot  = performance.now() - start;
                chai.assert.isBelow(tot / n_cycles * 1000, 10, "too slow");
            });
        });
    });
}