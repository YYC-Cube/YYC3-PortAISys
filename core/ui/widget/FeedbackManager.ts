/**
 * @file 反馈管理系统
 * @description 管理用户反馈，包括评分、评论和反馈分析
 * @module ui/widget/FeedbackManager
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { EventEmitter } from 'events';

interface FeedbackManagerConfig {
  widget: any;
  enableRating?: boolean;
  enableComments?: boolean;
  enableAnalytics?: boolean;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  timestamp: number;
  metadata?: any;
}

export class FeedbackManager extends EventEmitter {
  private widget: any;
  private enableRating: boolean;
  private enableComments: boolean;
  private enableAnalytics: boolean;
  private feedbacks: Feedback[];
  private averageRating: number;

  constructor(config: FeedbackManagerConfig) {
    super();
    this.widget = config.widget;
    this.enableRating = config.enableRating || true;
    this.enableComments = config.enableComments || true;
    this.enableAnalytics = config.enableAnalytics || true;
    this.feedbacks = [];
    this.averageRating = 0;
  }

  submitFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): string {
    const newFeedback: Feedback = {
      ...feedback,
      id: `feedback-${Date.now()}`,
      timestamp: Date.now(),
    };

    this.feedbacks.push(newFeedback);
    this.updateAverageRating();

    this.emit('feedback:submitted', newFeedback);

    if (this.enableAnalytics) {
      this.analyzeFeedback(newFeedback);
    }

    return newFeedback.id;
  }

  submitRating(rating: number): void {
    if (!this.enableRating) {
      throw new Error('Rating is disabled');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    this.submitFeedback({ rating, comment: '' });
    this.emit('rating:changed', { rating, averageRating: this.averageRating });
  }

  submitComment(comment: string): void {
    if (!this.enableComments) {
      throw new Error('Comments are disabled');
    }

    this.submitFeedback({ rating: 0, comment });
  }

  private updateAverageRating(): void {
    const validRatings = this.feedbacks.filter(f => f.rating > 0);
    if (validRatings.length === 0) {
      this.averageRating = 0;
      return;
    }

    const sum = validRatings.reduce((acc, f) => acc + f.rating, 0);
    this.averageRating = sum / validRatings.length;
  }

  private analyzeFeedback(feedback: Feedback): void {
    // 简单的反馈分析
    console.log('Analyzing feedback:', feedback);
  }

  getAverageRating(): number {
    return this.averageRating;
  }

  getFeedbackCount(): number {
    return this.feedbacks.length;
  }

  getRecentFeedbacks(limit: number = 10): Feedback[] {
    return [...this.feedbacks]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  isRatingEnabled(): boolean {
    return this.enableRating;
  }

  isCommentsEnabled(): boolean {
    return this.enableComments;
  }

  isAnalyticsEnabled(): boolean {
    return this.enableAnalytics;
  }

  setRatingEnabled(enabled: boolean): void {
    this.enableRating = enabled;
  }

  setCommentsEnabled(enabled: boolean): void {
    this.enableComments = enabled;
  }

  setAnalyticsEnabled(enabled: boolean): void {
    this.enableAnalytics = enabled;
  }

  clearFeedbacks(): void {
    this.feedbacks = [];
    this.averageRating = 0;
  }

  destroy(): void {
    this.clearFeedbacks();
    this.removeAllListeners();
  }
}

export default FeedbackManager;