{
  # Node 26's common.gypi references variables like `enable_thin_lto` in
  # `conditions`, but the bundled node-gyp (10.x) shipped with prebuild
  # 13 doesn't inject defaults for them. On the Windows toolchain that
  # results in `gyp: name 'enable_thin_lto' is not defined`. Providing a
  # `%` default here is safe across all platforms and node-gyp versions:
  # gyp only uses our default when the variable isn't already set.
  'variables': {
    'enable_thin_lto%': 'false',
  },
  'targets': [
    {
      'target_name': 'node_expat',
      'sources': [ 'node-expat.cc' ],
      'include_dirs': [
        '<!(node -e "require(\'nan\')")'
      ],
      'cflags': [ "-Wno-cast-function-type" ],
      'dependencies': [
        'deps/libexpat/libexpat.gyp:expat'
      ]
    }
  ]
}
