////////////////////////////////////////////////////////////////////////////////
// UI variables
var tree_button_state = 'add';
var graph_secondary_update = null;

////////////////////////////////////////////////////////////////////////////////
// Handle global pause
var global_paused = false;
var global_paused_button = document.querySelector('#global_pause');
global_paused_button.onchange = function(event) {
	global_paused = global_paused_button.checked;
};
document.addEventListener('keydown', function(event) {
	if('pP'.includes(event.key)) {
		global_paused = !global_paused;
		global_paused_button.checked = global_paused;
	}
});

////////////////////////////////////////////////////////////////////////////////
// Initialize gambezi
var refresh_rate = 100;
//var gambezi = new Gambezi('pivision.local:5809');
//var gambezi = new Gambezi('localhost:5809');
var gambezi = new Gambezi('10.17.47.2:5809');
gambezi.set_refresh_rate(refresh_rate);
gambezi.set_default_subscription(0xFFFF);

// Initialize root node
var rootNode = new DataNode(gambezi.get_root_node(), null);
var rootDiv = document.querySelector('#tree');

// Update tree
setInterval(function() {
	gambezi.get_root_node().request_all_children();
	setTimeout(function() {
		rootNode.buildTree();
	}, 100);
}, 500);

// Initialize view
var view = document.querySelector('#view');

////////////////////////////////////////////////////////////////////////////////
// Tree structure creation
function DataNode(gambeziNode, parentDiv) {
	this.gambeziNode = gambeziNode;
	this.children = [];

	//==============================================================================
	// Create divs
	this.parentDiv = parentDiv;
	this.div = document.createElement('div');
	this.div.classList.add('tree_node');
	this.childDiv = document.createElement('div');

	//==============================================================================
	// Create controls
	let expand = document.createElement('button');
	expand.innerHTML = '&gt;';
	expand.onclick = function(event) {
		if(expand.innerHTML == '&gt;') {
			expand.innerHTML = 'v';
			this.childDiv.style.display = 'block';
		}
		else {
			expand.innerHTML = '&gt;';
			this.childDiv.style.display = 'none';
		}
	}.bind(this);
	let add = document.createElement('button');
	add.innerHTML = '+';

	//==============================================================================
	// Add handler
	add.onclick = function(event) {
		if(tree_button_state == 'add') {
			create_view(gambeziNode);
		}
		else if(tree_button_state == 'graph') {
			// Update graph element
			if(graph_secondary_update != null) {
				graph_secondary_update(gambeziNode);
			}

			// Update state
			tree_button_state = 'add';
		}
	}.bind(this);

	//==============================================================================
	// Add all children
	this.div.appendChild(expand);
	this.div.appendChild(document.createTextNode(gambeziNode.get_name()));
	this.div.appendChild(add);
	this.div.appendChild(this.childDiv);

	//==============================================================================
	// Add if not the root node
	if(parentDiv != null) {
		parentDiv.appendChild(this.div);
	}
}

DataNode.prototype.buildTree = function() {
	// Add new children if the number has changed
	let gambeziChildren = this.gambeziNode.get_children();
	if(gambeziChildren.length > this.children.length) {
		for(let i = this.children.length;i < gambeziChildren.length;i++) {
			let child = new DataNode(gambeziChildren[i], (this.parentDiv == null) ? rootDiv : this.childDiv);
			this.children.push(child);
		}
	}
	
	// Check children recursively
	for(let child of this.children) {
		child.buildTree();
	}
}

