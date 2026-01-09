import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MindMapNode {
  id: string;
  title: string;
  children?: string[];
  level: number;
}

export default function MindMapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pdfName, subjectName } = useLocalSearchParams();
  
  // Hierarchical mind map structure
  const mindMapNodes: MindMapNode[] = [
    { id: '1', title: 'Organic Reactions', level: 0 },
    { id: '2', title: 'Substitution', children: ['4', '5'], level: 1 },
    { id: '3', title: 'Elimination', children: ['6', '7'], level: 1 },
    { id: '4', title: 'SN1 Mechanism', level: 2 },
    { id: '5', title: 'SN2 Mechanism', level: 2 },
    { id: '6', title: 'E1 Mechanism', level: 2 },
    { id: '7', title: 'E2 Mechanism', level: 2 },
  ];

  const getNodesByLevel = (level: number) => {
    return mindMapNodes.filter(node => node.level === level);
  };

  const getNodeColor = (level: number) => {
    const colorPalette = [
      colors.primary,
      '#4CAF50',
      '#2196F3',
      '#FF9800',
    ];
    return colorPalette[level % colorPalette.length];
  };

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.subtitle}>{subjectName as string}</Text>
            <Text style={styles.title}>Mind Map</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Concept Visualization</Text>
          <Text style={styles.helperText}>Hierarchical view of key concepts</Text>
          
          {/* Central Node */}
          <View style={styles.centralNodeContainer}>
            <View style={[styles.centralNode, { borderColor: getNodeColor(0) }]}>
              <MaterialIcons name="account-tree" size={32} color={getNodeColor(0)} />
              <Text style={styles.centralNodeText}>{getNodesByLevel(0)[0]?.title}</Text>
            </View>
          </View>

          {/* Level 1 Nodes */}
          <View style={styles.levelContainer}>
            {getNodesByLevel(1).map((node) => (
              <View key={node.id} style={styles.branchContainer}>
                <View style={styles.connector} />
                <View style={[styles.branchNode, { borderColor: getNodeColor(1) }]}>
                  <Text style={styles.branchNodeText}>{node.title}</Text>
                </View>
                
                {/* Level 2 Nodes (children) */}
                {node.children && (
                  <View style={styles.childrenContainer}>
                    {node.children.map((childId) => {
                      const childNode = mindMapNodes.find(n => n.id === childId);
                      return (
                        <View key={childId} style={styles.childNodeWrapper}>
                          <View style={styles.childConnector} />
                          <View style={[styles.childNode, { backgroundColor: getNodeColor(2) }]}>
                            <Text style={styles.childNodeText}>{childNode?.title}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Legend</Text>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getNodeColor(0) }]} />
              <Text style={styles.legendText}>Main Topic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getNodeColor(1) }]} />
              <Text style={styles.legendText}>Subtopic</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: getNodeColor(2) }]} />
              <Text style={styles.legendText}>Concept</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  centralNodeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  centralNode: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 3,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  centralNodeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  levelContainer: {
    gap: 24,
  },
  branchContainer: {
    marginBottom: 16,
  },
  connector: {
    width: 2,
    height: 20,
    backgroundColor: colors.textSecondary,
    alignSelf: 'center',
    marginBottom: 8,
  },
  branchNode: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  branchNodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  childrenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  childNodeWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  childConnector: {
    width: 2,
    height: 16,
    backgroundColor: colors.textSecondary,
    marginBottom: 8,
  },
  childNode: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  childNodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.iconOnPrimary,
    textAlign: 'center',
  },
  legend: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 32,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  legendText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
