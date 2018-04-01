# CppTester
Simple application tester
## What does it do
It simply passes user-defined input in target executable's stdin (or file) and checks if its stdout (or file contents it produces) matches expected one.
## Options
* --dir [path] - path to folder with tests [required]
* --file [path] / --stdin - input/output file target app uses [or use stdin/stdout]
* --app [path] - path to executable to test
## Usage
* Create folder with tests
* Create some tests in this folder e.g. myTest1.in, myTest1.out, errorTest1.in, errorTest1.out [Note: all tests MUST end with .in and .out]
* Run tester

Typical usage:
```
node tester.js --dir tests --stdin --app main.exe
```

## Installation
* Download and install NodeJS
* Download files
* Open console in folder with files and run:
```
npm install
```
* Run tester
