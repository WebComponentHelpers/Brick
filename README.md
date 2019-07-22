# Brick

This is a webcomponent generator, it uses string literals to generate an HTML template and a mixin.
One can then add the mixin (and so the generated template) to the HTMLElement class when extending.

It is inspired by [lit-element](https://github.com/Polymer/lit-element) with one big difference: it **does not include virtual-dom**.
It is thus very lightweight. Web-components do not really need the complexity of a v-dom and there are other effective, light ways soulution to exchange/update  data,
for example one could use Events or you can have a look at this repo: [App-State and Data Binding Using Proxy](https://github.com/WebComponentHelpers/ImperaJS).


# What it Does

 - It is **FAST and light**, less than 3kB minified (and 1kB gzip). <!--, try out the [benchmark test comparison with lit-html]().-->
 - Supports **imports of styles** and in general of ```<template>```. Gives a pattern to import shared styles (like a ```normalize```) from templates, cutting on parsing time.
 - Supports **server-side rendering** out of the box, as opposed to lit-element (where because of interaction between elements is usually needed to incapsulate custom-elements one inside the other).
 - Supports automatic dom element-ID retrival, **no more shadowRoot.GetElementByID("...")**. 
 - Supports automatic reflection of atributes to properties, but is not intended to exchange rich data (like objects) see [here](https://developers.google.com/web/fundamentals/web-components/best-practices#do-not-reflect-rich-data-properties-to-attributes) for best practices.
 - Light and elegant syntax :rainbow:


# Install

```bash
npm i brick-element
```


## Import it in your code

If you are using a builder like webpack then you can import it like below.

```javascript
import {brick, templateme, dfn} from "brick-element"  

// brick - is a mixins generator
// templateme - is a template generator
// dfn - is a shortcut for customElements.define function

```

Otherwise need to give the full path.

## Define your element

```javascript
let mixin = brick`
	<h1> Hello World </h1>
`;

customElements.define("hello-x",class extends mixin(HTMLElement){});
// or same would be:
// dfn("hello-x",class extends mixin(HTMLElement){});

```

Now this is [tagged literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals), 
this means that you can add expression into it (similarly to lit-elemet) and they will be executed.

**Brick supports:** ```number, string, array of strings and <template>``` as input placeholders like this:
```javascript

let world = "World";
let  arr = ["Hello","World"];


let mixin = brick`
        <h1> Hello ${world} </h1>
	<h1> ${arr} </h1>
	${template_previosly_defined}
`;
```

## Automatic ID assignment to shadowRoot

To define an intrinsic ID one can use the symbol prefix **#-** in a string before the ID name, like this:

```javascript
let mixin = brick`
	<button ${"#-btn"}> </button>
`;

dfn("button-x",class extends mixin(HTMLElement){
	constructor(){
	    super();
	    this.ids.btn.onclick = this.my_onclick_function; 
	}
});

```

Here **ids** is an object that has been automatically attached to ```this``` that will contain as key all objects names whose ID is specified as above.

## Automatic reflection of atributes to properties

A list of attribute can be defined to be reflected to object property. You can  add a string containing this list anywhere in the template tag. 
This list of attribute string must follow a special formatting: **"|*"** to start the list, **"*|"** when the list is finished and **"|"** to separate items,
like shown below. This will add a property to the custom-element that has the same name as specified in the item list. Also, when the attribute 
is changed from HTML, or the property is changed from JS, a method is fired (if defined by you) for that specific attribute name, the function name
is by convention the attribute name prefixed by the word "update_" as for example: **update_attributeName**. 
If this function is not the defined then this call is ignored.

```html

let mixin = brick`
	<style>
		:host[red] > button { /* once the attribute red is added to the element*/
			background-color:red;
		}
		:host[green] > button { /* once the attribute red is added to the element*/
			background-color:green;
		}
	</style>
	<button ${"#-btn"}> </button>

	${"|* red | green *|"} <!-- Attributes names definition -->
`;
```
```javascript
dfn("button-x",class extends mixin(HTMLElement){
	
	update_red(new_value){
		console.log("Attribute 'red' has changed");
	}
}
```

## Template generation helper

**templateme** is a template generator via tagged literals, it uses the same syntax of **brick**, so it supports automatic ID assignment and 
attribute to property reflection. It creates automatically a template with the defined content and adds it to the document. Once this template 
is included into a brick-element then all the properties and attribute will be forwarded to it. This is usefull to share styles like a normalize for example.

```javascript
//defining the template
let template = templateme`
	<button ${"#-btn"}> </button>
`;

//adding the template to a brick element
let mixin = brick`
	${template}
`;
```