////////////////////////////////////////////////////////////////////////////////
// Method to create view
function create_view(gambeziNode) {
	// Create div
	let div = document.createElement('div');
	div.classList.add('view_node');
	div.style.width = grid_size * 6 + 'px';
	div.style.height = grid_size * 2 + 'px';
	div.style.left = Math.round(0 / grid_size) * grid_size + 'px';
	div.style.top  = Math.round(0 / grid_size) * grid_size + 'px';
	div.setAttribute('data-x', 0);
	div.setAttribute('data-y', 0);

	// Create header
	let header = document.createElement('div');
	let settings = document.createElement('a');
	settings.innerHTML = '&#9881;';
	settings.onclick = function(event) {
		// Remove old menu
		let element = document.querySelector('.view_menu');
		if(element != null && !element.contains(event.target)) {
			view.removeChild(element);
		}

		// Create if necessary
		if(document.querySelector('.view_menu') == null) {
			//------------------------------------------------------------------------------
			// Create context menu
			let menu = document.createElement('div');
			menu.classList.add('view_menu');
			menu.style.left = event.clientX - view.offsetLeft;
			menu.style.top = event.clientY - view.offsetTop;

			//------------------------------------------------------------------------------
			// Create buttons
			let data_type = div.getAttribute('data_type');
			let type_label = document.createElement('b');
			type_label.innerHTML = data_type;
			menu.appendChild(type_label);

			let button = document.createElement('a');
			button.innerHTML = 'Remove';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				view.removeChild(div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Input Number';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_input_number(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Output Number';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_output_number(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Input Boolean';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_input_boolean(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Output Boolean';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_output_boolean(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Input String';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_input_string(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Output String';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_output_string(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Log String';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_log_string(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Button';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_button(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			button = document.createElement('a');
			button.innerHTML = 'Graph Number';
			button.onclick = function(event) {
				view.removeChild(menu);
				clear_contents(gambeziNode, div);
				create_graph_number(gambeziNode, div);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			//------------------------------------------------------------------------------
			// Add
			view.appendChild(menu);
		}
	};
	header.appendChild(document.createTextNode(gambeziNode.get_string_key().join('/')));
	header.appendChild(settings);
	
	// Add 
	div.appendChild(header);
	div.appendChild(document.createElement('div'));
	view.appendChild(div);

	// Create contents
	create_output_number(gambeziNode, div);

	return div;
}

////////////////////////////////////////////////////////////////////////////////
// Method for clearing an input output view
function clear_contents(gambeziNode, div) {
	// Remove all children
	clearTimeout(div.getAttribute('timer_ident'));
	div.removeChild(div.children[1]);
	div.appendChild(document.createElement('div'));
}

////////////////////////////////////////////////////////////////////////////////
// Input output generation methods
function create_input_number(gambeziNode, div) {
	let field = document.createElement('input');
	field.type = 'text';
	field.value = gambeziNode.get_double();
	div.style.backgroundColor = '#DFFFDF';
	field.onchange = function(event) {
		gambeziNode.set_double(field.value);
	};
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'input_number');
}

function create_output_number(gambeziNode, div) {
	let field = document.createElement('input');
	field.type = 'text';
	field.readOnly = true;
	gambeziNode.set_subscription(1);
	div.style.backgroundColor = '#DFDFFF';
	let ident = setInterval(function() {
		field.value = gambeziNode.get_double();
	}, refresh_rate);
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'output_number');
	div.setAttribute('timer_ident', ident);
}

function create_input_boolean(gambeziNode, div) {
	let field = document.createElement('input');
	field.type = 'checkbox';
	field.checked = gambeziNode.get_boolean();
	div.children[1].style.backgroundColor = field.checked ? '#00FF00' : '#FF0000';
	div.style.backgroundColor = '#DFFFDF';
	field.onchange = function(event) {
		gambeziNode.set_boolean(field.checked);
		div.children[1].style.backgroundColor = field.checked ? '#00FF00' : '#FF0000';
	};
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'input_boolean');
}

function create_output_boolean(gambeziNode, div) {
	let field = document.createElement('input');
	field.type = 'checkbox';
	field.disabled = true;
	gambeziNode.set_subscription(1);
	div.style.backgroundColor = '#DFDFFF';
	let ident = setInterval(function() {
		field.checked = gambeziNode.get_boolean();
		div.children[1].style.backgroundColor = field.checked ? '#00FF00' : '#FF0000';
	}, refresh_rate);
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'output_boolean');
	div.setAttribute('timer_ident', ident);
}

function create_input_string(gambeziNode, div) {
	let field = document.createElement('input');
	field.type = 'text';
	field.value = gambeziNode.get_string();
	div.style.backgroundColor = '#DFFFDF';
	field.onchange = function(event) {
		gambeziNode.set_string(field.value);
	};
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'input_string');
}

function create_output_string(gambeziNode, div) {
	let field = document.createElement('input');
	field.type = 'text';
	field.readOnly = true;
	gambeziNode.set_subscription(1);
	div.style.backgroundColor = '#DFDFFF';
	let ident = setInterval(function() {
		field.value = gambeziNode.get_string();
	}, refresh_rate);
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'output_string');
	div.setAttribute('timer_ident', ident);
}

