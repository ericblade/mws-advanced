### ARCHIVED - DEPRECATION ALERT ###

Over the last year, Amazon has shutdown most of the MWS API, and it has not been available to new users for quite some time.  The new Amazon SP API is a replacement for it.  You can find suitable libraries for using SP API in several places on github.  

As the MWS API is effectively no longer available, this repository has now been deprecated, and moved to archive status.  There will be no more updates of any kind to this code.  If you depend on it still, for the last few months of the last few sections of MWS that remain, go ahead and fork it.

Have a great day, and BE AWESOME.

Thank you for all your support over the years.

-Eric

[![Build Status](https://travis-ci.org/ericblade/mws-advanced.svg?branch=master)](https://travis-ci.org/ericblade/mws-advanced)
[![codebeat badge](https://codebeat.co/badges/83ea05b8-db4e-4765-ae00-63169ef19c2e)](https://codebeat.co/projects/github-com-ericblade-mws-advanced-master)
[![Greenkeeper badge](https://badges.greenkeeper.io/ericblade/mws-advanced.svg)](https://greenkeeper.io/)
[![Documentation badge](./docs/badge.svg)](https://esdoc.org)
[![Coverage Status](https://coveralls.io/repos/ericblade/mws-advanced/badge.svg?branch=master)](https://coveralls.io/r/ericblade/mws-advanced?branch=master)
# mws-advanced -- A modern Amazon Merchant Web Services API Interface for Javascript

[![Join the chat at https://gitter.im/mws-advanced/Lobby](https://badges.gitter.im/mws-advanced/Lobby.svg)](https://gitter.im/mws-advanced/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## What does it do?

mws-advanced provides a modern, fast, and hopefully sensible APIs to connect your Javascript
application (node or browser) to the Amazon Merchant Web Services API.

Nice-to-have features:
 - Automatic throttle-retry mechanism
 - Automatic parameter validation
 - Transform Javascript Arrays into MWS List format
 - Transform Date objects into ISO-8601 date stamps

mws-advanced uses the straight-forward and very basic functionality provided by
[mws-simple](https://github.com/ericblade/mws-simple) to provide a much more advanced library for
accessing MWS, than what has previously been available in the past.

# Discussions
Hey, everyone! :-) This is by far my most popular repo on github at the moment, based on the number
of clones and amount of traffic I'm seeing in the stats. If you think you might have a good use for
this library, drop a line at [Discussion](https://github.com/ericblade/mws-advanced/issues/1) :-)

## Documentation / Quick-Start (I've heard enough, let's write some code)
Automatically generated documentation is available at [Documentation](https://ericblade.github.io/mws-advanced/).

## Why a new mws library?

Although there are a whole lot of MWS libraries out there on the npm repository, few are actively
maintained, and even fewer are written using modern Javascript. Some use Promises, but none are
written to take advantage of the newest features of the language. Still fewer have documentation
that doesn't just assume you are intimately familiar with the Amazon MWS API already.

I am writing this to change that. I am writing a project that needs access to the MWS API, and to
do that, I needed code that interfaces well with modern code.  I need code that is documented well,
is intuitive to use, and doesn't leave my primary application stuck having to figure out all the
vagaries of an XML response transformed into a JSON result.  Or worse.

Most of all, though, this library is here to give you the pieces that I am using to build my
internal project with.  Enjoy! :-)

## Requirements

This requires node.js v9.0+ to run. If that's not your environment, you can setup Babel or some
other transpiler to make it work in older versions.  I'd be happy to accept pulls for this, or any
other reason, but it is not something I am at all concerned with.  Let's move the ecosystem forward!

## Development

This library is under heavy development.  Pull requests from all are welcome.  Since I am writing
a system that makes use of this library, my primary priority is to make it work for my specific use-
cases.  Your use cases may not match mine, so let's work together to create a fantastic library for
all of us :-)
