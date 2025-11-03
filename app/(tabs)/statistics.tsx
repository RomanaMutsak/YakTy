import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from '../../components/StarRating';
import { supabase } from '../../supabaseConfig';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
  accent: '#A1887F',
  chartColor: (opacity = 1) => `rgba(121, 85, 72, ${opacity})`,
  inputBackground: 'rgba(121, 85, 72, 0.08)',
};

const screenWidth = Dimensions.get('window').width;

interface ChartDataType {
  labels: string[];
  datasets: { data: number[] }[];
}

function getInsightMessage(mood: number, anxiety: number): string {
  if (mood === 0 && anxiety === 0) return "Продовжуй вести щоденник, щоб побачити аналіз.";
  if (mood >= 4 && anxiety <= 2) {
    return "Чудовий баланс! Твій настрій високий, а тривожність низька. Так тримати! 🌟";
  }
  if (mood < 2.5 && anxiety > 3.5) {
    return "Схоже, це був важкий період. Не забувай бути добрим до себе і приділяти час відпочинку. ☕️";
  }
  if (anxiety > 3.5) {
    return "Помітно, що рівень тривожності був підвищеним. Спробуй дихальні вправи або коротку прогулянку.";
  }
  if (mood < 2.5) {
    return "Твій настрій був переважно низьким. Спробуй згадати одну дрібницю, яка принесла тобі радість.";
  }
  return "Продовжуй спостереження! Кожен запис — це крок до кращого розуміння себе.";
}


