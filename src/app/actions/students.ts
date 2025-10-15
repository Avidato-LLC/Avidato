'use server'

import { prisma } from '../../lib/prisma'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import type { Session } from 'next-auth'
import { languages, levels, ageGroups } from '../../lib/form-data-mappings'

/**
 * Server Actions for Student Management
 * 
 * This file contains server actions for handling student-related operations
 * including creating, reading, updating, and managing student data in the database.
 * 
 * Features:
 * - Server-side validation and error handling
 * - Authentication checks to ensure only logged-in users can access students
 * - Proper database operations using Prisma
 * - Type-safe operations with proper error responses
 */

/**
 * Interface for student creation data
 */
interface CreateStudentData {
  name: string
  targetLanguage: string
  nativeLanguage: string
  ageGroup: string
  level: string
  endGoals: string
  occupation?: string
  weaknesses?: string
  interests?: string
}

/**
 * Interface for server action response
 */
interface ActionResponse {
  success: boolean
  error?: string
  message?: string
  data?: {
    id: string
    name: string
  }
}

/**
 * Creates a new student in the database
 * 
 * @param formData - FormData object containing student information
 * @returns ActionResponse indicating success or failure
 */
export async function addStudent(formData: FormData): Promise<ActionResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to create students'
      }
    }

    const userId = session.user.id

    // Extract and validate form data
    const studentData: CreateStudentData = {
      name: formData.get('name') as string,
      targetLanguage: formData.get('targetLanguage') as string,
      nativeLanguage: formData.get('nativeLanguage') as string,
      ageGroup: formData.get('ageGroup') as string,
      level: formData.get('level') as string,
      endGoals: formData.get('endGoals') as string,
      occupation: formData.get('occupation') as string || undefined,
      weaknesses: formData.get('weaknesses') as string || undefined,
      interests: formData.get('interests') as string || undefined,
    }

    // Sanitize input data (trim whitespace and basic cleanup)
    const sanitizedData: CreateStudentData = {
      name: studentData.name?.trim() || '',
      targetLanguage: studentData.targetLanguage?.trim() || '',
      nativeLanguage: studentData.nativeLanguage?.trim() || '',
      ageGroup: studentData.ageGroup?.trim() || '',
      level: studentData.level?.trim() || '',
      endGoals: studentData.endGoals?.trim() || '',
      occupation: studentData.occupation?.trim() || undefined,
      weaknesses: studentData.weaknesses?.trim() || undefined,
      interests: studentData.interests?.trim() || undefined,
    }

    // Server-side validation
    const validationError = validateStudentData(sanitizedData)
    if (validationError) {
      return {
        success: false,
        error: validationError
      }
    }

    // Create the student in the database
    const student = await prisma.student.create({
      data: {
        name: sanitizedData.name,
        targetLanguage: sanitizedData.targetLanguage,
        nativeLanguage: sanitizedData.nativeLanguage,
        ageGroup: sanitizedData.ageGroup,
        level: sanitizedData.level,
        endGoals: sanitizedData.endGoals,
        occupation: sanitizedData.occupation,
        weaknesses: sanitizedData.weaknesses,
        interests: sanitizedData.interests,
        tutorId: userId,
      },
    })

    console.log('✅ Student created successfully:', {
      id: student.id,
      name: student.name,
      targetLanguage: student.targetLanguage,
      level: student.level
    })

    return {
      success: true,
      data: {
        id: student.id,
        name: student.name
      }
    }

  } catch (error) {
    console.error('❌ Error creating student:', error)
    
    // Handle specific database errors
    if (error instanceof Error) {
      // Prisma unique constraint violations
      if (error.message.includes('Unique constraint')) {
        return {
          success: false,
          error: 'A student with this information already exists'
        }
      }
      
      // Prisma foreign key constraint violations
      if (error.message.includes('Foreign key constraint')) {
        return {
          success: false,
          error: 'Invalid tutor reference. Please try logging in again.'
        }
      }
      
      // Prisma validation errors
      if (error.message.includes('Argument')) {
        return {
          success: false,
          error: 'Invalid data provided. Please check your inputs.'
        }
      }
      
      // Database connection errors
      if (error.message.includes('connect') || error.message.includes('timeout')) {
        return {
          success: false,
          error: 'Database connection error. Please try again later.'
        }
      }
    }

    return {
      success: false,
      error: 'Failed to create student. Please try again.'
    }
  }
}

/**
 * Validates student data on the server side
 * 
 * @param data - Student data to validate
 * @returns Error message if validation fails, null if valid
 */
