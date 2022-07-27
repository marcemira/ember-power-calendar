# Ember Power Calendar [![Build Status](https://travis-ci.org/cibernox/ember-power-calendar.svg?branch=master)](https://travis-ci.org/cibernox/ember-power-calendar)

Customizable Calendar Component for Ember.

## Disclaimer

Version 0.20 of this addon requires Ember 4 or greater.

## Installation

`ember install ember-power-calendar`

```js
// ember-cli-build.js

let app = new EmberAddon(defaults, {
  'ember-cli-babel': {
    includePolyfill: true
  }
});
```

## Usage

There are many possible ways to use it, for giving you just a taste of the API:

```hbs
<PowerCalendar @selected={{arrival}} @onSelect={{action (mut arrival) value="date"}} as |calendar|>
  <calendar.Nav/>
  <calendar.Days/>
</PowerCalendar>
```

Check the full documentation at www.ember-power-calendar.com