export default function StatisticsScreen() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [entries, setEntries] = useState<any[]>([]);
  const [moodChartData, setMoodChartData] = useState<ChartDataType>({ labels: [], datasets: [{ data: [] }] });
  const [energyChartData, setEnergyChartData] = useState<ChartDataType>({ labels: [], datasets: [{ data: [] }] });
  const [sleepChartData, setSleepChartData] = useState<ChartDataType>({ labels: [], datasets: [{ data: [] }] });
  const [anxietyChartData, setAnxietyChartData] = useState<ChartDataType>({ labels: [], datasets: [{ data: [] }] });
  const [averages, setAverages] = useState({ mood: 0, energy: 0, sleep: 0, anxiety: 0 });
  const [insight, setInsight] = useState('');

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }
    const dateFrom = new Date();
    if (timeRange === 'week') { dateFrom.setDate(dateFrom.getDate() - 7); }
    else { dateFrom.setDate(dateFrom.getDate() - 30); }
    const { data: fetchedEntries, error } = await supabase
      .from('daily_entries')
      .select('created_at, mood, energy, sleep_quality, anxiety')
      .eq('user_id', user.id)
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: true });
    if (error) {
      Alert.alert('Помилка', error.message);
      setLoading(false);
      return;
    }
    setEntries(fetchedEntries);
    if (fetchedEntries && fetchedEntries.length >= 1) {
      const labels = fetchedEntries.map(entry => {
        const date = new Date(entry.created_at);
        return `${date.getDate()}.${date.getMonth() + 1}`;
      });
      const moodData = fetchedEntries.map(entry => entry.mood);
      const energyData = fetchedEntries.map(entry => entry.energy);
      const sleepEntries = fetchedEntries.filter(e => e.sleep_quality != null);
      const sleepLabels = sleepEntries.map(entry => {
        const date = new Date(entry.created_at);
        return `${date.getDate()}.${date.getMonth() + 1}`;
      });
      const sleepData = sleepEntries.map(e => e.sleep_quality);
      const anxietyEntries = fetchedEntries.filter(e => e.anxiety != null);
      const anxietyLabels = anxietyEntries.map(entry => {
        const date = new Date(entry.created_at);
        return `${date.getDate()}.${date.getMonth() + 1}`;
      });
      const anxietyData = anxietyEntries.map(e => e.anxiety);
      setMoodChartData(labels.length >= 2 ? { labels, datasets: [{ data: moodData }] } : { labels: [], datasets: [{ data: [] }] });
      setEnergyChartData(labels.length >= 2 ? { labels, datasets: [{ data: energyData }] } : { labels: [], datasets: [{ data: [] }] });
      setSleepChartData(sleepLabels.length >= 2 ? { labels: sleepLabels, datasets: [{ data: sleepData }] } : { labels: [], datasets: [{ data: [] }] });
      setAnxietyChartData(anxietyLabels.length >= 2 ? { labels: anxietyLabels, datasets: [{ data: anxietyData }] } : { labels: [], datasets: [{ data: [] }] });
      const totalMood = fetchedEntries.reduce((sum, entry) => sum + entry.mood, 0);
      const totalEnergy = fetchedEntries.reduce((sum, entry) => sum + entry.energy, 0);
      const totalSleep = sleepEntries.reduce((sum, entry) => sum + entry.sleep_quality, 0);
      const totalAnxiety = anxietyEntries.reduce((sum, entry) => sum + entry.anxiety, 0);
      const avgMood = parseFloat((totalMood / fetchedEntries.length).toFixed(1)) || 0;
      const avgEnergy = parseFloat((totalEnergy / fetchedEntries.length).toFixed(1)) || 0;
      const avgSleep = parseFloat((totalSleep / (sleepEntries.length || 1)).toFixed(1)) || 0;
      const avgAnxiety = parseFloat((totalAnxiety / (anxietyEntries.length || 1)).toFixed(1)) || 0;
      setAverages({
        mood: avgMood,
        energy: avgEnergy,
        sleep: avgSleep,
        anxiety: avgAnxiety,
      });
      setInsight(getInsightMessage(avgMood, avgAnxiety));
    } else {
      setMoodChartData({ labels: [], datasets: [{ data: [] }] });
      setEnergyChartData({ labels: [], datasets: [{ data: [] }] });
      setSleepChartData({ labels: [], datasets: [{ data: [] }] });
      setAnxietyChartData({ labels: [], datasets: [{ data: [] }] });
      setAverages({ mood: 0, energy: 0, sleep: 0, anxiety: 0 });
      setInsight('');
    }
    setLoading(false);
  }, [timeRange]);

  useFocusEffect(
    useCallback(() => {
      fetchChartData();
    }, [fetchChartData])
  );

  const chartConfig = {
    backgroundColor: COLORS.background,
    backgroundGradientFrom: COLORS.background,
    backgroundGradientTo: COLORS.background,
    decimalPlaces: 1,
    color: COLORS.chartColor,
    labelColor: (opacity = 1) => `rgba(121, 85, 72, ${opacity * 0.7})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: COLORS.buttonBackground },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>

        <View style={styles.filterContainer}>
          <Pressable
            style={[styles.filterButton, timeRange === 'week' && styles.filterActive]}
            onPress={() => setTimeRange('week')}
          >
            <Text style={[styles.filterText, timeRange === 'week' && styles.filterTextActive]}>Тиждень</Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, timeRange === 'month' && styles.filterActive]}
            onPress={() => setTimeRange('month')}
          >
            <Text style={[styles.filterText, timeRange === 'month' && styles.filterTextActive]}>Місяць</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.textPrimary} style={{ marginTop: 50 }} />
        ) : (
          <>
            {entries.length < 1 ? (
              <View style={styles.placeholderContainer}>
                <Ionicons name="stats-chart-outline" size={60} color={COLORS.textSecondary} />
                <Text style={styles.placeholderText}>Недостатньо даних...</Text>
                <Text style={styles.placeholderSubText}>Продовжуй вести щоденник, і графіки з'являться тут.</Text>
              </View>
            ) : (
              <>
                <View style={styles.averagesContainer}>
                  <View style={styles.averageCard}>
                    <Text style={styles.averageLabel}>Настрій</Text>
                    <Text style={styles.averageValue}>{averages.mood} / 5</Text>
                    <StarRating rating={averages.mood} size={20} />
                  </View>
                  <View style={styles.averageCard}>
                    <Text style={styles.averageLabel}>Енергія</Text>
                    <Text style={styles.averageValue}>{averages.energy} / 5</Text>
                    <StarRating rating={averages.energy} size={20} />
                  </View>
                  
                  {averages.sleep > 0 && (
                    <View style={styles.averageCard}>
                      <Text style={styles.averageLabel}>Сон</Text>
                      <Text style={styles.averageValue}>{averages.sleep} / 5</Text>
                      <StarRating rating={averages.sleep} size={20} />
                    </View>
                  )}
                  {averages.anxiety > 0 && (
                    <View style={styles.averageCard}>
                      <Text style={styles.averageLabel}>Тривожність</Text>
                      <Text style={styles.averageValue}>{averages.anxiety} / 5</Text>
                      <StarRating rating={averages.anxiety} size={20} />
                    </View>
                  )}
                </View>

                <View style={styles.insightContainer}>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>

                {moodChartData.labels.length >= 2 ? (
                  <>
                    <Text style={styles.chartTitle}>Динаміка твого настрою</Text>
                    <LineChart
                      data={moodChartData}
                      width={screenWidth - 30}
                      height={220}
                      yAxisSuffix="/5"
                      yAxisInterval={1}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chartStyle}
                      fromZero
                      withVerticalLines={false}
                    />
                  </>
                ) : null}

                {energyChartData.labels.length >= 2 ? (
                  <>
                    <Text style={styles.chartTitle}>Динаміка твоєї енергії</Text>
                    <LineChart
                      data={energyChartData}
                      width={screenWidth - 30}
                      height={220}
                      yAxisSuffix="/5"
                      yAxisInterval={1}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chartStyle}
                      fromZero
                      withVerticalLines={false}
                    />
                  </>
                ) : null}

                {sleepChartData.labels.length >= 2 ? (
                  <>
                    <Text style={styles.chartTitle}>Динаміка якості сну</Text>
                    <LineChart
                      data={sleepChartData}
                      width={screenWidth - 30}
                      height={220}
                      yAxisSuffix="/5"
                      yAxisInterval={1}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chartStyle}
                      fromZero
                      withVerticalLines={false}
                    />
                  </>
                ) : null}

                {anxietyChartData.labels.length >= 2 ? (
                  <>
                    <Text style={styles.chartTitle}>Динаміка тривожності</Text>
                    <LineChart
                      data={anxietyChartData}
                      width={screenWidth - 30}
                      height={220}
                      yAxisSuffix="/5"
                      yAxisInterval={1}
                      chartConfig={chartConfig}
                      bezier
                      style={styles.chartStyle}
                      fromZero
                      withVerticalLines={false}
                    />
                  </>
                ) : null}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    paddingHorizontal: 15, 
    paddingBottom: 30,
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(121, 85, 72, 0.1)',
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  filterActive: {
    backgroundColor: COLORS.buttonBackground,
  },
  filterText: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  filterTextActive: {
    color: COLORS.buttonText,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  placeholderSubText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  averagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    width: '100%',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  averageCard: {
    backgroundColor: 'rgba(121, 85, 72, 0.08)',
    padding: 10, 
    borderRadius: 15,
    alignItems: 'center',
    width: '48.5%', 
    marginBottom: 10,
  },
  averageValue: {
    fontSize: 22, 
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
    marginVertical: 2, 
  },
  averageLabel: {
    fontSize: 13, 
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  insightContainer: {
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: 'rgba(121, 85, 72, 0.1)', 
    borderRadius: 15,
    padding: 15, 
    width: '100%',
    marginBottom: 20,
  },
  insightText: {
    fontSize: 15, 
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 21,
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
    marginTop: 10, 
    marginBottom: 10,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
});