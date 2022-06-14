import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {BLEPrinter} from 'react-native-thermal-receipt-printer';

const App = () => {
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPrinter, setCurrentPrinter] = useState();

  const init = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        );
        console.log('granted: ', granted);
      }
      console.log('initializing');
      await BLEPrinter.init();
      console.log('initialized');
      const printersOnNetwork = await BLEPrinter.getDeviceList();
      console.log('printersOnNetwork: ', printersOnNetwork);
      setPrinters(printersOnNetwork);
      setLoading(false);
    } catch (error) {
      console.log('init BLE error: ', error);
      Alert.alert('Scanning printers error', JSON.stringify(error));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, []);

  const connectPrinter = async printer => {
    try {
      console.log('printer: ', printer);
      //connect printer
      const selectedPrinter = await BLEPrinter.connectPrinter(
        printer.inner_mac_address,
      );
    } catch (error) {
      console.log('connect printer error: ', error);
    }
    setCurrentPrinter(printer);
  };

  printBillTest = async () => {
    try {
      await BLEPrinter.printBill('<C>sample bill</C>', {beep: true});
    } catch (error) {
      console.log('print bill error: ', error);
    }
  };

  printTextTest = async () => {
    try {
      await BLEPrinter.printText('<C>sample text</C>', {beep: true});
    } catch (error) {
      console.log('print bill error: ', error);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{backgroundColor: Colors.white, paddingTop: 10}}>
          <Text style={styles.sectionTitle}>Printer App</Text>
          {loading && <ActivityIndicator style={{marginVertical: 10}} />}
          {printers.map(printer => (
            <Pressable
              key={printer.inner_mac_address}
              style={{
                borderWidth: 1,
                paddingHorizontal: 10,
                paddingVertical: 8,
                marginTop: 10,
              }}
              onPress={() => connectPrinter(printer)}>
              <Text>{`device_name: ${printer.device_name}, inner_mac_address: ${printer.inner_mac_address}`}</Text>
              {currentPrinter?.inner_mac_address ===
                printer.inner_mac_address && (
                <Text style={{color: 'green', fontSize: 16}}>Connected</Text>
              )}
            </Pressable>
          ))}
          <Pressable
            style={{
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginTop: 10,
              backgroundColor: '#CAD5E2',
            }}
            onPress={printBillTest}>
            <Text>Print Bill Text</Text>
          </Pressable>
          <Pressable
            style={{
              borderWidth: 1,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginTop: 10,
              backgroundColor: '#CAD5E2',
            }}
            onPress={printTextTest}>
            <Text>Print Normal Text</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default App;