function validateStudentData(data: CreateStudentData): string | null {
  // Required field validation
  if (!data.name?.trim()) {
    return 'Student name is required'
  }

  if (!data.targetLanguage) {
    return 'Target language is required'
  }

  if (!data.nativeLanguage) {
    return 'Native language is required'
  }

  if (!data.ageGroup) {
    return 'Age group is required'
  }

  if (!data.level) {
    return 'Language level is required'
  }

  if (!data.endGoals?.trim()) {
    return 'Learning goals are required'
  }

  // Validate against allowed values
  const validLanguages = languages.map(lang => lang.value)
  if (!validLanguages.includes(data.targetLanguage)) {
    return 'Invalid target language selected'
  }

  if (!validLanguages.includes(data.nativeLanguage)) {
    return 'Invalid native language selected'
  }

  const validLevels = levels.map(level => level.value)
  if (!validLevels.includes(data.level)) {
    return 'Invalid language level selected'
  }

  const validAgeGroups = ageGroups.map(group => group.value)
  if (!validAgeGroups.includes(data.ageGroup)) {
    return 'Invalid age group selected'
  }

  // Length validation
  if (data.name.trim().length < 2) {
    return 'Student name must be at least 2 characters long'
  }

  if (data.name.trim().length > 100) {
    return 'Student name must be less than 100 characters'
  }

  if (data.endGoals.trim().length < 10) {
    return 'Learning goals must be at least 10 characters long'
  }

  if (data.endGoals.trim().length > 1000) {
    return 'Learning goals must be less than 1000 characters'
  }

  // Optional field length validation
  if (data.occupation && data.occupation.length > 100) {
    return 'Occupation must be less than 100 characters'
  }

  if (data.weaknesses && data.weaknesses.length > 500) {
    return 'Weaknesses description must be less than 500 characters'
  }

  if (data.interests && data.interests.length > 500) {
    return 'Interests description must be less than 500 characters'
  }

  // Additional validation checks
  
  // Check for malicious content (basic XSS prevention)
  const suspiciousPatterns = /<script|javascript:|on\w+\s*=/i
  if (suspiciousPatterns.test(data.name) || 
      suspiciousPatterns.test(data.endGoals) ||
      (data.occupation && suspiciousPatterns.test(data.occupation)) ||
      (data.weaknesses && suspiciousPatterns.test(data.weaknesses)) ||
      (data.interests && suspiciousPatterns.test(data.interests))) {
    return 'Invalid characters detected in input fields'
  }

  // Validate that target and native languages are different
  if (data.targetLanguage === data.nativeLanguage) {
    return 'Target language must be different from native language'
  }

  // Validate name format (letters, spaces, hyphens, apostrophes only)
  const namePattern = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s\-'\.]+$/
  if (!namePattern.test(data.name.trim())) {
    return 'Student name contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed.'
  }

  return null
}

/**
 * Server action wrapper that handles the form submission and redirects
 * This is used directly in form actions for proper Next.js server action handling
 * 
 * @param formData - FormData from the form submission
 */
export async function addStudentAction(formData: FormData) {
  const result = await addStudent(formData)
  
  if (result.success) {
    // Redirect to dashboard on success
    redirect('/dashboard')
  } else {
    // For now, we'll redirect back with an error (in a real app, we'd use searchParams or session)
    // TODO: Implement proper error handling with searchParams or session storage
    redirect('/dashboard/students/add?error=' + encodeURIComponent(result.error || 'Unknown error'))
  }
}

/**
 * Interface for student data returned from queries
 */
interface StudentData {
  id: string
  name: string
  targetLanguage: string
  nativeLanguage: string
  ageGroup: string
  level: string
  endGoals: string
  occupation?: string | null
  weaknesses?: string | null
  interests?: string | null
  archived: boolean
  createdAt: Date
  updatedAt: Date
  lessonCount?: number
}

/**
 * Interface for students list response
 */
interface StudentsResponse {
  success: boolean
  data?: {
    students: StudentData[]
    total: number
  }
  error?: string
}

/**
 * Interface for search and filter parameters
 */
interface StudentFilters {
  search?: string
  targetLanguage?: string
  level?: string
  ageGroup?: string
  sortBy?: 'name' | 'level' | 'occupation' | 'lessonCount' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  archived?: boolean
}

/**
 * Fetches all students for the authenticated user with optional filtering
 * 
 * @param filters - Optional search and filter parameters
 * @returns StudentsResponse with students data or error
 */
