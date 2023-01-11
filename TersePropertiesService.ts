type PropertyDecoder = (encoded: string) => any;
type PropertyEncoder = (value: any) => string;

class TersePropertiesService {
  public static getScriptProperty(key: string, decoder: PropertyDecoder = null) {
    const value = PropertiesService.getScriptProperties().getProperty(key);
    if (decoder) {
      return decoder(value);
    }
    return value;
  }

  public static getUserProperty(key: string, decoder: PropertyDecoder = null) {
    const value = PropertiesService.getUserProperties().getProperty(key);
    if (decoder) {
      return decoder(value);
    }
    return value;
  }

  public static setUserProperty(key: string, value: string, encoder: PropertyEncoder = null) {
    if (encoder) {
      value = encoder(value);
    }
    return PropertiesService.getUserProperties().setProperty(key, value);
  }

  public static deleteUserProperty(key: string) {
    return PropertiesService.getUserProperties().deleteProperty(key);
  }
}
