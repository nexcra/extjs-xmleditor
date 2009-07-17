function createViewport() {
	var ret = new Array();
	
	var controller = new PanelEditable({
		frame: true,
		title: '<center>View</center>',
		html: '',
		height: '50%',
		region: 'center',
		autoScroll: true
	});
		
	var button_save = new Ext.Button({
		text: 'save',
		style: {'padding-left': '10px'},
		handler: function() {controller.output();},
	}); 

	var button_undo = new Ext.Button({
		text: 'undo',
		style: {'padding-left': '10px'},
		handler: function() {ContentEditor.recallSnapshot(-1);},
	}); 
	
	var button_redo = new Ext.Button({
		text: 'redo',
		style: {'padding-left': '10px'},
		handler: function() {ContentEditor.recallSnapshot(1);},
	}); 

	var xpath = new Ext.Panel({
		//contentEl: 'idCurXPath',
		id : "xpath",
		html : "",
		style: {'padding-left': '10px'},
	});

			
	var button_update = new Ext.Button({
		text: 'update',
		style: {'padding-left': '10px'},
		handler: function() {controller.updateViews();},
	}); 
		
	var toolbarWest = new Ext.Panel({
		//contentEl: 'idToolbarWest',
		region: 'west',
		layout: 'column',
		//autoWidth: true,
		width: 300,
		items: [button_save],
	});

	var toolbarCenter = new Ext.Panel({
		//contentEl: 'idToolbarCenter',
		layout: 'column',
		region: 'center',
		items: [button_undo, button_redo, xpath],
	});

	var toolbarEast = new Ext.Panel({
	//	contentEl: 'idToolbarEast',
		region: 'east',
		layout: 'column',
		width: 170,
		items: [button_update],
	});
	
	var toolbar = new Ext.Panel({
		//contentEl: 'idToolbar',
		frame: true,
		height: 37,
		region: 'north',
		layout: 'border',
		items: [toolbarWest ,toolbarCenter, toolbarEast]
	});	
		


	
	var View = new Ext.Viewport({
		renderTo: 'viewport',
		frame: true,
		layout: 'border',
		items: [toolbar, controller]	
	});
	
	return controller;
}
