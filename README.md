 :warning: ```Still experimental```

# Brick

This is a webcomponent generator, it uses string literals to generate an HTML template and a mixin.
One can then add the mixin (and so the generated template) to the HTMLElement class when extending.

It is inspired by [lit-element]() with one big difference: it **does not include virtual-dom**.
By the way, have you ever tought that you probably don't need v-dom on web-components? 
Have a look at this repo for example: [App-State and Data Binding Using DOM Events](https://github.com/WebComponentHelpers/StateElement).


# what it does

 - it is FAST, being less than 3Kb minified (and 1Kb gzip) it is as fast as web-component instantiation can be,
here a benchmark test comparison with lit-html [TRY IT OUT]().
 - It has a light and elegant syntax... Well... at least I like it ;)
 - It supports <template> imports. One of the main use cases for this is the **imports of styles**. Gives a pattern to import shared
styles from templates, cutting on parsing time.
 - Supports automatic dom element-ID retrival, so that **you don't have to write ever again** shadowRoot.GetElementByID("..."). 
 - Supports automatic reflection of html-attribute to properties. But who doesn't these days...


# Code Examples


