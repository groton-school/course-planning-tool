import g from '@battis/gas-lighter';

class Form implements g.HtmlService.Element.Picker.Pickable {
  public constructor(private _year: string | number) { }

  toOption(): g.HtmlService.Element.Picker.Option {
    return { name: `Form of ${this._year}`, value: this._year.toString() };
  }
}

namespace Form { }

export { Form as default };
