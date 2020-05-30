import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'
import package_ from './package.json'

export default {
  input : path.resolve(__dirname, './src/client.ts'),
  output: [
    {
      file  : package_.main,
      format: 'cjs',
    },
    {
      file  : package_.module,
      format: 'es',
    },
    {
      name   : 'Webauthn',
      file   : package_.browser,
      format : 'iife',
      exports: 'default',
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({ tsconfig: path.resolve(__dirname, './tsconfig.json') }),
    // globals(),
    // auto(),
    resolve(),
    cjs({
      include     : /node_modules/,
      namedExports: { 'node_modules/js-base64/base64.js': ['Base64'] },
    }),
    babel({
      babelHelpers      : 'runtime',
      skipPreflightCheck: true,
      extensions        : ['.js', '.ts'],
    }),
  ],
}
