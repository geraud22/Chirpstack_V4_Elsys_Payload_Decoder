        /*
  ______ _       _______     _______ 
 |  ____| |     / ____\ \   / / ____|
 | |__  | |    | (___  \ \_/ / (___  
 |  __| | |     \___ \  \   / \___ \ 
 | |____| |____ ____) |  | |  ____) |
 |______|______|_____/   |_| |_____/ 
 
  ELSYS simple payload decoder. 
*/
const TYPE_TEMP = 0x01; //temp 2 bytes -3276.8°C -->3276.7°C
const TYPE_RH = 0x02; //Humidity 1 byte  0-100%
const TYPE_ACC = 0x03; //acceleration 3 bytes X,Y,Z -128 --> 127 +/-63=1G
const TYPE_LIGHT = 0x04; //Light 2 bytes 0-->65535 Lux
const TYPE_MOTION = 0x05; //No of motion 1 byte  0-255
const TYPE_CO2 = 0x06; //Co2 2 bytes 0-65535 ppm
const TYPE_VDD = 0x07; //VDD 2byte 0-65535mV
const TYPE_ANALOG1 = 0x08; //VDD 2byte 0-65535mV
const TYPE_GPS = 0x09; //3bytes lat 3bytes long binary
const TYPE_PULSE1 = 0x0A; //2bytes relative pulse count
const TYPE_PULSE1_ABS = 0x0B; //4bytes no 0->0xFFFFFFFF
const TYPE_EXT_TEMP1 = 0x0C; //2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL = 0x0D; //1bytes value 1 or 0
const TYPE_EXT_DISTANCE = 0x0E; //2bytes distance in mm
const TYPE_ACC_MOTION = 0x0F; //1byte number of vibration/motion
const TYPE_IR_TEMP = 0x10; //2bytes internal temp 2bytes external temp -3276.5C-->3276.5C
const TYPE_OCCUPANCY = 0x11; //1byte data
const TYPE_WATERLEAK = 0x12; //1byte data 0-255
const TYPE_GRIDEYE = 0x13; //65byte temperature data 1byte ref+64byte external temp
const TYPE_PRESSURE = 0x14; //4byte pressure data (hPa)
const TYPE_SOUND = 0x15; //2byte sound data (peak/avg)
const TYPE_PULSE2 = 0x16; //2bytes 0-->0xFFFF
const TYPE_PULSE2_ABS = 0x17; //4bytes no 0->0xFFFFFFFF
const TYPE_ANALOG2 = 0x18; //2bytes voltage in mV
const TYPE_EXT_TEMP2 = 0x19; //2bytes -3276.5C-->3276.5C
const TYPE_EXT_DIGITAL2 = 0x1A; // 1bytes value 1 or 0
const TYPE_EXT_ANALOG_UV = 0x1B; // 4 bytes signed int (uV)
const TYPE_TVOC = 0x1C; // 2 bytes (ppb)
const TYPE_DEBUG = 0x3D; // 4bytes debug

function bin16dec(bin) {
    var num = bin & 0xFFFF;
    if (0x8000 & num)
        num = -(0x010000 - num);
    return num;
}

function bin8dec(bin) {
    var num = bin & 0xFF;
    if (0x80 & num)
        num = -(0x0100 - num);
    return num;
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}

