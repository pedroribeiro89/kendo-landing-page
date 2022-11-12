import { createHtmlPlugin } from 'vite-plugin-html'

export default {
    root: 'src',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        minify: 'terser'
    },
    plugins: [
        createHtmlPlugin({
            minify: true,
        })
    ]
}