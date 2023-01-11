/** global: PropertiesService */

const TersePropertiesService = {
  getScriptProperty(key, decoder = null) {
    const value = PropertiesService.getScriptProperties().getProperty(key);
    if (decoder) {
      return decoder(value);
    }
    return value;
  },

  getUserProperty(key, decoder = null) {
    const value = PropertiesService.getUserProperties().getProperty(key);
    if (decoder) {
      return decoder(value);
    }
    return value;
  },

  setUserProperty(key, value, encoder = null) {
    if (encoder) {
      value = encoder(value);
    }
    return PropertiesService.getUserProperties().setProperty(key, value);
  },

  deleteUserProperty(key) {
    return PropertiesService.getUserProperties().deleteProperty(key);
  }
}
