import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Add this alias configuration
		alias: {
			$lib: './src/lib',
		},
		adapter: adapter({
			// Specify Node.js version
			runtime: 'nodejs20.x'
		}),
	}
};

export default config;