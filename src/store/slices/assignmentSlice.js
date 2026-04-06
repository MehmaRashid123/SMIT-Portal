import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabaseClient'

export const fetchAssignments = createAsyncThunk('assignment/fetch', async (courseId, { rejectWithValue }) => {
  let q = supabase.from('assignments').select('*').order('created_at', { ascending: false })
  if (courseId) q = q.eq('course_id', courseId)
  const { data, error } = await q
  if (error) return rejectWithValue(error.message)
  return data
})

export const addAssignment = createAsyncThunk('assignment/add', async (assignment, { rejectWithValue }) => {
  const { data, error } = await supabase.from('assignments').insert([assignment]).select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

export const submitAssignment = createAsyncThunk('assignment/submit', async ({ assignmentId, studentId, fileUrl, note }, { rejectWithValue }) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert([{ assignment_id: assignmentId, student_id: studentId, file_url: fileUrl, note }])
    .select().single()
  if (error) return rejectWithValue(error.message)
  return data
})

const assignmentSlice = createSlice({
  name: 'assignment',
  initialState: { list: [], submissions: [], loading: false, error: null },
  reducers: { clearError(s) { s.error = null } },
  extraReducers: (b) => {
    b.addCase(fetchAssignments.pending,  (s)    => { s.loading = true })
     .addCase(fetchAssignments.fulfilled,(s, a) => { s.loading = false; s.list = a.payload })
     .addCase(fetchAssignments.rejected, (s, a) => { s.loading = false; s.error = a.payload })
     .addCase(addAssignment.fulfilled,   (s, a) => { s.list.unshift(a.payload) })
     .addCase(submitAssignment.fulfilled,(s, a) => { s.submissions.unshift(a.payload) })
  },
})
export default assignmentSlice.reducer
