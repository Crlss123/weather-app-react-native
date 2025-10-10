import { StyleSheet, Text, View, TextInput, FlatList, Image } from 'react-native';
import { useState, useEffect } from 'react';

const API_KEY = '334c97abd0130f13b6522e1f5c028285';

const Card = ({ forecast }) => {
  const iconUrl = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.leftColumn}>
        <Text style={styles.dayText}>{forecast.dayOfWeek}</Text>
        <Text style={styles.descText}>{forecast.desc}</Text>
        <Text style={styles.timeText}>{forecast.time}</Text>
      </View>

      <View style={styles.rightColumn}>
        <Text style={styles.cardTempText}>{Math.round(forecast.temp)}°C</Text>
        <Image source={{ uri: iconUrl }} style={styles.weatherIcon} />
      </View>
    </View>
  );
};

export default function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [temp, setTemp] = useState(null);

  useEffect(() => {
    if (!city) {
      setTemp(null);
      setData([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      getData(city);
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [city]);


  const getData = async (cityName) => {
    if (!cityName) return;
    setLoading(true);
    setData([]); // Limpiamos los datos anteriores al iniciar una nueva búsqueda
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      const json = await response.json();

      setTemp(json.list[0].main.temp);

      const forecasts = json.list.map((element) => {
        const dateObj = new Date(element.dt_txt);
        const dayOfWeek = dateObj.toLocaleDateString('es-ES', { weekday: 'long' });
        const time = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return {
          id: element.dt,
          temp: element.main.temp,
          desc: element.weather[0].description,
          icon: element.weather[0].icon,
          dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
          time: time,
        };
      });
      setData(forecasts);
    } catch (error) {
      console.log(error);
      setTemp(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar ciudad..."
        value={city}
        onChangeText={(text) => {
          setCity(text);
          if (!text) {
              setTemp(null);
              setData([]);
          }
        }}
        onSubmitEditing={() => getData(city)}
      />

      <View style={styles.tempContainer}>
        <Text style={styles.tempText}>{temp !== null ? `${Math.round(temp)}°C` : '- °C'}</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Card forecast={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    fontSize: 16,
    marginTop:80,
    marginHorizontal:30
  },
  tempContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  tempText: {
    fontSize: 72,
    fontWeight: '300',
    color: '#333',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  descText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  cardTempText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007aff',
  },
  weatherIcon: {
    width: 60,
    height: 60,
  },
});