import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from '@rollup/plugin-babel';
import replace from 'rollup-plugin-replace';
import purgecss from '@fullhuman/postcss-purgecss'



export default {
        input : 'data_table.js',
        output: {
            file : 'bundle.js',
            format: 'iife'
        },
        plugins: [resolve(),
                  babel({
                     exclude: 'node_modules/**',
                     presets: ['@babel/env', '@babel/preset-react']
                   }),
                  commonjs({
                     namedExports: {
                        react: ['createElement', 'PureComponent'],
                     }
                    }),
                replace({
                        'process.env.NODE_ENV': JSON.stringify( 'production' )
                      }),
                purgecss({
                  content: ['*.html']
                })

            ]
        };