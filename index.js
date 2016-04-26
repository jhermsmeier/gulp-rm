var fs = require( 'fs' )
var path = require( 'path' )
var inherit = require( 'bloodline' )
var Stream = require( 'stream' )
var log = console.log.bind( console, '[gulp-rm]' )

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

  this._async = this.options.async !== false

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
 * Walk an array of directories and
 * delete one after another
 * @param  {Array}    ls
 * @param  {Function} done
 */
function rmdirWalk( ls, done ) {
  if( ls.length === 0 ) return done()
  fs.rmdir( ls.shift().path, function( error ) {
    if( error ) log( error.message )
    rmdirWalk( ls, done )
  })
}

/**
 * DeleteStream prototype
 * @type {Object}
 */
DeleteStream.prototype = {

  constructor: DeleteStream,

  _transform: function( file, encoding, next ) {

    if( path.relative( file.cwd, file.path ) === '' ) {
      log( 'Cannot delete current working directory' )
    }

    if( file.stat == null ) {
      try { file.stat = fs.statSync( file.path ) }
      catch( error ) {
        log( error.message )
        return next()
      }
    }

    // Defer removal of directories until
    // all files are deleted to ensure they're empty
    if( file.stat.isDirectory() ) {
      this.directories.unshift( file )
      next()
    } else if( !this._async ) {
      try { fs.unlinkSync( file.path ) }
      catch( error ) { log( error.message ) }
      finally { next() }
    } else {
      fs.unlink( file.path, function( error ) {
        if( error ) log( error.message )
        next()
      })
    }

  },

  _flush: function( done ) {

    // Sort by depth in the directory tree,
    // so that the deepest are the first
    this.directories
      .sort( function( a, b ) {
        var x = a.path.replace( /^\/|\/$/, '' ).split( '/' ).length
        var y = b.path.replace( /^\/|\/$/, '' ).split( '/' ).length
        if( x > y ) return -1
        if( x < y ) return +1
        return 0
      })

    if( !this._async ) {
      var dir = null
      while( dir = this.directories.shift() ) {
        try { fs.rmdirSync( dir.path ) }
        catch( error ) { log( error.message ) }
        if( !this.directories.length ) done()
      }
    } else {
      rmdirWalk( this.directories, done )
    }

  }

}

// Inherit from transform stream
inherit( DeleteStream, Stream.Transform )

// Exports
module.exports = DeleteStream.create
