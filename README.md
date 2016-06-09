# testing-inversify-express-utils

Showing async issue with https://github.com/inversify/inversify-express-utils

Howto demonstrate:
Run:
* git clone git@github.com:m-abs/testing-inversify-express-utils.git
* cd testing-inversify-express-utils && npm i
* npm start &
* curl http://localhost:3000/async

Service have now crashed with a: *Error: Can't set headers after they are sent.*