function create_log_string(gambeziNode, div) {
	let field = document.createElement('textarea');
	field.type = 'text';
	field.readOnly = true;
	field.rows = 1;
	field.value = '';
	gambeziNode.set_subscription(0);
	div.style.backgroundColor = '#DFDFFF';
	gambeziNode.on_update = function(node) {
		let atBottom = field.scrollTop == (field.scrollHeight - field.clientHeight);
		if(field.value == '') {
			field.value = gambeziNode.get_string();
		}
		else {
			field.value += '\n' + gambeziNode.get_string();
		}
		if(atBottom) {
			field.scrollTop = field.scrollHeight - field.clientHeight;
		}
	};
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'log_string');
}

function create_button(gambeziNode, div) {
	let field = document.createElement('button');
	field.innerHTML = 'Send';
	div.style.backgroundColor = '#DFFFDF';
	field.onclick = function(event) {
		gambeziNode.set_boolean(true);
	};
	div.children[1].appendChild(field);
	div.setAttribute('data_type', 'button');
}

function create_graph_number(gambeziNode0, div) {
	// Parameters
	let margin_top = 20;
	let margin_left = 50;
	let margin_bottom = 20;
	let margin_right = 50;

	// Variables
	let gambeziNode1 = null;
	let paused = false;
	let autoscale = true;
	let scroll = false;
	let buffer_length = 30 * 1000 / refresh_rate;
	let buffer0 = null;
	let buffer1 = null;
	let offset = null;
	let index = null;
	let min_y = null;
	let max_y = null;
	let div_y = null;
	let div_x = null;
	let background_color = null;
	let grid_color = null;
	let text_color = null;
	let text_size = null;
	let text_font = null;
	let update_color = null;
	let cursor_color = null;
	let color0 = null;
	let color1 = null;
	let mouse_x = null;
	let mouse_y = null;
	let cursor_x = null;

	// Reset method
	function reset() {
		if(buffer_length < 2) {
			buffer_length = 2;
		}
		buffer0 = new Array(buffer_length);
		buffer1 = new Array(buffer_length);
		for(let i = 0;i < buffer_length;i++) {
			buffer0[i] = NaN;
			buffer1[i] = NaN;
		}
		offset = -buffer_length * 2;
		index = 0;
	}
	function full_reset() {
		reset();
		min_y = 0;
		max_y = 0;
		div_y = 4;
		div_x = 6;
		background_color = '#FFFFFF';
		grid_color = '#BFBFBF';
		text_color = '#000000';
		text_size = 10;
		text_font = text_size + 'pt sans-serif';
		update_color = 'magenta';
		cursor_color = 'green';
		color0 = 'red';
		color1 = 'blue';
		mouse_x = 0;
		mouse_y = 0;
		cursor_x = 0;
	}
	full_reset();

	// Create second header
	let header1 = document.createElement('div');
	header1.style.flex = '0 1 auto';
	header1.appendChild(document.createTextNode(''));

	// Create settings button
	let settings0 = document.createElement('a');
	settings0.innerHTML = '&#9881;';
	settings0.style.float = 'right';
	settings0.style.cursor = 'pointer';
	settings0.style.marginRight = '4px';
	settings0.onclick = function(event) {
		// Remove old menu
		let element = document.querySelector('.view_menu');
		if(element != null && !element.contains(event.target)) {
			view.removeChild(element);
		}

		// Create if necessary
		if(document.querySelector('.view_menu') == null) {
			//------------------------------------------------------------------------------
			// Create context menu
			let menu = document.createElement('div');
			menu.classList.add('view_menu');
			menu.style.left = event.clientX - view.offsetLeft;
			menu.style.top = event.clientY - view.offsetTop;

			//------------------------------------------------------------------------------
			// Create buttons
			let label = document.createElement('b');
			label.innerHTML = 'Graph Settings';
			menu.appendChild(label);

			let button = document.createElement('a');
			button.innerHTML = 'Reset Graph';
			button.onclick = function(event) {
				view.removeChild(menu);
				reset();
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			let checkbox0 = document.createElement('input');
			checkbox0.type = 'checkbox';
			checkbox0.checked = paused;
			checkbox0.onclick = function(event) {
				paused = checkbox0.checked; };
			menu.appendChild(document.createElement('br'));
			label = document.createElement('label');
			label.appendChild(checkbox0);
			label.appendChild(document.createTextNode('Paused'));
			menu.appendChild(label);

			let checkbox1 = document.createElement('input');
			checkbox1.type = 'checkbox';
			checkbox1.checked = autoscale;
			checkbox1.onclick = function(event) {
				autoscale = checkbox1.checked;
			};
			menu.appendChild(document.createElement('br'));
			label = document.createElement('label');
			label.appendChild(checkbox1);
			label.appendChild(document.createTextNode('Autoscale'));
			menu.appendChild(label);

			let checkbox2 = document.createElement('input');
			checkbox2.type = 'checkbox';
			checkbox2.checked = scroll;
			checkbox2.onclick = function(event) {
				scroll = checkbox2.checked;
			};
			menu.appendChild(document.createElement('br'));
			label = document.createElement('label');
			label.appendChild(checkbox2);
			label.appendChild(document.createTextNode('Scroll Graph'));
			menu.appendChild(label);

			let input0 = document.createElement('input');
			input0.style.width = '100%';
			input0.style.border = '0';
			input0.style.height = '1.5em';
			input0.value = min_y;
			input0.onchange = function(event) {
				min_y = parseFloat(input0.value);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Y minimum'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input0);

			let input1 = document.createElement('input');
			input1.style.width = '100%';
			input1.style.border = '0';
			input1.style.height = '1.5em';
			input1.value = max_y;
			input1.onchange = function(event) {
				max_y = parseFloat(input1.value);
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Y maximum'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input1);

			let input2 = document.createElement('input');
			input2.style.width = '100%';
			input2.style.border = '0';
			input2.style.height = '1.5em';
			input2.value = buffer_length * refresh_rate / 1000;
			input2.onchange = function(event) {
				buffer_length = Math.round(parseFloat(input2.value) * 1000 / refresh_rate);
				reset();
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Window length (s)'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input2);

			let input3 = document.createElement('input');
			input3.style.width = '100%';
			input3.style.border = '0';
			input3.style.height = '1.5em';
			input3.value = div_y;
			input3.onchange = function(event) {
				div_y = Math.round(parseFloat(input3.value));
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Y divisions'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input3);

			let input4 = document.createElement('input');
			input4.style.width = '100%';
			input4.style.border = '0';
			input4.style.height = '1.5em';
			input4.value = div_x;
			input4.onchange = function(event) {
				div_x = Math.round(parseFloat(input4.value));
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('X divisions'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input4);

			//------------------------------------------------------------------------------
			// Add
			view.appendChild(menu);
		}
	};
	header1.appendChild(settings0);

	// Create settings button
	let settings1 = document.createElement('a');
	settings1.innerHTML = '&#9881;';
	settings1.style.float = 'right';
	settings1.style.cursor = 'pointer';
	settings1.style.marginRight = '4px';
	settings1.onclick = function(event) {
		// Remove old menu
		let element = document.querySelector('.view_menu');
		if(element != null && !element.contains(event.target)) {
			view.removeChild(element);
		}

		// Create if necessary
		if(document.querySelector('.view_menu') == null) {
			//------------------------------------------------------------------------------
			// Create context menu
			let menu = document.createElement('div');
			menu.classList.add('view_menu');
			menu.style.left = event.clientX - view.offsetLeft;
			menu.style.top = event.clientY - view.offsetTop;

			//------------------------------------------------------------------------------
			// Create buttons
			let label = document.createElement('b');
			label.innerHTML = 'Graph Settings';
			menu.appendChild(label);

			let button = document.createElement('a');
			button.innerHTML = 'Select Node';
			button.onclick = function(event) {
				view.removeChild(menu);
				tree_button_state = 'graph';
				graph_secondary_update = function(gambeziNode) {
					gambeziNode1 = gambeziNode;
					graph_secondary_update = null;
					// Update header
					header1.removeChild(header1.firstChild);
					let subtitle = '';
					if(gambeziNode1 != null) {
						gambeziNode1.set_subscription(1);
						subtitle = gambeziNode1.get_string_key().join('/');
					}
					header1.insertBefore(document.createTextNode(subtitle), settings1);
					// Clear buffer
					for(let i = 0;i < buffer_length;i++) {
						buffer1[i] = NaN;
					}
				};
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(button);

			let input0 = document.createElement('input');
			input0.style.width = '100%';
			input0.style.border = '0';
			input0.style.height = '1.5em';
			input0.value = update_color;
			input0.onchange = function(event) {
				update_color = input0.value;
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Update color'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input0);

			let input1 = document.createElement('input');
			input1.style.width = '100%';
			input1.style.border = '0';
			input1.style.height = '1.5em';
			input1.value = cursor_color;
			input1.onchange = function(event) {
				cursor_color = input1.value;
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Cursor color'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input1);

			let input2 = document.createElement('input');
			input2.style.width = '100%';
			input2.style.border = '0';
			input2.style.height = '1.5em';
			input2.value = color0;
			input2.onchange = function(event) {
				color0 = input2.value;
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Primary color'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input2);

			let input3 = document.createElement('input');
			input3.style.width = '100%';
			input3.style.border = '0';
			input3.style.height = '1.5em';
			input3.value = color1;
			input3.onchange = function(event) {
				color1 = input3.value;
			};
			menu.appendChild(document.createElement('br'));
			menu.appendChild(document.createTextNode('Secondary color'));
			menu.appendChild(document.createElement('br'));
			menu.appendChild(input3);

			//------------------------------------------------------------------------------
			// Add
			view.appendChild(menu);
		}
	};
	header1.appendChild(settings1);

	// Save method
	div.get_graph_parameters = function() {
		let output = '';
		output += margin_top + '\n';
		output += margin_left + '\n';
		output += margin_bottom + '\n';
		output += margin_right + '\n';
		if(gambeziNode1 != null) {
			output += gambeziNode1.get_string_key().join('/') + '\n';
		}
		else {
			output += '\n';
		}
		output += autoscale + '\n';
		output += scroll + '\n';
		output += buffer_length + '\n';
		output += min_y + '\n';
		output += max_y + '\n';
		output += div_y + '\n';
		output += div_x + '\n';
		output += background_color + '\n';
		output += grid_color + '\n';
		output += text_color + '\n';
		output += text_size + '\n';
		output += text_font + '\n';
		output += update_color + '\n';
		output += cursor_color + '\n';
		output += color0 + '\n';
		output += color1 + '\n';
		return output;
	};

	// Open method
	div.set_graph_parameters = function(parameters) {
		let i = 0;
		margin_top = Number(parameters[i++]);
		margin_left = Number(parameters[i++]);
		margin_bottom = Number(parameters[i++]);
		margin_right = Number(parameters[i++]);
		let name1 = String(parameters[i++]);
		if(name1 != '') {
			gambeziNode1 = gambezi.get_node(name1);
			gambeziNode1.set_subscription(1)
			header1.removeChild(header1.firstChild);
			header1.insertBefore(document.createTextNode(gambeziNode1.get_string_key().join('/')), settings1);
		}
		autoscale = (parameters[i++]) == 'true';
		scroll = (parameters[i++]) == 'true';
		buffer_length = Number(parameters[i++]);
		min_y = Number(parameters[i++]);
		max_y = Number(parameters[i++]);
		div_y = Number(parameters[i++]);
		div_x = Number(parameters[i++]);
		background_color = String(parameters[i++]);
		grid_color = String(parameters[i++]);
		text_color = String(parameters[i++]);
		text_size = Number(parameters[i++]);
		text_font = String(parameters[i++]);
		update_color = String(parameters[i++]);
		cursor_color = String(parameters[i++]);
		color0 = String(parameters[i++]);
		color1 = String(parameters[i++]);
		reset();
	};

	// Create content area
	let contents = document.createElement('div');
	contents.style.flex = '1 1 auto';

	// Add divs
	div.children[1].style.display = 'flex';
	div.children[1].style.flexFlow = 'column';
	div.children[1].appendChild(header1);
	div.children[1].appendChild(contents);

	// Canvas setup
	let canvas = document.createElement('canvas');
	canvas.onmousemove = function(event) {
		// Transform coordinates to canvas
		mouse_x = event.layerX - canvas.offsetLeft;
		mouse_y = event.layerY - canvas.offsetTop;
	};
	let ctx = canvas.getContext('2d');
	gambeziNode0.set_subscription(1);
	div.style.backgroundColor = '#DFDFFF';
	let ident = setInterval(function() {
		// Draw background
		let width = contents.clientWidth;
		let height = div.clientHeight - div.firstChild.clientHeight - header1.clientHeight;
		canvas.width = width;
		canvas.height = height;
		ctx.fillStyle = background_color;
		ctx.fillRect(0, 0, width, height);

		// Get new data
		if(!paused && !global_paused) {
			buffer0[index] = gambeziNode0.get_double();
			if(gambeziNode1 != null) {
				buffer1[index] = gambeziNode1.get_double();
			}
			index++;
			if(index >= buffer_length) {
				index -= buffer_length;
			}
			if(index == 1) {
				offset += buffer_length;
			}
		}
		let last_index = index-1;
		if(last_index < 0) {
			last_index += buffer_length;
		}

		// Handle scrolling graph
		if(scroll) {
			// Shift until correct
			while(index != 1) {
				let temp0 = buffer0[0];
				let temp1 = buffer1[0];
				for(let i = 1;i < buffer_length;i++) {
					buffer0[i-1] = buffer0[i];
					buffer1[i-1] = buffer1[i];
				}
				buffer0[buffer_length-1] = temp0;
				buffer1[buffer_length-1] = temp1;

				index--;
				if(index < 0) {
					index += buffer_length;
				}
				last_index--;
				if(last_index < 0) {
					last_index += buffer_length;
				}
				offset++;
			}
		}

		// Autoscale y axis
		if(autoscale) {
			max_y = -Infinity;
			min_y = Infinity;
			for(let i = 0;i < buffer_length;i++) {
				if(buffer0[i] > max_y) {
					max_y = buffer0[i];
				}
				if(buffer0[i] < min_y) {
					min_y = buffer0[i];
				}
				if(buffer1[i] > max_y) {
					max_y = buffer1[i];
				}
				if(buffer1[i] < min_y) {
					min_y = buffer1[i];
				}
			}
		}

		// Create drawing parameters
		if(min_y > max_y) {
			let temp = min_y;
			min_y = max_y;
			max_y = temp;
		}
		if(min_y == max_y) {
			min_y -= 0.02;
			max_y += 0.02;
		}
		if(min_y == -Infinity && max_y == Infinity) {
			min_y = -0.02;
			max_y = 0.02;
		}
		let graph_width = width - margin_left - margin_right;
		let graph_height = height - margin_top - margin_bottom;
		if(graph_width > 0 && graph_height > 0) {
			let x_interval = graph_width/buffer_length;
			let y_interval = graph_height/(max_y - min_y);

			// Draw grid
			ctx.strokeStyle = grid_color;
			ctx.beginPath();
			for(let i = 0;i <= div_x;i++) {
				ctx.moveTo(margin_left + i * graph_width / div_x, margin_top);
				ctx.lineTo(margin_left + i * graph_width / div_x, height - margin_bottom);
			}
			for(let i = 0;i <= div_y;i++) {
				ctx.moveTo(margin_left, margin_top + i * graph_height / div_y);
				ctx.lineTo(width - margin_right, margin_top + i * graph_height / div_y);
			}
			ctx.stroke();

			// Draw data
			ctx.strokeStyle = color0;
			ctx.beginPath();
			for(let i = 0;i < buffer_length;i++) {
				let y0 = height - margin_bottom - (buffer0[i] - min_y) * y_interval;
				let y1 = height - margin_bottom - (buffer0[(i+1)%buffer_length] - min_y) * y_interval;
				if(!isNaN(y0) && y0 >= margin_top && y0 <= height - margin_bottom &&
				   !isNaN(y1) && y1 >= margin_top && y1 <= height - margin_bottom &&
				   i != last_index) {
					ctx.moveTo(margin_left + i * x_interval, y0);
					ctx.lineTo(margin_left + (i+1) * x_interval, y1);
				}
			}
			ctx.stroke();
			ctx.strokeStyle = color1;
			ctx.beginPath();
			for(let i = 0;i < buffer_length;i++) {
				let y0 = height - margin_bottom - (buffer1[i] - min_y) * y_interval;
				let y1 = height - margin_bottom - (buffer1[(i+1)%buffer_length] - min_y) * y_interval;
				if(!isNaN(y0) && y0 >= margin_top && y0 <= height - margin_bottom &&
				   !isNaN(y1) && y1 >= margin_top && y1 <= height - margin_bottom &&
				   i != last_index) {
					ctx.moveTo(margin_left + i * x_interval, y0);
					ctx.lineTo(margin_left + (i+1) * x_interval, y1);
				}
			}
			ctx.stroke();

			// Draw update
			if(!isNaN(buffer0[last_index]) || !isNaN(buffer1[last_index])) {
				let draw_index = last_index;
				if(draw_index == 0) {
					draw_index += buffer_length;
				}
				ctx.strokeStyle = update_color;
				ctx.beginPath();
				ctx.moveTo(margin_left + draw_index* x_interval, margin_top);
				ctx.lineTo(margin_left + draw_index * x_interval, height - margin_bottom);
				ctx.stroke();
			}

			// Draw cursor
			cursor_x = Math.round((mouse_x - margin_left) / x_interval);
			if(cursor_x < 0) {
				cursor_x = 0;
			}
			if(cursor_x > buffer_length) {
				cursor_x = buffer_length;
			}
			ctx.strokeStyle = cursor_color;
			ctx.beginPath();
			ctx.moveTo(margin_left + cursor_x * x_interval, margin_top);
			ctx.lineTo(margin_left + cursor_x * x_interval, height - margin_bottom);
			ctx.stroke();

			// Draw cursor text
			ctx.font = text_font;
			ctx.fillStyle = cursor_color;
			ctx.fillText(((cursor_x + offset + (cursor_x <= last_index ? buffer_length : 0)) * refresh_rate / 1000).toPrecision(4) + 's',
				         margin_left + cursor_x * x_interval + 2,
				         margin_top - 2);
			ctx.font = text_font;
			ctx.fillStyle = color0;
			ctx.fillText((buffer0[cursor_x % buffer_length]).toPrecision(4),
				         margin_left + cursor_x * x_interval + 2,
				         margin_top * 2 - 2);
			ctx.font = text_font;
			ctx.fillStyle = color1;
			ctx.fillText((buffer1[cursor_x % buffer_length]).toPrecision(4),
				         margin_left + cursor_x * x_interval + 2,
				         margin_top * 3 - 2);

			// Draw horizontal labels
			ctx.fillStyle = text_color;
			ctx.font = text_font;
			for(let i = 0;i <= div_x;i++) {
				let label_index = i * buffer_length / div_x;
				ctx.fillText(((label_index + offset + (label_index <= last_index ? buffer_length : 0)) * refresh_rate / 1000).toPrecision(4) + 's',
				             margin_left + i * graph_width / div_x,
				             height - margin_bottom + text_size + 2);
			}

			// Draw vertical labels
			ctx.fillStyle = text_color;
			for(let i = 0;i <= div_y;i++) {
				ctx.fillText((max_y - i * (max_y - min_y) / div_y).toPrecision(4) + '',
				             2, margin_top + i * graph_height / div_y);
			}
		}
	}, refresh_rate);
	contents.appendChild(canvas);
	div.setAttribute('data_type', 'graph_number');
	div.setAttribute('timer_ident', ident);
}

////////////////////////////////////////////////////////////////////////////////
// Document click handler
document.onclick = function(event) {
	// Menu dismissal handler
	let element = document.querySelector('.view_menu');
	let is_link = event.target.tagName == 'A';
	let is_child_view_node = false;
	let target = event.target;
	while(target != null) {
		if(typeof(target.classList) != 'undefined' && target.classList.contains('view_node')) {
			is_child_view_node = true;
		}
		target = target.parentElement;
	}
	if(!is_link || !is_child_view_node) {
		if(element != null && !element.contains(event.target)) {
			view.removeChild(element);
		}
	}

	// Selection dismissal handler
	if(!(event.target.tagName == 'BUTTON' && event.target.innerHTML == '+') &&
	   !(event.target.tagName == 'A' && event.target.innerHTML == 'Select Node')) {
		// Update graph element
		if(graph_secondary_update != null) {
			graph_secondary_update(null);
		}

		// Update state
		tree_button_state = 'add';
	}
}

////////////////////////////////////////////////////////////////////////////////
// Allow tree to be resized
interact('#tree')
.resizable({
	edges: { left: false, right: true, bottom: false, top: false },
})
.on('resizemove', function (event) {
	var target = event.target;
	document.querySelector('#tree').style.width = event.rect.width + 'px';
	document.querySelector('#view').style.width = 'calc(100% - ' + event.rect.width + 'px)';
});

////////////////////////////////////////////////////////////////////////////////
// Create draggable interface
var grid_size = 25;
interact('.view_node > div:first-child')
.draggable({
	snap: {
		range: Infinity,
		relativePoints: [ { x: 0, y: 0 } ]
	},
	restrict: {
		restriction: '#view',
		elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
	},

	onmove: dragMoveListener,
});
interact('.view_node')
.resizable({
	edges: { left: false, right: true, bottom: true, top: false },

	// keep the edges inside the parent
	restrictEdges: {
		outer: 'parent',
		endOnly: false,
	},

	// minimum size
	restrictSize: {
		min: { width: grid_size * 2, height: grid_size * 2 },
	},
})
.on('resizemove', function (event) {
	var target = event.target;
	target.style.width  = Math.round(event.rect.width / grid_size) * grid_size + 'px';
	target.style.height = Math.round(event.rect.height / grid_size) * grid_size + 'px';
});
function dragMoveListener (event) {
	var target = event.target.parentElement;
	var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
	var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	// translate the element
	target.style.left = Math.round(x / grid_size) * grid_size + 'px';
	target.style.top  = Math.round(y / grid_size) * grid_size + 'px';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);
}
window.dragMoveListener = dragMoveListener;

////////////////////////////////////////////////////////////////////////////////
// Saving and restoring
function saveLayout() {
	let output = '';
	let divs = document.querySelector('#view').children;
	for(let i = 0;i < divs.length;i++) {
		let div = divs[i];

		output += div.children[0].firstChild.textContent + '\n';
		output += div.style.left + '\n';
		output += div.style.top + '\n';
		output += div.style.width + '\n';
		output += div.style.height + '\n';
		output += div.getAttribute('data_type') + '\n';
		if(div.getAttribute('data_type') == 'graph_number') {
			output += div.get_graph_parameters();
		}
		output += '========================================\n';
	}
	return output;
}

function openLayout(data) {
	// Remove old elements
	let divs = document.querySelector('#view').children;
	for(let i = divs.length-1;i >= 0;i--) {
		let div = divs[i];
		clearTimeout(div.getAttribute('timer_ident'));
		view.removeChild(div);
	}

	// Add elements
	let sections = data.split('========================================\n');
	for(let i = 0;i < sections.length;i++) {
		let parts = sections[i].split('\n');
		if(parts.length >= 7) {
			let gambeziNode = gambezi.get_node(parts[0]);
			let div = create_view(gambeziNode);
			div.style.left = parts[1];
			div.setAttribute('data-x', parts[1]);
			div.style.top = parts[2];
			div.setAttribute('data-y', parts[2]);
			div.style.width = parts[3];
			div.style.height = parts[4];
			clear_contents(gambeziNode, div);
			switch(parts[5]) {
				case 'input_number':   create_input_number(gambeziNode, div, div.children[1]);   break;
				case 'output_number':  create_output_number(gambeziNode, div, div.children[1]);  break;
				case 'input_boolean':  create_input_boolean(gambeziNode, div, div.children[1]);  break;
				case 'output_boolean': create_output_boolean(gambeziNode, div, div.children[1]); break;
				case 'input_string':   create_input_string(gambeziNode, div, div.children[1]);   break;
				case 'output_string':  create_output_string(gambeziNode, div, div.children[1]);  break;
				case 'log_string':     create_log_string(gambeziNode, div, div.children[1]);     break;
				case 'button':         create_button(gambeziNode, div, div.children[1]);         break;
				case 'graph_number':   create_graph_number(gambeziNode, div, div.children[1]);   break;
			}
			if(parts[5] == 'graph_number') {
				div.set_graph_parameters(parts.slice(6));
			}
		}
	}
}

document.querySelector('#save_button').onclick = function(event) {
	let blob = new Blob([saveLayout()], {type: 'text/plain;charset=utf-8'});
	saveAs(blob, 'gambezi_dashboard.txt');
};

document.querySelector('#open_button').onclick = function(event) {
	let reader = new FileReader();
	reader.onloadend = function() {
		openLayout(reader.result);
	}
	reader.onerror = function () {
		alert('Error reading file');
	}
	reader.readAsText(document.querySelector('#file_selector').files[0]);
};

document.querySelector('#clear_button').onclick = function(event) {
	openLayout('');
}

window.onbeforeunload = function(event) {
	localStorage.setItem('gambezi_dashboard_layout', saveLayout());
};

setTimeout(function() {
	let value = localStorage.getItem('gambezi_dashboard_layout');
	if(value != null) {
		openLayout(value);
	}
}, 1000);
