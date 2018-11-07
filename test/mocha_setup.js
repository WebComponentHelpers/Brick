import  "https://unpkg.com/chai/chai.js";
import  'https://unpkg.com/mocha@5.2.0/mocha.js';

// here do the asserts imports
import brick_asserts from './brick.test.js';

mocha.setup('bdd');

// here run asserts
brick_asserts();

mocha.checkLeaks();
mocha.run();
