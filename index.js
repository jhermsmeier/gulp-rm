var fs     = require( 'fs' )
var path   = require( 'path' )
var derive = require( 'derive' )
var Gulp   = require( 'gulp-util' )
var Stream = require( 'stream' )

var PluginError = Gulp.PluginError

/**
 * DeleteStream constructor
 * @param {Object} options
 */
function DeleteStream( options ) {

  if( !(this instanceof DeleteStream) )
    return new DeleteStream( options )

  this.options = options || {}
  this.options.objectMode = true
  this.directories = []

  Stream.Transform.call( this, this.options )

}

/**
 * DeleteStream factory
 * @param  {Object} options
 * @return {Stream}
 */
DeleteStream.create = function( options ) {
  return new DeleteStream( options )
}

/**
 * DeleteStream prototype
 * @type {Object}
 */
DeleteStream.prototype = {

  constructor: DeleteStream,

  _transform: function( file, encoding, next ) {

    var relative = path.relative( file.cwd, file.path )
    if( relative === '' ) {
      Gulp.log( 'Cannot delete current working directory' )
    }

    if( file.stat.isDirectory() ) {
      this.directories.unshift( file )
      next()
    } else {
      try { fs.unlinkSync( file.path ) }
      catch( error ) { Gulp.log( error.message ) }
      finally { next() }
    }

  },

  _flush: function( done ) {
    this.directories
      .sort( function( a, b ) {
        var x = a.path.replace( /^\/|\/$/, '' ).split( '/' ).length
        var y = b.path.replace( /^\/|\/$/, '' ).split( '/' ).length
        if( x > y ) return -1
        if( x < y ) return +1
        return 0
      })
      .forEach( function( dir ) {
        try { fs.rmdirSync( dir.path ) }
        catch( error ) { Gulp.log( error.message ) }
      })
    done()
  }

}

// Inherit from transform stream
derive.inherit(
  DeleteStream,
  Stream.Transform
)

// Exports
module.exports = DeleteStream.create
