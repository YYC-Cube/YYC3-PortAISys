import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MobileAppCore } from '../../core/mobile/MobileAppCore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';

describe('移动端应用集成测试', () => {
  let mobileApp: MobileAppCore;

  beforeEach(async () => {
    mobileApp = new MobileAppCore({
      apiBaseUrl: 'https://api.example.com',
      enableOfflineMode: true,
      enableBiometrics: true,
      enablePushNotifications: true,
    });
    await mobileApp.initialize();
  });

  afterEach(async () => {
    await mobileApp.cleanup();
    await AsyncStorage.clear();
  });

  describe('应用初始化', () => {
    it('应该正确初始化所有核心功能', async () => {
      expect(mobileApp.isInitialized()).toBe(true);
      expect(mobileApp.getNetworkStatus()).toBeDefined();
      expect(mobileApp.getOfflineQueue()).toBeDefined();
    });

    it('应该检查并请求必要权限', async () => {
      const permissions = await mobileApp.checkPermissions();
      
      expect(permissions).toHaveProperty('camera');
      expect(permissions).toHaveProperty('location');
      expect(permissions).toHaveProperty('notifications');
      expect(permissions).toHaveProperty('biometrics');
    });

    it('应该恢复之前的应用状态', async () => {
      // 保存状态
      await mobileApp.saveState({
        userId: 'test-user',
        theme: 'dark',
        lastSync: Date.now(),
      });

      // 创建新实例并初始化
      const newApp = new MobileAppCore({
        apiBaseUrl: 'https://api.example.com',
      });
      await newApp.initialize();

      const restoredState = await newApp.restoreState();
      expect(restoredState.userId).toBe('test-user');
      expect(restoredState.theme).toBe('dark');
    });
  });

  describe('网络连接管理', () => {
    it('应该检测网络状态变化', async () => {
      const statusChanges: string[] = [];
      
      mobileApp.on('network:changed', (status) => {
        statusChanges.push(status.type);
      });

      // 模拟网络状态变化
      await NetInfo.fetch().then(() => {
        NetInfo.addEventListener((state) => {
          mobileApp.handleNetworkChange(state);
        });
      });

      // 模拟离线
      mobileApp.handleNetworkChange({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });

      expect(statusChanges).toContain('none');
      expect(mobileApp.isOnline()).toBe(false);
    });

    it('应该在网络恢复时自动同步', async () => {
      // 离线时添加操作到队列
      mobileApp.handleNetworkChange({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });

      await mobileApp.queueRequest({
        method: 'POST',
        url: '/api/data',
        data: { test: 'data' },
      });

      expect(mobileApp.getOfflineQueue().length).toBe(1);

      // 模拟网络恢复
      const syncSpy = vi.spyOn(mobileApp, 'syncOfflineData');
      
      mobileApp.handleNetworkChange({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(syncSpy).toHaveBeenCalled();
      expect(mobileApp.getOfflineQueue().length).toBe(0);
    });
  });

  describe('离线模式', () => {
    it('应该在离线时缓存请求', async () => {
      mobileApp.handleNetworkChange({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });

      const result = await mobileApp.apiRequest({
        method: 'POST',
        url: '/api/data',
        data: { name: 'test', value: 123 },
      });

      expect(result.queued).toBe(true);
      expect(mobileApp.getOfflineQueue().length).toBe(1);
    });

    it('应该提供离线数据访问', async () => {
      // 在线时获取并缓存数据
      mobileApp.handleNetworkChange({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      });

      const onlineData = await mobileApp.apiRequest({
        method: 'GET',
        url: '/api/user/profile',
        cache: true,
      });

      // 切换到离线
      mobileApp.handleNetworkChange({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });

      // 应该能从缓存获取数据
      const offlineData = await mobileApp.getCachedData('/api/user/profile');
      expect(offlineData).toEqual(onlineData);
    });

    it('应该处理离线数据冲突', async () => {
      // 离线时修改数据
      mobileApp.handleNetworkChange({
        type: 'none',
        isConnected: false,
        isInternetReachable: false,
      });

      await mobileApp.updateLocalData('user:profile', {
        name: 'Offline Update',
        timestamp: Date.now(),
      });

      // 恢复在线
      mobileApp.handleNetworkChange({
        type: 'wifi',
        isConnected: true,
        isInternetReachable: true,
      });

      // 模拟服务器上有更新的数据
      const serverData = {
        name: 'Server Update',
        timestamp: Date.now() + 1000,
      };

      const resolved = await mobileApp.resolveConflict(
        'user:profile',
        serverData
      );

      expect(resolved).toBeDefined();
      expect(resolved.name).toBe('Server Update'); // 服务器数据更新
    });
  });

  describe('生物识别认证', () => {
    it('应该检测设备是否支持生物识别', async () => {
      const hasHardware = await mobileApp.hasBiometricHardware();
      const isEnrolled = await mobileApp.isBiometricEnrolled();

      expect(typeof hasHardware).toBe('boolean');
      expect(typeof isEnrolled).toBe('boolean');
    });

    it('应该执行生物识别认证', async () => {
      // 模拟成功的生物识别
      vi.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({
        success: true,
      });

      const result = await mobileApp.authenticateWithBiometrics({
        promptMessage: 'Authenticate to continue',
        cancelLabel: 'Cancel',
      });

      expect(result.success).toBe(true);
      expect(result.authenticated).toBe(true);
    });

    it('应该处理生物识别失败', async () => {
      vi.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await mobileApp.authenticateWithBiometrics({
        promptMessage: 'Authenticate to continue',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('user_cancel');
    });

    it('应该支持回退到密码认证', async () => {
      vi.spyOn(LocalAuthentication, 'authenticateAsync').mockResolvedValue({
        success: false,
        error: 'user_fallback',
      });

      const result = await mobileApp.authenticateWithBiometrics({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use Password',
      });

      expect(result.fallback).toBe(true);
    });
  });

  describe('位置服务', () => {
    it('应该获取当前位置', async () => {
      vi.spyOn(Location, 'getCurrentPositionAsync').mockResolvedValue({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
          altitude: 0,
          altitudeAccuracy: 0,
          heading: 0,
          speed: 0,
        },
        timestamp: Date.now(),
      });

      const location = await mobileApp.getCurrentLocation({
        accuracy: Location.Accuracy.High,
      });

      expect(location).toBeDefined();
      expect(location.latitude).toBe(37.7749);
      expect(location.longitude).toBe(-122.4194);
    });

    it('应该监听位置变化', async () => {
      const locations: any[] = [];

      await mobileApp.watchLocation({
        accuracy: Location.Accuracy.High,
        distanceInterval: 10,
      }, (location) => {
        locations.push(location);
      });

      // 模拟位置更新
      await mobileApp.simulateLocationUpdate({
        latitude: 37.7749,
        longitude: -122.4194,
      });

      await mobileApp.simulateLocationUpdate({
        latitude: 37.7750,
        longitude: -122.4195,
      });

      expect(locations.length).toBeGreaterThan(0);
    });

    it('应该处理位置权限拒绝', async () => {
      vi.spyOn(Location, 'requestForegroundPermissionsAsync').mockResolvedValue({
        status: 'denied',
        canAskAgain: true,
        granted: false,
        expires: 'never',
      });

      await expect(
        mobileApp.getCurrentLocation()
      ).rejects.toThrow('Location permission denied');
    });
  });

  describe('推送通知', () => {
    it('应该注册推送通知', async () => {
      const token = await mobileApp.registerPushNotifications();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('应该接收和处理推送通知', async () => {
      const notifications: any[] = [];

      mobileApp.on('notification:received', (notification) => {
        notifications.push(notification);
      });

      // 模拟接收通知
      await mobileApp.handleNotification({
        title: 'Test Notification',
        body: 'This is a test',
        data: { type: 'test', id: '123' },
      });

      expect(notifications.length).toBe(1);
      expect(notifications[0].title).toBe('Test Notification');
    });

    it('应该显示本地通知', async () => {
      const notificationId = await mobileApp.showLocalNotification({
        title: 'Local Notification',
        body: 'Test local notification',
        data: { action: 'open_screen' },
        scheduledFor: Date.now() + 5000,
      });

      expect(notificationId).toBeDefined();
    });

    it('应该处理通知点击', async () => {
      let clickedNotification: any = null;

      mobileApp.on('notification:clicked', (notification) => {
        clickedNotification = notification;
      });

      await mobileApp.handleNotificationClick({
        id: 'notif-123',
        title: 'Test',
        body: 'Test',
        data: { screen: 'home' },
      });

      expect(clickedNotification).toBeDefined();
      expect(clickedNotification.data.screen).toBe('home');
    });
  });

  describe('数据同步', () => {
    it('应该执行完整的数据同步', async () => {
      // 添加一些离线数据
      await mobileApp.updateLocalData('user:profile', { name: 'John' });
      await mobileApp.updateLocalData('user:settings', { theme: 'dark' });

      const syncResult = await mobileApp.syncAllData();

      expect(syncResult.success).toBe(true);
      expect(syncResult.synced).toBeGreaterThan(0);
    });

    it('应该处理同步冲突', async () => {
      const conflicts: any[] = [];

      mobileApp.on('sync:conflict', (conflict) => {
        conflicts.push(conflict);
      });

      // 模拟冲突数据
      await mobileApp.updateLocalData('user:profile', {
        name: 'Local Name',
        updatedAt: Date.now() - 1000,
      });

      await mobileApp.syncData('user:profile', {
        name: 'Server Name',
        updatedAt: Date.now(),
      });

      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('应该支持增量同步', async () => {
      const lastSync = Date.now() - 3600000; // 1小时前

      const changes = await mobileApp.getChangesSince(lastSync);
      expect(Array.isArray(changes)).toBe(true);

      const syncResult = await mobileApp.syncChanges(changes);
      expect(syncResult.success).toBe(true);
    });
  });

  describe('性能优化', () => {
    it('应该高效处理大量数据', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        data: { value: Math.random() },
      }));

      const startTime = Date.now();
      await mobileApp.batchSaveData('items', largeDataset);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(2000); // 应该在2秒内完成
    });

    it('应该实现内存缓存', async () => {
      // 第一次请求应该从网络获取
      const start1 = Date.now();
      await mobileApp.apiRequest({
        method: 'GET',
        url: '/api/data',
        cache: true,
      });
      const duration1 = Date.now() - start1;

      // 第二次请求应该从缓存获取
      const start2 = Date.now();
      await mobileApp.apiRequest({
        method: 'GET',
        url: '/api/data',
        cache: true,
      });
      const duration2 = Date.now() - start2;

      expect(duration2).toBeLessThan(duration1);
    });

    it('应该支持图片懒加载', async () => {
      const images = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        url: `https://example.com/image-${i}.jpg`,
      }));

      const loadedImages: number[] = [];

      await mobileApp.lazyLoadImages(images, {
        viewport: { top: 0, bottom: 800 },
        onLoad: (imageId) => loadedImages.push(imageId),
      });

      // 只应该加载可见区域的图片
      expect(loadedImages.length).toBeLessThan(images.length);
    });
  });

  describe('错误处理和恢复', () => {
    it('应该处理API错误', async () => {
      const errors: any[] = [];

      mobileApp.on('api:error', (error) => {
        errors.push(error);
      });

      // 模拟API错误
      await mobileApp.apiRequest({
        method: 'GET',
        url: '/api/error',
      }).catch(() => {});

      expect(errors.length).toBeGreaterThan(0);
    });

    it('应该自动重试失败的请求', async () => {
      let attemptCount = 0;
      
      vi.spyOn(mobileApp, 'makeHttpRequest').mockImplementation(async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary error');
        }
        return { success: true, data: 'ok' };
      });

      const result = await mobileApp.apiRequest({
        method: 'GET',
        url: '/api/retry',
        retries: 3,
      });

      expect(result.success).toBe(true);
      expect(attemptCount).toBe(3);
    });

    it('应该从应用崩溃中恢复', async () => {
      // 模拟保存崩溃前的状态
      await mobileApp.saveState({
        screen: 'home',
        scrollPosition: 150,
      });

      // 模拟应用重启
      const newApp = new MobileAppCore({
        apiBaseUrl: 'https://api.example.com',
      });
      await newApp.initialize();

      const recovered = await newApp.recoverFromCrash();
      expect(recovered).toBe(true);
      expect(newApp.getCurrentScreen()).toBe('home');
    });
  });

  describe('安全性', () => {
    it('应该加密敏感数据', async () => {
      const sensitiveData = {
        password: 'secret123',
        token: 'abc123xyz',
      };

      await mobileApp.secureStore('credentials', sensitiveData);

      const retrieved = await mobileApp.secureRetrieve('credentials');
      expect(retrieved).toEqual(sensitiveData);
    });

    it('应该清除敏感数据', async () => {
      await mobileApp.secureStore('token', 'sensitive-token');
      await mobileApp.clearSecureData('token');

      const retrieved = await mobileApp.secureRetrieve('token');
      expect(retrieved).toBeNull();
    });

    it('应该防止截屏敏感界面', async () => {
      await mobileApp.preventScreenCapture(true);
      const prevented = mobileApp.isScreenCapturePrevented();
      expect(prevented).toBe(true);

      await mobileApp.preventScreenCapture(false);
      expect(mobileApp.isScreenCapturePrevented()).toBe(false);
    });
  });
});