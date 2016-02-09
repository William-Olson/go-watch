#!/usr/bin/env node

'use strict';

var gulp = require('gulp')
  , sh = require('shelljs');

//grab environment variable value
var GO_PATH = process.env.GOPATH;

/*
    Change config var below for
    your specific scenario
*/
var config = {
    build_path : 'github.com/user/hello' // for running: 'go install ...'
  , binary     : 'hello'                 // called with global scope
  , watch_path : GO_PATH + '/src/github.com/**/*.go'
  , params     : ''
  , shouldRun  : false
};


//change the marker if annoying
var GW = '[go-watch]';

//simple state tracker vars
var task_num =0;
var PHASE = {BUILD: 'BUILD', RUN: 'RUN'};



/* the log.msg function */
// (wraps tasks with before/after messages)
var log = {
  msg: function (phase, task_count, task_cb) {
    switch(phase){
      case PHASE.BUILD:
        console.log('\n' + GW + ' -- Performing -- Build #%d: \n', task_count);
        task_cb();
        //console.log('\n' + GW + ' -- Done -- Build #%d. \n', task_count);
        break;
      case PHASE.RUN:
        console.log('\n' + GW + ' -- Performing -- Run #%d: \n', task_count);
        task_cb();
        //console.log('\n' + GW + ' -- Done -- Run #%d. \n', task_count);
        break;
      default:
        return;
    }
  }
};


/* gulp tasks */
//if using gulp cmd, use: gulp --gulpfile=this_file.js
gulp.task('build', builder_task);
gulp.task('run', ['build'], runner_task);
gulp.task('watch', ['run'], watcher_task);
gulp.task('default', ['watch']);


// -----------------------*----------- task implementations -----------*----------------------- */

function builder_task (){
  log.msg(PHASE.BUILD, ++task_num, function () {
    sh.exec('go install ' + config.build_path);
  });
}
function runner_task (){
  if(config.shouldRun)
    log.msg(PHASE.RUN, task_num, function () {
      sh.exec(config.binary + ' ' + config.params);
    });
}
function watcher_task (){
  gulp.watch(config.watch_path, ['run']);
}


// -------------------------------------------------------------------------------------------- */



// command line helpers...

/*
  @return: {int}
    returns 1 on success, 0 on help,
    and -1 on errors
*/
function parse_args (settings) {
  for(var i=1; i < process.argv.length; i++){
    if(process.argv[i][0] === '-')
      switch(process.argv[i][1]) {
        case 's': //src: files to watch
          var src_files = process.argv[++i];
          if(src_files.indexOf(',') === -1) {
            settings.watch_path =  ((src_files[0] === '/') ?
                                 [ (GO_PATH + src_files) ] :
                                 [ (GO_PATH + '/' + src_files) ]);
          } else{
            settings.watch_path = src_files.split(',');
            settings.watch_path.forEach(trim_each);
          }
          break;
        case 'b': //build: path to run go install with
          settings.build_path = process.argv[++i];
          break;
        case 'r': //runner: produced by go install cmd
          settings.binary = process.argv[++i];
          settings.shouldRun = true;
          break;
        case 'p': //params: to pass to runner program
          settings.params = process.argv[++i];
          break;
        case 'h': //help
          print_help();
          return 0;
        default:
          print_help(true, process.argv[i]);
          return -1;
      }
  }
  return 1;
}

//delete whitespace from strings
//(callback of Array.for_each())
//and add $GOPATH to root of each path
function trim_each (opt, n, opts) {
  opts[n] = opt.trim();
  opts[n] = ((opts[n][0] === '/') ?
    (GO_PATH + opts[n]) : (GO_PATH + '/' + opts[n]));
}

/*
  print_help
    displays help menu to console,
    shows arg error if given.
*/
function print_help (err, focus) {
  if(err) console.error('\n\n[!] Error: Arg %s is not a valid arg!\n', focus);
  console.log('   Program Options: \n' +
              '    -s    :   src files to watch for changes ($GOPATH is root)\n' +
              '    -b    :   build path relative to $GOPATH/src (for \'go install ...\') \n' +
              '    -r    :   runner name for binary file produced ($GOPATH/bin executable)\n' +
              '    -p    :   params to pass to the runner \n' +
              '    -h    :   display this help menu \n' );
}



//--------------------------  CONTROL FLOW --------------------------//

//get the console args and set config
var parse_result = parse_args(config);
if(parse_result <= 0){ process.exit(parse_result); }

/* when not calling directely from gulp cmd */
if((process.argv[1].indexOf('gulp') === -1) ||
   //allow renaming of this file to gulpfile.js
   (process.argv[1].indexOf('gulpfile') !== -1)){
  builder_task();
  runner_task();
  watcher_task();
}

//------------------------------ END --------------------------------//
