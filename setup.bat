@echo off
cls

echo Installing nodemon -- required for initiating the server.
npm i -g nodemon

cls
echo Installing necessary node modules...

echo Installing `path` module -- required for accessing and interacting with the file system.
npm i path

cls
echo Installing `url` module -- required for understanding what URL is being requested.
npm i url

cls
echo Installing `fs` module -- required for modifying the file system.
npm i fs

cls
echo Installing `querstring` module -- required for parsing form data sent to the server.
npm i querystring

cls
echo Installing `ip` module -- required for retrieving your computer's IP address to host the server.
npm i ip

cls
echo Installing `child_process` module -- required for executing system commands.
npm i child_process

cls
echo Installing `readline` module -- required for getting user input.
npm i readline

cls
echo Installing `crypto` module -- required for encrypting and decrypting credentials.
npm i crypto

cls
echo Installing `uuid` module -- required for creating UUID tokens.
npm i uuid

cls
echo Installing `colors` module -- required for coloring text in terminal.
npm i uuid

cls
echo Installation complete.
pause
cls

start cmd /k cd ./server && cls && nodemon server.js