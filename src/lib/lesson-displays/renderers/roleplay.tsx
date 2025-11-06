/**
 * Role Play Exercise Renderer
 */

import React from 'react'

interface Role {
  name: string
  description: string
  keyPoints?: string[]
}

interface RoleplayRendererProps {
  title: string
  instructions: string
  scenario: string
  roles: Role[]
  timeMinutes: number
}

export const RoleplayRenderer: React.FC<RoleplayRendererProps> = ({
  instructions,
  scenario,
  roles,
  timeMinutes,
}) => {
  return (
    <div className="space-y-6">
      <div className="border-l-4 border-purple-500 pl-4 mb-6">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{instructions}</p>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          ⏱️ {timeMinutes} minutes • {roles.length} roles
        </p>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-2">
          📍 Scenario:
        </h3>
        <p className="text-gray-900 dark:text-gray-100">{scenario}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          👥 Roles:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white">{role.name}</h4>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {role.description}
                </p>
              </div>

              {role.keyPoints && role.keyPoints.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Key Points:
                  </p>
                  <ul className="space-y-2">
                    {role.keyPoints.map((point, pointIndex) => (
                      <li
                        key={pointIndex}
                        className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
                      >
                        <span className="flex-shrink-0 text-purple-500 font-bold mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-300">
          🎭 <strong>How to Practice:</strong> With a partner or teacher, act out this scenario. Take turns playing different roles. Focus on using the new vocabulary naturally in your conversation.
        </p>
      </div>
    </div>
  )
}
