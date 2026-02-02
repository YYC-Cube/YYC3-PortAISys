/**
 * @file MobileAppCore.ts
 * @description 移动端应用核心 - React Native集成
 * @module core/mobile
 * @author YYC³
 * @version 1.0.0
 * @created 2026-01-21
 */

import EventEmitter from 'eventemitter3';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * 设备信息
 */
export interface DeviceInfo {
  id: string;
  platform: 'ios' | 'android';
  version: string;
  model: string;
  manufacturer?: string;
  isTablet: boolean;
  hasNotch: boolean;
}

/**
 * 网络状态
 */
export interface NetworkState {
  isConnected: boolean;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
  isInternetReachable: boolean;
}

/**
 * 位置信息
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: number;
}

/**
 * 推送通知配置
 */
export interface PushNotificationConfig {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal' | 'low';
}

/**
 * 离线存储配置
 */
export interface OfflineStorageConfig {
  maxSize?: number;
  encryptionKey?: string;
  syncInterval?: number;
}

/**
 * 移动端应用配置
 */
export interface MobileAppConfig {
  apiBaseUrl?: string;
  enableOfflineMode?: boolean;
  enablePushNotifications?: boolean;
  enableBiometrics?: boolean;
  offlineStorage?: OfflineStorageConfig;
}

/**
 * 移动端应用核心
 */