export async function getStudents(filters: StudentFilters = {}): Promise<StudentsResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to view students'
      }
    }

    const userId = session.user.id

    // Build where clause for filtering
    const whereClause = {
      tutorId: userId,
      archived: filters.archived || false,
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' as const } },
          { endGoals: { contains: filters.search, mode: 'insensitive' as const } },
          { occupation: { contains: filters.search, mode: 'insensitive' as const } },
          { interests: { contains: filters.search, mode: 'insensitive' as const } }
        ]
      }),
      ...(filters.targetLanguage && { targetLanguage: filters.targetLanguage }),
      ...(filters.level && { level: filters.level }),
      ...(filters.ageGroup && { ageGroup: filters.ageGroup })
    }

    // Build order by clause
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    
    let orderBy: object
    if (sortBy === 'lessonCount') {
      // Special handling for lesson count sorting
      orderBy = {
        lessons: {
          _count: sortOrder
        }
      }
    } else {
      orderBy = { [sortBy]: sortOrder }
    }

    // Fetch students with optimized query
    const students = await prisma.student.findMany({
      where: whereClause,
      orderBy,
      select: {
        id: true,
        name: true,
        targetLanguage: true,
        nativeLanguage: true,
        ageGroup: true,
        level: true,
        endGoals: true,
        occupation: true,
        weaknesses: true,
        interests: true,
        archived: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            lessons: true
          }
        }
      }
    })

    // Transform data to include lesson count
    const studentsWithCounts: StudentData[] = students.map(student => ({
      id: student.id,
      name: student.name,
      targetLanguage: student.targetLanguage,
      nativeLanguage: student.nativeLanguage,
      ageGroup: student.ageGroup,
      level: student.level,
      endGoals: student.endGoals,
      occupation: student.occupation,
      weaknesses: student.weaknesses,
      interests: student.interests,
      archived: student.archived,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      lessonCount: student._count.lessons
    }))

    return {
      success: true,
      data: {
        students: studentsWithCounts,
        total: studentsWithCounts.length
      }
    }

  } catch (error) {
    console.error('❌ Error fetching students:', error)
    
    return {
      success: false,
      error: 'Failed to load students. Please try again.'
    }
  }
}

/**
 * Toggles the archived status of a student
 * 
 * @param studentId - The ID of the student to archive/unarchive
 * @param archived - Whether to archive (true) or unarchive (false) the student
 * @returns ActionResponse indicating success or failure
 */
export async function toggleStudentArchive(studentId: string, archived: boolean): Promise<ActionResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to archive students'
      }
    }

    // Validate input
    if (!studentId || typeof studentId !== 'string') {
      return {
        success: false,
        error: 'Invalid student ID'
      }
    }

    const userId = session.user.id

    // Verify the student belongs to the user
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        tutorId: userId
      }
    })

    if (!existingStudent) {
      return {
        success: false,
        error: 'Student not found or you do not have permission to modify this student'
      }
    }

    // Update the student's archived status
    await prisma.student.update({
      where: {
        id: studentId
      },
      data: {
        archived: archived
      }
    })

    return {
      success: true,
      message: `Student ${archived ? 'archived' : 'unarchived'} successfully`
    }

  } catch (error) {
    console.error('Toggle student archive error:', error)
    return {
      success: false,
      error: `Failed to ${archived ? 'archive' : 'unarchive'} student. Please try again.`
    }
  }
}

/**
 * Permanently deletes a student and all associated data
 * 
 * @param studentId - The ID of the student to delete
 * @returns ActionResponse indicating success or failure
 */
export async function deleteStudent(studentId: string): Promise<ActionResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to delete students'
      }
    }

    // Validate input
    if (!studentId || typeof studentId !== 'string') {
      return {
        success: false,
        error: 'Invalid student ID'
      }
    }

    const userId = session.user.id

    // Verify the student belongs to the user
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        tutorId: userId
      },
      include: {
        _count: {
          select: {
            lessons: true
          }
        }
      }
    })

    if (!existingStudent) {
      return {
        success: false,
        error: 'Student not found or you do not have permission to delete this student'
      }
    }

    // Delete the student (this will cascade to delete associated lessons)
    await prisma.student.delete({
      where: {
        id: studentId
      }
    })

    return {
      success: true,
      message: `Student and ${existingStudent._count.lessons} associated lesson(s) deleted successfully`
    }

  } catch (error) {
    console.error('Delete student error:', error)
    return {
      success: false,
      error: 'Failed to delete student. Please try again.'
    }
  }
}

