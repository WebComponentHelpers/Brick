import  "../node_modules/chai/chai.js"; //https://unpkg.com/chai/chai.js";
import   "../node_modules/mocha/mocha.js";  //'https://unpkg.com/mocha@5.2.0/mocha.js';

// here do the asserts imports
import litRead_asserts from './litRead.test.js';
import templateme_asserts from './templateme.test.js';
import brick_asserts from './brick.test.js';

mocha.setup('bdd');

// here run asserts
 litRead_asserts();
 templateme_asserts();
 brick_asserts();

mocha.checkLeaks();
mocha.run();
