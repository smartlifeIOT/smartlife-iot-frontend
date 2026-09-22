export const isValidDeviceName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 50;
};

export const isValidDeviceType = (type: string): boolean => {
  const validTypes = ['sensor', 'gateway', 'controller', 'actuator'];
  return validTypes.includes(type.toLowerCase());
};

export const isValidFirmwareVersion = (version: string): boolean => {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  return versionRegex.test(version);
};

export const isValidModel = (model: string): boolean => {
  return model.length >= 2 && model.length <= 30;
};

export const isValidManufacturer = (manufacturer: string): boolean => {
  return manufacturer.length >= 2 && manufacturer.length <= 50;
};

export const isValidLocation = (location: string): boolean => {
  return location.length >= 2 && location.length <= 100;
};

export const isValidSerialNumber = (serialNumber: string): boolean => {
  return /^[A-Za-z0-9\-]+$/.test(serialNumber) && serialNumber.length >= 5;
};

export const isValidCoordinates = (lat: number, lon: number): boolean => {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
};

export const isValidTelemetryKey = (key: string): boolean => {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) && key.length <= 50;
};

export const isValidTelemetryValue = (value: any): boolean => {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (typeof value === 'object' && value !== null)
  );
};