/**
 * Fetches a single student by ID for the authenticated user
 * 
 * @param studentId - The ID of the student to fetch
 * @returns StudentResponse with student data or error
 */
export async function getStudent(studentId: string): Promise<{
  success: boolean
  data?: StudentData
  error?: string
}> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to view students'
      }
    }

    // Validate input
    if (!studentId || typeof studentId !== 'string') {
      return {
        success: false,
        error: 'Invalid student ID'
      }
    }

    const userId = session.user.id

    // Fetch the student with lesson count
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tutorId: userId
      },
      include: {
        _count: {
          select: {
            lessons: true
          }
        }
      }
    })

    if (!student) {
      return {
        success: false,
        error: 'Student not found or you do not have permission to view this student'
      }
    }

    // Transform the data
    const studentData: StudentData = {
      id: student.id,
      name: student.name,
      targetLanguage: student.targetLanguage,
      nativeLanguage: student.nativeLanguage,
      ageGroup: student.ageGroup,
      level: student.level,
      endGoals: student.endGoals,
      occupation: student.occupation,
      weaknesses: student.weaknesses,
      interests: student.interests,
      archived: student.archived,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      lessonCount: student._count.lessons
    }

    return {
      success: true,
      data: studentData
    }

  } catch (error) {
    console.error('Get student error:', error)
    return {
      success: false,
      error: 'Failed to load student. Please try again.'
    }
  }
}

/**
 * Updates an existing student's information
 * 
 * @param studentId - The ID of the student to update
 * @param formData - The FormData containing updated student information
 * @returns ActionResponse indicating success or failure
 */
export async function updateStudent(studentId: string, formData: FormData): Promise<ActionResponse> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as Session | null
    if (!session?.user || typeof session.user.id !== 'string') {
      return {
        success: false,
        error: 'You must be logged in to update students'
      }
    }

    // Validate student ID
    if (!studentId || typeof studentId !== 'string') {
      return {
        success: false,
        error: 'Invalid student ID'
      }
    }

    const userId = session.user.id

    // Extract and validate form data
    const name = formData.get('name') as string
    const targetLanguage = formData.get('targetLanguage') as string
    const nativeLanguage = formData.get('nativeLanguage') as string
    const ageGroup = formData.get('ageGroup') as string
    const level = formData.get('level') as string
    const endGoals = formData.get('endGoals') as string
    const occupation = formData.get('occupation') as string
    const weaknesses = formData.get('weaknesses') as string
    const interests = formData.get('interests') as string

    // Required field validation
    if (!name?.trim()) {
      return {
        success: false,
        error: 'Student name is required'
      }
    }

    if (!targetLanguage || !nativeLanguage || !ageGroup || !level) {
      return {
        success: false,
        error: 'Please fill in all required fields (target language, native language, age group, and level)'
      }
    }

    if (!endGoals?.trim()) {
      return {
        success: false,
        error: 'Learning goals are required'
      }
    }

    // Validate language selections
    const validLanguages = languages.map(lang => lang.value)
    if (!validLanguages.includes(targetLanguage) || !validLanguages.includes(nativeLanguage)) {
      return {
        success: false,
        error: 'Please select valid languages'
      }
    }

    // Validate level
    const validLevels = levels.map(level => level.value)
    if (!validLevels.includes(level)) {
      return {
        success: false,
        error: 'Please select a valid level'
      }
    }

    // Validate age group
    const validAgeGroups = ageGroups.map(group => group.value)
    if (!validAgeGroups.includes(ageGroup)) {
      return {
        success: false,
        error: 'Please select a valid age group'
      }
    }

    // Verify the student exists and belongs to the user
    const existingStudent = await prisma.student.findFirst({
      where: {
        id: studentId,
        tutorId: userId
      }
    })

    if (!existingStudent) {
      return {
        success: false,
        error: 'Student not found or you do not have permission to update this student'
      }
    }

    // Update the student
    const updatedStudent = await prisma.student.update({
      where: {
        id: studentId
      },
      data: {
        name: name.trim(),
        targetLanguage,
        nativeLanguage,
        ageGroup,
        level,
        endGoals: endGoals.trim(),
        occupation: occupation?.trim() || null,
        weaknesses: weaknesses?.trim() || null,
        interests: interests?.trim() || null,
        updatedAt: new Date()
      }
    })

    return {
      success: true,
      message: 'Student profile updated successfully',
      data: {
        id: updatedStudent.id,
        name: updatedStudent.name
      }
    }

  } catch (error) {
    console.error('Update student error:', error)
    return {
      success: false,
      error: 'Failed to update student. Please try again.'
    }
  }
}