import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingItem {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  type: 'navigate' | 'toggle';
  value?: boolean;
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [notifications, setNotifications] = React.useState(true);
  const [autoGenerate, setAutoGenerate] = React.useState(true);

  const settingsSections = [
    {
      title: 'Study Preferences',
      items: [
        {
          id: '1',
          icon: 'notifications' as const,
          title: 'Notifications',
          subtitle: 'Get reminders for study sessions',
          type: 'toggle' as const,
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: '2',
          icon: 'auto-awesome' as const,
          title: 'Auto-generate Questions',
          subtitle: 'Generate questions automatically after upload',
          type: 'toggle' as const,
          value: autoGenerate,
          onToggle: setAutoGenerate,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: '3',
          icon: 'person' as const,
          title: 'Profile',
          type: 'navigate' as const,
        },
        {
          id: '4',
          icon: 'credit-card' as const,
          title: 'Subscription',
          subtitle: 'Manage your plan',
          type: 'navigate' as const,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: '5',
          icon: 'help-outline' as const,
          title: 'Help Center',
          type: 'navigate' as const,
        },
        {
          id: '6',
          icon: 'bug-report' as const,
          title: 'Report a Problem',
          type: 'navigate' as const,
        },
        {
          id: '7',
          icon: 'info-outline' as const,
          title: 'About',
          type: 'navigate' as const,
        },
      ],
    },
  ];

  const styles = createStyles(colors);

  const renderSettingItem = (item: any) => {
    if (item.type === 'toggle') {
      return (
        <View key={item.id} style={styles.settingItem}>
          <View style={styles.iconContainer}>
            <MaterialIcons name={item.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
            )}
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: colors.backgroundTertiary,
              true: colors.primaryLight,
            }}
            thumbColor={item.value ? colors.primary : colors.background}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        activeOpacity={0.7}
        onPress={() => console.log(`Navigate to ${item.title}`)}
      >
        <View style={styles.iconContainer}>
          <MaterialIcons name={item.icon} size={24} color={colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.iconSecondary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your learning experience
          </Text>
        </View>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {renderSettingItem(item)}
                  {index < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Student Mate v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: colors.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 68,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
