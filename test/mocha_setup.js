import  "../node_modules/chai/chai.js"; //https://unpkg.com/chai/chai.js";
import   "../node_modules/mocha/mocha.js";  //'https://unpkg.com/mocha@5.2.0/mocha.js';

// here do the asserts imports
import litRead_asserts from './litRead.test.js';

mocha.setup('bdd');

// here run asserts
litRead_asserts();

mocha.checkLeaks();
mocha.run();
