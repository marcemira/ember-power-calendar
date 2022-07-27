import { computed, action, getProperties } from '@ember/object'
import CalendarComponent from '../power-calendar/component'
import { arg } from 'ember-arg-types'
import { assert } from '@ember/debug'
import ownProp from 'ember-power-calendar/-private/utils/own-prop'
import { func } from 'prop-types'
import {
  normalizeDate,
  normalizeRangeActionValue,
  diff,
  isAfter,
  isBefore,
  normalizeDuration
} from 'ember-power-calendar-utils'

const DEFAULT_DURATION = 86400000

export default class PowerCalendarRange extends CalendarComponent {
  @arg
  center

  @arg
  selected

  @arg(func)
  onSelect

  @arg
  proximitySelection = false

  @arg
  minRange

  @arg
  maxRange

  _calendarType = 'range'
  daysComponent = 'power-calendar-range/days'

  get currentCenter () {
    let center = this.center

    if (!center) {
      center = this.selected.start || this.powerCalendarService.getDate()
    }

    return normalizeDate(center)
  }

  get publicAPI () {
    let rangeOnlyAPI = {
      minRange: this.minRange,
      maxRange: this.maxRange
    }

    return { ...rangeOnlyAPI, ...this._publicAPI }
  }

  // Actions
  @action
  select ({ date }, calendar, e) {
    assert(
      'date must be either a Date, or a Range',
      date?.start || date?.end || date instanceof Date
    )

    let range

    if (date?.start && date?.end) {
      range = { date }
    } else {
      range = this._buildRange({ date })
    }

    const { start, end } = range.date

    if (start && end) {
      const { minRange, maxRange } = this.publicAPI
      const diffInMs = Math.abs(diff(end, start))

      if (diffInMs < minRange || (maxRange && diffInMs > maxRange)) {
        return
      }
    }

    if (this.onSelect) {
      this.onSelect(range, calendar, e)
    }
  }

  // Methods
  _buildRange (day) {
    const selected = this.publicAPI.selected || { start: null, end: null }
    const { start, end } = getProperties(selected, 'start', 'end')

    if (this.proximitySelection) {
      return this._buildRangeByProximity(day, start, end)
    }

    return this._buildDefaultRange(day, start, end)
  }

  _buildRangeByProximity (day, start, end) {
    if (start && end) {
      const changeStart =
        Math.abs(diff(day.date, end)) > Math.abs(diff(day.date, start))

      return normalizeRangeActionValue({
        date: {
          start: changeStart ? day.date : start,
          end: changeStart ? end : day.date
        }
      })
    }

    if (isBefore(day.date, start)) {
      return normalizeRangeActionValue({ date: { start: day.date, end: null } })
    }

    return this._buildDefaultRange(day, start, end)
  }

  _buildDefaultRange (day, start, end) {
    if (start && !end) {
      if (isAfter(start, day.date)) {
        return normalizeRangeActionValue({
          date: { start: day.date, end: start }
        })
      }
      return normalizeRangeActionValue({
        date: { start: start, end: day.date }
      })
    }

    return normalizeRangeActionValue({ date: { start: day.date, end: null } })
  }
}
