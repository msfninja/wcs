@echo off
cls

echo Installing nodemon -- required for initiating the server.
echo
npm i -g nodemon

echo
echo Installing necessary node modules...

echo Installing `path` module -- required for accessing and interacting with the file system.
echo
npm i path

echo
echo Installing `url` module -- required for understanding what URL is being requested.
echo
npm i url

echo
echo Installing `fs` module -- required for modifying the file system.
echo
npm i fs

echo
echo Installing `querstring` module -- required for parsing form data sent to the server.
echo
npm i querystring

echo
echo Installing `ip` module -- required for retrieving your computer's IP address to host the server.
echo
npm i ip

echo
echo Installing `child_process` module -- required for executing system commands.
echo
npm i child_process

echo
echo Installing `readline` module -- required for getting user input.
echo
npm i readline

echo
echo Installing `crypto` module -- required for encrypting and decrypting credentials.
echo
npm i crypto

echo
echo Installing `uuid` module -- required for creating UUID tokens.
echo
npm i uuid

cls
echo Installation complete.
echo
pause
cls

start cmd /k cd ./server && cls && nodemon server.js