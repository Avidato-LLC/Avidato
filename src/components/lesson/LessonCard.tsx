// src/components/lesson/LessonCard.tsx
'use client';

import React, { useState } from 'react';
import ShareIcon from '@/components/icons/ShareIcon';
import { useLessonSharing } from '@/hooks/useLessonSharing';

/**
 * Lesson Card Component
 * 
 * Modular component for displaying lesson cards with share functionality.
 * Features:
 * - Displays lesson title, overview, and creation date
 * - Share button with loading and error states (Issue #37)
 * - Share icon appears on the card when lesson is marked as shared
 * - Responsive design
 * 
 * Props:
 * - lesson: Lesson data (id, title, overview, createdAt, sharedAt)
 * - studentId: Student ID for sharing context
 * - onShare: Optional callback after successful share
 */

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    overview: string | null;
    createdAt: Date;
    sharedAt?: Date | null;
  };
  studentId: string;
  onShare?: () => void;
}

export default function LessonCard({ lesson, studentId, onShare }: LessonCardProps) {
  const { isSharing, shareLesson, error, clearError } = useLessonSharing();
  const [isShared, setIsShared] = useState(!!lesson.sharedAt);
  const [showError, setShowError] = useState(false);

  const handleShare = async () => {
    clearError();
    setShowError(false);

    const success = await shareLesson(lesson.id, studentId);
    if (success) {
      setIsShared(true);
      onShare?.();
    } else {
      setShowError(true);
    }
  };

  const createdDate = new Date(lesson.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
            {isShared && (
              <span
                className="text-green-600"
                title="Shared with student"
              >
                <ShareIcon className="w-4 h-4" />
              </span>
            )}
          </div>
          {lesson.overview && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {lesson.overview}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Created: {formattedDate}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {!isShared ? (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isSharing
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
              title="Mark this lesson as shared with the student"
            >
              {isSharing ? 'Sharing...' : 'Share'}
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700 cursor-default"
            >
              ✓ Shared
            </button>
          )}
          {showError && error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
