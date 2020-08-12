import {brick} from '../brick-element.js'


export default function (){

    let counter = 0;
    let attr_value = 'default';
    let style = document.createElement('template');
    style.innerHTML=`<style> h1{color:blue;} h2{color:red;} h3{color:green;} </style>`;
    let h1 = document.createElement('template');
    h1.innerHTML=`<h1> test </h1>`;
    let h2 = document.createElement('template');
    h2.innerHTML=`<h2> smaller test </h2>`;
    
    let mixin = brick`<h3>${'ciao'}</h3> ${""}
                    <h4${'#-cocco'}> Ciao</h4>
                    <h5${'#-hey'}>ciao</h5>
                    <h5${'#-bella | innerText=updatable '}>ciao</h5>

                    ${style} 
                    ${[h1,h2]}
                    ${'|* updatable | not_updatable *|'} `;

    customElements.define('test-element',class extends mixin(HTMLElement){
        update_updatable(newval){
            attr_value = newval;
            counter++;
        }
        
    });

    let el = document.createElement('test-element');

    describe('Brick',()=>{

        describe('ShadowDom',()=>{
            it('Has shadowdom well defined and all elements appears in right order',()=>{
                chai.assert.equal(el.tagName, 'TEST-ELEMENT', 'wrong tag name');
                chai.assert.equal(el.shadowRoot.mode, "open", 'has shadow dom');
                chai.assert.equal(el.shadowRoot.firstChild.tagName, "STYLE", 'correctfirst child');
                chai.assert.include(el.shadowRoot.children[0], { tagName:"STYLE"},  'child 0 fail');
                chai.assert.include(el.shadowRoot.children[1], { tagName:"H1"},  'child 1 fail');
                chai.assert.include(el.shadowRoot.children[2], { tagName:"H2"},  'child 2 fail');
                chai.assert.include(el.shadowRoot.children[3], { tagName:"H3"},  'child 3 fail');
                chai.assert.include(el.shadowRoot.children[4], { tagName:"H4", id:"cocco"},  'child 4 fail');
                chai.assert.include(el.shadowRoot.children[5], { tagName:"H5", id:'hey'},  'child 5 fail');
                chai.assert.include(el.shadowRoot.children[6], { tagName:"H5", id:'bella'},  'child 6 fail');
                chai.assert.equal(el.shadowRoot.children.length,7 ,  'elements number differ');

                chai.assert.property(el,"swr", 'has shortcut for shadow');
                chai.assert.property(el,"qs", 'has shortcut for query selector');
                chai.assert.property(el,"ids", 'has shortcut for ids');
            }); 
        });

        describe('IDs',()=>{
            it('has ID quick reference well defined, and no more no less than 3.',()=>{
                chai.assert.include(el.ids.cocco, {tagName:'H4', id:"cocco"}, 'ID reference 1 ok');
                chai.assert.include(el.ids.hey, {tagName:'H5', id:"hey"}, 'ID reference 2 ok');
                chai.assert.include(el.ids.bella, {tagName:'H5', id:"bella"}, 'ID reference 3 ok');
                chai.assert.equal(Object.keys(el.ids).length, 3, 'only 3 IDs no more, no less');
            });
            
        });

        describe('Attribute',()=>{
            it('Has the properties',()=>{
                chai.assert.property(el, 'updatable', 'has updatable attibute');
                chai.assert.property(el, 'not_updatable', 'has not_updatable attribute');
                chai.assert.isNull(el.updatable,'at this point property must be null');
                chai.assert.isNull(el.not_updatable,'at this point property must be null');
            });

            it('Reflects properties value correctly, from JS and HTML and autoset.',()=>{
                chai.assert.equal(attr_value,'default', 'the attr on change has not been called.');
                chai.assert.equal(counter, 0, 'attribute change has not been called.');
                el.setAttribute('updatable','uhmmm');
                chai.assert.equal(el.updatable,'uhmmm', 'the attr reflect to property.');
                chai.assert.equal(attr_value,'uhmmm', 'the attr on change has been called.');
                chai.assert.equal(counter, 1, 'attribute change has been called only once');
                chai.assert.isNull(el.not_updatable,'This must stillbe null.');
                chai.assert.equal(el.ids.bella.innerText,'uhmmm','Autoset attribute must be set');
                
                el.setAttribute('not_updatable','test');
                chai.assert.equal(el.not_updatable,'test', 'the attr reflect to property.');
                chai.assert.equal(el.updatable,'uhmmm', 'the attr reflect to property.');
                chai.assert.equal(attr_value,'uhmmm', 'the attr on change has been called.');
                chai.assert.equal(counter, 1, 'attribute change has been called only once');
                chai.assert.equal(el.ids.bella.innerText,'uhmmm','Autoset attribute must be set');
                el.updatable = 'second';
                chai.assert.equal(el.updatable,'second', 'the attr reflect to property.');
                chai.assert.equal(attr_value,'second', 'the attr on change has been called.');
                chai.assert.equal(counter, 2, 'attribute change has been called for second time');
                chai.assert.equal(el.not_updatable,'test', 'the attr reflect to property.');
                chai.assert.equal(el.ids.bella.innerText,'second','Autoset attribute must be set');
                el.removeAttribute('updatable');
                chai.assert.isNull(el.updatable,'the attr has been remover.');
                chai.assert.isNull(attr_value,'the attr on change has been called on remove attr.');
                chai.assert.equal(counter, 3, 'attribute change has been called for third time');
                chai.assert.equal(el.ids.bella.innerText,'','Autoset attribute must be set');
                chai.assert.equal(el.not_updatable,'test', 'the attr reflect to property.');
            });
            it('Runs the autoset properly on attribute',()=>{

            });

        });

        localStorage.clear();
        let mxn_ab = brick`
            <h1>
                <slot></slot>
            </h1>
            ${"|*nice_prop*|"}
        `;
        class tstCustom extends mxn_ab(HTMLElement){}
        customElements.define('test-custom1', tstCustom);
        let mxn_ab2 = brick`
            ${"|*nice_prop2*|"}
        `;
        class PreposteRous extends mxn_ab2(tstCustom,{inherit:true}){}
        customElements.define('test-custom',PreposteRous);

        let mixin_s = brick`
                    <h1>
                        <slot name="test"></slot>
                    </h1>
                    <h2>
                        <slot></slot>
                    </h2>
                    <h3>
                        <slot name="s_test" type="span"></slot>
                        <slot name="s_custom" type="test-custom"></slot>
                    </h3>
                    ${"|* goya *|"}
            `;
            customElements.define('test-slot',class extends mixin_s(HTMLElement){});
            

        describe('Slots',()=>{
            let slot_test = document.createElement("test-slot");

            let el0 = document.createElement("span");
            el0.innerText = "zero"; el0.setAttribute("slot","test");
            let el1 = document.createElement("span");
            el1.innerText = "one";
            let el2 = document.createElement("span");
            el2.innerText = "two"; el2.setAttribute("slot","s_test");
            slot_test.appendChild(el0);
            slot_test.appendChild(el1);
            slot_test.appendChild(el2);
            
            it('Reflect only slots that have type',()=>{
                chai.assert.property(slot_test,"s_test", "does not have property");
                chai.assert.equal(Array.isArray(slot_test.s_test),false,"Does not contain ONLY 1 slot element");
                chai.assert.include(slot_test.s_test, {tagName:"SPAN",innerText:"two"}, "is not a span");
            });
            it('Set value to slot',()=>{
                slot_test.s_test = {innerText:"amaizing"};
                chai.assert.include(slot_test.s_test, {tagName:"SPAN",innerText:"amaizing"}, "Did not set value");
                
                slot_test.s_test = [{innerText:"amaizing"},{innerText:"spiderman"}];
                chai.assert.equal(slot_test.s_test.length, 2, "Not Two items in list");
                chai.assert.include(slot_test.s_test[0], {tagName:"SPAN",innerText:"amaizing"}, "Did not set value for list");
                chai.assert.include(slot_test.s_test[1], {tagName:"SPAN",innerText:"spiderman"}, "Did not set value for list 2");
            });
        });

        describe('Data ingestion',()=>{
            it('Ingest data properly to attribute',()=>{
                let slot_test = document.createElement("test-slot");

                let dat = {goya:"ciao"};
                slot_test.ingestData(dat);
                chai.assert.equal(slot_test.goya,'ciao', "does not set attribute");
            });

            it('Ingest data to slots',()=>{
                let slot_test = document.createElement("test-slot");

                let dat = {s_test:[{innerText:"amaizing1"},{innerText:"spiderman1"}]};
                slot_test.ingestData(dat);
                chai.assert.equal(slot_test.s_test.length, 2, "Not Two items in list");
                chai.assert.include(slot_test.s_test[0], {tagName:"SPAN",innerText:"amaizing1"}, "Did not set value for list");
                chai.assert.include(slot_test.s_test[1], {tagName:"SPAN",innerText:"spiderman1"}, "Did not set value for list 2");
            });
            it('Ingest to all',()=>{
                let slot_test = document.createElement("test-slot");

                let dat = {s_test:{innerText:"amaizing3"},goya:"medusa" };
                slot_test.ingestData(dat);
                chai.assert.equal(slot_test.goya,'medusa', "does not set attribute");
                chai.assert.include(slot_test.s_test, {tagName:"SPAN",innerText:"amaizing3"}, "Did not set value");
            });
            it('Slot type is custom-element',()=>{
                let slot_test = document.createElement("test-slot");

                let dat = {s_custom:[{innerText:"amaizing3", nice_prop:"bella"}]};
                slot_test.ingestData(dat);
                chai.assert.equal(slot_test.s_custom.nice_prop,'bella', "does not set attribute");
                chai.assert.include(slot_test.s_custom, {tagName:"TEST-CUSTOM",innerText:"amaizing3"}, "Did not set value");
            });
        });
        describe('Inheritance',()=>{

            let mxn_parent = brick`<h1>Hello</h1>
                ${'|* parentprop *|'}
            `;

            let mxn_child = brick`<h2>World</h2>
                ${'|* childprop *|'}
            `;

            class parent extends mxn_parent(HTMLElement){}
            class child extends mxn_child(parent,{inherit:true}){
                constructor(){
                    super();
                    this.updated_parent_prop = false;
                    this.updated_child_prop = false;
                }
                update_parentprop(val){
                    this.updated_parent_prop = true;
                }
                update_childprop(val){
                    this.updated_child_prop = true;
                }
            }

            customElements.define('parent-element', parent);
            customElements.define('child-element', child);

            let el_child = document.createElement("child-element");

            it('Child has attribute-property reflection of parent',()=>{
                chai.assert.equal(el_child.hasOwnProperty("parentprop"), true, "parentprop missing in child")
                chai.assert.equal(el_child.parentprop, null, "parent property-attribute is not reflected in child, wrong value");
                el_child.setAttribute("parentprop","hey");
                chai.assert.equal(el_child.parentprop, "hey", "parent property-attribute is not reflected in child, wrong value");
            });
            it('Child has own attribute-property reflection',()=>{
                chai.assert.equal(el_child.hasOwnProperty("childprop"), true, "childprop missing in child")
                chai.assert.equal(el_child.childprop, null, "child property-attribute is not reflected in child, wrong value");
                el_child.setAttribute("childprop","hey");
                chai.assert.equal(el_child.childprop, "hey", "child property-attribute is not reflected in child, wrong value");

            });

            it('Child has template of parent and appended his own',()=>{
                chai.assert.include(el_child.shadowRoot.children[0], { tagName:"H1"},  'parent template not there');
                chai.assert.include(el_child.shadowRoot.children[1], { tagName:"H2"},  'child template not there');
                chai.assert.equal(el_child.shadowRoot.children.length,2,"too many elements");
            });

            it('Observes parent and child props and run the on_update function',()=>{
                chai.assert.equal(el_child.updated_child_prop, true, "update child prop function not called");
                chai.assert.equal(el_child.updated_parent_prop, true,"update parent prop function not called");
            });
        
        });

        describe('Performance',()=>{
            it('one cycle in less than 75mus',()=>{
                
                let start = performance.now();
                let n_cycles = 1000;
                for (let i =0 ; i < n_cycles; i++){

                    let te = document.createElement('test-element');
                    // document.body.appendChild(te);
                }
                let te = document.createElement('test-element');
                    // document.body.appendChild(te);
                    // document.te= te;
                
                let tot  = performance.now() - start;
                chai.assert.isBelow(tot / n_cycles * 1000, 75, "too slow");
            });
        });
    });
}