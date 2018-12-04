 :warning: ```Still in beta.```

# Brick

This is a webcomponent generator, it uses string literals to generate an HTML template and a mixin.
One can then add the mixin (and so the generated template) to the HTMLElement class when extending.

It is inspired by [lit-element](https://github.com/Polymer/lit-element) with one big difference: it **does not include virtual-dom**.
On my opinion web-components do not really need the complexity of a v-dom and there are many effective, light ways out there to exchange/update  data,
for example one could use Events or you can have a look at this repo: [App-State and Data Binding Using Proxy](https://github.com/WebComponentHelpers/ImperaJS).


# What it Does

 - It is **FAST and light**, less than 3kB minified (and 1kB gzip). <!--, try out the [benchmark test comparison with lit-html]().-->
 - Supports **imports of styles** and in general of ```<template>```. Gives a pattern to import shared styles (like a ```normalize```) from templates, cutting on parsing time.
 - Supports **server-side rendering** out of the box, well, web-components do.
 - Supports automatic dom element-ID retrival, **no more shadowRoot.GetElementByID("...")**. 
 - Supports automatic reflection of atributes to properties, but is not intended to exchange rich data (like objects) see [here](https://developers.google.com/web/fundamentals/web-components/best-practices#do-not-reflect-rich-data-properties-to-attributes) for best practices.
 - Light and elegant syntax :rainbow:


# Install

```bash
npm i brick-element
```

#Usage

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
this means that you can add expression into it (similarly to lit-elemet) and the will be executed.

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

Let's create a simple button that when has the attribute disabled cannot be clicked.
To define an intrinsic ID one can use the symbol prefix **#-** in a string before the ID name, like this:

```
let mixin = brick`
	<button ${"#-btn"}> </button>
`;

dfn("button-x",class extends mixin(HTMLElement){
	constructor(){
	    super();
	    this.onclick = this.ids.btn.onclick; 
	}
});

```

Here **ids** is an object that has been automatically attached to ```this``` that will contain as key all objects names whos ID is specified with sintax above.

