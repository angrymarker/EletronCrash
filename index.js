//***	Importings items needed	***//
console.time('init')


const {
	app
	, BrowserWindow
	, dialog
	, Menu
	, MenuItem
	, ipcMain
, } = require('electron');
let win;
var allowclose = false;
var devtoolsadded = false;

try{
	app.setPath('temp', 'C:\\Temp');
	const { crashReporter } = require('electron')
	crashReporter.start({
		companyName: 'name',
		submitURL: 'internalurl',
		uploadToServer: true,
		crashesDirectory: 'C:\\Temp'
	});
}
catch(err)
{
	console.log(err);
}

app.disableHardwareAcceleration(); 
//##	Fully quit app when all windows are closed	##//
app.on('window-all-closed', () => {
	app.quit();
})

//##	Starting process	##//
app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
})

app.on('ready', () => {
	createWindow();
	  console.timeEnd('init')

});
//##	Create main interface window	##//
function createWindow() {
	win = new BrowserWindow({
		title: "CD Toolbox"
		, show: true //##	Hide till it's ready to show	##//
		, backgroundColor: '#a1af6c' //##	Prevent white flash during load/page change	##//
		, width: 1050
		, height: 650
		, webPreferences: { webSecurity: false }
	});
	//##	loadFile for relative path	##//
	win.loadFile('index.html');

	//##	Release resources when closed	##//
	win.on('closed', () => {
			win = null;
		})
		//##	Handle Crashes	##/
	win.webContents.on('crashed', () => {
		const options = {
			type: 'info'
			, title: 'Renderer Process Crashed'
			, message: 'This process has crashed.'
			, buttons: ['Reload', 'Close']
		};
		dialog.showMessageBox(options, (index) => {
			if (index === 0) win.reload();
			else win.close();
		});
	});
	//##	Wait till dom is loaded before opening window	##//
	win.on('ready-to-show', function () {
		//win.show();
		win.focus();
	});

	win.on('close', function (e) {
		
		if (allowclose == false) {
			console.log('closing');
			e.preventDefault();
			allowclose = true;
			win.webContents.send('info', {
				msg: 'hello from main process'
			});
		}
		setTimeout(function () {
			try
			{
				win.close();
			}
			catch (err)
			{}
		}, 100);
	});
	
	//##	Handle Hanging - temporarily disabled	##//
	/*win.on('unresponsive', () => {
	    const options = {
	        type: 'info',
	        title: 'Renderer Process Hanging',
	        message: 'This process is hanging.',
	        buttons: ['Reload', 'Wait', 'Close']
	    }
	    dialog.showMessageBox(options, (index) => {
	    	if (index === 0) {win.reload()}
	    	else if (index === 1) {}
	    	else {win.close()}
	    })
	})*/

}

const menu = new Menu();

menu.append(new MenuItem({
			label: 'Open Dev Tools'
			, role: 'toggledevtools'
		}));
			
app.on('browser-window-created', (event, win) => {
	win.webContents.on('context-menu', (e, params) => {
		menu.popup(win, params.x, params.y)
	})
})

ipcMain.on('show-context-menu', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	menu.popup(win)
})