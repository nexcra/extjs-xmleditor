function createViewport(controller) {
	var ret = new Array();
		
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
		
	var view1 = new XMLPanelEditable({
		frame: true,
		title: '<center>XML View</center>',
		html: '',
		height: '50%',
		region: 'center',
		autoScroll: true
	});

	var view2 = new XMLPanelEditable({
		layout: 'fit',
		frame: true,
		title: '<center>XSLT Transformed</center>',
		html: '',
		columnWidth: .5,
		autoScroll: true
	});

	var view3 = new XMLPanelEditable({
		layout: 'fit',
		frame: true,
		title: '<center>XML Tree</center>',
		html: '',	
		columnWidth: .5,
		autoScroll: true
	});

	var bottomPanel = new Ext.Panel({
		//contentEl: 'idBottomPanel',
		frame: true,
		html: '',
		layout: 'column',
		layoutConfig: {
			fitHeight: true,
			margin: 5,
			split: true
		},		
		items: [view2, view3],
		region: 'south',
		height: 375,
		split: true,
		autoHeight: false,		
	});
	
	var View = new Ext.Viewport({
		renderTo: 'viewport',
		frame: true,
		layout: 'border',
		items: [toolbar, view1, bottomPanel]	
	});
	
	ret[0] = view1;
	ret[1] = view2;
	ret[2] = view3;
	return ret;
}
