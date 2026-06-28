import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getNotifications, markNotificationsRead } from "./services/api";
import socketService from "./services/socket";

const { width } = Dimensions.get("window");

// Helper to format date in a readable way
const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserAndNotifications = useCallback(async (pageNum = 1, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      // Get logged in user details
      const stored = await AsyncStorage.getItem("userData");
      let currentUserId = "";
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?._id) {
          setUserId(parsed._id);
          currentUserId = parsed._id;
        }
      }

      // Fetch notification records from backend with pagination
      const limit = 20;
      const data = await getNotifications(pageNum, limit);
      
      const userNotifs = (data || []).filter(
        (n: any) => !n.userId || n.userId === currentUserId
      );

      if (pageNum === 1) {
        setNotifications(userNotifs);
        setHasMore(userNotifs.length === limit);
      } else {
        setNotifications((prev) => {
          // Prevent duplicates
          const existingIds = new Set(prev.map((n) => n._id));
          const filteredNew = userNotifs.filter((n: any) => !existingIds.has(n._id));
          return [...prev, ...filteredNew];
        });
        setHasMore(userNotifs.length === limit);
      }
    } catch (err) {
      console.warn("❌ Error loading notifications:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  // Set up socket subscription and initial load
  useEffect(() => {
    fetchUserAndNotifications(1);

    // Subscribe to Socket.io for real-time notification sync
    const unsubscribe = socketService.subscribe(async (event, data) => {
      if (event === "new_notification" && data) {
        // Retrieve current logged in user details to compare
        const stored = await AsyncStorage.getItem("userData");
        let currentUserId = "";
        if (stored) {
          const parsed = JSON.parse(stored);
          currentUserId = parsed?._id || "";
        }

        // Only append if it belongs to the logged-in user
        if (!data.userId || data.userId === currentUserId) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n._id === data._id);
            if (exists) return prev;
            return [data, ...prev];
          });

          // Trigger local push notification popup in foreground!
          try {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: data.title,
                body: data.message,
                data: data.metadata || {},
              },
              trigger: null,
            });
          } catch (notifErr: any) {
            console.warn("❌ Failed to schedule local push:", notifErr.message);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [fetchUserAndNotifications]);

  const handleRefresh = () => {
    setPage(1);
    fetchUserAndNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUserAndNotifications(nextPage, false);
  };

  const handleMarkAllRead = async () => {
    if (notifications.length === 0) return;
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
      if (unreadIds.length > 0) {
        await markNotificationsRead(unreadIds);
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn("❌ Failed to mark notifications as read:", err);
    }
  };

  const handleNotificationTap = async (item: any) => {
    if (!item.read) {
      try {
        await markNotificationsRead([item._id]);
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.warn("❌ Failed to mark single notification as read:", err);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "fault":
        return <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />;
      case "payment":
        return <MaterialCommunityIcons name="currency-inr" size={24} color="#10B981" />;
      case "session_start":
      case "session_end":
        return <MaterialCommunityIcons name="flash" size={24} color="#0D7FF2" />;
      case "otp":
        return <Ionicons name="key" size={24} color="#F59E0B" />;
      default:
        return <Ionicons name="notifications" size={24} color="#64748B" />;
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={[styles.notifCard, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationTap(item)}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>{getNotificationIcon(item.type)}</View>
        <View style={styles.textContainer}>
          <View style={styles.cardHeader}>
            <Text style={[styles.notifTitle, !item.read && styles.unreadTitle]}>
              {item.title}
            </Text>
            <Text style={styles.timeText}>{formatRelativeTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.notifBody}>{item.message}</Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          {notifications.some((n) => !n.read) && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadButton}>
              <Text style={styles.markReadText}>Mark Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading && page === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D7FF2" />
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item._id || item.createdAt}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#0D7FF2"]}
              />
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loaderFooter}>
                  <ActivityIndicator size="small" color="#0D7FF2" />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color="#94A3B8" />
                <Text style={styles.emptyTitle}>All caught up!</Text>
                <Text style={styles.emptySubtitle}>
                  You'll see charging sessions and system alerts here.
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DADBDF",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    color: "#000000",
    marginLeft: 10,
  },
  markReadButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  markReadText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0D7FF2",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  notifCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderColor: "#E0F2FE",
    backgroundColor: "#F0F9FF",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  unreadTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  timeText: {
    fontSize: 11,
    color: "#94A3B8",
  },
  notifBody: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0D7FF2",
    marginLeft: 8,
  },
  loaderFooter: {
    paddingVertical: 15,
    alignItems: "center",
  },
  emptyContainer: {
    paddingTop: 120,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
});
