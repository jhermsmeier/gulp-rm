var DeleteStream = require( '..' )
var GlobStream = require( 'glob-stream' )
var fs = require( 'fs' )
var mkd = require( 'mkdirp' )

suite( 'DeleteStream', function() {

  test( 'can delete hidden directories', function( done ) {

    var dir = __dirname + '/tree/.tmp'

    mkd( dir, function( error ) {

      if( error ) return done( error )

      var gs = GlobStream.create( __dirname + '/tree/.*' )
      var ds = new DeleteStream()

      ds.on( 'error', done )
      ds.once( 'end', function() {
        process.nextTick( function() {
          fs.stat( dir, function( error ) {
            done( error ? null : new Error( 'Directory still exists: ' + dir ) )
          })
        })
      })

      gs.pipe( ds ).resume()

    })

  })

})
