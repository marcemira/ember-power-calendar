import Component from '@glimmer/component'
import { action } from '@ember/object'
import { guidFor } from '@ember/object/internals'
import { inject as service } from '@ember/service'
import { task } from 'ember-concurrency'
import { assert } from '@ember/debug'
import { arg } from 'ember-arg-types'
import { string, func } from 'prop-types'
import {
  add,
  normalizeDate,
  normalizeCalendarValue
} from 'ember-power-calendar-utils'

export default class extends Component {
  @service('power-calendar') powerCalendarService

  navComponent = 'power-calendar/nav'
  daysComponent = 'power-calendar/days'
  center = null
  _calendarType = 'single'

  @arg(func)
  onInit

  @arg(func)
  onSelect

  @arg(func)
  onCenterChange

  @arg(string)
  locale

  // Lifecycle hooks
  constructor() {
    super(...arguments)

    this.registerCalendar()

    if (this.onInit) {
      this.onInit(this.publicAPI)
    }
  }

  // CPs
  get publicActions() {
    const actions = {}

    if (this.onSelect) {
      actions.select = (...args) => this.select(...args)
    }

    if (this.onCenterChange) {
      const changeCenter = (newCenter, calendar, e) => {
        return this.changeCenterTask.perform(newCenter, calendar, e)
      }

      actions.changeCenter = changeCenter

      actions.moveCenter = (step, unit, calendar, e) => {
        let newCenter = add(this.currentCenter, step, unit)
        return changeCenter(newCenter, calendar, e)
      }
    }

    return actions
  }

  get selected() {
    return undefined
  }

  set selected(v) {
    return normalizeDate(v)
  }

  get currentCenter() {
    let center = this.center

    if (!center) {
      center = this.selected || this.powerCalendarService.getDate()
    }

    return normalizeDate(center)
  }

  get publicAPI() {
    return this._publicAPI
  }

  get _publicAPI() {
    return {
      uniqueId: guidFor(this),
      type: this._calendarType,
      selected: this.selected,
      loading: this.changeCenterTask.isRunning,
      center: this.currentCenter,
      locale: this.locale || this.powerCalendarService.locale,
      actions: this.publicActions
    }
  }

  get tagWithDefault() {
    if (this.tag === undefined || this.tag === null) {
      return 'div'
    }
    return this.tag
  }

  // Actions
  @action
  select(day, calendar, e) {
    if (this.onSelect) {
      this.onSelect(day, calendar, e)
    }
  }

  // Methods
  registerCalendar() {
    if (window) {
      window.__powerCalendars = window.__powerCalendars || {} // TODO: weakmap??
      window.__powerCalendars[this.publicAPI.uniqueId] = this
    }
  }

  unregisterCalendar() {
    if (window) {
      delete window.__powerCalendars[guidFor(this)]
    }
  }

  // Tasks
  @task
  * changeCenterTask(newCenter, calendar, e) {
    assert(
      "You attempted to move the center of a calendar that doesn't receive an `@onCenterChange` action.",
      typeof this.onCenterChange === 'function'
    )
    let value = normalizeCalendarValue({ date: newCenter })
    yield this.onCenterChange(value, calendar, e)
  }

  willDestroy() {
    super.willDestroy(...arguments)
    this.unregisterCalendar()
  }
}
