import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
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
    // eslint-disable-next-line array-element-newline
    typescript({ tsconfig: path.resolve(__dirname, './tsconfig.json') }),
    babel({ babelHelpers: 'runtime', extensions: ['.js', '.ts'] }),
  ],
}
