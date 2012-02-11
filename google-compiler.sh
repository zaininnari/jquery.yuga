#!/bin/sh

# compilation_level :
#     WHITESPACE_ONLY
#     SIMPLE_OPTIMIZATIONS
#     ADVANCED_OPTIMIZATIONS

sh ./gjslint.sh
echo $?

java \
    -jar google-compiler/compiler.jar \
    --warning_level VERBOSE \
    --js "js/yuga.js" \
    --js_output_file js/jquery.yuga.min.js \
    --jscomp_off=internetExplorerChecks \
    --externs google-compiler/jquery-1.7.js \
    --externs google-compiler/extern1.js \
    --externs google-compiler/thickbox.js \
    --compilation_level SIMPLE_OPTIMIZATIONS
