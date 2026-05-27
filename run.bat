@echo off

start http://localhost:8080
set DEBUG=app
node index.js

:: If node encounters an error during startup or
:: execution, this input prompt allows you to
:: read the error message returned without the
:: terminal closing prematurely.
::
:: |
:: |
:: V

echo:
set /p input = PRESS ANYTHING TO CLOSE TERMINAL