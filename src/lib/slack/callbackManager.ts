// lib/slack/callbackManager.ts - مدير Callbacks متقدم

import crypto from 'crypto';
import { supabase } from '../supabase';
import { SlackCallback, SlackErrorCode, SlackError } from './types';

export interface CreateCallbackOptions {
  type: SlackCallback['type'];
  targetId: string;
  userId: string;
  metadata?: Record<string, any>;
  expiresInHours?: number;
}

export interface CallbackExecutionResult {
  success: boolean;
  callbackId: string;
  status: SlackCallback['status'];
  data?: any;
  error?: string;
}

export class SlackCallbackManager {
  /**
   * إنشاء Callback ID جديد
   * 
   * @example
   * const callbackId = await SlackCallbackManager.create({
   *   type: 'approval',
   *   targetId: 'req_123',
   *   userId: 'user_456',
   *   metadata: { requestType: 'emergency' }
   * });
   */
  static async create(options: CreateCallbackOptions): Promise<string> {
    try {
      const callbackId = crypto.randomUUID();
      const expiresInHours = options.expiresInHours || 24;

      const { data, error } = await supabase
        .from('slack_callbacks')
        .insert({
          callback_id: callbackId,
          type: options.type,
          target_id: options.targetId,
          user_id: options.userId,
          status: 'pending',
          metadata: options.metadata || {},
          expires_at: new Date(
            Date.now() + expiresInHours * 60 * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new SlackError(
          SlackErrorCode.DATABASE_ERROR,
          'Failed to create callback',
          { originalError: error }
        );
      }

      console.log(`✅ Callback created: ${callbackId} (type: ${options.type})`);
      return callbackId;
    } catch (error) {
      console.error('❌ Error creating callback:', error);
      throw error;
    }
  }

  /**
   * التحقق من صحة Callback ID والتأكد من عدم انتهاء صلاحيته
   */
  static async verify(callbackId: string): Promise<SlackCallback | null> {
    try {
      const { data, error } = await supabase
        .from('slack_callbacks')
        .select('*')
        .eq('callback_id', callbackId)
        .eq('status', 'pending') // تحقق فقط من Callbacks النشطة
        .single();

      if (error || !data) {
        console.warn(`⚠️ Callback not found: ${callbackId}`);
        return null;
      }

      // التحقق من عدم انتهاء الصلاحية
      if (new Date(data.expires_at) < new Date()) {
        console.warn(`⏰ Callback expired: ${callbackId}`);
        await this.markAsExpired(callbackId);
        return null;
      }

      console.log(`✅ Callback verified: ${callbackId}`);
      return data;
    } catch (error) {
      console.error('❌ Error verifying callback:', error);
      throw new SlackError(
        SlackErrorCode.DATABASE_ERROR,
        'Failed to verify callback',
        { callbackId }
      );
    }
  }

  /**
   * تحديث حالة Callback
   */
  static async updateStatus(
    callbackId: string,
    status: SlackCallback['status'],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (metadata) {
        updateData.metadata = metadata;
      }

      const { error } = await supabase
        .from('slack_callbacks')
        .update(updateData)
        .eq('callback_id', callbackId);

      if (error) throw error;

      console.log(`✅ Callback status updated: ${callbackId} → ${status}`);
    } catch (error) {
      console.error('❌ Error updating callback status:', error);
      throw new SlackError(
        SlackErrorCode.DATABASE_ERROR,
        'Failed to update callback status',
        { callbackId, status }
      );
    }
  }

  /**
   * تعليم Callback كمكتمل
   */
  static async markAsCompleted(
    callbackId: string,
    result?: any
  ): Promise<void> {
    await this.updateStatus(callbackId, 'completed', {
      completed_at: new Date().toISOString(),
      result,
    });
  }

  /**
   * تعليم Callback كمنتهي الصلاحية
   */
  static async markAsExpired(callbackId: string): Promise<void> {
    await this.updateStatus(callbackId, 'expired', {
      expired_at: new Date().toISOString(),
    });
  }

  /**
   * الحصول على Callback مع بيانات مرتبطة
   */
  static async getWithContext(
    callbackId: string
  ): Promise<(SlackCallback & { contextData?: any }) | null> {
    const callback = await this.verify(callbackId);
    if (!callback) return null;

    try {
      // جلب بيانات مرتبطة بناءً على النوع
      let contextData = null;

      switch (callback.type) {
        case 'task':
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', callback.target_id)
            .single();
          contextData = taskData;
          break;

        case 'approval':
          const { data: approvalData } = await supabase
            .from('maintenance_requests')
            .select('*')
            .eq('id', callback.target_id)
            .single();
          contextData = approvalData;
          break;

        case 'comment':
          const { data: commentData } = await supabase
            .from('comments')
            .select('*')
            .eq('id', callback.target_id)
            .single();
          contextData = commentData;
          break;

        case 'project':
          const { data: projectData } = await supabase
            .from('projects')
            .select('*')
            .eq('id', callback.target_id)
            .single();
          contextData = projectData;
          break;

        default:
          contextData = null;
      }

      return {
        ...callback,
        contextData,
      };
    } catch (error) {
      console.warn('⚠️ Error fetching context data:', error);
      return callback;
    }
  }

  /**
   * حذف Callback (بعد انتهاء الصلاحية)
   */
  static async cleanup(hoursOld: number = 48): Promise<number> {
    try {
      const cutoffDate = new Date(
        Date.now() - hoursOld * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await supabase
        .from('slack_callbacks')
        .delete()
        .eq('status', 'expired')
        .lt('expires_at', cutoffDate)
        .select('*');

      if (error) throw error;

      const deletedCount = data?.length || 0;
      console.log(`🧹 Cleaned up ${deletedCount} expired callbacks`);

      return deletedCount;
    } catch (error) {
      console.error('❌ Error during callback cleanup:', error);
      throw new SlackError(
        SlackErrorCode.DATABASE_ERROR,
        'Failed to cleanup callbacks',
        { hoursOld }
      );
    }
  }

  /**
   * الحصول على جميع Callbacks النشطة للمستخدم
   */
  static async getUserPendingCallbacks(
    userId: string
  ): Promise<SlackCallback[]> {
    try {
      const { data, error } = await supabase
        .from('slack_callbacks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Error fetching user callbacks:', error);
      throw new SlackError(
        SlackErrorCode.DATABASE_ERROR,
        'Failed to fetch user callbacks',
        { userId }
      );
    }
  }

  /**
   * الحصول على إحصائيات Callbacks
   */
  static async getStats(): Promise<{
    pending: number;
    completed: number;
    expired: number;
    total: number;
  }> {
    try {
      const { count: pendingCount } = await supabase
        .from('slack_callbacks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: completedCount } = await supabase
        .from('slack_callbacks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      const { count: expiredCount } = await supabase
        .from('slack_callbacks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'expired');

      return {
        pending: pendingCount || 0,
        completed: completedCount || 0,
        expired: expiredCount || 0,
        total: (pendingCount || 0) + (completedCount || 0) + (expiredCount || 0),
      };
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      return { pending: 0, completed: 0, expired: 0, total: 0 };
    }
  }

  /**
   * معالج Callback متكامل
   */
  static async executeCallback(
    callbackId: string,
    action: (callback: SlackCallback & { contextData?: any }) => Promise<any>
  ): Promise<CallbackExecutionResult> {
    try {
      // 1. التحقق من الـ Callback
      const callbackWithContext = await this.getWithContext(callbackId);

      if (!callbackWithContext) {
        return {
          success: false,
          callbackId,
          status: 'expired',
          error: 'Callback not found or expired',
        };
      }

      // 2. تنفيذ الإجراء
      const result = await action(callbackWithContext);

      // 3. تحديث الحالة
      await this.markAsCompleted(callbackId, result);

      return {
        success: true,
        callbackId,
        status: 'completed',
        data: result,
      };
    } catch (error) {
      console.error('❌ Error executing callback:', error);

      // محاولة تحديث الحالة بالخطأ
      try {
        await this.updateStatus(callbackId, 'completed', {
          error: error instanceof Error ? error.message : String(error),
        });
      } catch (updateError) {
        console.error('❌ Error updating callback with error:', updateError);
      }

      return {
        success: false,
        callbackId,
        status: 'completed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * إنشاء Callback ومعالجة الرسالة في خطوة واحدة
   */
  static async createAndSend(
    options: CreateCallbackOptions,
    messageCallback: (callbackId: string) => Promise<void>
  ): Promise<string> {
    try {
      // إنشاء الـ Callback أولاً
      const callbackId = await this.create(options);

      // إرسال الرسالة مع الـ Callback ID
      await messageCallback(callbackId);

      return callbackId;
    } catch (error) {
      console.error('❌ Error in createAndSend:', error);
      throw error;
    }
  }
}

export default SlackCallbackManager;
