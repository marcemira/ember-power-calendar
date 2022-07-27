import DaysComponent from '../../power-calendar/days/component'
import { isSame } from 'ember-power-calendar-utils'

export default class PowerCalendarMultipleDays extends DaysComponent {
  maxLength = Infinity

  // Methods
  dayIsSelected (date, calendar = this.calendar) {
    const selected = calendar.selected || []

    return selected.some(d => isSame(date, d, 'day'))
  }

  dayIsDisabled (date) {
    const numSelected =
      (this.calendar.selected && this.calendar.selected.length) || 0
    const maxLength = this.maxLength || Infinity

    return (
      super.dayIsDisabled(...arguments) ||
      (numSelected >= maxLength && !this.dayIsSelected(date))
    )
  }
}
