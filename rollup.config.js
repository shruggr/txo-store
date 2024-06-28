import typescript from '@rollup/plugin-typescript';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';

export default {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
		format: 'es',
		sourcemap: true,
		// name: 'spv-store',
		// globals: {}
	},
	plugins: [typescript(), nodePolyfills(), nodeResolve(), sourcemaps()]
};