function decodeUplink(input) {
    var bytes = input.bytes;
    var decoded = {};

	for (i = 0; i < bytes.length; i++) {
  		switch (bytes[i]) {
  			case TYPE_TEMP: //Temperature
      			var temp = (bytes[i + 1] << 8) | (bytes[i + 2]);
              	temp = bin16dec(temp);
              	decoded.temperature = temp / 10;
              	i += 2;
              	break
          	case TYPE_RH: //Humidity
              	var rh = (bytes[i + 1]);
              	decoded.humidity = rh;
              	i += 1;
              	break
          	case TYPE_ACC: //Acceleration
                decoded.x = bin8dec(bytes[i + 1]);
                decoded.y = bin8dec(bytes[i + 2]);
                decoded.z = bin8dec(bytes[i + 3]);
                i += 3;
                break
            case TYPE_LIGHT: //Light
                decoded.light = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_MOTION: //Motion sensor(PIR)
                decoded.motion = (bytes[i + 1]);
                i += 1;
                break
            case TYPE_CO2: //CO2
                decoded.co2 = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_VDD: //Battery level
                decoded.vdd = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_ANALOG1: //Analog input 1
                decoded.analog1 = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_GPS: //gps
                i++;
                decoded.lat = (bytes[i + 0] | bytes[i + 1] << 8 | bytes[i + 2] << 16 | (bytes[i + 2] & 0x80 ? 0xFF << 24 : 0)) / 10000;
                decoded.long = (bytes[i + 3] | bytes[i + 4] << 8 | bytes[i + 5] << 16 | (bytes[i + 5] & 0x80 ? 0xFF << 24 : 0)) / 10000;
                i += 5;
                break
            case TYPE_PULSE1: //Pulse input 1
                decoded.pulse1 = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_PULSE1_ABS: //Pulse input 1 absolute value
                var pulseAbs = (bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | (bytes[i + 4]);
                decoded.pulseAbs = pulseAbs;
                i += 4;
                break
            case TYPE_EXT_TEMP1: //External temp
                var temp = (bytes[i + 1] << 8) | (bytes[i + 2]);
                temp = bin16dec(temp);
                decoded.externalTemperature = temp / 10;
                i += 2;
                break
            case TYPE_EXT_DIGITAL: //Digital input
                decoded.digital = (bytes[i + 1]);
                i += 1;
                break
            case TYPE_EXT_DISTANCE: //Distance sensor input
                decoded.distance = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_ACC_MOTION: //Acc motion
                decoded.accMotion = (bytes[i + 1]);
                i += 1;
                break
            case TYPE_IR_TEMP: //IR temperature
                var iTemp = (bytes[i + 1] << 8) | (bytes[i + 2]);
                iTemp = bin16dec(iTemp);
                var eTemp = (bytes[i + 3] << 8) | (bytes[i + 4]);
                eTemp = bin16dec(eTemp);
                decoded.irInternalTemperature = iTemp / 10;
                decoded.irExternalTemperature = eTemp / 10;
                i += 4;
                break
            case TYPE_OCCUPANCY: //Body occupancy
                decoded.occupancy = (bytes[i + 1]);
                i += 1;
                break
            case TYPE_WATERLEAK: //Water leak
                decoded.waterleak = (bytes[i + 1]);
                i += 1;
                break
            case TYPE_GRIDEYE: //Grideye data
                var ref = bytes[i+1];
                i++;
                decoded.grideye = [];
                for(var j = 0; j < 64; j++) {
                    decoded.grideye[j] = ref + (bytes[1+i+j] / 10.0);
                }
                i += 64;
                break
            case TYPE_PRESSURE: //External Pressure
                var temp = (bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | (bytes[i + 4]);
                decoded.pressure = temp / 1000;
                i += 4;
                break
            case TYPE_SOUND: //Sound
                decoded.soundPeak = bytes[i + 1];
                decoded.soundAvg = bytes[i + 2];
                i += 2;
                break
            case TYPE_PULSE2: //Pulse 2
                decoded.pulse2 = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_PULSE2_ABS: //Pulse input 2 absolute value
                decoded.pulseAbs2 = (bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | (bytes[i + 4]);
                i += 4;
                break
            case TYPE_ANALOG2: //Analog input 2
                decoded.analog2 = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            case TYPE_EXT_TEMP2: //External temp 2
                var temp = (bytes[i + 1] << 8) | (bytes[i + 2]);
                temp = bin16dec(temp);
                if(typeof decoded.externalTemperature2 === "number") {
                    decoded.externalTemperature2 = [decoded.externalTemperature2];
                } 
                if(typeof decoded.externalTemperature2 === "object") {
                    decoded.externalTemperature2.push(temp / 10);
                } else {
                    decoded.externalTemperature2 = temp / 10;
                }
                i += 2;
                break
            case TYPE_EXT_DIGITAL2: //Digital input 2
                decoded.digital2 = (bytes[i + 1]);
                i += 1;
                break
            case TYPE_EXT_ANALOG_UV: //Load cell analog uV
                decoded.analogUv = (bytes[i + 1] << 24) | (bytes[i + 2] << 16) | (bytes[i + 3] << 8) | (bytes[i + 4]);
                i += 4;
                break
            case TYPE_TVOC:
                decoded.tvoc = (bytes[i + 1] << 8) | (bytes[i + 2]);
                i += 2;
                break
            default: //something is wrong with data
                i = bytes.length;
                break
          }
      }
    return {
        data: decoded
    };
}        