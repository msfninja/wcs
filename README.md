# WCS | Windows Control Server

WCS, or Windows Control Server, is a tool that allows you to perform certain tasks on your Windows PC remotely from another device. So far the tool offers only features related to shutting or turning the machine off in a number of ways, accessing and modifying the file system and launching certain applications.

The tool itself represents a server that runs on the machine that you want to be able to perform certain tasks on, and a web client that you can access from any device on your LAN or worldwide if you configure your router's NAT with your ISP.

The web client is a regular frontend, with Sass code which is compiled into native CSS code on the server side (the Sass code comes precompiled with the project). The web client is also protected with a 4 to 8 digit PIN-code that you configure when setting up the server for the first time. The PIN-code is required on every request made to the server in order to access the control panel from where you can perform the tasks. The PIN-code is stored on the server encrypted using the AES 256 bit encryption algorithm.

The web client control panel has a set of buttons each designated to perform a specific task. Upon clicking on a button, an AJAX request is being made to the server. Based on what task you chose to perform a request will be made to the task-specific-URL.

Upon receiving a request to the task-specific-URL, the server will execute a batch file containing the relevant commands for the task.

All batch files can be found in the `\batch` directory, each file given the semantically relevant name.

The server is written in Node.js, meaning the machine the server will be run on must have Node.js installed. There are also specific modules that are required for running the server, but those can be installed by running the `setup.bat` file which is located in the root directory of the project.

