var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var os = require('os');
var EOL = os.EOL;
var colors = require('colors');
/*colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  ok: 'green'
});*/
//
let args = require('minimist')(process.argv);


let sunshine = (s) => s.split(/[\r\n]+/).map(it => it.trim()).filter(it => it.length != 0).join(EOL);
let l = console.log;
let e = (s) => {console.error(s.red)};
let w = (s) => {console.log(s.yellow)};
let v = (s) => {console.log(s.cyan)};
let dbg = (s) => {console.log(s.magenta)};
let help = () => {
  l("Cpp Tester. Made by".cyan +" Rofleksey".rainbow);
  l("Usage: node tester.js --dir [path to folder with tests] (--file [filename without .in or .out postfix]) (--stdin) --app [path to executable to test]");
  l("For each test place .in and .out file in tests folder.")
}
if(!args.dir || args.dir===true) {
  e("Path to folder with tests is not specified! (--dir)");
  help();
  process.exit(1);
} else {
  args.dir = path.resolve(args.dir);
  if(!fs.existsSync(args.dir)) {
    e("Folder " + args.dir + " doesn't exist! (--dir)");
    process.exit(1);
  }
  if(!fs.lstatSync(args.dir).isDirectory()) {
    e("File " + args.dir + " is not a directory! (--dir)");
    help();
    process.exit(1);
  }
}
if(!args.stdin && (!args.file || args.file===true)) {
  e("Filename is not specified! (--file)");
  help();
  process.exit(1);
}
if(!args.app || args.app === true) {
  e("Executable is not specified! (--app)");
  help();
  process.exit(1);
} else {
  args.app = path.resolve(args.app);
  if(!fs.existsSync(args.app)) {
    e("File " + args.app + " doesn't exist! (--app)");
    process.exit(1);
  }
}

fs.readdir(args.dir, (err, files) => {
  if(err) {
    e("Error occured opening "+args.dir+": "+err);
    process.exit(1);
  }
  let tests = files.filter(it => path.extname(it)==".in").map(it => it.substring(0, it.indexOf(".in"))).filter(it => {
    if(!fs.existsSync(path.join(args.dir, it+".out"))) {
      w("Warning: can't find appropriate .out file for test " + it + ". This test is not valid.");
      return false;
    }
    return true;
  });
  l();
  l((tests.length+" valid tests found.").blue.bold);
  l();

  let counter = 0;

  tests.forEach(it => {
    process.stdout.write(("> Testing '"+it+"'... ").cyan.bold);
    let stdInput;
    if(!args.stdin) {
      fs.copyFileSync(path.join(args.dir, it+".in"), path.join(path.dirname(args.app), args.file+".in"));
    } else {
      stdInput = sunshine(fs.readFileSync(path.join(args.dir, it+".in"), "utf-8"))+EOL;
    }
    let child = cp.spawnSync(args.app, {
      cwd: path.dirname(args.app),
      timeout: 3000,
      encoding: "utf-8",
      input: stdInput
    });
    /*
    if(child.error) {
      e("Invalid exit code: " + child.status);
      e("Stdout: "+child.stdout);
      e("Stderr: "+child.stderr);
      e();
    }*/
    if(child.status == 0 && child.signal == null) {
      let output = !args.stdin ? sunshine(fs.readFileSync(path.join(path.dirname(args.app), args.file+".out"), "utf-8")) : sunshine(child.stdout);
      let expected = sunshine(fs.readFileSync(path.join(args.dir, it+".out"), "utf-8"));
      if(output != expected) {
        w("[ WRONG ANSWER ]");
        l("Expected: "+expected);
        l("Found: "+output);
        l();
      } else {
        l("[ OK ]".green);
        l();
        counter++;
      }
    } else {
      if(child.signal == "SIGTERM") {
        e("[ TIME OUT: "+child.signal+"]");
      } else {
        e("[ ERROR: "+child.signal+" ]");
      }
      l("stdout: "+child.stdout);
      l("stderr: "+child.stderr);
      l();
    }
  });
  if(counter == 0 && tests.length != 0) {
    e(("[ ERROR ] " + counter+" / "+tests.length +" tests passed.").bold);
  } else if(counter < tests.length) {
    w(("[ ERROR ] " + counter+" / "+tests.length +" tests passed.").bold);
  } else {
    l(("[ OK ] "+counter+" / "+tests.length +" tests passed.").green.bold);
  }

})
