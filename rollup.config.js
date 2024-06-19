import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'es',
		// name: 'spv-store',
		// globals: {}
	},
	plugins: [typescript(), nodePolyfills()]
};