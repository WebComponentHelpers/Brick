 :warning: ```Still experimental```

# Brick

This is a webcomponent generator, it uses string literals to generate an HTML template and a mixin.
One can then add the mixin (and so the generated template) to the HTMLElement class when extending.

It is inspired by [lit-element]() with one big difference: it **does not include virtual-dom**.
Have you ever tought that maybe you don't need v-dom on web-components? 
Have a look at this repo for example: [App-State and Data Binding Using DOM Events](https://github.com/WebComponentHelpers/StateElement).


# What it Does

 - It is **FAST and light**, less than 3kB minified (and 1kB gzip), try out the [benchmark test comparison with lit-html]().
 - Supports **imports of styles** and in general of ```<template>```. Gives a pattern to import shared styles from templates, cutting on parsing time.
 - Supports **server-side rendering** out of the box. Happens, when one doesn't enforce webcomponents to look like a matrioska.
 - Supports automatic dom element-ID retrival, **no more shadowRoot.GetElementByID("...")**. 
 - Supports automatic reflection of atributes to properties. But really, who doesn't these days...
 - Light and elegant syntax :rainbow:


# Usage