<table>
	<tr>
		<th>Table of Contents</th>
	</tr>
	<tr>
		<td>
			<ol>
				<li>[Installing Git](#installing-git)</li>
				<li>[Installing Node.js](#installing-nodejs)</li>
				<li>[Installing required modules](#installing-required-modules)</li>
				<li>[Cloning the repository](#cloning-the-repository)</li>
				<li>[Initiating the server](#initiating-the-server)</li>
				<li>[Configuring the server](#configuring-the-server)</li>
				<ol>
					<li>[Changing the port](#changing-the-port)</li>
					<li>[Setting a new PIN-code (and port)](#setting-a-new-pincode-and-port)</li>
				</ol>
				<li>[Adding new tasks](#adding-new-tasks)</li>
				<li>[Compiling the Sass code](#compiling-the-sass-code)</li>
			</ol>
		</td>
	</tr>
</table>

## Installing Git

You will be needing Git to clone this repository to your machine. You can download and install Git from their official website [here](https://git-scm.com/download/win).

## Installing Node.js

As mentioned, the server is written in Node.js, requiring its presence on the machine. You can download and install Node.js from their official website [here](https://nodejs.org/en/download/).

## Installing required modules

Some modules do not come preinstalled with Node.js (of which I noticed are the `ip` and `uuid` modules). You can install all modules that the server uses by running the `setup.bat` file in the root directory of the project. The `setup.bat` file will also install `nodemon`, a handy tool that automates the process of manually restarting the server upon file changes.

## Cloning the repository

To clone the repository to your machine, go to the directory you wish to clone it to in your terminal, and run the following command:

```bat
git clone https://github.com/msfninja/wcs.git
```

This will clone the WCS repository to your machine. You can access the WCS directory from your terminal or explorer.

## Initiating the server

The server CLI is initiated by going to the `\server` directory in your terminal, and running the following command:

```bat
nodemon server.js
```

This will start the server CLI, but not make the HTTP server itself online. That will happen after a few more steps.

If everything went correctly, you should see this text:

```plain
	Welcome to WCS. This appears to be your first time using WCS.
	Provide a PIN-code to protect the control panel (4 to 8 digits).
	
	PIN-code:
```

Enter a PIN-code that's 4 to 8 digits, and hit Enter. The PIN-code will be immedtiately encrypted using the AES 256 bit encryption algorithm and the PIN-code hash will be written to the `\server\root\dat\key.hash` file.

After providing a valid PIN-code and hitting Enter, you should see this text:

```plain
	Enter a port WCS will run on (a number from 0 to 64738, use 80 for no port).
	
	Port:
```

Enter a valid port, and hit Enter. The port you entered will be written to the `config.json` file and used in the future. Wish you change the port, simply change the value in the `config.json` file which is located in the root directory of the project, save the changes and restart the server (if it doesn't restart automatically, e.g. if you initiated the `server.js` file with the `nodemon` command with the argument/flag `--ignore` set to `'*.json'`).

After providing a valid port and hitting Enter, you should see this text (where &lt;your_ip&gt; is your machine's IP address, i.e., where the server will be accessible from on other devices, and &lt;your_port&gt; being the port that you provided in the previous step):

```plain
	WCS is running at the following address:
	http://<your_ip>:<your_port>
	
	Press ctrl+c any time to shut the server down.
```

To see if the server actually works, copy the address from the terminal and paste in your browser to visit it. If everything went fine, you should see this screen in your browser:

<img src="https://github.com/msfninja/wcs/raw/main/screenshots/Landing%20page%20when%20accessing%20the%20WCS%20web%20client.png" alt="Landing page when accessing the WCS web client" width="80%" />

Enter the PIN-code that you provided in the terminal, and log in. You should see this screen now:

<img src="https://github.com/msfninja/wcs/raw/main/screenshots/Landing%20page%20after%20logging%20in%20with%20your%20PIN-code%20in%20the%20WCS%20web%20client.png" alt="Landing page after logging in with your PIN-code in the WCS web client" width="80%" />

You can press any button to perform a task and see if it works.

## Configuring the server

A few basic things of the server can be configured in the `config.json` file in the root directory of the project, such as the port the server runs on, the name of the application, and whether to ask for a new PIN-code and port every time you initiate the server CLI.

Things will definitely change in future releases, but as of now, configuration further than that requires modifying the source code of the server.

### Changing the port

The `config.json` file has a property called `port`, by default on line 7:

```json
"port": null,
```

You can change its value to any valid port any time and save the file for changes to apply (maybe you have to restart the server as well).

### Setting a new PIN-code (and port)

This can be achieved by simply making the server think that you are using it for the first time, and therefore prompting for a PIN-code, but that'll also prompt for a port afterwards. To make this happen, find the `sec` property, by default on line 8. This property contains another property called `init`:

```json
"sec": {
	"init": false
}
```

If its value is set to `true`, it won't ask for a PIN-code and a port upon initiating the server CLI. If it's set to `false` however, it will. Keep in mind that the server will automatically set this value to `true` every time you initiate the server CLI, enter a PIN-code and a port.

## Adding new tasks

There will be more tasks added upon each new release of WCS, but you can add your own too. The only way to add your own task is to simply create a batch file with your script. You can put the batch file in a new directory inside the `\batch` directory to make it appear as a separate category in the control panel. There are a few guidelines/rules on how to name a directory:

 - Can consist of an unlimited amount of characters
 - Can start with and contain any alphanumerical character
 - Cannot contain non-alphanumerical characters
 - Use a dash (`-`) for spaces (whitespace characters will be ignored)
 - Text case will be ignored, the server will make every first character of a word (words are separated with a dash) upper case and all other characters lower case

Create a new batch file inside the `\batch\<your_directory>` directory, write the script you want to be executed, and save the file. A few guidelines/rules on how to name a batch file:

 - Can consist of an unlimited amount of characters
 - Can start with and contain any alphanumerical character
 - Cannot contain non-alphanumerical characters
 - Text case will be ignored, the server will make the first character upper case, and the rest lower case).

Depending on how you name the file, the name will appear in the control panel.

A sample batch script:

```bat
echo Hello, World!
```

Saved batch file in explorer:

<img src="https://github.com/msfninja/wcs/raw/main/screenshots/A%20batch%20file%20in%20the%20batch%20directory%20in%20WCS%20in%20explorer.png" alt="A batch file in the batch directory in WCS in explorer" width="80%" />

That's it.

The button will appear in the web client under the category what you named the directory the batch file is in to in the `\batch` directory.

## Compiling the Sass code

WCS uses Sass. The actual file itself is written in SCSS though, not in SASS, due to syntax preferences. The SCSS file is located in the `\server\client\sass` directory. If you go to the project's root directory in your terminal, you can run this command to compile the SCSS code once:

```bat
sass .\server\client\sass\stylesheet.scss .\public\client\css\stylesheet.css
```

Or use run this command to make Sass compile the SCSS code every time you make changes to it:

```bat
sass -w .\server\client\sass\stylesheet.scss .\public\client\css\stylesheet.css
```

---

&#169; 2021 WCS, Windows Control Server