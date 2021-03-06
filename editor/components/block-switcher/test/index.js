/**
 * External dependencies
 */
import { shallow } from 'enzyme';

/**
 * WordPress dependencies
 */
import { registerCoreBlocks } from '@wordpress/blocks';
import { keycodes } from '@wordpress/utils';

/**
 * Internal dependencies
 */
import { BlockSwitcher } from '../';

const { DOWN } = keycodes;

describe( 'BlockSwitcher', () => {
	const headingBlock1 = {
		attributes: {
			content: [ 'How are you?' ],
			nodeName: 'H2',
		},
		isValid: true,
		name: 'core/heading',
		originalContent: '<h2>How are you?</h2>',
		uid: 'a1303fd6-3e60-4fff-a770-0e0ea656c5b9',
	};

	const textBlock = {
		attributes: {
			content: [ 'I am great!' ],
			nodeName: 'P',
		},
		isValid: true,
		name: 'core/text',
		originalContent: '<p>I am great!</p>',
		uid: 'b1303fdb-3e60-43faf-a770-2e1ea656c5b8',
	};

	const headingBlock2 = {
		attributes: {
			content: [ 'I am the greatest!' ],
			nodeName: 'H3',
		},
		isValid: true,
		name: 'core/text',
		originalContent: '<h3>I am the greatest!</h3>',
		uid: 'c2403fd2-4e63-5ffa-b71c-1e0ea656c5b0',
	};

	beforeAll( () => {
		registerCoreBlocks();
	} );

	test( 'should not render block switcher without blocks', () => {
		const wrapper = shallow( <BlockSwitcher /> );

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should render switcher with blocks', () => {
		const blocks = [
			headingBlock1,
		];
		const wrapper = shallow( <BlockSwitcher blocks={ blocks } /> );

		expect( wrapper ).toMatchSnapshot();
	} );

	test( 'should not render block switcher with multi block of different types.', () => {
		const blocks = [
			headingBlock1,
			textBlock,
		];
		const wrapper = shallow( <BlockSwitcher blocks={ blocks } /> );

		expect( wrapper.html() ).toBeNull();
	} );

	test( 'should not render a component when the multi selected types of blocks match.', () => {
		const blocks = [
			headingBlock1,
			headingBlock2,
		];
		const wrapper = shallow( <BlockSwitcher blocks={ blocks } /> );

		expect( wrapper.html() ).toBeNull();
	} );

	describe( 'Dropdown', () => {
		const blocks = [
			headingBlock1,
		];

		const onTransformStub = jest.fn();
		const getDropdown = () => {
			const blockSwitcher = shallow( <BlockSwitcher blocks={ blocks } onTransform={ onTransformStub } /> );
			return blockSwitcher.find( 'Dropdown' );
		};

		test( 'should dropdown exist', () => {
			expect( getDropdown() ).toHaveLength( 1 );
		} );

		describe( '.renderToggle', () => {
			const onToggleStub = jest.fn();
			const mockKeyDown = {
				preventDefault: () => {},
				stopPropagation: () => {},
				keyCode: DOWN,
			};

			afterEach( () => {
				onToggleStub.mockReset();
			} );

			test( 'should simulate a keydown event, which should call onToggle and open transform toggle.', () => {
				const toggleClosed = shallow( getDropdown().props().renderToggle( { onToggle: onToggleStub, isOpen: false } ) );
				const iconButtonClosed = toggleClosed.find( 'IconButton' );

				iconButtonClosed.simulate( 'keydown', mockKeyDown );

				expect( onToggleStub ).toHaveBeenCalledTimes( 1 );
			} );

			test( 'should simulate a click event, which should call onToggle.', () => {
				const toggleOpen = shallow( getDropdown().props().renderToggle( { onToggle: onToggleStub, isOpen: true } ) );
				const iconButtonOpen = toggleOpen.find( 'IconButton' );

				iconButtonOpen.simulate( 'keydown', mockKeyDown );

				expect( onToggleStub ).toHaveBeenCalledTimes( 0 );
			} );
		} );

		describe( '.renderContent', () => {
			const onCloseStub = jest.fn();

			const getIconButtons = () => {
				const content = shallow( getDropdown().props().renderContent( { onClose: onCloseStub } ) );
				return content.find( 'IconButton' );
			};

			test( 'should create the iconButtons for the chosen block. A heading block will have 3 items', () => {
				expect( getIconButtons() ).toHaveLength( 3 );
			} );

			test( 'should simulate the click event by closing the switcher and causing a block transform on iconButtons.', () => {
				getIconButtons().first().simulate( 'click' );

				expect( onCloseStub ).toHaveBeenCalledTimes( 1 );
				expect( onTransformStub ).toHaveBeenCalledTimes( 1 );
			} );
		} );
	} );
} );
