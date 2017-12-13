//------------------------------------------------------------------------------
/*
 * http://stackoverflow.com/questions/287903/enums-in-javascript/29074825#29074825
 * usage:
 * var KeyCodes = newEnum({ VK_CANCEL : 3 });
 *
 *				switch( event.keyCode ) {
 *					case KeyCodes.VK_UP		:
 *						grid.moveCursor_(-1, 0);
 *						break;
 *					case KeyCodes.VK_DOWN	:
 *						grid.moveCursor_(+1, 0);
 *						break; 
 * 					case KeyCodes.VK_LEFT	:
 *						grid.moveCursor_(0, -1);
 *						break;
 *					case KeyCodes.VK_RIGHT	:
 *						grid.moveCursor_(0, +1);
 *						break;
 *				};
 */
export function newEnum(list) {

	for( const key in list )
		list[list[key] = list[key]] = key;

	return Object.freeze(list);
}
//------------------------------------------------------------------------------