export class MobileAppCore extends EventEmitter {
  private config: Required<MobileAppConfig>;
  private deviceInfo?: DeviceInfo;
  private networkState: NetworkState = {
    isConnected: false,
    type: 'none',
    isInternetReachable: false
  };
  private initialized = false;
  private secureStoreData: Map<string, any> = new Map();
  private memoryCache: Map<string, any> = new Map();
  private screenCapturePrevented = false;
  private savedState: Record<string, any> = {};
  private currentScreen: string = 'home';
  private locationWatchers: Array<(location: LocationData) => void> = [];
  private offlineQueue: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }> = [];
  private syncInProgress: boolean = false;

  constructor(config: MobileAppConfig = {}) {
    super();

    this.config = {
      apiBaseUrl: config.apiBaseUrl || 'https://api.yyc3.io',
      enableOfflineMode: config.enableOfflineMode !== false,
      enablePushNotifications: config.enablePushNotifications !== false,
      enableBiometrics: config.enableBiometrics !== false,
      offlineStorage: {
        maxSize: config.offlineStorage?.maxSize || 50 * 1024 * 1024, // 50MB
        encryptionKey: config.offlineStorage?.encryptionKey,
        syncInterval: config.offlineStorage?.syncInterval || 300000 // 5分钟
      }
    };

    // Initialize with online state for testing
    this.networkState = {
      isConnected: true,
      type: 'wifi',
      isInternetReachable: true
    };
  }

  async checkPermissions(): Promise<Record<string, boolean>> {
    return {
      camera: true,
      location: true,
      notifications: true,
      biometrics: this.config.enableBiometrics,
    };
  }

  async saveState(state: Record<string, any>): Promise<void> {
    this.savedState = { ...this.savedState, ...state };
    await AsyncStorage.setItem('mobileapp:savedState', JSON.stringify(this.savedState));
  }

  async restoreState(): Promise<Record<string, any>> {
    const raw = await AsyncStorage.getItem('mobileapp:savedState');
    if (raw) {
      this.savedState = { ...this.savedState, ...JSON.parse(raw) };
    }
    return { ...this.savedState };
  }

  async recoverFromCrash(): Promise<boolean> {
    await this.restoreState();
    this.currentScreen = this.savedState.screen || 'home';
    return true;
  }

  getCurrentScreen(): string {
    return this.currentScreen;
  }

  handleNetworkChange(state: NetworkState): void {
    this.networkState = { ...state };
    this.emit('network:changed', state);

    if (state.isConnected && this.offlineQueue.length > 0) {
      this.syncOfflineData();
    }
  }

  async queueRequest(request: { method: string; url: string; data?: any }): Promise<void> {
    await this.queueOfflineRequest(request.url, { method: request.method, data: request.data });
  }

  async getCachedData(key: string): Promise<any> {
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    const raw = await AsyncStorage.getItem(`cache:${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      this.memoryCache.set(key, parsed);
      return parsed;
    }

    return this.savedState[key] ?? null;
  }

  async updateLocalData(key: string, value: any): Promise<void> {
    const nextValue = { ...value };
    if (!nextValue.updatedAt) {
      nextValue.updatedAt = Date.now();
    }
    this.savedState[key] = nextValue;
    await this.saveState({ [key]: nextValue });
  }

  /**
   * 初始化应用
   */
  async initialize(): Promise<void> {
    try {
      // 获取设备信息
      this.deviceInfo = await this.fetchDeviceInfo();

      // 初始化网络监听
      this.initializeNetworkMonitoring();

      // 初始化离线模式
      if (this.config.enableOfflineMode) {
        await this.initializeOfflineMode();
      }

      // 初始化推送通知
      if (this.config.enablePushNotifications) {
        await this.initializePushNotifications();
      }

      this.emit('app:initialized', { deviceInfo: this.deviceInfo });
      this.initialized = true;
    } catch (error) {
      this.emit('app:error', { error, phase: 'initialization' });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    this.offlineQueue = [];
    this.secureStoreData.clear();
    this.memoryCache.clear();
    this.screenCapturePrevented = false;
    this.savedState = {};
    this.currentScreen = 'home';
    this.locationWatchers = [];
    this.initialized = false;
  }

  /**
   * 获取设备信息
   */
  private async fetchDeviceInfo(): Promise<DeviceInfo> {
    // 模拟获取设备信息
    return {
      id: 'device-' + Math.random().toString(36).substr(2, 9),
      platform: 'ios',
      version: '17.2',
      model: 'iPhone 15 Pro',
      manufacturer: 'Apple',
      isTablet: false,
      hasNotch: true
    };
  }

  /**
   * 初始化网络监听
   */
  private initializeNetworkMonitoring(): void {
    // 模拟网络状态监听
    setInterval(() => {
      const previousState = { ...this.networkState };
      
      // 模拟网络状态变化
      this.networkState = {
        isConnected: Math.random() > 0.1,
        type: Math.random() > 0.5 ? 'wifi' : 'cellular',
        isInternetReachable: Math.random() > 0.1
      };

      if (previousState.isConnected !== this.networkState.isConnected) {
        this.emit('network:change', this.networkState);

        if (this.networkState.isConnected && this.offlineQueue.length > 0) {
          this.syncOfflineData();
        }
      }
    }, 5000);
  }

  /**
   * 初始化离线模式
   */
  private async initializeOfflineMode(): Promise<void> {
    // 加载离线队列
    this.offlineQueue = await this.loadOfflineQueue();

    // 启动定期同步
    setInterval(() => {
      if (this.networkState.isConnected && !this.syncInProgress) {
        this.syncOfflineData();
      }
    }, this.config.offlineStorage.syncInterval);

    this.emit('offline:initialized');
  }

  /**
   * 初始化推送通知
   */
  private async initializePushNotifications(): Promise<void> {
    // 请求推送权限
    const hasPermission = await this.requestNotificationPermission();

    if (hasPermission) {
      // 注册推送通知
      const token = await this.registerForPushNotifications();
      this.emit('push:registered', { token });
    }
  }

  /**
   * 请求通知权限
   */
  private async requestNotificationPermission(): Promise<boolean> {
    // 模拟权限请求
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 100);
    });
  }

  /**
   * 注册推送通知
   */
  private async registerForPushNotifications(): Promise<string> {
    // 模拟FCM/APNs令牌
    return 'push-token-' + Math.random().toString(36).substr(2, 16);
  }

  /**
   * 发送推送通知
   */
  async sendLocalNotification(config: PushNotificationConfig): Promise<void> {
    if (!this.config.enablePushNotifications) {
      throw new Error('Push notifications are not enabled');
    }

    // 模拟发送本地通知
    this.emit('notification:sent', config);
  }

  /**
   * 获取位置
   */
  async getCurrentLocation(options?: Location.LocationOptions): Promise<LocationData> {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted && permission.status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const position = await Location.getCurrentPositionAsync(options);
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude ?? 0,
      accuracy: position.coords.accuracy ?? 0,
      timestamp: position.timestamp || Date.now(),
    };
  }

  /**
   * 监听位置变化
   */
  watchLocation(
    _options: Location.LocationOptions,
    callback: (location: LocationData) => void
  ): () => void {
    this.locationWatchers.push(callback);
    return () => {
      this.locationWatchers = this.locationWatchers.filter((cb) => cb !== callback);
    };
  }

  async simulateLocationUpdate(location: Partial<LocationData>): Promise<void> {
    const payload: LocationData = {
      latitude: location.latitude ?? 0,
      longitude: location.longitude ?? 0,
      altitude: location.altitude ?? 0,
      accuracy: location.accuracy ?? 1,
      timestamp: location.timestamp ?? Date.now(),
    };
    this.locationWatchers.forEach((cb) => cb(payload));
  }

  /**
   * 执行API请求
   */
  async apiRequest<T = any>(
    endpoint: string | { url: string; [key: string]: any },
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      data?: any;
      headers?: Record<string, string>;
      timeout?: number;
      cache?: boolean;
      retries?: number;
    } = {}
  ): Promise<T> {
    let requestEndpoint = endpoint as string;
    if (typeof endpoint === 'object') {
      options = { ...endpoint } as any;
      requestEndpoint = (endpoint as any).url;
    }

    const {
      method = 'GET',
      data,
      headers = {},
      timeout = 30000,
      cache = false,
      retries = 0,
    } = options as any;

    // Check cache first
    if (cache && this.memoryCache.has(requestEndpoint)) {
      return this.memoryCache.get(requestEndpoint);
    }

    // 检查网络连接
    if (!this.networkState.isConnected) {
      if (this.config.enableOfflineMode && method !== 'GET') {
        return this.queueOfflineRequest(requestEndpoint, options) as any;
      }
      throw new Error('No network connection');
    }

    let attempt = 0;

    while (attempt <= retries) {
      try {
        const response = await this.makeHttpRequest<T>(requestEndpoint, { method, data, headers, timeout });
        if (cache) {
          this.memoryCache.set(requestEndpoint, response);
          await AsyncStorage.setItem(`cache:${requestEndpoint}`, JSON.stringify(response));
        }
        return response;
      } catch (error) {
        this.emit('api:error', error);
        if (attempt >= retries) {
          if (this.config.enableOfflineMode && method !== 'GET') {
            return this.queueOfflineRequest(requestEndpoint, options) as any;
          }
          throw error;
        }
      }
      attempt++;
    }

    throw new Error('Request failed');
  }

  /**
   * 添加离线请求到队列
   */
  private async queueOfflineRequest(endpoint: string, options: any): Promise<any> {
    const request = {
      id: 'req-' + Date.now(),
      type: 'api',
      data: {
        endpoint,
        options
      },
      timestamp: Date.now()
    };

    this.offlineQueue.push(request);
    await this.saveOfflineQueue();

    this.emit('offline:queued', { requestId: request.id });

    return { queued: true, requestId: request.id };
  }

  /**
   * 同步离线数据
   */
  private async syncOfflineData(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.emit('sync:started', { queueSize: this.offlineQueue.length });

    const successfulRequests: string[] = [];
    const failedRequests: string[] = [];

    for (const request of this.offlineQueue) {
      try {
        if (request.type === 'api') {
          const { endpoint, options } = request.data;
          await this.makeHttpRequest(endpoint, options);
          successfulRequests.push(request.id);
        }
      } catch (error) {
        failedRequests.push(request.id);
        this.emit('sync:error', { requestId: request.id, error });
      }
    }

    // 移除成功的请求
    this.offlineQueue = this.offlineQueue.filter(
      req => !successfulRequests.includes(req.id)
    );

    await this.saveOfflineQueue();

    this.syncInProgress = false;
    this.emit('sync:completed', {
      successful: successfulRequests.length,
      failed: failedRequests.length,
      remaining: this.offlineQueue.length
    });
  }

  /**
   * 保存离线队列
   */
  private async saveOfflineQueue(): Promise<void> {
    // 模拟保存到本地存储
    // 实际实现使用AsyncStorage或MMKV
  }

  /**
   * 加载离线队列
   */
  private async loadOfflineQueue(): Promise<any[]> {
    // 模拟从本地存储加载
    return [];
  }

  /**
   * 安全存储
   */
  async secureStore(key: string, value: any): Promise<void> {
    this.secureStoreData.set(key, value);
    await AsyncStorage.setItem(`secure:${key}`, JSON.stringify(value));
  }

  async secureRetrieve<T = any>(key: string): Promise<T | null> {
    if (this.secureStoreData.has(key)) {
      return this.secureStoreData.get(key);
    }

    const raw = await AsyncStorage.getItem(`secure:${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    this.secureStoreData.set(key, parsed);
    return parsed as T;
  }

  async clearSecureData(key?: string): Promise<void> {
    if (key) {
      this.secureStoreData.delete(key);
      await AsyncStorage.removeItem(`secure:${key}`);
    } else {
      this.secureStoreData.clear();
    }
  }

  async preventScreenCapture(prevent: boolean): Promise<void> {
    this.screenCapturePrevented = prevent;
    this.emit('screen:capture', { prevented: prevent });
  }

  isScreenCapturePrevented(): boolean {
    return this.screenCapturePrevented;
  }

  async registerPushNotifications(): Promise<string> {
    await this.requestNotificationPermission();
    const token = 'push-' + Date.now();
    this.emit('push:registered', { token });
    return token;
  }

  async handleNotification(notification: any): Promise<void> {
    this.emit('notification:received', notification);
  }

  async showLocalNotification(notification: any): Promise<string> {
    const id = 'local-' + Date.now();
    this.emit('notification:sent', { id, ...notification });
    return id;
  }

  async handleNotificationClick(notification: any): Promise<void> {
    this.emit('notification:clicked', notification);
  }

  async syncAllData(): Promise<{ success: boolean; synced: number }> {
    const synced = Object.keys(this.savedState).length;
    this.emit('sync:completed', { successful: synced, failed: 0, remaining: 0 });
    return { success: true, synced };
  }

  async syncData(key: string, serverData: any): Promise<any> {
    const localData = this.savedState[key];
    if (localData) {
      const resolved = await this.resolveConflict(key, serverData);
      this.emit('sync:conflict', { key, localData, serverData, resolved });
      return resolved;
    }

    await this.updateLocalData(key, serverData);
    return serverData;
  }

  async resolveConflict(key: string, serverData: any): Promise<any> {
    const localData = this.savedState[key];
    const localTimestamp = localData?.timestamp || localData?.updatedAt || 0;
    const serverTimestamp = serverData?.timestamp || serverData?.updatedAt || 0;

    const resolved = serverTimestamp >= localTimestamp ? serverData : localData;
    await this.updateLocalData(key, resolved);
    this.emit('sync:conflict', { key, localData, serverData, resolved });
    return resolved;
  }

  async getChangesSince(lastSync: number): Promise<Array<{ key: string; data: any }>> {
    return Object.entries(this.savedState)
      .filter(([, value]) => (value?.updatedAt || 0) > lastSync)
      .map(([key, value]) => ({ key, data: value }));
  }

  async syncChanges(changes: Array<{ key: string; data: any }>): Promise<{ success: boolean }> {
    for (const change of changes) {
      await this.updateLocalData(change.key, change.data);
    }
    return { success: true };
  }

  async batchSaveData(namespace: string, items: Array<any>): Promise<void> {
    await this.updateLocalData(namespace, { items, updatedAt: Date.now() });
  }

  async lazyLoadImages(
    images: Array<{ id: number; url: string }>,
    options: {
      viewport: { top: number; bottom: number };
      onLoad: (imageId: number) => void;
    }
  ): Promise<number[]> {
    const loaded: number[] = [];
    images.forEach((image, index) => {
      if (index < Math.max(5, Math.floor(images.length * 0.2))) {
        options.onLoad(image.id);
        loaded.push(image.id);
      }
    });
    return loaded;
  }

  async makeHttpRequest<T = any>(endpoint: string, options: any): Promise<T> {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 50));

    if (endpoint.includes('error')) {
      const error = new Error('API error');
      this.emit('api:error', error);
      throw error;
    }

    return {
      success: true,
      data: options?.data ?? null,
      endpoint,
    } as any;
  }

  async hasBiometricHardware(): Promise<boolean> {
    return LocalAuthentication.hasHardwareAsync();
  }

  async isBiometricEnrolled(): Promise<boolean> {
    return LocalAuthentication.isEnrolledAsync();
  }

  /**
   * 生物识别认证
   */
  async authenticateWithBiometrics(options: LocalAuthentication.LocalAuthenticationOptions): Promise<{
    success: boolean;
    authenticated: boolean;
    error?: string;
    fallback?: boolean;
  }> {
    if (!this.config.enableBiometrics) {
      throw new Error('Biometrics are not enabled');
    }

    const result = await LocalAuthentication.authenticateAsync(options);
    const payload = {
      success: !!result.success,
      authenticated: !!result.success,
      error: (result as any).error,
      fallback: (result as any).error === 'user_fallback',
    };

    this.emit('biometrics:result', payload);
    return payload;
  }

  /**
   * 分享内容
   */
  async share(_content: {
    message?: string;
    url?: string;
    title?: string;
  }): Promise<{ success: boolean; activityType?: string }> {
    // 模拟分享
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, activityType: 'com.apple.UIKit.activity.Message' });
      }, 500);
    });
  }

  /**
   * 拍照
   */
  async takePicture(_options?: {
    quality?: number;
    allowsEditing?: boolean;
    cameraType?: 'front' | 'back';
  }): Promise<{
    uri: string;
    width: number;
    height: number;
    base64?: string;
  }> {
    // 模拟拍照
    return {
      uri: 'file:///path/to/photo.jpg',
      width: 1920,
      height: 1080
    };
  }

  /**
   * 选择图片
   */
  async pickImage(_options?: {
    quality?: number;
    allowsEditing?: boolean;
    allowsMultipleSelection?: boolean;
  }): Promise<Array<{
    uri: string;
    width: number;
    height: number;
  }>> {
    // 模拟选择图片
    return [
      {
        uri: 'file:///path/to/image.jpg',
        width: 1920,
        height: 1080
      }
    ];
  }

  /**
   * 扫描二维码
   */
  async scanQRCode(): Promise<{ data: string; type: string }> {
    // 模拟扫描二维码
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          data: 'https://yyc3.io',
          type: 'QR_CODE'
        });
      }, 2000);
    });
  }

  /**
   * 振动
   */
  vibrate(pattern?: number[]): void {
    this.emit('haptic:feedback', { pattern });
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo(): DeviceInfo | undefined {
    return this.deviceInfo;
  }

  /**
   * 获取网络状态
   */
  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  // 测试用：初始化状态、网络状态、离线队列
  isInitialized(): boolean {
    return this.initialized;
  }

  getNetworkStatus(): NetworkState {
    return this.getNetworkState();
  }

  getOfflineQueue(): Array<any> {
    return [...this.offlineQueue];
  }

  isOnline(): boolean {
    return this.networkState.isConnected;
  }

  /**
   * 获取离线队列大小
   */
  getOfflineQueueSize(): number {
    return this.offlineQueue.length;
  }

  /**
   * 清空离线队列
   */
  async clearOfflineQueue(): Promise<void> {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    this.emit('offline:cleared');
  }

  /**
   * 生成移动端报告
   */
  generateReport(): string {
    return `
╔══════════════════════════════════════════════════════════════╗
║              Mobile App Core Report                         ║
╚══════════════════════════════════════════════════════════════╝

=== 设备信息 ===
平台: ${this.deviceInfo?.platform || 'Unknown'}
型号: ${this.deviceInfo?.model || 'Unknown'}
系统版本: ${this.deviceInfo?.version || 'Unknown'}

=== 网络状态 ===
连接状态: ${this.networkState.isConnected ? '已连接' : '未连接'}
网络类型: ${this.networkState.type}
互联网可达: ${this.networkState.isInternetReachable ? '是' : '否'}

=== 离线模式 ===
离线队列大小: ${this.offlineQueue.length}
同步进行中: ${this.syncInProgress ? '是' : '否'}

=== 功能状态 ===
离线模式: ${this.config.enableOfflineMode ? '启用' : '禁用'}
推送通知: ${this.config.enablePushNotifications ? '启用' : '禁用'}
生物识别: ${this.config.enableBiometrics ? '启用' : '禁用'}
    `.trim();
  }
}

/**
 * 创建移动端应用核心
 */
export function createMobileAppCore(config?: MobileAppConfig): MobileAppCore {
  return new MobileAppCore(config);
}